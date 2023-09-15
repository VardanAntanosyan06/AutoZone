'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
    }
  }
  Users.init({
    fullName: DataTypes.STRING,
    gmail: DataTypes.STRING,
    phoneNumber: {
      type:DataTypes.INTEGER,
      allowNull : false , 

    },
    pin: DataTypes.INTEGER,
    isVerified: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};