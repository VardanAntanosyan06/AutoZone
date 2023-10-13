var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.get("/getData",controller.GetUserData)
router.post("/register",controller.LoginOrRegister)
router.post("/sendSMSCodeForVerification",controller.SendSMSCodeForVerification)
router.post("/verification",controller.Verification)
router.patch("/createOrUpdatePin",controller.CreateOrUpdatePin)
router.patch("/updateDeviceToken",controller.updateDeviceToken)
router.patch("/updateUserData",controller.UpdateUserData)
router.patch("/updateUserImage",controller.UpdateUserImage)
router.post("/login",controller.Login)
router.delete("/deleteUserForTesting/:phoneNumber",controller.deleteUserForTesting)


module.exports = router;