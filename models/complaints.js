"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Complaints extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Complaints.init(
    {
      senderId: DataTypes.INTEGER,
      reciverId: DataTypes.INTEGER,
      complaint: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Complaints",
    }
  );
  const Users = sequelize.define("Users");
  Complaints.belongsTo(Users, { foreignKey: "senderId", as: "sender" });
  Complaints.belongsTo(Users, { foreignKey: "reciverId", as: "receiver" });
  return Complaints;
};
