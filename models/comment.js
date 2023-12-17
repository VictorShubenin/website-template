const sequelize = require('../database')
const {DataTypes} = require('sequelize');

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true 
    },
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'User',
            key: 'id'
        },
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    article_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Article',
            key: 'id'
        },
        allowNull: false
    },
}, { 
    timestamps: false,
    tableName: "comments",
    underscored: true
 })

module.exports = Comment;