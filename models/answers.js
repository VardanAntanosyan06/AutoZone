'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Answers.init({
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    notificationId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Answers',
  });

  const Notifications = sequelize.define("Notifications")
  Answers.hasOne(Notifications)

  return Answers;
};