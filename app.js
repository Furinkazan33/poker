
var env = process.env.NODE_ENV || 'dev';

var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger(env));
var Player = require('./player')
var Cards = require('./cards')

var player = new Player(new Cards({ "aggressivite": 1.5, }), {
    "debug": true,
    "name": "Les cannards loqués",
    "localport": 3001,
    "host": "192.168.0.10", "port": 4000
})
/*
var player2 = new Player(new Cards({ debug: true, "aggressivite": 1.5, }), {
    "debug": false,
    "name": "P2",
    "localport": 3002,
    "host": "localhost", "port": 4000
})

var player3 = new Player(new Cards({ "aggressivite": 1.8, }), {
    "debug": false,
    "name": "P3",
    "localport": 3003,
    "host": "localhost", "port": 4000
})

var player3 = new Player(new Cards({ "aggressivite": 2, }), {
    "debug": false,
    "name": "P4",
    "localport": 3004,
    "host": "localhost", "port": 4000
})
*/


module.exports = app;
