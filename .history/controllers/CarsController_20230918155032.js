const { Users } = require("../models");

const Searchcar = async (req, res) => {
  try {
    const { documentNumber, phoneNumber } = req.body;

    const { id } = await Users.findOne({ where: { phoneNumber } });
    console.log(id);
  } catch (error) {}
};


module.exports = {
          Searchcar
}