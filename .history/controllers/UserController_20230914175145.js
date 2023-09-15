const { Users } = require("../models");
const { Cars } = require("../models");
const bcrypt = require("bcrypt");

const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const User = await Users.findOne({
      where: { phoneNumber },
    });

    if (User && User.isVerified)
      return res.status(200).json({ message: "Enter pin code." });

    const code = Math.floor(Math.random() * 8999 + 1000);
    const hashPin = bcrypt.hashSync("test", 10);
    console.log(hashPin);
    await Users.create({
      phoneNumber:phoneNumber,
      pin:hashPin
    });

    sendSMSCode(
      phoneNumber,
      "Verify your account",
      `Verification code is ${code}`
    );

          return res.json({success:true})
  } catch (error) {
    console.log(error.message);
    if (error.name == "SequelizeValidationError") {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

module.exports = {
  LoginOrRegister,
};
