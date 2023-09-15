'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cars extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Cars.init({
    carTechNumber: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    carNumber: DataTypes.STRING,
    carMark: DataTypes.STRING,
    serviceRequestId: DataTypes.INTEGER,
    vehicleTypeHy: DataTypes.STRING,
    vehicleTypeEn: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Cars',
  });
  const Users = sequelize.define("Users")

  Cars.hasOne(Users)
  return Cars;
};