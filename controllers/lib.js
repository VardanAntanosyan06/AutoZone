const fetch = require("node-fetch");
const { Users } = require("../models");
const { Cars } = require("../models");
const serviceAccount = require("../public/jsons/google-services.json");
const admin = require("firebase-admin");
const { Op } = require("sequelize");
const mysql = require("mysql2");
const { PaymentStatusOne } = require("../models");

const sendSMSCode = async (phoneNumber, subject, text) => {
  //working API
  await fetch("https://api.mobipace.com:444/v3/Authorize", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Username: process.env.MPC_USER,
      Password: process.env.MPC_USER_PASSWORD,
    }),
  })
    .then((res) => res.json())
    .then((responseJson) => {
      console.log(responseJson);
      let sessionId = responseJson.SessionId;

      fetch("https://api.mobipace.com:444/v3/Send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SessionId: sessionId,
          Sender: "AutoZone",

          Messages: [
            {
              Recipient: phoneNumber,
              Body: text,
            },
          ],
        }),
      });
    });
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const deg2rad = (deg) => deg * (Math.PI / 180);

  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const getAlllocations = async (req, res) => {
  try {
    let locations = await fetch("https://api.onepay.am/autoclub/locations", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
      },
    });

    locations = await locations.json();

    return res.status(200).json({ success: true, locations });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed, so we add 1.
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

const sendInspectionMessage = async () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    const currentDate = new Date();

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);

    const User = await Users.findAll({
      attributes: ["id", "deviceToken"],
      include: {
        model: Cars,
        where: {
          inspection: {
            [Op.and]: {
              [Op.gte]: currentDate,
              [Op.lte]: targetDate,
            },
          },
        },
      },
    });

    await Promise.all(
      User.map(async (e) => {
        const message = {
          notification: {
            title: "Տեխզննման ժամկետ",
            body: `${
              e.Cars[0].carNumber
            } մեքենայի տեխզննման ժամկետն ավարտվում է ${formatDate(
              new Date(e.Cars[0].inspection)
            )}թ.-ին:`,
          },
          token: e.deviceToken,
        };

        await admin.messaging().send(message);
      })
    );
  } catch (error) {
    console.error("Error sending GET request:", error);
  }
};

const sendPaymentMessage = async (req, res) => {
  try {
    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccount),
    //   });
    // }

    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "onepay",
      password: "evywS3K6RJB8~>.^",
    });

    // const message = {
    //   notification: {
    //     title: "Վճարումն հաստատված է",
    //     body: `71LS001 մեքենայի տեխզննման վճարումը հաստատված է։ Խնդրում ենք մոտենալ Ձեր կողմից նշված տեխզննման կայան:`,
    //   },
    //   token:
    //     "d_I8MZVZR8GVUq4jW-cZnh:APA91bHrVUZAbjelN5NRfq7N9Z2xPu02TvPCB__CBP5A1bOPNma0naKY_YYe7xe3p58kexS8gXxAqR5EPB0qyF__NFPItQjBl-HVJM7NYl0luTDl3u8Wqx7MPV3JnGkSqEu73V3NB7lt",
    // };

    // // await admin.messaging().send(message);
    // const requests = await Users.findAll({include:{
    //   model:PaymentStatusOne
    // }});

    // if (requests.length > 0) {
    //   Promise.all(
    //     requests.map(async (request) => {
    //       const users  = await Users.findAll({where:{phoneNumber:e.phoneNumber},attributes:['id','deviceToken']});
    //       users.map((user)=>{
            
    //       })
          
    //     })
    //   );
    // }
    connection.query(
      "SELECT * FROM `orders` WHERE `is_autoclub` =1 AND `status`=1;",
      function (err, results) {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Something went wrong." });
        }
        if (results.length > 0) {
          // add to postgreSQL
          return res.json(results);
        }
        return res.status(404).json({ message: "Request not found!" });
      }
    );
  } catch (error) {
    console.error("Error sending GET request:", error);
  }
};

module.exports = {
  sendSMSCode,
  calculateDistance,
  getAlllocations,
  sendInspectionMessage,
  sendPaymentMessage,
};
