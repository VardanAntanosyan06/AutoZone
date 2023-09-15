var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/loginOrRegister",controller.LoginOrRegister)
router.get("/verification",controller.Verification)
router.get("/verification",controller.Verification)

module.exports = router;