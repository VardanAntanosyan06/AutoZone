const { Users } = require("../models");

const Searchcar = async (req, res) => {
  try {
    const { documentNumber, phoneNumber } = req.body;

    const { id } = await Users.findOne({ where: { phoneNumber } });

    if (!id)return res
        .json(404)
        .status({ success: false, message: "User not found" });

        await fetch(
          'https://api.onepay.am/autoclub/payment-service/select-vehicle',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization:
                'Y3rFG3iEZUVhbn7v6sJOzovrkZkvIZHYb9Kb7LnYqCW0Ne5pVsqPt3NdLvGiDQPp',
            },
    
            body: JSON.stringify({
              userID: userId,
              phone: phoneNumber,
              documentNumber: techNumber,
            }),
          },
        )
  } catch (error) {}
};

module.exports = {
  Searchcar,
};
