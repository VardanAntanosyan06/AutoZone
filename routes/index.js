var express = require('express');
var router = express.Router();
var fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// router.post("/chnageVersion",(req,res)=>{
// fs.readFile("package.json", {encoding: 'utf8'}, function (err,data) {
//   return res.json({success:true,data})
// });
// })
module.exports = router;
