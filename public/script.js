document.addEventListener("DOMContentLoaded", (event) => {
    const likes = document.querySelectorAll(".like");

    likes.forEach(like => {
        const articleId = like.dataset.article
        like.addEventListener('click', ()=> {
            fetch(`/article/${articleId}/like`,
            {
                method: "POST",
            }).then(response => {

            })
        })
    })
})



document.addEventListener("DOMContentLoaded", (event) => {
    const dislikes = document.querySelectorAll(".dislike");

    dislikes.forEach(dislike => {
        const articleId = dislike.dataset.article
        dislike.addEventListener('click', ()=> {
            fetch(`/article/${articleId}/dislike`,
            {
                method: "POST",
            }).then(response => {

            })
        })
    })
})