var express = require('express');
var router = express.Router();
const controller = require("")

router.post("/",controller.add)

module.exports = router;