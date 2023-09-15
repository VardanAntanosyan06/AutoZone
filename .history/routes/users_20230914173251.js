var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/",controller.add)

module.exports = router;