var express = require('express');
var router = express.Router();
const controller = require("../controllers/CarsController")

router.post("/search",controller.Searchcar)
// router.get("/verification",controller.Verification)
// router.patch("/createOrUpdatePin",controller.CreateOrUpdatePin)
// router.post("/login",controller.Login)
router.delete("/deleteCar/:techNumber",controller.DeleteCar)


module.exports = router;