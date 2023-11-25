var express = require('express');
var router = express.Router();
const controller = require("../controllers/CarsController")
const {checkCacheAuto} = require("../middleware/chechkCache")

router.post("/search",controller.SearchCar)
router.post("/SearchExisting",controller.SearchExistingCar)
router.post("/addCar",controller.AddCar)
router.patch("/updateCarVehicleType",controller.UpdateCarVehicleType)
router.patch("/updateCarInspection",controller.UpdateCarInspection)
router.delete("/deleteCar/:techNumber",controller.DeleteCar)
router.get("/getUserByCarNumber/:carNumber",controller.getUserByCarNumber)
router.get("/getCount",controller.GetCount)
router.patch("/UpdateAllCardata",controller.UpdateAllCardata)

module.exports = router;