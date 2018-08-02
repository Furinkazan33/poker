
var env = process.env.NODE_ENV || 'dev';

var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger(env));

var v1Router = require('./routes/v1');

//var db = require('./db')()
//db.create_db() 
//db.create_collections(["player"])
//db.insert("player", { name: "Marcel3" })
var io = require('socket.io-client')
var logic = require('./logic').default()




app.use('/v1', v1Router);


module.exports = app;
