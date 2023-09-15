const { Users } = require("../models");
const { Cars } = require("../models");

const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;


    const User = Users.findOne({
          where:{phoneNumber}
    })

    if(User) return res.status(200).json({message:"Enter pin code."})

    await User.
  } catch (error) {}
};
