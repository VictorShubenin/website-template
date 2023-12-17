const sequelize = require('../database')
const {DataTypes} = require('sequelize');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { 
    timestamps: false,
    tableName: "reports"
 })

module.exports = Report;