const fetch = require("node-fetch");
const { calculateDistance } = require("./lib");
const { Cars } = require("../models");

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

const GetServicesForPay = async (req, res) => {
  try {
    const { techNumber } = req.body;
    if (!techNumber)
      return res.status(403).json({ message: "techNumber cannot be null." });
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });

    if (!Car) res.status(404).json({ message: "Car was not found." });
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
    return res.json({ succes: true, services });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
const GetPaymentURL = async(req,res)=>{
  try {
    const {techNumber} = req.body;
  }catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}
module.exports = {
  GetStatons,
  GetServicesForPay,
};
