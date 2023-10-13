var express = require('express');
var router = express.Router();
const controller = require("../controllers/TechPayController")

router.post("/getStations",controller.GetStatons)
router.post("/getServicesForPay",controller.GetServicesForPay)
router.post("/getPaymentURLArca",controller.GetPaymentURLArca)
router.get("/getOrders/:id",controller.GetOrders)
// router.patch("/updateCarVehicleType",controller.UpdateCarVehicleType)
// router.delete("/deleteCar/:techNumber",controller.DeleteCar)


module.exports = router;