const { Users } = require("../models");
const { Cars } = require("../models");

const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;


    const User = Users.findOne({
          where:{phoneNumber}
    })
  } catch (error) {}
};
