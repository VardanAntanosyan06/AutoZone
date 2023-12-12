const fetch = require("node-fetch");
const { calculateDistance } = require("./lib");
const { Cars } = require("../models");
const { Users } = require("../models");
const { SubscribtionPayment } = require("../models");
const { createClient, setex } = require("redis");
var CryptoJS = require("crypto-js");

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
    console.log(
      User.Cars[0].serviceRequestId,
      station,
      User.Cars[0].vehicleTypeEn,
      services
    );
    if (!paymentResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch car data" });
    }
    paymentResponse = await paymentResponse.json();

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
        await fetch(q, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        return res.json({ success: true });
      }
      return res.status(401).json({message:"User not found"});
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

module.exports = {
  GetStatons,
  GetServicesForPay,
  GetPaymentURLArca,
  GetOrders,
  GetAllStatons,
  TellcelPayment,
};
