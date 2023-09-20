var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/register",controller.LoginOrRegister)
router.post("/sendSMSCodeForVerification",controller.SendSMSCodeForVerification)
router.post("/verification",controller.Verification)
router.patch("/createOrUpdatePin",controller.CreateOrUpdatePin)
router.post("/login",controller.Login)
router.delete("/deleteUserForTesting/:phoneNumber",controller.deleteUserForTesting)


module.exports = router;