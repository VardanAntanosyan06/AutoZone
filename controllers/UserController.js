const { Users } = require("../models");
const { Cars } = require("../models");
const { Complaints } = require("../models");
const moment = require("moment");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { sendSMSCode } = require("../controllers/lib");
const fetch = require("node-fetch");
const { createClient } = require("redis");

const sharp = require("sharp");

const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const User = await Users.findOne({
      where: { phoneNumber },
    });
    if (User && moment().diff(User.messageSendTime, "hours") >= 24) {
      (User.messageSendTime = null), (User.messageSendCount = 0);
    }

    if (User && User.isVerified)
      return res
        .status(200)
        .json({ success: true, message: "Enter pin code." });

    const code = Math.floor(Math.random() * 8999 + 1000);
    const hashPin = bcrypt.hashSync(code.toString(), 10);

    if (User && !User.isVerified && User.messageSendCount < 2) {
      sendSMSCode(
        +phoneNumber,
        "Verify your account",
        `Verification code is ${code}`
      );
      (User.pin = hashPin), (User.messageSendCount = User.messageSendCount + 1);
      User.messageSendTime = moment();
      await User.save();
      return res.json({
        success: true,
        message: "The verification code was sent successfully.",
      });
    } else if (!User) {
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
      return res.json({
        success: true,
        message: "The verification code was sent successfully.",
      });
    }
    return res
      .status(403)
      .json({ message: " Maximum daily message limit exceeded." });
  } catch (error) {
    console.log(error);
    if (error.name == "SequelizeValidationError") {
      return res.status(403).json({ success: false, message: error.message });
    } else {
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const SendSMSCodeForVerification = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const User = await Users.findOne({
      where: { phoneNumber },
    });
    if (!User || !User.isVerified)
      return res
        .status(403)
        .json({ success: false, message: "Verified user not found!" });
    if (moment().diff(User.messageSendTime, "hours") >= 24) {
      (User.messageSendTime = null), (User.messageSendCount = 0);
    }

    if (User.isVerified && User.messageSendCount < 2) {
      const code = Math.floor(Math.random() * 8999 + 1000);
      const hashPin = bcrypt.hashSync(code.toString(), 10);
      sendSMSCode(
        +phoneNumber,
        "Verify your account",
        `Verification code is ${code}`
      );
      (User.pin = hashPin), (User.messageSendCount = User.messageSendCount + 1);
      User.messageSendTime = moment();
      await User.save();
      return res.json({
        success: true,
        message: "The verification code was sent successfully.",
      });
    }
    return res
      .status(403)
      .json({ message: " Maximum daily message limit exceeded." });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong." });
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
    if (User && bcrypt.compareSync(verificationCode, User.pin)) {
      User.isVerified = true;
      const token = jwt.sign(
        { user_id: User.id, email: User.email },
        process.env.JWT_SECRET
      );
      User.token = token;
      await User.save();
      return res.json({ success: true, token });
    }

    return res.status(403).json({
      success: false,
      message: "Wrong verificationCode or phoneNumber!",
    });
  } catch (error) {
    console.log(error);
  }
};

