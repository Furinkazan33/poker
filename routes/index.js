var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
//  res.send({ a: "a" })  

  db.get_players(function(err, players) {
    return res.send({ a: "a" })
  })
  

});

module.exports = router;
