var express = require('express');
var router = express.Router();
const controller = require("../controllers/TechPayController")
const {checkCacheStations} = require("../middleware/chechkCache")

router.post("/getStations",controller.GetStatons)
router.post("/getAllStations",checkCacheStations,controller.GetAllStatons)
router.post("/getServicesForPay",controller.GetServicesForPay)
router.post("/getPaymentURL",controller.GetPaymentURLArca)
router.post("/getOrders",controller.GetOrders)
router.post("/SucccessURL",controller.SucccessURL)
router.post("/FailURL",controller.FailURL)
router.post("/ConfirmIdram",controller.ConfirmIdram)
// router.patch("/updateCarVehicleType",controller.UpdateCarVehicleType)
// router.delete("/deleteCar/:techNumber",controller.DeleteCar)


module.exports = router;