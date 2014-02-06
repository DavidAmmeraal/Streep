
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var parentComponents = require('./routes/parent-components');
var fillTestData = require('./routes/fill-test-data');
var http = require('http');
var path = require('path');
var ParentComponent = require('./models/parent-component');
var mongoose = require('mongoose');

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

mongoose.connect('localhost', 'streep');

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/parent-components', parentComponents.list);
app.get('/fill-test-data', fillTestData.start);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
