const jwt = require("jsonwebtoken");

const checkisAdmin = () =>{
  return function (req, res, next) {
    try {
      const token = req.headers?.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ success: false });
      }
      next();
    } catch (e) {
      res.status(401).json({ success: false });
      console.log(e);
    }
  };
};
module.exports = {
    checkisAdmin
}