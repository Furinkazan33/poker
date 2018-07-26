var express = require('express')
var router = express.Router()
var db = require('../db')()


router.get('/', function(req, res, next) {

  db.find("player", { name: "Marcel3" }, function(players, err) {
    if (err) { 
      console.log(err)
      res.json(err) 
    }

    //console.log(players)
    res.json(players)
  })
  

})

router.post('/', function(req, res, next) {
  //console.log(req.body.info)
  res.json(req.body)
  

})

module.exports = router;
