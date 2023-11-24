"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {}
  }
  Users.init(
    {
      fullName: DataTypes.STRING,
      gmail: DataTypes.STRING,
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pin: DataTypes.STRING,
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      image:{
        type:DataTypes.STRING
      },
      deviceToken:DataTypes.STRING,
      token:DataTypes.STRING,
      messageSendTime: DataTypes.DATE,
      messageSendCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );

  const Cars = sequelize.define("Cars");
  const Notifications = sequelize.define("Notifications");
  const PaymentStatusOne = sequelize.define("PaymentStatusOne")
  Users.hasMany(Cars, {
    foreignKey: "userId",
  });
  Users.hasMany(PaymentStatusOne, {
    foreignKey: "phoneNumber",
  });

  Users.hasMany(Notifications,{
    foreignKey:"senderId"
  })
  Users.hasMany(Notifications,{
    foreignKey:"receiverId"
  })
  return Users;
};
