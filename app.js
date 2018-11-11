
var env = process.env.NODE_ENV || 'dev';

var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger(env));
var Player = require('./player')
var Cards = require('./cards')

var player = new Player(new Cards(), {
    "debug": false,
    "name": "P1",
    "aggressivite": 1.3,
    "localport": 3001,
    "host": "localhost", "port": 4000
})

var player2 = new Player(new Cards({ debug: true }), {
    "debug": false,
    "name": "P2",
    "aggressivite": 1.5,
    "localport": 3002,
    "host": "localhost", "port": 4000
})

var player3 = new Player(new Cards(), {
    "debug": false,
    "name": "P3",
    "aggressivite": 1.8,
    "localport": 3003,
    "host": "localhost", "port": 4000
})

var player3 = new Player(new Cards(), {
    "debug": false,
    "name": "P4",
    "aggressivite": 2,
    "localport": 3004,
    "host": "localhost", "port": 4000
})



module.exports = app;
