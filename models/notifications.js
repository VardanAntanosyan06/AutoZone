'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notifications extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notifications.init({
    receiverId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    body: DataTypes.STRING,
    title: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Notifications',
  });
  const Users = sequelize.define("Users");
  const Answers = sequelize.define("Answers");

  Notifications.hasOne(Users)
  Notifications.hasOne(Answers,{
    foreignKey:"notificationId"
  })
  return Notifications;
};