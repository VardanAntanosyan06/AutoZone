var express = require('express');
var router = express.Router();
const controller = require("../controllers/AdminPart/Login")
const MenuController = require("../controllers/AdminPart/Menu")

router.post("/login",controller.Login)
router.get("/isLogined",controller.isLogined)
router.post("/getAllUserData",MenuController.GetAllUserData)
router.post("/getAllCarData",MenuController.getAllCarData)
router.get("/getAllComplaintsData",MenuController.getAllComplaintsData)
router.get("/getAllPaymentData",MenuController.getAllPaymentData)
module.exports = router;