const CreateOrUpdatePin = async (req, res) => {
  try {
    const { pin } = req.body;
    let { authorization: token } = req.headers;

    if (token) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id", "fullName", "gmail", "phoneNumber", "isVerified"],
        where: { token },
      });
      if (User && User.isVerified) {
        const hashPin = bcrypt.hashSync(pin.toString(), 10);
        User.pin = hashPin;
        await User.save();

        const token = jwt.sign(
          { user_id: User.id, email: User.email },
          process.env.JWT_SECRET
        );
        User.token = token;
        await User.save();
        return res.json({ success: true, token });
      }
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const Login = async (req, res) => {
  try {
    let { pin, phoneNumber } = req.body;
    if (!phoneNumber || !pin)
      return res
        .status(403)
        .json({ message: "phoneNumber or pin cannot be empty." });
    pin = pin.toString();
    phoneNumber = phoneNumber.toString();
    let { authorization: token } = req.headers;

    if (token) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id", "fullName", "gmail", "phoneNumber", "pin", "token"],
        where: { token },
        include: [Cars],
      });
      if (User) {
        delete User.dataValues.pin;
        return res.json({ success: true, User });
      }
      return res
        .status(403)
        .json({ message: "Token timeout: please enter the pin code" });
    }

    let User = await Users.findOne({
      attributes: ["id", "fullName", "gmail", "phoneNumber", "pin"],
      where: { phoneNumber },
      include: [Cars],
    });

    if (User && (await bcrypt.compare(pin, User.pin))) {
      token = jwt.sign(
        { user_id: User.id, email: User.fullName },
        process.env.JWT_SECRET
      );
      User.token = token;
      await User.save();
      delete User.dataValues.pin;
      return res.json({ success: true, User });
    }

    return res.status(403).json({ message: "Wrong pin" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res
        .status(403)
        .json({ message: "Token timeout: please enter the pin code" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const deleteUserForTesting = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const User = await Users.findOne({ where: { phoneNumber } });

    User &&
      (await Cars.destroy({
        where: { userId: User.id },
      }));
    const status = await Users.destroy({
      where: { phoneNumber },
    });
    if (status === 1)
      return res
        .status(200)
        .json({ success: true, message: "The user was deleted successfully." });
    return res
      .status(404)
      .json({ success: false, message: "User not found!." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const updateDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    let { authorization: token } = req.headers;

    if (token) {
      token = token.replace("Bearer ", "");

      let User = await Users.findOne({
        attributes: ["id", "fullName", "gmail", "phoneNumber", "pin"],
        where: { token },
        include: [Cars],
      });
      if (User) {
        User.deviceToken = deviceToken;
        await User.save();
        return res.json({ success: true });
      }
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const UpdateUserData = async (req, res) => {
  try {
    const { email, fullName } = req.body;
    let { authorization: token } = req.headers;
    console.log(token);

    if (token) {
      token = token.replace("Bearer ", "");
      console.log(token);

      let User = await Users.findOne({
        attributes: ["id", "fullName", "gmail", "phoneNumber"],
        where: { token },
      });
      if (User) {
        fullName ? (User.fullName = fullName) : (User.fullName = User.fullName);
        email ? (User.gmail = email) : (User.gmail = User.gmail);
        await User.save();
        return res.json({ success: true });
      }
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const GetUserData = async (req, res) => {
  try {
    let { authorization: token } = req.headers;

    if (token) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id", "fullName", "gmail", "phoneNumber", "image"],
        where: { token },
        include: [
          {
            model: Cars,
            order: [["createdAt", "DESC"]],
          },
        ],
      });
      if (User) {
        return res.json({ success: true, User });
      }
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const UpdateUserImage = async (req, res) => {
  try {
    const image = req.files?.image;
    let { authorization: token } = req.headers;
    if (token && image) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id", "image"],
        where: { token },
      });
      if (User) {
        let UserIcon = User.image;
        if (UserIcon) {
          UserIcon = UserIcon.split(process.env.HOST)[1];
          console.log(UserIcon);
          fs.unlink(
            path.resolve(__dirname, "..", "static", UserIcon),
            (err) => {
              if (err) {
                throw err;
              }
            }
          );
        }

        const type = image.mimetype.split("/")[1];
        const fileName = v4() + "." + type;
        await image.mv(path.resolve(__dirname, "..", "static", fileName));

        // const inputImagePath = `static/${fileName}`;
        // const outputImagePath = `static/compressed-${fileName}`;
        // const compressionQuality = 40;

        // sharp(inputImagePath)
        //   .jpeg({ quality: compressionQuality })
        //   .toFile(outputImagePath, (err, info) => {
        //     if (err) {
        //       console.error(err);
        //     } else {
        //       console.log(
        //         `Image compressed successfully. New file: ${outputImagePath}`
        //       );
        //       fs.unlink(
        //         path.resolve(__dirname, "..", "static", fileName),
        //         (err) => {
        //           if (err) {
        //             throw err;
        //           }
        //         }
        //       );
        //     }
        //   });

        User.image = process.env.HOST + fileName;
        await User.save();
        return res.json({ success: true, image: User.image });
      }
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token or Image cannot be empty" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const sendComplaint = async (req, res) => {
  try {
    const { reciverId, complaint } = req.body;
    let { authorization: token } = req.headers;
    if (token) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id"],
        where: { token },
      });
      if (User) {
        await Complaints.create({
          senderId: User.id,
          reciverId,
          complaint,
        });
        return res.json({ success: true });
      }
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const GetDAHKInfo = async (req, res) => {
  try {
    let { authorization: token } = req.headers;
    const client = await createClient()
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
    if (token) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id"],
        include: [{ model: Cars, attributes: ["carNumber"] }],
        where: { token },
      });

      if (User) {
        let cars = User.Cars.map((e) => e.carNumber);
        cars = cars.join();

        let carInfo = await client.get(cars);
        if (carInfo) {
          carInfo = JSON.parse(carInfo);
          return res.status(200).json(carInfo);
        }

        let data = await fetch(
          `https://api.onepay.am/autoclub/dahk?techNumber=${cars}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization:
                "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
            },
          }
        );
        data = await data.json();
        let carData = JSON.stringify(data);
        // cars = cars.replace(",","")
        console.log(cars);
        client.set(`${cars}`, carData, (err) => {
          if (err) {
            throw err;
          }
        });
        // data = JSON.parse(carData)
        // data = Object.values(data)
        return res.json(data);
      }
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

module.exports = {
  LoginOrRegister,
  Verification,
  CreateOrUpdatePin,
  Login,
  deleteUserForTesting,
  SendSMSCodeForVerification,
  updateDeviceToken,
  UpdateUserData,
  GetUserData,
  UpdateUserImage,
  sendComplaint,
  GetDAHKInfo,
};
