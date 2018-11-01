
var env = process.env.NODE_ENV || 'dev';

var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger(env));

var player = require('./player')({
    "debug": true,
    "name": "Les cannards loqués",
    "localport": 3001,
    "host": "localhost", "port": 1300
})

var player2 = require('./player')({
    "debug": false,
    "name": "P2",
    "localport": 3002,
    "host": "localhost", "port": 1300
})



module.exports = app;
