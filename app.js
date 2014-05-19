
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var frames = require('./routes/frames');
var fronts = require('./routes/fronts');
var sizes = require('./routes/sizes');
var screenshot = require('./routes/screenshot');
var serverRendering = require('./routes/server-rendering');
var fillTestData = require('./routes/fill-test-data');
var http = require('http');
var path = require('path');

var mongoose = require('mongoose');

var connectDb = function(){
    mongoose.connect('localhost', 'streep');
};

mongoose.connection.on('error', function (err) {
    console.log('Could not connect to mongo server!');
    setTimeout(connectDb, 1000);
    console.log(err);
});

mongoose.connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
});

setTimeout(function(){
    connectDb();
}, 5000);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({limit: '50mb'}))
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app);
var io = require('socket.io').listen(server);

serverRendering.setIO(io);

app.get('/', frames.editFrame);
app.get('/users', user.list);

app.post('/server-rendering/command', serverRendering.command());
app.post('/server-rendering/command', function(req, res){
    var uuid = require('node-uuid');
    var id = uuid.v1();
    req.body.commandID = id;
    waitingCommands[id] = res;
    socket.emit('command', req.body);
});

app.get('/choose-frame', frames.chooseFrame);
app.get('/edit-frame', frames.editFrame);
app.get('/edit-frame/:id', frames.editFrame);
app.get('/models_api/frames', frames.all);
app.get('/models_api/frames/:id', frames.findById);
app.get('/models_api/fronts', fronts.all);
app.get('/models_api/fronts/:id', frames.findById);
app.get('/models_api/sizes', sizes.all);
app.get('/models_api/sizes/:id', sizes.findById);
app.get('/server-rendering/start-session', serverRendering.startSession());
app.get('/server-rendering/renderer/:id', serverRendering.renderer);
app.get('/server-rendering/get-stl/:sessionId', serverRendering.getSTL);
app.post('/screenshot/save', screenshot.save);
app.get('/fill-test-data', fillTestData.start);
app.post('/server-rendering/receive-stl/:commandID', serverRendering.receiveSTL());

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

