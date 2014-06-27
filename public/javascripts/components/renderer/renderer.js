define([
    './viewer',
    './component-context',
    './component/json-component',
    './component/frame',
    './component/connector/connector',
    './component/modification/csg-object/csg-object',
    './component/modification/csg-text-modification',
    './component/modification/csg-object-modification',
    './component/transformation/rotate',
    './component/transformation/scale',
    './component/transformation/translate',
    './keyboard-listener/keyboard-listener',
    './gui/overlay/indicator-overlay/indicator-overlay'
], function(
    Viewer,
    ComponentContext,
    JSONComponent,
    Frame,
    Connector,
    CSGObject,
    CSGTextModification,
    CSGObjectModification,
    Rotate,
    Scale,
    Translate,
    KeyboardListener,
    IndicatorOverlay
){
    var Renderer = function(options){
        var self = this;
        $.extend(self, options);
    };

    Renderer.prototype.backgroundColor = "#f3f1f1";
    Renderer.prototype.frame = null;
    Renderer.prototype.renderedFrame = null;
    Renderer.prototype.container = null;
    Renderer.prototype.context = null;
    Renderer.prototype.viewer = null;
    Renderer.prototype.indicators = null;
    Renderer.prototype.connectors = null;
    Renderer.prototype.init = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            self.context = new ComponentContext();
            self.viewer = new Viewer(self.container, self.context, {
                backgroundColor: self.backgroundColor,
                startPosition: new THREE.Vector3(-100, 20, 400)
            });

            $(self.viewer).on('viewer.focus', function(){
                self.handleFocusChanged.apply(self, arguments);
            });

            new KeyboardListener({viewer: self.viewer});
            resolve();
        });
    };
    Renderer.prototype.handleFocusChanged = function(event, comp){
        var self = this;
        self.comp = comp;
        self.showOverlays();
    };
    Renderer.prototype.loadFrame = function(frame){

        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame = Frame.parseFromDB(frame.toJSON());
            self.renderedFrame.load().then(function(){
                try{
                    self.indicators = new IndicatorOverlay({
                        targetElement: self.container,
                        viewer: self.viewer,
                        className: 'indicators'
                    });

                    self.context.add(self.renderedFrame);
                    self.viewer.focusTo(self.renderedFrame);

                    window['globalviewer'] = self.viewer;
                }catch(err){
                    console.log(err);
                }
                resolve();
            });
        });
    }
    Renderer.prototype.showOverlays = function(){
        if(this.comp.parent && !this.comp.children){
            this.indicators.hide();
        }else{
            this.indicators.show();
        }
    };
    Renderer.prototype.hideOverlays = function(){
        this.indicators.hide();
    };
    Renderer.prototype.resize = function(){
        this.viewer.resize();
    };
    Renderer.prototype.getPrice = function(){
        return this.renderedFrame.getPrice();
    }
    Renderer.prototype.changeFront = function(front){
        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame.changeFront(front).then(function(newFrontObj){
                resolve(newFrontObj);
            });
        });
    };
    Renderer.prototype.changeNose = function(nose){
        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame.changeNose(nose).then(function(newNoseObj){
                resolve(newNoseObj);
            });
        });
    };
    Renderer.prototype.getRenderedFrameObj = function(){
        return this.renderedFrame;
    };
    Renderer.prototype.changePattern = function(leg, pattern){
        console.log("Renderer.prototype.changePattern()");
        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame.changePattern(leg, pattern).then(function(newLegs){
                resolve(newLegs);
            });
        });
    };
    Renderer.prototype.changeGlasses = function(newGlasses){
        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame.changeGlasses(newGlasses).then(function(newGlasses){
                resolve(newGlasses);
                self.viewer.render();
            });
        });
    }
    Renderer.prototype.changeLegs = function(leg){
        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame.changeLegs(leg).then(function(newLegs){
                _.each(newLegs, function(leg){
                    if(leg.focused){
                        self.connectors.currentComp = leg;
                        //self.connectors.render();
                    }
                });
                resolve(newLegs);
            });
        });

    };
    Renderer.prototype.destroy = function(){
        console.log($(this.container).html(''));
    };
    Renderer.prototype.getSTL = function(){
        return this.renderedFrame.exportSTL();
    };
    Renderer.prototype.createScreenshot = function(){

    };
    Renderer.prototype.getScreenshot = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            try{
                var cameraPosition = {
                    x: self.viewer.camera.position.x,
                    y: self.viewer.camera.position.y,
                    z: self.viewer.camera.position.z
                };
                var lightsPosition = {
                    x: self.viewer.light.position.x,
                    y: self.viewer.light.position.y,
                    z: self.viewer.light.position.z
                };
                var originalWidth = $(self.viewer.target).width();
                var originalHeight = $(self.viewer.target).height();
                $(self.viewer.target).width(1280);
                $(self.viewer.target).height(720);

                var lookingAt = self.viewer.lookingAt;
                self.viewer.focusTo(self.renderedFrame, 0);
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
    };
    return Renderer;
})