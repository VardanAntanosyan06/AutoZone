"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fullName: {
        type: Sequelize.STRING,
      },
      gmail: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      pin: {
        type: Sequelize.STRING,
      },
      image:{
        type:Sequelize.STRING
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
      },
      messageSendTime: {
        type: Sequelize.DATE,
      },
      messageSendCount: {
        type: Sequelize.INTEGER,
      },
      deviceToken: {
        type: Sequelize.STRING,
      },
      token: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
