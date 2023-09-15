var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/loginOrRegister",controller.LoginOrRegister)
router.get("/loginOrRegister",controller.LoginOrRegister)

module.exports = router;