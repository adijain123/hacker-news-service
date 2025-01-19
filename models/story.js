const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('hacker_news', 'root', '482004', {
  host: 'localhost',
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
