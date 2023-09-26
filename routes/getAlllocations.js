var express = require('express');
var router = express.Router();
const controller = require("../controllers/lib")

router.get("/getLocations",controller.getAlllocations)
// router.get("/verification",controller.Verification)


module.exports = router;