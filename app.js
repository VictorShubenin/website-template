const express = require('express')

const path = require('path');
const cookieParser = require('cookie-parser')
const markdownit = require('markdown-it')
const app = express()
const port = 3001
const db = require('./database')
const multer = require("multer");
const Sequelize = require("sequelize")

const Article = require('./models/article')
const User = require('./models/user')
const Comment = require('./models/comment')
const Report = require('./models/report')

const md = markdownit()

Article.hasMany(Comment, {foreignKey: 'article_id'});
Comment.belongsTo(Article, {foreignKey: 'article_id'});

try {
    db.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')
app.use(cookieParser())
app.use((req, res, next) => {
    const userId = req.cookies.userId;
    res.locals.userId = userId;
    console.log(userId);
    next()
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/blog', (req, res) => {
    Article.findAll().then(articles => {
        const articlesArray = articles.map(article => article.get());
        Article.findAll({ order: Sequelize.literal('random()'), limit: 4 })
            .then(suggestedArticles => {
                res.render('blog', {articles : articlesArray, suggestedArticles : suggestedArticles})
            })
            .catch(error => {
                console.log(error)
            });
    });
})

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    User.create({ name: req.body.login, password: req.body.password, is_admin: false }).catch(error => {
        console.log(error);
    })
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    User.findOne({where: { name: req.body.login } })
        .then(user => {
            res.clearCookie('userId');
            if (!user) {
                res.render('login', { title: 'Вход', userFound: false})
            } else {
                res.cookie('userId', user.id)
                res.redirect('/')
            }
        })
})

app.get('/logout', (req, res) => {
    res.clearCookie('userId');
    res.redirect('/');
})

app.get('/article/:articleId', (req, res, next) => {
    const articleId = req.params.articleId;
    Article.findByPk(articleId, { include: Comment }).then(article => {
        if (article === null) {
            const error = new Error('Not Found');
            error.status = 404;
            throw error;
        }
        console.log(article);
        const comments = Comment.findAll({ include: Article });

        const markdown = md.render(article.content);

        const userId = res.locals.userId;
        User.findByPk(userId).then(user => {
            if (user && user.is_admin) {
                res.render('article', {article : article, markdown : markdown, isAdmin : true});
            } else {
                res.render('article', {article : article, markdown : markdown, isAdmin : false});
            }
        })
    }).catch(error => {
        next(error);
    });
})

app.get('/contact', (req, res) => {
    const userId = res.locals.userId;
    User.findByPk(userId).then(user => {
        if (user && user.is_admin) {
            Report.findAll().then(reports => {
                const reportsArray = reports.map(report => report.get());
                res.render('contact', {reports : reportsArray})
            });
        } else {
            let status;
            console.log("params: ", res.locals)
            if (req.query.status === "success") {
                status = true;
            } 
            else {
                status = false;
            }
            res.render('contact', { status : status })
        }
    })

})

app.get('/materials', (req, res) => {
    res.render('materials')
})

app.get('/articles/create', (req, res) => {
    res.render('articles/create')
})


const upload = multer({
    dest: "public/uploads/"
  });

app.post('/articles/create', upload.single("image"), (req, res) => {
    Article.create({ title: req.body.title, content: req.body.content, image : req.file.filename })
        .then(article => {
            res.redirect('/blog')
        })
        .catch(error => {
            console.log(error);
        })
    console.log(req.file)
});

app.get('/articles/edit/:articleId', (req, res) => {
    const articleId = req.params.articleId;
    Article.findByPk(articleId).then(article => {
        if (article === null) {
            const error = new Error('Not Found');
            error.status = 404;
            throw error;
        }
        res.render('articles/edit', {article : article});
    }).catch(error => {
        console.log(error);
    });
})

app.post('/articles/edit/:articleId', (req, res) => {
    const articleId = req.params.articleId;
    Article.findByPk(articleId).then(article => {
        if (article === null) {
            const error = new Error('Not Found');
            error.status = 404;
            throw error;
        } else {
            article.title = req.body.title;
            article.content = req.body.content;
            article.save().then(article => {
                res.redirect('articles/:articleId')
            });
        }
        res.redirect('articles/:articleId')
    })
})

app.post('/comments', (req, res) => {
    const articleId = req.body.articleId;
    const content = req.body.content;
    const userId = res.locals.userId;

    Comment.create({user_id: userId, content: content, article_id: articleId})
        .then(comment => {
            res.redirect('/article/' + articleId)
        })
        .catch(error => {
            console.log(error);
        });
})

app.post('/article/:articleId/like', (req, res) => {
    const articleId = req.params.articleId;
    Article.findByPk(articleId)
        .then(article => {
            if (article ===  null) {
                const error = new Error('Not Found');
                error.status = 404;
                throw error;
            }
            article.likes_count++;
            article.save();
            res.status(200).send(article.likes_count);
        })
})

app.post('/article/:articleId/dislike', (req, res) => {
    const articleId = req.params.articleId;
    Article.findByPk(articleId)
        .then(article => {
            if (article ===  null) {
                const error = new Error('Not Found');
                error.status = 404;
                throw error;
            }
            article.dislikes_count++;
            article.save();
            res.status(202);
        })
})

app.post('/reports', (req, res) => {
    Report.create({ email: req.body.email, subject: req.body.subject, content: req.body.content })
        .then( report => {
            res.redirect('/contact?status=success')
        })
        .catch(error => {
            console.log(error);
        })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// app.use((req, res, next) => {
//     res.status(404).render("404")
// })

// app.use((error, req, res, next) => {
//     res.status(404).render("404")
// })
