const { Users } = require("../models");
const { Cars } = require("../models");
const fetch = require("node-fetch");
const Searchcar = async (req, res) => {
  try {
    const { techNumber, phoneNumber } = req.body;

    const User = await Users.findOne({ where: { phoneNumber } });
    const Car = await Cars.findOne({ where: { carTechNumber:techNumber } });

    if(Car) return res.status(403).json({success:false,message:"Another user already aded the car."})
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
            "Y3rFG3iEZUVhbn7v6sJOzovrkZkvIZHYb9Kb7LnYqCW0Ne5pVsqPt3NdLvGiDQPp",
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
    console.log( );
    User.fullName = carData.full_name;

    await User.save();

    await Cars.create({
      carTechNumber: techNumber,
      userId: User.id,
      carNumber: carData.car_reg_no,
      carMark: carData.car,
      serviceRequestId: carData.service_request_id,
      vehicleTypeHy: carData.vehicle_type,
      vehicleTypeEn: Array.isArray(carData.vehicle_types) ? carData.vehicle_types[0].id : "passenger",
    });

    return res.status(200).json({ success:true,carData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success:false,message: "Something went wrong." });
  }
};


const DeleteCar = async (req,res)=>{
  try {
    const { techNumber } = req.params;

    const status = await Cars.destroy({
      where: { carTechNumber:techNumber } 
    });
    if (status === 1)
      return res
        .status(200)
        .json({ success: true, message: "The Car was deleted successfully." });
    return res
      .status(404)
      .json({ success: false, message: "Car not found!." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
} 
module.exports = {
  Searchcar,
  DeleteCar
};
