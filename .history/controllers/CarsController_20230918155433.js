const { Users } = require("../models");

const Searchcar = async (req, res) => {
  try {
    const { documentNumber, phoneNumber } = req.body;

    const { id } = await Users.findOne({ where: { phoneNumber } });

    if (!id)return res
        .json(404)
        .status({ success: false, message: "User not found" });


  } catch (error) {}
};

module.exports = {
  Searchcar,
};
