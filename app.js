
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path');

// Load Database
var mongo = require('mongoskin'),
    db = mongo.db('mongodb://localhost:27017/todos', {native_parser:true});

var app = express();
module.exports = app;

app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes');

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
