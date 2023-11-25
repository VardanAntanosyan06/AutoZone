const { ARRAY } = require("sequelize");
const { Users } = require("../models");
const { Cars } = require("../models");
const fetch = require("node-fetch");
const { createClient } = require("redis");

const SearchCar = async (req, res) => {
  try {
    let { techNumber, phoneNumber } = req.body;

    const User = await Users.findOne({ where: { phoneNumber } });
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });

    // if(Car) return res.status(200).json(Car)
    phoneNumber = phoneNumber.replace(/374/g, "0");
    if (!User)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const carDataResponse = await fetch(
      "https://api.onepay.am/autoclub/payment-service/select-vehicle",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
        body: JSON.stringify({
          userID: User.id,
          phone: phoneNumber,
          documentNumber: techNumber,
        }),
      }
    );

    if (!carDataResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch car data" });
    }
    let carData = await carDataResponse.json();
    if (!Array.isArray(carData.vehicle_types)) {
      carData.vehicle_types = Object.values(carData.vehicle_types);
    }
    const client = await createClient()
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
    carData = JSON.stringify(carData);

    client.set(`${techNumber}`, carData, (err) => {
      if (err) {
        throw err;
      }
    });
    carData = JSON.parse(carData);

    return res.status(200).json({ success: true, carData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const SearchExistingCar = async (req, res) => {
  try {
    let { techNumber } = req.body;

    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });

    if (!Car)
      return res
        .status(404)
        .json({ success: false, message: "An existing car was not found." });
    return res.status(200).json({ success: true, carData: Car });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const AddCar = async (req, res) => {
  try {
    let { techNumber, phoneNumber } = req.body;

    techNumber = techNumber.toUpperCase();
    const User = await Users.findOne({ where: { phoneNumber } });
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });

    if (Car)
      return res.status(403).json({
        success: false,
        message: "Another user already aded the car.",
      });
    if (!User)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const client = await createClient()
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();

    let carInfo = await client.get(techNumber);
    if (carInfo) {
      carInfo = JSON.parse(carInfo);
      if (!Array.isArray(carInfo.vehicle_types)) {
        carInfo.vehicle_types = Object.values(carInfo.vehicle_types);
      }

      if (!User.fullName) {
        User.fullName = carInfo.full_name;
        await User.save();
      }
      // console.log();
      await Cars.create({
        carTechNumber: techNumber,
        userId: User.id,
        carNumber: carInfo.car_reg_no,
        carMark: carInfo.car,
        insuranceInfo: carInfo.insurance_info.insurance_name,
        insuranceEndDate:
          new Date(carInfo.insurance_info.end_date) != "Invalid Date"
            ? new Date(carInfo.inspection).toISOString()
            : null,
        inspection: new Date(carInfo.inspection).toISOString(),
        serviceRequestId: carInfo.service_request_id,
        vehicleTypeHy: (carInfo.vehicle_type = "ԿԻՍԱԿՑՈՐԴ"
          ? "Կցորդ"
          : carInfo.vehicle_type),
        vehicleTypeEn: carInfo.vehicle_types[0].id,
      });

      return res.status(200).json({ success: true });
      // return res.status(200).json( carInfo);
    }

    phoneNumber = phoneNumber.replace(/374/g, "0");

    const carDataResponse = await fetch(
      "https://api.onepay.am/autoclub/payment-service/select-vehicle",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
        body: JSON.stringify({
          userID: User.id,
          phone: phoneNumber,
          documentNumber: techNumber,
        }),
      }
    );

    if (!carDataResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch car data" });
    }
    let carData = await carDataResponse.json();
    if (!Array.isArray(carData.vehicle_types)) {
      carData.vehicle_types = Object.values(carData.vehicle_types);
    }
    if (!User.fullName) {
      User.fullName = carData.full_name;
      await User.save();
    }
    await Cars.create({
      carTechNumber: techNumber,
      userId: User.id,
      carNumber: carData.car_reg_no,
      carMark: carData.car,
      insuranceInfo: carData.insurance_info.insurance_name,
      insuranceEndDate: carData.insurance_info.end_date,
      inspection: new Date(carData.inspection).toISOString(),
      serviceRequestId: carData.service_request_id,
      vehicleTypeHy: carData.vehicle_type,
      vehicleTypeEn: carData.vehicle_types[0].id,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const DeleteCar = async (req, res) => {
  try {
    const { techNumber } = req.params;

    const status = await Cars.destroy({
      where: { carTechNumber: techNumber },
    });
    if (status === 1)
      return res
        .status(200)
        .json({ success: true, message: "The Car was deleted successfully." });
    return res.status(404).json({ success: false, message: "Car not found!." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const UpdateCarVehicleType = async (req, res) => {
  try {
    const { name, id, techNumber } = req.body;
    console.log(techNumber);
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });
    if (!Car)
      return res
        .status(404)
        .json({ success: false, message: "Car not found!" });

    Car.vehicleTypeHy = name;
    Car.vehicleTypeEn = id;

    await Car.save();

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
          vehicle_types: id,
        }),
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "The Car was updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const UpdateCarInspection = async (req, res) => {
  try {
    const { techNumber, inspection } = req.body;
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });

    if (!Car)
      return res
        .status(404)
        .json({ success: false, message: "Car not found!" });

    Car.inspection = inspection;

    await Car.save();
    return res
      .status(200)
      .json({ success: true, message: "The Car was updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserByCarNumber = async (req, res) => {
  try {
    let { carNumber } = req.params;

    carNumber = carNumber.toUpperCase();
    const User = await Users.findOne({
      include: { model: Cars, where: { carNumber } },

      attributes: ["id", "phoneNumber", "fullName", "gmail", "deviceToken"],
    });
    if (!User)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    return res.status(200).json({ success: true, User });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const GetCount = async (req, res) => {
  try {
    const count = await Cars.count();

    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const UpdateAllCardata = async (req, res) => {
  try {
    let { techNumber, phoneNumber } = req.body;

    console.log(techNumber,phoneNumber,"+++++++++++++++++++++++++++++++++++++++++");
    const User = await Users.findOne({ where: { phoneNumber } });
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });

    // if(Car) return res.status(200).json(Car)
    phoneNumber = phoneNumber.replace(/374/g, "0");
    if (!User)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const carDataResponse = await fetch(
      "https://api.onepay.am/autoclub/payment-service/select-vehicle",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "XReWou2hVHAEXxwlq4BWlUeld?YKexVceIQaeMuAd46ahTDypeM0Gc58qYUhXyIG",
        },
        body: JSON.stringify({
          userID: User.id,
          phone: phoneNumber,
          documentNumber: techNumber,
        }),
      }
    );

    if (!carDataResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch car data" });
    }
    let carData = await carDataResponse.json();
    // return res.json(carData)
    
    Car.insuranceInfo = carData.insurance_info.insurance_name,
    Car.insuranceEndDate =
        new Date(carData.insurance_info.end_date) != "Invalid Date"
          ? new Date(carData.insurance_info.end_date).toISOString()
          : null,
      Car.inspection = new Date(carData.inspection).toISOString();

    await Car.save();
    return res.status(200).json({ success: true,inspection:Car.inspection });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

module.exports = {
  SearchCar,
  AddCar,
  SearchExistingCar,
  DeleteCar,
  UpdateCarVehicleType,
  getUserByCarNumber,
  GetCount,
  UpdateCarInspection,
  UpdateAllCardata
};
