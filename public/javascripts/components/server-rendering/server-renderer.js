define([
], function(){
    var ServerRenderer = function(options){
        $.extend(this, options);
    };

    ServerRenderer.prototype.host = "http://streep.nl:3000";
    ServerRenderer.prototype.url = "server-rendering";
    ServerRenderer.prototype.commandURI = "command";
    ServerRenderer.prototype.sessionID = null;
    ServerRenderer.prototype.container = null;
    ServerRenderer.prototype.init = function(){
        var self = this;
        return self.startSession()
    };
    ServerRenderer.prototype.startSession = function(){
        console.log("ServerRenderer.prototype.startSession()");
        var self = this;
        return new Promise(function(resolve){
            $.get(self.host + '/' + self.url + '/start-session').then(function(data){
                self.sessionID = data.sessionID;
                resolve();
            });
        });

    };
    ServerRenderer.prototype.loadFrame = function(frame){
        console.log("ServerRenderer.prototype.loadFrame()");
        var self = this;
        console.log(self.container);
        var container = $(self.container);
        var command = {
            'name': 'loadFrame',
            'sessionID' : this.sessionID,
            'frame': frame.toJSON(),
            'containerDimensions': [container.width(), container.height()]
        };
        console.log(JSON.stringify(command));
        return new Promise(function(resolve){
            $.post(self.host + '/' + self.url + '/' + self.commandURI, command).then(function(data){
                var img = $('<img src="' + data.img + '" />');
                container.html(img);
                resolve();
            });
        });
    };

    ServerRenderer.prototype.resize = function(){

    };

    return ServerRenderer;
});