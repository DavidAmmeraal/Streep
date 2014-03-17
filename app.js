
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var frames = require('./routes/frames');
var fronts = require('./routes/fronts');
var fillTestData = require('./routes/fill-test-data');
var http = require('http');
var path = require('path');

var mongoose = require('mongoose');

var connectDb = function(){
    mongoose.connect('localhost', 'streep');
}

mongoose.connection.on('error', function (err) {
    console.log('Could not connect to mongo server!');
    setTimeout(connectDb, 1000);
    console.log(err);
});

mongoose.connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
});

connectDb();

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', frames.chooseFrame);
app.get('/users', user.list);

app.get('/choose-frame', frames.chooseFrame);
app.get('/edit-frame/:id', frames.editFrame);

app.get('/models_api/frames', frames.all);
app.get('/models_api/frames/:id', frames.findById);
app.get('/models_api/fronts', fronts.all);
app.get('/models_api/fronts/:id', frames.findById);

app.get('/fill-test-data', fillTestData.start);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
