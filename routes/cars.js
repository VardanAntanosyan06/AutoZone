var express = require('express');
var router = express.Router();
const controller = require("../controllers/CarsController")

router.post("/search",controller.SearchCar)
router.post("/addCar",controller.AddCar)
router.patch("/updateCarVehicleType",controller.UpdateCarVehicleType)
router.delete("/deleteCar/:techNumber",controller.DeleteCar)
router.get("/getUserByCarNumber/:carNumber",controller.getUserByCarNumber)


module.exports = router;