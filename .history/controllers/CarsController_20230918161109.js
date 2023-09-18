const { Users } = require("../models");
const fetch = require("node-fetch")
const Searchcar = async (req, res) => {
  try {
    const { techNumber, phoneNumber } = req.body;

    const { id } = await Users.findOne({ where: { phoneNumber } });

    if (!id)
      return res
        .json(404)
        .status({ success: false, message: "User not found" });

    let carData = await fetch(
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
          userID: id,
          phone: phoneNumber,
          documentNumber: techNumber,
        }),
      }
    );
    carData = carData.json();
    return res.status(200).json({ carData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  Searchcar,
};
