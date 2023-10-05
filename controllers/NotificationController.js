const { Users } = require("../models");
const { Cars } = require("../models");
const { Notifications } = require("../models");
const serviceAccount = require("../public/jsons/google-services.json");
const admin = require("firebase-admin");

const sendNotifications = async (req, res) => {
  try {
    const { receiverId, title, body, answerId } = req.body;
    let { authorization: token } = req.headers;

    if (token && receiverId) {
      token = token.replace("Bearer ", "");

      const Sender = await Users.findOne({ where: { token } });
      const receiver = await Users.findOne({ where: { id: receiverId } });

      if (Sender && receiver) {
        if(!admin.apps.length){
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
          status:"sent",
          answerId
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

module.exports = {
  sendNotifications,
};
