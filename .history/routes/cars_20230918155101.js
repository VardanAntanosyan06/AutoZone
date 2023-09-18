var express = require('express');
var router = express.Router();
const controller = require("../controllers/CarsController")

router.post("/searc",controller.LoginOrRegister)
// router.get("/verification",controller.Verification)
// router.patch("/createOrUpdatePin",controller.CreateOrUpdatePin)
// router.post("/login",controller.Login)
// router.delete("/deleteUserForTesting/:phoneNumber",controller.deleteUserForTesting)


module.exports = router;