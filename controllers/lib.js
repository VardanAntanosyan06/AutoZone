const fetch = require("node-fetch");
const { Users } = require("../models");
const { Cars } = require("../models");
const serviceAccount = require("../public/jsons/google-services.json");
const admin = require("firebase-admin");
const { Op } = require("sequelize");
const mysql = require("mysql2");


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

const sendPaymentMessage = async () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    // create the connection to database
    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "onepay",
      password:"evywS3K6RJB8~>.^"
    });

    // simple query
    const message = {
      notification: {
        title: "Վճարումն հաստատվել է",
        body: `71LS001 մեքենայի տեխզննման վճարումը հաստատված է։ Խնդրում ենք մոտենալ Ձեր կողմից նշված տեխզննման կայան`,
      },
      token: "cKQX8rURRFGbMFQte3aL1K:APA91bFia3eVPXBGE7zG_VEaptPCsTyfmAbGIV7bkRTnBPu5Zbg1tr9TAxFOwG760kVxtOCzB9PY-97UtqPzUf9tYuKIMYD1wLDRyuR-wPHbhJv3sT8PIqi1-xLWIMxbjarw2yVijeVG",
    };

    await admin.messaging().send(message);
    connection.query(
      
      'SELECT * FROM `orders` WHERE `is_autoclub` =1;',
      function (err, results, fields) {
        if(err){
          return res.json(err);
        }
        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
        return res.json(results)
      }
      );
      
    // targetDate.setDate(targetDate.getDate() + 5);
    // const User = await Users.findAll({ attributes: ["id", "deviceToken"] });
  } catch (error) {
    console.error("Error sending GET request:", error);
  }
};

module.exports = {
  sendSMSCode,
  calculateDistance,
  getAlllocations,
  sendInspectionMessage,
  sendPaymentMessage
};
