const { ARRAY } = require("sequelize");
const { Users } = require("../models");
const { Cars } = require("../models");
const fetch = require("node-fetch");

const SearchCar = async (req, res) => {
  try {
    let { techNumber, phoneNumber } = req.body;

    const User = await Users.findOne({ where: { phoneNumber } });

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
    const carData = await carDataResponse.json();
    if (!Array.isArray(carData.vehicle_types)) {
      carData.vehicle_types = Object.values(carData.vehicle_types);
    }

    return res.status(200).json({ success: true, carData });
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

    techNumber = techNumber.toUpperCase()
    const User = await Users.findOne({ where: { phoneNumber } });
    const Car = await Cars.findOne({ where: { carTechNumber: techNumber } });
    phoneNumber = phoneNumber.replace(/374/g, "0");
    if (Car)
      return res.status(403).json({
        success: false,
        message: "Another user already aded the car.",
      });
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
          userID: 32,
          phone: phoneNumber,
          documentNumber: techNumber,
        }),
      }
    );

    if (!carDataResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch car data" });
    }
    const carData = await carDataResponse.json();
    if (!Array.isArray(carData.vehicle_types)) {
      carData.vehicle_types = Object.values(carData.vehicle_types);
    }
    User.fullName = carData.full_name;
    await User.save();
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
  }
    catch (error) {
      console.log(error);
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
    console.log(Car);
    if (!Car)
      return res
        .status(404)
        .json({ success: false, message: "Car not found!" });

    Car.vehicleTypeHy = name;
    Car.vehicleTypeEn = id;

    await Car.save();
    return res
      .status(200)
      .json({ success: true, message: "The Car was updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


const getUserByCarNumber = async (req,res)=>{
  try {
    let {carNumber} = req.params;

    carNumber = carNumber.toUpperCase()
    const User = await Users.findOne({
      include: { model: Cars, where: { carNumber } },

      attributes:['id','phoneNumber','fullName','gmail','deviceToken']
    });
    if(!User) return res.status(404).json({success:false,message:"User not found!"})
    return res.status(200).json({success:true,User})
  }  catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}



module.exports = {
  SearchCar,
  AddCar,
  DeleteCar,
  UpdateCarVehicleType,
  getUserByCarNumber
};
