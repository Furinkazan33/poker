'use strict'

var env = process.env.NODE_ENV || 'dev';

var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger(env));

var GameClient = require('./gameClient')
var Cards = require('./cards')

var gameClient1 = new GameClient(new Cards(), {
    "debug": false,
    "name": "P1",
    "aggressivite": 1.3,
    "localport": 3001,
    "host": "localhost", "port": 4000
})

var gameClient2 = new GameClient(new Cards({ debug: true }), {
    "debug": false,
    "name": "P2",
    "aggressivite": 1.5,
    "localport": 3002,
    "host": "localhost", "port": 4000
})

var gameClient3 = new GameClient(new Cards(), {
    "debug": false,
    "name": "P3",
    "aggressivite": 1.8,
    "localport": 3003,
    "host": "localhost", "port": 4000
})

var gameClient4 = new GameClient(new Cards(), {
    "debug": false,
    "name": "P4",
    "aggressivite": 2,
    "localport": 3004,
    "host": "localhost", "port": 4000
})

var gameClients = [ gameClient1, gameClient2, gameClient3, gameClient4 ]

gameClients.forEach(client => {
    client.connect(function() {
        client.start_playing()
    })
})


module.exports = app;
