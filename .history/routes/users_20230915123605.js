var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/loginOrRegister",controller.LoginOrRegister)
router.get("/verification",controller.Verification)
router.get("/createOrUpdatePin",controller.CreateOrUpdatePin)

module.exports = router;