
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var frames = require('./routes/frames');
var fronts = require('./routes/fronts');
var screenshot = require('./routes/screenshot');
var serverRendering = require('./routes/server-rendering');
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

setTimeout(function(){
    connectDb();
}, 5000);

var app = express();

//Start selenium

var webdriver = require('selenium-webdriver');
var keyword = "Diego Mejia";

console.log(webdriver.Capabilities.chrome());
var caps = webdriver.Capabilities.chrome();
caps.caps_.chromeOptions = {
    args: ['--ignore-gpu-blacklist']
};
var driver = new webdriver.Builder().
    usingServer('http://localhost:4444/wd/hub/').
    withCapabilities(caps).
    build();
driver.get('http://threejs.org/examples/#webgl_animation_cloth')
setTimeout(function(){
    driver.executeScript('window.scrollBy(0,0)');
}, 1000);

//END selenium


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

var server = http.createServer(app);
/*
var io = require('socket.io').listen(server);
var waitingCommands = {};
io.sockets.on('connection', function (socket) {
    app.post('/server-rendering/command', function(req, res){
        var uuid = require('node-uuid');
        var id = uuid.v1();
        req.body.commandID = id;
        waitingCommands[id] = res;
        socket.emit('command', req.body);
    });
    socket.on('commandDone', function(data){
        waitingCommands[data.commandID].send(data);
        delete waitingCommands[data.commandID];
    });
});*/

app.get('/', frames.chooseFrame);
app.get('/users', user.list);

app.get('/choose-frame', frames.chooseFrame);
app.get('/edit-frame/:id', frames.editFrame);

app.get('/models_api/frames', frames.all);
app.get('/models_api/frames/:id', frames.findById);
app.get('/models_api/fronts', fronts.all);
app.get('/models_api/fronts/:id', frames.findById);
app.get('/server-rendering/renderer', serverRendering.renderer);


app.post('/screenshot/save', screenshot.save);

app.get('/fill-test-data', fillTestData.start);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

