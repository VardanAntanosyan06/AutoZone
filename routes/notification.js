var express = require('express');
var router = express.Router();
const controller = require("../controllers/NotificationController")

router.post("/send",controller.sendNotifications)
// router.post("/sendSMSCodeForVerification",controller.SendSMSCodeForVerification)
// router.post("/verification",controller.Verification)
// router.patch("/createOrUpdatePin",controller.CreateOrUpdatePin)
// router.patch("/updateDeviceToken",controller.updateDeviceToken)
// router.post("/login",controller.Login)
// router.delete("/deleteUserForTesting/:phoneNumber",controller.deleteUserForTesting)


module.exports = router;