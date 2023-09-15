const { Users } = require("../models");
const { Cars } = require("../models");
const bcrypt = require("bcrypt");


const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;


    const User = await Users.findOne({
          where:{phoneNumber}
    })

    if(User && User.isVerified) return res.status(200).json({message:"Enter pin code."})

    await User.create({
          phoneNumber,
          pin:bcrypt.hashSync()
})
  } catch (error) {}
};
