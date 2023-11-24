'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentStatusOne extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentStatusOne.init({
    phoneNumber: DataTypes.STRING,
    requestId: DataTypes.INTEGER,
    station: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PaymentStatusOne',
  });

  const Users = sequelize.define("Users")

  PaymentStatusOne.hasOne(Users)

  return PaymentStatusOne;
};