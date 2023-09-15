const { Users } = require("../models");
const { Cars } = require("../models");
const moment = require("moment");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendSMSCode } = require("../controllers/lib");

const LoginOrRegister = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const User = await Users.findOne({
      where: { phoneNumber },
    });
    if(User && moment().diff(User.messageSendTime, "hours") >= 24){
      User.messageSendTime = null,
      User.messageSendCount = 0;
    }

    if (User && User.isVerified) return res.status(200).json({ message: "Enter pin code." });

    const code = Math.floor(Math.random() * 8999 + 1000);
    const hashPin = bcrypt.hashSync(code.toString(), 10);

    if (User && !User.isVerified && User.messageSendCount<2) {
      sendSMSCode(
        +phoneNumber,
        "Verify your account",
        `Verification code is ${code}`
      );
      User.pin =  hashPin,
      User.messageSendCount = User.messageSendCount+1;
      User.messageSendTime = moment() 
      await User.save()
      return res.json({ success: true });
    }else if(!User){
    await Users.create({
      phoneNumber: phoneNumber,
      pin: hashPin,
      messageSendCount: 1,
    });

    await sendSMSCode(
      +phoneNumber,
      "Verify your account",
      `Verification code is ${code}`
      ); 
      return res.json({ success: true });
    }
    return res.status(403).json({message:" Maximum daily message limit exceeded."})
    } catch (error) {
      console.log(error);
      if (error.name == "SequelizeValidationError") {
        return res.status(403).json({ message: error.message });
      } else {
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const Verification = async (req, res) => {
  try {
    const { verificationCode, phoneNumber } = req.body;

    const User = await Users.findOne({
      where: {
        phoneNumber,
      },
    });
    console.log(
      verificationCode,
      bcrypt.compareSync(verificationCode, User.pin)
    );
    if (User && bcrypt.compareSync(verificationCode, User.pin)){
      User.isVerified = true;

      await User.save()
      return res.json({ success: true }); 
    }

    return res
      .status(403)
      .json({ message: "Wrong verificationCode or phoneNumber!" });
  } catch (error) {
    console.log(error);
  }
};

const CreateOrUpdatePin = async (req, res) => {
  try {
    const {phoneNumber,pin} = req.body;

    const User = await Users.findOne({
      where: { phoneNumber },
    }); 
     
    
    if(User && User.isVerified){
      const hashPin = bcrypt.hashSync(pin.toString(), 10);
      User.pin =  hashPin
      await User.save() 

       const token = jwt.sign({ user_id: User.id, email:User.email }, process.env.JWT_SECRET);
      return res.json({success:true,token})
    }

    return res
    .status(403)
    .json({ message: "Wrong phoneNumber!" });
  } catch (error) {
    console.log(error);
  }
};

const Login = async (req,res)=>{
  try {
    const {pin,token} = req.body;
    
    if(token){
      const User = await Users.findOne({where:{}})
    }
    
  } catch (error) {
    
  }
}
module.exports = {
  LoginOrRegister,
  Verification,
  CreateOrUpdatePin
};
