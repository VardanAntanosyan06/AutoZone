const { Users, Cars, Complaints } = require("../../models");
const { Op } = require("sequelize");

const GetAllUserData = async (req, res) => {
  try {
    const {filter } = req.body;

    if (filter) {
      const User = await Users.findAll({
        attributes: ["id", "phoneNumber", "gmail", "createdAt"],
        where: {
          [Op.or]: [
            +filter && { id: filter },
            { phoneNumber: {[Op.like]:`%${filter}`} },
            { gmail: {[Op.like]:`%${filter}`} },
          ],    
        },
        order:[['createdAt','ASC']]
      });

      return res.status(200).json({ success: true, User });
    }
    const User = await Users.findAll();
    return res.status(200).json({ success: true, User });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

module.exports = {
  GetAllUserData,
};
