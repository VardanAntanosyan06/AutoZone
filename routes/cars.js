var express = require('express');
var router = express.Router();
const controller = require("../controllers/CarsController")

router.post("/search",controller.Searchcar)
router.patch("/updateCarVehicleType",controller.UpdateCarVehicleType)
router.delete("/deleteCar/:techNumber",controller.DeleteCar)
// router.get("/verification",controller.Verification)
// router.post("/login",controller.Login)


module.exports = router;