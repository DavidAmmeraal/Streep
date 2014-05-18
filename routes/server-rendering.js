var uuid = require('node-uuid');
var io = null;
exports.setIO = function(IO){
    io = IO;
}
var sockets = {};

exports.renderer = function(req, res){
    res.render('renderer', { title: 'Server renderer' });
};

exports.getSTL = function(req, res){
    var sessionID = req.params.sessionId;
    var socket = sockets[sessionID];
    var commandID = uuid.v4();
    var command = {
        commandID: commandID,
        sessionID: sessionID,
        name: 'getSTL'
    }
    socket.emit('command', command);
    socket.on('commandDone', function(data){
        if(data.commandID == commandID){
            var buffer = new Buffer(data.stl, "utf-8");
            console.log(buffer.toString());
        }
    });
};

exports.startSession = function(){
    return function(req, res){
        console.log(io);
        var webdriver = require('selenium-webdriver');
        console.log("HOI WEBDRIVER");
        var caps = webdriver.Capabilities.firefox();
        /*
        caps.caps_.chromeOptions = {
            args: ['--ignore-gpu-blacklist']
        };*/
        var driver = new webdriver.Builder().
            usingServer('http://localhost:4444/wd/hub/').
            withCapabilities(caps).
            build();

        var sessionID;
        driver.getCapabilities().then(function(caps){
            sessionID = caps.caps_['webdriver.remote.sessionid'];
        }).then(function(){
            driver.get('http://localhost:3000/server-rendering/renderer/' + sessionID);
            io.sockets.on('connection', function (socket) {
                socket.on('ready', function(data){
                    if(data.sessionID == sessionID){
                        sockets[sessionID] = socket;
                        res.send({'sessionID': sessionID});
                    }
                });
            });
        });
    }
};

exports.command = function(){
    return function(req, res){
        console.log("ServerRendering.command()");
        console.log(req);
        var socket = sockets[req.body.sessionID];
        var commandID = uuid.v4();
        req.body.commandID = commandID;
        socket.emit('command', req.body);
        socket.on('commandDone', function(data){
            if(data.commandID == commandID){
                res.send(data);
            }
        });
    };
};