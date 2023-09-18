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
      type:DataTypes.STRING,
      allowNull: false, 
    },
    pin: DataTypes.STRING,
    isVerified: {
      type:DataTypes.BOOLEAN
    defaultValue:
    },
    messageSendTime:DataTypes.DATE,
    messageSendCount:{
      type:DataTypes.INTEGER,
      defaultValue:0
    }
  }, {
    sequelize,
    modelName: 'Users',
  });

  const Cars = sequelize.define("Cars")

  Users.hasMany(Cars,{
    foreignKey:"userId"
  })
  return Users;
};