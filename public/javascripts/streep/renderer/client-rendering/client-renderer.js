define([
    '../frame-renderer',
    '../../../components/renderer/component-context',
    '../../../components/renderer/viewer',
    '../../../components/renderer/component/frame'
], function(
    FrameRenderer,
    ComponentContext,
    Viewer,
    Frame
){
    var ClientRenderer = function(options){
        console.log("ClientRenderer()");
        FrameRenderer.apply(this, [options]);
    };

    ClientRenderer.prototype = $.extend(Object.create(FrameRenderer.prototype), {
        context: null,
        viewer: null,
        init: function(){
            console.log("ClientRenderer.init()");
            var self = this;
            return new Promise(function(resolve, reject){
                FrameRenderer.prototype.init.apply(self).then(function(){

                    try{
                        self.context = new ComponentContext();

                        self.viewer = new Viewer(self.container, self.context, {
                            backgroundColor: self.backgroundColor,
                            startPosition: new THREE.Vector3(-100, 20, 400)
                        });

                        self._listenToViewer();

                        $(self.viewer).on('viewer.focus', function(){
                            self.handleFocusChanged.apply(self, arguments);
                        });
                    }catch(err){
                        reject(err);
                    }
                    resolve();
                });
            });

            console.log("END ClientRenderer.init()");
        },
        handleFocusChanged: function(event, comp){
            var self = this;
            self.comp = comp;
            if(comp == this.frame){
                self.showOverlays();
            }else{
                self.hideOverlays();
            }
        },
        _listenToViewer: function(){
            var self = this;
            $(this.viewer).on('viewer.render', function(){
                self.indicators.setIndicators(self.getIndicators());
                self.indicators.render();
            });
        },
        getIndicators: function(){
            var self = this;
            var comps = this.viewer.getComponents();
            var indicators = [];
            for(var c = 0; c < comps.length; c++){
                var comp = comps[c];
                if(comp.indicator){
                    var indicator = {
                        component: comp,
                        position: self.viewer.get2DPositions(comp.indicator)
                    };
                    indicators.push(indicator);
                }
            }
            return indicators;
        },
        loadFrame: function(dbFrame){
            var self = this;
            return new Promise(function(resolve, reject){
                self.frame = Frame.parseFromDB(dbFrame.toJSON());
                self.frame.load().then(function(){
                    try{
                        self.context.add(self.frame);
                        self.viewer.focusTo(self.frame);

                        window['globalviewer'] = self.viewer; //HACK FOR TESTING!
                    }catch(err){
                        reject(err);
                    }
                    resolve();
                }).catch(function(err){
                    reject(err);
                });
            });
        },
        resize: function(){
            this.viewer.resize();
        },
        getPrice: function(){
            return this.frame.getPrice();
        },
        changeFront: function(front){
            return this.frame.changeFront(front);
        },
        changeNose: function(nose){
            return this.frame.changeNose(nose);
        },
        changePattern: function(leg, pattern){
            return this.frame.changePattern(leg, pattern);
        },
        changeGlasses: function(glasses){
            return self.frame.changeGlasses(newGlasses);
        },
        changeLegs: function(leg){
            return this.frame.changeLegs(leg);
        },
        destroy: function(){
            $(this.container).html('');
        },
        getSTL: function(){
            return this.frame.exportSTL();
        },
        focus: function(comp){
           console.log("ClientRender.focus()");
           var self = this;
           this.viewer.focusTo(comp, 500);
           $(this).trigger('focus-changed', comp);
        },
        getScreenshot: function(){
            var self = this;
            return new Promise(function(resolve, reject){
                try{
                    var cameraPosition = {
                        x: self.viewer.camera.position.x,
                        y: self.viewer.camera.position.y,
                        z: self.viewer.camera.position.z
                    };
                    var originalWidth = $(self.viewer.target).width();
                    var originalHeight = $(self.viewer.target).height();
                    $(self.viewer.target).width(1280);
                    $(self.viewer.target).height(720);

                    var lookingAt = self.viewer.lookingAt;
                    self.viewer.focusTo(self.frame, 0);
                    self.viewer.resize();
                    var screenshot = self.viewer.getScreenshot();
                    $(self.viewer.target).width(originalWidth);
                    $(self.viewer.target).height(originalHeight);
                    self.viewer.focusTo(lookingAt, 0);
                    self.viewer.positionCamera(cameraPosition, 0);
                    self.viewer.resize();

                    $.post('/screenshot/save', {data: screenshot}).done(function(data){
                        data = JSON.parse(data);
                        resolve(data.screenshot);
                    });
                }catch(err){
                    console.log(err);
                }
            });
        }

    });

    return ClientRenderer
});