const { Users } = require("../models");
const { Cars } = require("../models");
const fetch = require("node-fetch")
const Searchcar = async (req, res) => {
  try {
    const { techNumber, phoneNumber } = req.body;

    const User = await Users.findOne({ where: { phoneNumber } });

    if (!id)
      return res
        .json(404)
        .status({ success: false, message: "User not found" });

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
        
        User.fullName = carData.fullName;

        await User.save()

        await Cars.update({
          carTechNumber:techNumber,
          userId:id,
          carNumber:carData.car_reg_no,
          carmark:carData.car,
          serviceRequestId,
          vehicleTypeHy:
        })
        return res.status(200).json({ carData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  Searchcar,
};
