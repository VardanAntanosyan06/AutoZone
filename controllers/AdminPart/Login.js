const { Admins } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Login = async (req, res) => {
  try {
    const { login, password } = req.body;

    const Admin = await Admins.findOne({ where: { login } });

    if (Admin && (await bcrypt.compare(password,Admin.password ))) {
      token = jwt.sign(
        { user_id: Admin.id, email: Admin.login },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      return res.json({ success: true, token });
    }

    return res.status(403).json({ success:false,message: "Wrong login or password" });
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
};

const isLogined = async (req,res)=>{
  try {
    let { authorization: token } = req.headers;

    if(token){
        token = token.replace("Bearer ", "");
      const decode = jwt.verify(token, process.env.JWT_SECRET);

      // if(decode)
      res.json({
          login: true,
      });

  } }
  catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res
        .status(403)
        .json({ message: "Token timeout: please enter the password" });
    }
    console.log(error.message);  
    return res
    .status(500)
    .json({ message: "Something went wrong." });
  }
}

module.exports = {
  Login,
  isLogined
};
