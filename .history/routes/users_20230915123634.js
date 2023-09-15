var express = require('express');
var router = express.Router();
const controller = require("../controllers/UserController")

router.post("/register",controller.LoginOrRegister)
router.get("/verification",controller.Verification)
router.patch("/createOrUpdatePin",controller.CreateOrUpdatePin)

module.exports = router;