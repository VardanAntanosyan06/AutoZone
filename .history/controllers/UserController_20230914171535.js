const { Users } = require("../models");
const { Cars } = require("../models");
const bcrypt = re
const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;


    const User = Users.findOne({
          where:{phoneNumber}
    })

    if(User && User.isVerified) return res.status(200).json({message:"Enter pin code."})

    await User.create({
          phoneNumber
          pin:bcr
})
  } catch (error) {}
};
