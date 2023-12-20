const { Users, Cars, Complaints,SubscribtionPayment } = require("../../models");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const mysql = require("mysql2");

const GetAllUserData = async (req, res) => {
  try {
    const { filter, date } = req.body;
    // console.log(new Date(""));
    if (filter) {
      const User = await Users.findAll({
        attributes: ["id", "phoneNumber", "gmail", "createdAt"],
        where: {
          [Op.or]: [
            +filter && { id: filter },
            { phoneNumber: { [Op.like]: `%${filter}` } },
            { gmail: { [Op.like]: `%${filter}` } },
          ],
        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, User });
    }
    if (date) {
      const fixedDate = new Date(date);
      const User = await Users.findAll({
        attributes: ["id", "phoneNumber", "gmail", "createdAt"],
        where: {
          createdAt: {
            [Op.between]: [
              fixedDate,
              new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000),
            ], // Assuming you want actions for the entire day
          },
        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, User });
    }
    const User = await Users.findAll({
      attributes: ["id", "phoneNumber", "gmail", "createdAt"],
      order: [["id", "DESC"]],
    });
    return res.status(200).json({ success: true, User });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const getAllCarData = async (req, res) => {
  try {
    const { filter, date } = req.body;
    if (filter) {
      const Car = await Cars.findAll({
        attributes: [
          "carTechNumber",
          "userId",
          "carNumber",
          "carMark",
          "vehicleTypeHy",
          "insuranceEndDate",
          "inspection",
        ],
        where: {
          [Op.or]: [
            +filter && { id: filter },
            { carNumber: { [Op.like]: `%${filter}` } },
            +filter && { userId: filter },
          ],
        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, Car });
    }
    if (date) {
      const fixedDate = new Date(date);
      const Car = await Cars.findAll({
        attributes: [
          "carTechNumber",
          "userId",
          "carNumber",
          "carMark",
          "vehicleTypeHy",
          "insuranceEndDate",
          "inspection",
        ],
        where: {
          createdAt: {
            [Op.between]: [
              fixedDate,
              new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000),
            ], // Assuming you want actions for the entire day
          },
        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, Car });
    }
    const Car = await Cars.findAll({
      attributes: [
        "carTechNumber",
        "userId",
        "carNumber",
        "carMark",
        "vehicleTypeHy",
        "insuranceEndDate",
        "inspection",
      ],
      order: [["id", "DESC"]],
    });
    return res.status(200).json({ success: true, Car });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const getAllComplaintsData = async (req, res) => {
  try {
    const { filter, date } = req.body;
    if (filter) {
      let Complaint = await Complaints.findAll({
        include: [
          { model: Users, as: "sender", attributes: ["phoneNumber"] },
          { model: Users, as: "receiver", attributes: ["phoneNumber"] },
        ],
        order: [["id", "DESC"]],
        where: {
          "$Complaints.id$": { [Sequelize.Op.ne]: null },
          phoneNumber: { [Op.like]: `%${filter}` },
        },
      });
      return res.status(200).json({ success: true, Complaint });
    }
    if (date) {
      let Complaint = await Complaints.findAll({
        include: [
          { model: Users, as: "sender", attributes: ["phoneNumber"] },
          { model: Users, as: "receiver", attributes: ["phoneNumber"] },
        ],
        order: [["id", "DESC"]],
        where: {
          "$Complaints.id$": { [Sequelize.Op.ne]: null },
          createdAt: {
            [Op.between]: [
              fixedDate,
              new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000),
            ],
          },
        },
      });
      return res.status(200).json({ success: true, Complaint });
    }
    let Complaint = await Complaints.findAll({
      include: [
        { model: Users, as: "sender", attributes: ["phoneNumber"] },
        { model: Users, as: "receiver", attributes: ["phoneNumber"] },
      ],
      order: [["id", "DESC"]],
      where: {
        "$Complaints.id$": { [Sequelize.Op.ne]: null },
      },
    });
    return res.status(200).json({ success: true, Complaint });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const getAllPaymentData = async (req, res) => {
  try {
    const { filter, date } = req.body;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "onepay",
      password: process.env.MYSQL_PASSWORD,
    });

    if (filter) {
      connection.query(
        `SELECT *
        FROM orders
        WHERE is_autoclub = 1
          AND (id = ${filter} OR phoneNumber LIKE ${"filter%"})
        ORDER BY id DESC;`,
        async function (err, results) {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ success: false, message: "Something went wrong." });
          }
          return res.status(200).json({ success: true, results });
        }
      );
    }
    connection.query(
      "SELECT * FROM `orders` WHERE `is_autoclub` = 1 ORDER BY `id` DESC;",
      async function (err, results) {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ success: false, message: "Something went wrong." });
        }
        return res.status(200).json({ success: true, results });
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const getAllSubscribtionData = async (req, res) => {
  try {
    const { filter, date } = req.body;
    if (filter) {
      const PaymentInfo = await Users.findAll({
        attributes: ["id", "phoneNumber"],
        include:[SubscribtionPayment],
        where: {
          [Op.or]: [
            { id: filter },
            { phoneNumber: { [Op.like]: `%${filter}` } },
          ],

        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, PaymentInfo });
      
    }
    if (date) {
      const fixedDate = new Date(date);
      const PaymentInfo = await Users.findAll({
        attributes:['id','phoneNumber'],
        order: [["id", "DESC"]],
        include:{
          model:SubscribtionPayment,
          where: {
            createdAt: {
              [Op.between]: [
                fixedDate,
                new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000),
              ], 
            },
          },
        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, PaymentInfo });
    }
    const PaymentInfo = await Users.findAll({
      attributes:['id','phoneNumber'],
      include:[SubscribtionPayment],
      order: [["id", "DESC"]],
      where:{"$SubscribtionPayments.id$": { [Sequelize.Op.ne]: null }}
    });

    return res.status(200).json({ success: true, PaymentInfo });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

module.exports = {
  GetAllUserData,
  getAllCarData,
  getAllComplaintsData,
  getAllPaymentData,
  getAllSubscribtionData
};
