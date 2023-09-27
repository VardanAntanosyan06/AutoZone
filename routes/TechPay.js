var express = require('express');
var router = express.Router();
const controller = require("../controllers/TechPayController")

router.post("/getStations",controller.GetStatons)
router.post("/getServicesForPay",controller.GetServicesForPay)

// router.post("/addCar",controller.AddCar)
// router.patch("/updateCarVehicleType",controller.UpdateCarVehicleType)
// router.delete("/deleteCar/:techNumber",controller.DeleteCar)
// router.get("/verification",controller.Verification)


module.exports = router;