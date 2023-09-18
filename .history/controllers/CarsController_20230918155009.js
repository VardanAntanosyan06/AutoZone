const {Users} = require("../models")

const Searchcar = async (req, res) => {
  try {
    const { documentNumber, phoneNumber } = req.body;

    const User = await Users.findOne({where})

  } catch (error) {}          
};
