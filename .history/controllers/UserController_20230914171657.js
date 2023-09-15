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

    const code = Math.floor(Math.random() * 8999 + 1000);

    await User.create({
          phoneNumber,
          pin:bcrypt.hashSync(code,10)
})
  } catch (error) {}
};
