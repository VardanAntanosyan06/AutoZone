var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/LoginOrRegister",controller.LoginOrRegister)

module.exports = router;