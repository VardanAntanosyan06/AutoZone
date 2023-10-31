const { Users } = require("../models");
const { Cars } = require("../models");
const { Notifications } = require("../models"); 
const { Answers } = require("../models");
const serviceAccount = require("../public/jsons/google-services.json");
const admin = require("firebase-admin");

const sendNotifications = async (req, res) => {
  try {
    const { receiverId, title, body } = req.body;
    let { authorization: token } = req.headers;

    if (token) {
      token = token.replace("Bearer ", "");

      const Sender = await Users.findOne({ where: { token } });
      
      const receiver = await Users.findOne({ where: { id: receiverId } });
      if (Sender && receiver) {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        const message = {
          notification: {
            title,
            body,
          },
          token: receiver.deviceToken,
        };

        await admin.messaging().send(message);

        await Notifications.create({
          receiverId,
          senderId: Sender.id,
          body,
          title,
          status: "sent",
        });
        return res.status(200).json({ success: true });
      }
      return res
        .status(401)
        .json({ success: false, message: "Invalid token or receiverId" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Token or receiverId cannot be empty" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const notificationAnswer = async (req, res) => {
  try {
    const { title, body, notificationId } = req.body;

    const Notification = await Users.findOne({
      include:{
        model:Notifications,
        where: { id: notificationId },
      },
      attributes:['deviceToken']
    });

    if (!Notification) {
      return res
        .status(403)
        .json({ success: false, message: "Notification not found" });
    }
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    const message = {
      notification: {
        title,
        body,
      },
      token: Notification.deviceToken,
    };

    let response = await admin.messaging().send(message);
    console.log(response);
    await Answers.create({
      title,
      body,
      notificationId,
    });

    return res.status(200).json({success:true})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


const getNotificationHistory = async (req, res) => {
  try {
    let { authorization: token } = req.headers;

    if (token) {
      token = token.replace("Bearer ", "");

      let notifications = await Users.findOne({
        include: {
          model: Notifications,
          include:[Answers],
          
        },
        where: { token },
        attributes: ["id", "fullName", "gmail", "phoneNumber"],
      });
      if (notifications) {
        // notifications = notifications.Notifications.sort((a,b)=>a.createdAt+b.c.createdAt)
        notifications.Notifications.sort((a, b) => b.createdAt - a.createdAt);
        return res.json({ success: true, Notifications:notifications.Notifications });
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
  sendNotifications,
  notificationAnswer,
  getNotificationHistory
};
