var express = require('express');
var router = express.Router();
const controller = require("../controllers/AdminPart/Login")
const MenuController = require("../controllers/AdminPart/Menu")
const {checkisAdmin} = require("../middleware/chechkAuth")
router.post("/login",controller.Login)
router.get("/isLogined",controller.isLogined)
router.post("/getAllUserData",checkisAdmin,MenuController.GetAllUserData)
router.post("/getAllCarData",checkisAdmin,MenuController.getAllCarData)
router.get("/getAllComplaintsData",checkisAdmin,MenuController.getAllComplaintsData)
router.get("/getAllPaymentData",checkisAdmin,MenuController.getAllPaymentData)
module.exports = router;