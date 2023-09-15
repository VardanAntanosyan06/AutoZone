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
      // allowNull: false, 
    },
    pin: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN
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