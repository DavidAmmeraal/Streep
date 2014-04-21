define([
    './session',
    '../../components/renderer/viewer',
    '../../components/renderer/component-context',
    '../../components/renderer/component/frame'
], function(
    Session,
    Viewer,
    ComponentContext,
    Frame
){
    console.log(Viewer);

    var Renderer = function(options){
        var self = this;
        $.extend(self, options);

        this.context = new ComponentContext();
        this.viewer = new Viewer(this.container, this.context, {
            backgroundColor: self.backgroundColor,
            startPosition: new THREE.Vector3(-100, 20, 400)
        });
    };

    Renderer.prototype.sessions = {};
    Renderer.prototype.backgroundColor = "#FFFFFF";
    Renderer.prototype.container = null;
    Renderer.prototype.context = null;
    Renderer.prototype.viewer = null;
    Renderer.prototype.startSession = function(data){
        console.log("Renderer.startSession(" + data + ")");
        var self = this;
        return new Promise(function(resolve){
            var session = new Session(data.commandID);
            self.sessions[session.id] = session;
            resolve({
                commandID: data.commandID,
                sessionID: session.id
            });
        });
    };
    Renderer.prototype.loadFrame = function(data){
        console.log("Renderer.prototype.loadFrame(" + JSON.stringify(data) + ")");
        var self = this;
        return new Promise(function(resolve){
            console.log("IN PROMISE");
            try{
                var session = self.sessions[data.sessionID];
                session.frame = Frame.parseFromDB(data.frame);
                self.container.width(data.containerDimensions[0]);
                self.container.height(data.containerDimensions[1]);
                self.viewer.resize();
                session.frame.load().then(function(){
                    self.context.add(session.frame);
                    try{
                        self.viewer.focusTo(session.frame);
                    }catch(err){
                        console.log(err.stack);
                    }
                    resolve({
                        'commandID': data.commandID,
                        'img': self.viewer.getScreenshot()
                    })
                })
            }catch(err){
                console.log(err.stack);
            }
        });
    };
    Renderer.prototype.handleCommand = function(data){
        console.log("Renderer.handleCommand()");
        return this[data.name](data);
    }

    return Renderer;
});