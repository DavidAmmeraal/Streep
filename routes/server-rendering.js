var uuid = require('node-uuid');
var io = null;
var AdmZip = require('adm-zip');
exports.setIO = function(IO){
    io = IO;
}
var sockets = {};
var waitingForSTL = {};
var openSeleniumSessions = [];

var checkSeleniumSessions = function(){
    var now = new Date().getTime();
    for(var i = 0; i < openSeleniumSessions.length; i++){
        var session = openSeleniumSessions[i];
        if((now - session.lastAlive) > 20000 && !session.closed){
            session.closed = true;
            session.session.close();
            session.session.quit();
        }
    }
}

var purgeClosedSessions = function(){
    openSeleniumSessions = openSeleniumSessions.filter(function(session){
        return !session.closed;
    });
};

setInterval(checkSeleniumSessions, 5000);
setInterval(purgeClosedSessions, 10000);

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
    waitingForSTL[commandID] = {};
    waitingForSTL[commandID]['parts'] = [];
    waitingForSTL[commandID]['amount'] = null;
    waitingForSTL[commandID]['callback'] = function(){
        if(waitingForSTL[commandID]['parts'].length == waitingForSTL[commandID]['amount']){

            var zip = new AdmZip();
            for(var i = 0; i < waitingForSTL[commandID]['parts'].length; i++){
                var part = waitingForSTL[commandID]['parts'][i];
                zip.addFile(part.name + ".stl", new Buffer(part.stl), "Part for STREEP glasses");
            }
            var toSend = zip.toBuffer();
            res.set('Content-Type', 'application/zip')
            res.set('Content-Disposition', 'attachment; filename=file.zip');
            res.set('Content-Length', toSend.length);
            res.end(toSend, 'binary');
        }
    };
    socket.emit('command', command);
    socket.on('commandDone', function(data){
    });
};

exports.receiveSTL = function(){
    return function(req, res){
        var commandID = req.params.commandID;
        console.log("commandID:" + commandID);
        if(req.body.stl){
            if(req.body.name != "length"){
                waitingForSTL[commandID]['parts'].push(req.body);
                waitingForSTL[commandID].callback();
            }
            res.send({'ok': true});
        }else if(req.body.amount){
            waitingForSTL[commandID]['amount'] = parseInt(req.body.amount);
            res.send({'ok': true});
        }

    }
}

exports.keepAlive = function(){
    return function(req, res){
        try{
            var sessionID = req.params.sessionID;
            openSeleniumSessions.filter(function(item){
                return item.sessionID == sessionID;
            })[0].lastAlive = new Date().getTime();
            res.send({'ok': true});
        }catch(err){
            res.send({'ok': false});
        }
    };
}

exports.startSession = function(){
    return function(req, res){
        var webdriver = require('selenium-webdriver');
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
            openSeleniumSessions.push({'sessionID': sessionID, 'session': driver, 'lastAlive': new Date().getTime()});
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