var express = require('express')
var router = express.Router()
var db = require('../db')()


router.get('/', function(req, res, next) {

  db.find("player", { name: "Marcel3" }, function(players) {
    //console.log(players)
    res.json(players)
  })
  

});

module.exports = router;
