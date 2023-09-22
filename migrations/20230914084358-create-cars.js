"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cars", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      carTechNumber: {
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      carNumber: {
        type: Sequelize.STRING,
      },
      carMark: {
        type: Sequelize.STRING,
      },
      insuranceInfo: {
        type: Sequelize.STRING,
      },
      insuranceEndDate:{
         type: Sequelize.DATE 
        },
      inspection:{
        type: Sequelize.STRING
      },
      serviceRequestId: {
        type: Sequelize.INTEGER,
      },
      vehicleTypeHy: {
        type: Sequelize.STRING,
      },
      vehicleTypeEn: {
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
    await queryInterface.dropTable("Cars");
  },
};
