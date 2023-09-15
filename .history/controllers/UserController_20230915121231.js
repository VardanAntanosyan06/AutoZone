const { Users } = require("../models");
const { Cars } = require("../models");
const moment = require("moment");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendSMSCode } = require("../controllers/lib");

const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const User = await Users.findOne({
      where: { phoneNumber },
    });

    if (User && User.isVerified)
      return res.status(200).json({ message: "Enter pin code." });

    const code = Math.floor(Math.random() * 8999 + 1000);
    const hashPin = bcrypt.hashSync(code.toString(), 10);

    if (User && !User.isVerified) {
      sendSMSCode(
        +phoneNumber,
        "Verify your account",
        `Verification code is ${code}`
      );

      await Users.update(
        { pin: hashPin, mes },
        {
          where: { phoneNumber },
        }
      );
      return res.json({ success: true });
    }


    await Users.create({
      phoneNumber: phoneNumber,
      pin: hashPin,
      messageSendCount: 1,
    });

    await sendSMSCode(
      +phoneNumber,
      "Verify your account",
      `Verification code is ${code}`
    );

    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    if (error.name == "SequelizeValidationError") {
      return res.status(403).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const Verification = async (req, res) => {
  try {
    const { verificationCode, phoneNumber } = req.body;

    const User = await Users.findOne({
      where: {
        phoneNumber,
      },
    });
    console.log(
      verificationCode,
      bcrypt.compareSync(verificationCode, User.pin)
    );
    if (User && bcrypt.compareSync(verificationCode, User.pin))
      return res.json({ success: true });

    return res
      .status(403)
      .json({ message: "Wrong verificationCode or phoneNumber!" });
  } catch (error) {
    console.log(error);
  }
};

const CreateOrUpdatePin = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  LoginOrRegister,
  Verification,
};
