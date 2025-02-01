const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Story extends Model {}

Story.init({
  storyId: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Story'
});

module.exports = { Story };
