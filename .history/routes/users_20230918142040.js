var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/register",controller.LoginOrRegister)
router.get("/verification",controller.Verification)
router.patch("/createOrUpdatePin",controller.CreateOrUpdatePin)
router.post("/login",controller.Login)
router.delete("/login",controller.)


module.exports = router;