var express = require('express');
var router = express.Router();
const controller = require("../controllers/FinancialAidController")

router.post("/",controller.add)

module.exports = router;