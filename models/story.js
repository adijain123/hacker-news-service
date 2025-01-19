const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize( process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,{
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const Story = sequelize.define('Story', {
  storyId: {
    type: DataTypes.STRING,
    unique: true, //primary key
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = { Story, sequelize };
