const fetch = require("node-fetch");
const { calculateDistance } = require("./lib");
const { Cars } = require("../models");
const { Users } = require("../models");
const { SubscribtionPayment,PaymentStatusOne } = require("../models");
const { createClient, setex } = require("redis");
var CryptoJS = require("crypto-js");
const { Op } = require("sequelize");

const GetStatons = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    let stations = await fetch("https://api.onepay.am/autoclub/partners", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
      },
    });
    stations = await stations.json();

    stations = stations.map((e) => {
      e.data = e.translations.hy;
      e.location.name = e.location.translations.hy.name;
      e.location.parent = e.location.parent.translations.hy.name;
      delete e.translations;
      delete e.location.translations;
      delete e.location.parent.translations;

      return e;
    });

    const stationsWithDistances = stations.map((station) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude
      );
      return { ...station, distance };
    });

    stationsWithDistances.sort((a, b) => a.distance - b.distance);

    return res.status(200).json({ stationsWithDistances });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong." });
  }
};

const GetAllStatons = async (req, res) => {
  try {
    const { community, region } = req.body;

    if (!community || !region)
      return res.status(403).json({
        success: false,
        message: "community or region cannot be empty",
      });

    let stations = await fetch("https://api.onepay.am/autoclub/partners", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
      },
    });
    stations = await stations.json();
    let stationsWithAdditionalLocation = stations.filter(
      (e) => e.additional_location
    );
    stationsWithAdditionalLocation = stationsWithAdditionalLocation.filter(
      (e) =>
        e.additional_location.translations.en.name == region &&
        e.additional_location.parent.translations.en.name == community
    );
    stationsWithAdditionalLocation = stationsWithAdditionalLocation.map((e) => {
      e.data = e.translations.hy;
      e.additional_location = null;
      delete e.translations;
      return e;
    });
    stations = stations.filter(
      (e) =>
        e.location.parent.translations.en.name == community &&
        e.location.translations.en.name == region
    );
    stations = stations.map((e) => {
      e.data = e.translations.hy;
      e.location.name = e.location.translations.hy.name;
      e.location.parent = e.location.parent.translations.hy.name;
      e.additional_location = stationsWithAdditionalLocation;
      delete e.translations;
      delete e.location.translations;
      delete e.location.parent.translations;

      return e;
    });

    const client = await createClient()
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
    stations = JSON.stringify(stations);

    client.set(`${community + region}`, stations, (err) => {
      if (err) {
        throw err;
      }
    });
    stations = JSON.parse(stations);

    return res.status(200).json({ stations });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const GetServicesForPay = async (req, res) => {
  try {
    const { techNumber } = req.body;
    if (!techNumber)
      return res
        .status(403)
        .json({ successs: false, message: "techNumber cannot be null." });
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });

    if (!Car)
      return res
        .status(404)
        .json({ successs: false, message: "Car was not found." });

    await fetch(
      "https://api.onepay.am/autoclub/payment-service/select-station",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
        body: JSON.stringify({
          service_request_id: Car.serviceRequestId,
          station: 1,
          vehicle_types: Car.vehicleTypeEn,
        }),
      }
    );

    let services = await fetch(
      "https://api.onepay.am/autoclub/payment-service/services",
      {
        method: "POST",
        body: JSON.stringify({
          request: Car.serviceRequestId,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
      }
    );
    services = await services.json();
    services = services.map((e) => {
      e.info = e.translations.hy;

      delete e.translations;
      return e;
    });
    return res.json({ success: true, services });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const GetOrders = async (req, res) => {
  try {
    const { userID, car_reg_no } = req.body;

    const User = await Users.findOne({ where: { id: userID } });
    if (!User)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });

    let payInfo = await fetch(
      "https://api.onepay.am/autoclub/payment-service/orders",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
        body: JSON.stringify({
          userID,
          car_reg_no,
        }),
      }
    );

    if (!payInfo.ok)
      return res.status(500).json({ error: "Failed to fetch pay info" });
    payInfo = await payInfo.json();

    return res.status(200).json({ success: true, payInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const GetPaymentURLArca = async (req, res) => {
  try {
    const { techNumber, station, services, redirectUri } = req.body;

    if (!techNumber || !station)
      return res.status(403).json({
        success: false,
        message: "techNumber,userID and station are undefined",
      });
    const User = await Users.findOne({
      include: { model: Cars, where: { carTechNumber: techNumber } },
    });
    if (!User)
      return res
        .status(403)
        .json({ success: false, message: "You've inserted invalid data." });

    await fetch(
      "https://api.onepay.am/autoclub/payment-service/select-station",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
        body: JSON.stringify({
          service_request_id: User.Cars[0].serviceRequestId,
          station,
          vehicle_types: User.Cars[0].vehicleTypeEn,
        }),
      }
    );
    await fetch("https://api.onepay.am/autoclub/payment-service/services", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
      },
      body: JSON.stringify({
        request: User.Cars[0].serviceRequestId,
      }),
    });

    let paymentResponse = await fetch(
      "https://api.onepay.am/autoclub/payment-service/pay",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
        body: JSON.stringify({
          service_request_id: User.Cars[0].serviceRequestId,
          station,
          services,
          redirectUri,
        }),
      }
    );

    if (!paymentResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch car data" });
    }
    paymentResponse = await paymentResponse.json();
    
    if(paymentResponse.order){
      const isRequest = await PaymentStatusOne.findOne({
        where: {
          phoneNumber: User.phoneNumber,
          requestId: paymentResponse.order.id,
          station
        },
      });
    if (!isRequest) {
      await PaymentStatusOne.create({
        phoneNumber: User.phoneNumber,
        requestId: paymentResponse.order.id,
        station
      });
    }
  }
    return res.json(paymentResponse);
  } catch (error) {
    console.log(error); 
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const TellcelPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    let { authorization: token } = req.headers;
    if (token) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id", "phoneNumber"],
        where: { token },
      });
      if (User) {
        await SubscribtionPayment.destroy({
          where: {
            userId: User.id,
          },
        });
        const { id } = await SubscribtionPayment.create({
          userId: User.id,
          endDate: new Date(),
          paymentWay: "Tellcel",
        });
        const buyer = `+${User.phoneNumber}`;
        const desc = `DESCRIPTION`;
        const description = Buffer.from(desc).toString("base64");
        const key = process.env.TELCELL_PASSWORD; // ID
        const shop_id = process.env.TELCELL_ID; // PASSWORD
        const currency = "51";
        const sum = amount;
        const valid_days = "1";
        const issuer_id = Buffer.from(id.toString()).toString("base64"); // orderId from your database
        const hk =
          key +
          shop_id +
          buyer +
          currency +
          sum +
          description +
          valid_days +
          issuer_id;
        const hash = CryptoJS.MD5(hk).toString();

        const merchant_url = "https://telcellmoney.am/invoices";

        const q =
          merchant_url +
          "?bill:issuer=" +
          encodeURIComponent(shop_id) +
          "&buyer=" +
          encodeURIComponent(buyer) +
          "&currency=" +
          currency +
          "&sum=" +
          sum +
          "&description=" +
          encodeURIComponent(description) +
          "&issuer_id=" +
          encodeURIComponent(issuer_id) +
          "&valid_days=" +
          valid_days +
          "&checksum=" +
          hash;
        console.log(q, hash);
        let data;

        try {
          const response = await fetch(q);

          if (!response.ok) {
            throw new Error(`Վճարման խափանում: ${response.status}`);
          }

          data = await response.json();
        } catch (error) {
          console.log(error);
        }
        let pay = await SubscribtionPayment.findOne({ where: { id } });
        pay.orderKey = data;
        pay.save();
        return res.json({ success: true, id:data });
      }
      return res.status(401).json({ message: "User not found" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const IdramPayment = async (req, res) => {
  try {
    let { authorization: token } = req.headers;
    if (token) {
      token = token.replace("Bearer ", "");
      let User = await Users.findOne({
        attributes: ["id", "phoneNumber"],
        where: { token },
      });
      if (User) {
        await SubscribtionPayment.destroy({
          where: {
            userId: User.id,
          },
        });
        const { id } = await SubscribtionPayment.create({
          userId: User.id,
          endDate: new Date(),
          paymentWay: "Idram",
        });

        return res.json({ success: true, id });
      }
      return res.status(401).json({ message: "User not found" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Token cannot be empty" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const SucccessURL = async (req, res) => {
  try {
    const { url } = req.body;

    if (url) {
      return res.status(200).json(url);
    }
    return res
      .status(403)
      .json({ success: false, message: "URL cannot be empty" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const FailURL = async (req, res) => {
  try {
    const { url } = req.body;

    if (url) {
      return res.status(200).json(url);
    }
    return res
      .status(403)
      .json({ success: false, message: "URL cannot be empty" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const ConfirmIdram = async (request, res) => {
  const SECRET_KEY = process.env.IDRAM_PASSWORD;
  const EDP_REC_ACCOUNT = process.env.IDRAM_ID;
  request = request.body;

  if (
    typeof request.EDP_PRECHECK !== "undefined" &&
    typeof request.EDP_BILL_NO !== "undefined" &&
    typeof request.EDP_REC_ACCOUNT !== "undefined" &&
    typeof request.EDP_AMOUNT !== "undefined"
  ) {
    if (request.EDP_PRECHECK === "YES") {
      if (request.EDP_REC_ACCOUNT === EDP_REC_ACCOUNT) {
        const bill_no = request.EDP_BILL_NO;
        return res.send("OK");
      }
    }
  }

  if (
    typeof request.EDP_PAYER_ACCOUNT !== "undefined" &&
    typeof request.EDP_BILL_NO !== "undefined" &&
    typeof request.EDP_REC_ACCOUNT !== "undefined" &&
    typeof request.EDP_AMOUNT !== "undefined" &&
    typeof request.EDP_TRANS_ID !== "undefined" &&
    typeof request.EDP_CHECKSUM !== "undefined"
  ) {
    const txtToHash =
      EDP_REC_ACCOUNT +
      ":" +
      request.EDP_AMOUNT +
      ":" +
      SECRET_KEY +
      ":" +
      request.EDP_BILL_NO +
      ":" +
      request.EDP_PAYER_ACCOUNT +
      ":" +
      request.EDP_TRANS_ID +
      ":" +
      request.EDP_TRANS_DATE;

    if (
      request.EDP_CHECKSUM.toUpperCase() !==
      CryptoJS.MD5(txtToHash).toString().toUpperCase()
    ) {
      return res.send("Error");
    } else {
      const amount = request.EDP_AMOUNT;
      if (amount > 0) {
        let currentDate = new Date();
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        currentDate = currentDate.toISOString();
        let UserSubscribtionPayment = await SubscribtionPayment.findOne({
          where: { id: request.EDP_BILL_NO },
        });
        UserSubscribtionPayment.endDate = currentDate;
        UserSubscribtionPayment.save();
        return res.send("OK");
        // }
      }
    }
  }
  return res.send("OK");
};

const checkTelcellPayments = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for the start of the day

  const TellcelPayments = await SubscribtionPayment.findAll({
    where: {
      paymentWay: "Tellcel",
      createdAt: {
        [Op.gte]: today,
      },
    },
  });

  Promise.all(
    TellcelPayments.map(async (e) => {
      let issuer_id = e.id;
      let merchant_url = "https://telcellmoney.am/invoices";
      let hk =
        process.env.TELCELL_PASSWORD +
        process.env.TELCELL_ID +
        e.orderKey +
        issuer_id;
      let hash = CryptoJS.MD5(hk);
      let q =
        merchant_url +
        "?check_bill:issuer=" +
        encodeURIComponent(process.env.TELCELL_ID) +
        "&invoice=" +
        e.orderKey +
        "&issuer_id=" +
        issuer_id +
        "&checksum=" +
        hash;
      console.log(q);

      try {
        const response = await fetch(q);

        if (!response.ok) {
          throw new Error(`Վճարման խափանում: ${response.status}`);
        }

        const responseBody = await response.text(); // Use text() instead of json() if the response is not JSON

        data = {};
        responseBody
          .replace(/\n/g, "&")
          .split("&")
          .forEach(function (val) {
            let parts = val.split("=");
            data[parts[0]] = decodeURIComponent(parts[1]);
          });
      } catch (error) {
        data = {
          error: true,
          statusCode: 500,
          message: "Վճարման խափանում",
          errors: error.message,
        };
      }

      if (data.status === "PAID") {
        let currentDate = new Date();
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        currentDate = currentDate.toISOString();
        e.endDate = currentDate;
        e.save();
      }
    })
  );
};

module.exports = {
  GetStatons,
  GetServicesForPay,
  GetPaymentURLArca,
  GetOrders,
  GetAllStatons,
  TellcelPayment,
  SucccessURL,
  FailURL,
  ConfirmIdram,
  IdramPayment,
  checkTelcellPayments,
};
