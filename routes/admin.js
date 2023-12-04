var express = require('express');
var router = express.Router();
const controller = require("../controllers/AdminPart/Login")

router.post("/login",controller.Login)
router.get("/isLogined",controller.isLogined)

module.exports = router;