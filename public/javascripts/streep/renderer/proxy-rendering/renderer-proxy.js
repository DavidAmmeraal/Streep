define([
    '../frame-renderer',
    '../../overlays/spin-overlay/spin-overlay'
], function(
    FrameRenderer,
    SpinOverlay
){

    var RendererProxy = function(){
        FrameRenderer.apply(this, arguments);
    };

    RendererProxy.prototype = $.extend(Object.create(FrameRenderer.prototype), {
        host: "http://streep.nl:3000",
        uri: "server-rendering",
        sessionID: null,
        target: null,
        commandTimeOut: 60000,
        spinner: null,
        doCommand: function(command){
            var self = this;
            return new Promise(function(resolve, reject){
                var commandTimeout = setTimeout(function(){
                    $(self).trigger('commandLoading');
                }, 2000);
                $.ajax({
                    type: "POST",
                    url: self.host + '/' + self.uri + '/command',
                    data: command,
                    timeout: self.commandTimeOut,
                    success: function(data){
                        clearTimeout(commandTimeout);
                        self.doingCommand = false;
                        $(self).trigger('commandDone');
                        resolve(data);
                    },
                    error: function(){
                        console.log(arguments);
                        $(self).trigger('commandError');
                    }
                });
            });

        },
        init: function(){
            var self = this;
            return new Promise(function(resolve, reject){
                self.target = $('<div class="viewer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"></div>');
                $(self.container).append(self.target);
                FrameRenderer.prototype.init.apply(self).then(function(){
                    try{
                        self.spinner = new SpinOverlay({
                            targetElement: self.container,
                            className: 'spinner'
                        });
                        self.spinner.render();
                        self._listenToSpinner();
                    }catch(err){
                        console.log(err);
                        console.log(err.stack);
                    }
                    if(!self.sessionID){
                        self.startSession().then(function(){
                            resolve();
                        });
                    }else{
                        resolve();
                    }
                });
            })
        },
        _listenToSpinner: function(){
            var self = this;
            $(this.spinner).on('rotate-left-requested', function(){
                self.rotateLeft();
                console.log("ROTATE LEFT REQUESTED!!");
            });

            $(this.spinner).on('rotate-right-requested', function(){
                self.rotateRight();
                console.log("ROTATE RIGHT REQUESTED!");
            });
        },
        exitPreviewMode: function(){
            console.log("RendererProxy.enterPreviewMode()");
            var self = this;
            var container = $(self.container);
            var command = {
                'name': 'exitPreviewMode',
                'sessionID' : this.sessionID,
                'frame': this.frame.toJSON(),
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }

                    self.spinner.hide();

                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);
                    $(self).trigger('preview-mode-entered');
                    self.indicators.show();
                    resolve();
                })
            });
        },
        enterPreviewMode: function(){
            console.log("RendererProxy.enterPreviewMode()");
            var self = this;
            var container = $(self.container);
            var command = {
                'name': 'enterPreviewMode',
                'sessionID' : this.sessionID,
                'frame': this.frame.toJSON(),
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);
                    self.spinner.show();
                    $(self).trigger('preview-mode-entered');
                    self.indicators.hide();
                    resolve();
                })
            });
        },
        rotateLeft: function(){
            var self = this;
            var container = $(self.container);
            var command = {
                'name': 'rotateLeft',
                'sessionID' : this.sessionID,
                'frame': this.frame.toJSON(),
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);
                    resolve();
                })
            });
        },
        rotateRight: function(){
            var self = this;
            var container = $(self.container);
            var command = {
                'name': 'rotateRight',
                'sessionID' : this.sessionID,
                'frame': this.frame.toJSON(),
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);
                    resolve();
                })
            });
        },
        startSession: function(){
            console.log("RendererProxy.prototype.startSession()");
            var self = this;
            return new Promise(function(resolve){
                $.get(self.host + '/' + self.uri + '/start-session').then(function(data){
                    self.sessionID = data.sessionID;
                    setInterval(function(){
                        $.post(self.host + '/' + self.uri + '/keep-alive/' + data.sessionID, {'keep-alive': true});
                    }, 10000);
                    resolve();
                });
            });

        },
        loadFrame: function(frame){
            console.log("RendererProxy.prototype.loadFrame()");
            var self = this;
            var container = $(self.container);
            this.frame = frame;
            var command = {
                'name': 'loadFrame',
                'sessionID' : this.sessionID,
                'frame': this.frame.toJSON(),
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);
                    self.indicators.setIndicators(data.indicators);
                    self.indicators.render();
                    resolve();
                })
            });
        },
        focus: function(comp){
            var self = this;
            var container = $(container);
            var command = {
                name: 'focus',
                'sessionID': this.sessionID,
                'comp': comp,
                'containerDimensions': [container.width(), container.height()]
            }
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    console.log(data.data);
                    $(self).trigger('focus-changed', [comp, data.data]);
                });
            });
        },
        zoomOut: function(){
            var self = this;
            var container = $(container);
            var command = {
                name: 'zoomOut',
                'sessionID': this.sessionID,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log("ZOOMOUT COMPLETED ON SERVER");
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                        self.indicators.show();
                    }else{
                        self.indicators.hide();
                    }
                    console.log(data.data);
                    $(self).trigger('focus-changed');
                });
            });
        },
        changeNose: function(nose){
            var self = this;
            var container = $(container);
            var command = {
                name: 'changeNose',
                sessionID: this.sessionID,
                nose: nose,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve();
                });
            });
        },
        changeFront: function(front){
            var self = this;
            var container = $(container);
            var command = {
                name: 'changeFront',
                sessionID: this.sessionID,
                front: front,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve(data);
                });
            });
        },
        changePattern: function(side, pattern){
            var self = this;
            var container = $(container);
            var command = {
                name: 'changePattern',
                sessionID: this.sessionID,
                side: side,
                pattern: pattern,
                containerDimensions: [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve(data);
                });
            });
        },
        changeLegsColor: function(color){
            var self = this;
            var container = $(container);
            var command = {
                name: 'changeLegsColor',
                sessionID: this.sessionID,
                color: color,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve(data);
                });
            });
        },
        changeFrontColor: function(color){
            var self = this;
            var container = $(container);
            var command = {
                name: 'changeFrontColor',
                sessionID: this.sessionID,
                color: color,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve(data);
                });
            });
        },
        carveLeg: function(side, size, font, text){
            var self = this;
            var container = $(container);
            var command = {
                name: 'carveLeg',
                sessionID: this.sessionID,
                side: side,
                font: font,
                size: size,
                text: text,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve(data);
                });
            });
        },
        engraveLeg: function(side, size, font, text){
            var self = this;
            var container = $(container);
            var command = {
                name: 'engraveLeg',
                sessionID: this.sessionID,
                side: side,
                font: font,
                size: size,
                text: text,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve(data);
                });
            });
        },
        resetLeg: function(side){
            var self = this;
            var container = $(container);
            var command = {
                name: 'resetLeg',
                sessionID: this.sessionID,
                side: side,
                containerDimensions: [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve(data);
                });
            });
        },
        resize: function(){
            var self = this;
            var container = $(self.container);
            var command = {
                name: 'resize',
                sessionID: this.sessionID,
                'containerDimensions': [container.width(), container.height()]
            };
            return new Promise(function(resolve){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    var img = $('<img src="' + data.img + '" />');
                    self.target.html(img);

                    if(data.indicators){
                        self.indicators.setIndicators(data.indicators);
                        self.indicators.render();
                    }else{
                        self.indicators.hide();
                    }
                    resolve();
                });
            });
        },
        getSTL: function(){
            var self = this;
            window.open(self.host + '/' + self.uri + '/get-stl/' + this.sessionID);
        },
        getPrice: function(){
            var self = this;
            var command = {
                name: 'getPrice',
                sessionID: this.sessionID
            };
            return new Promise(function(resolve, reject){
                self.doCommand(command).then(function(data){
                    console.log(data);
                    if(data.price){
                        resolve(data.price);
                    }
                });
            });
        }
    });

    return RendererProxy;
});