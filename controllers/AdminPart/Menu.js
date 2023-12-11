const { Users, Cars, Complaints } = require("../../models");
const { Op } = require("sequelize");
const Sequelize = require("sequelize")
const mysql = require("mysql2");
const GetAllUserData = async (req, res) => {
  try {
    const { filter,date } = req.body;
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
    if(date){
      const User = await Users.findAll({
        attributes: ["id", "phoneNumber", "gmail", "createdAt"],
        where: {
             createdAt: { [Op.like]: `%${date}` },
        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, User });
    }
    const User = await Users.findAll({
      attributes: ["id", "phoneNumber", "gmail", "createdAt"],
      order:[['id','DESC']]
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
    const { filter,data } = req.body;
    if (filter) {
      const Car = await Cars.findAll({
        attributes: [
          "carTechNumber",
          "userId",
          "carNumber",
          "carMark",
          "vehicleTypeHy",
          "insuranceEndDate",
          "inspection"
        ],
        where: {
          [Op.or]: [
            +filter && { id: filter },
            { carNumber: { [Op.like]: `%${filter}` } },
            +filter && { userId:filter },
          ],
        },
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ success: true, Car });
    }
    if(date){
      const Car = await Cars.findAll({
        attributes: ["id", "phoneNumber", "gmail", "createdAt"],
        where: {
             createdAt: { [Op.like]: `%${date}` },
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
        "inspection"
      ],
      order:[['id','DESC']]
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
    let Complaint = await Complaints.findAll({ 
      include: [
        { model: Users, as: 'sender', attributes:['phoneNumber'] },
        { model: Users, as: 'receiver', attributes:['phoneNumber']},
      ],      order:[['id','DESC']],
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

const getAllPaymentData = async(req,res)=>{
  try {
    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "onepay",
      password: process.env.MYSQL_PASSWORD,
    });

    connection.query(
      'SELECT * FROM `orders` WHERE `is_autoclub` = 1 ORDER BY `id` DESC;',
      async function (err, results) {
        if (err) {
          console.log(err);
          return res.status(500).json({success:false, message: "Something went wrong." });
        }
          return res.status(200).json({success:true,results})       
        })
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
}
module.exports = {
  GetAllUserData,
  getAllCarData,
  getAllComplaintsData,
  getAllPaymentData
};

