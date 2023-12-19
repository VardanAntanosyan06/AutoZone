'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubscribtionPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SubscribtionPayment.init({
    userId: DataTypes.INTEGER,
    endDate: DataTypes.DATE,
    paymentWay: DataTypes.STRING,
    orderKey:DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'SubscribtionPayment',
  });
  return SubscribtionPayment;
};