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
    './gui/overlay/connector-overlay/connector-overlay',
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
    ConnectorOverlay,
    IndicatorOverlay
){
    var Renderer = function(options){
        var self = this;

        $.extend(self, options);

        var initialize = function(){
            console.log("Renderer.initialize()");
            self.context = new ComponentContext();
            self.viewer = new Viewer(self.container, self.context, {
                backgroundColor: self.backgroundColor,
                startPosition: new THREE.Vector3(-100, 20, 400)
            });

            $(self.viewer).on('viewer.focus', handleFocusChanged);

            new KeyboardListener({viewer: self.viewer});
        };

        var handleFocusChanged = function(event, comp){
            self.comp = comp;
            self.showOverlays();
        }

        initialize();
    };

    Renderer.prototype.backgroundColor = "#FFFFFF";
    Renderer.prototype.frame = null;
    Renderer.prototype.renderedFrame = null;
    Renderer.prototype.container = null;
    Renderer.prototype.context = null;
    Renderer.prototype.viewer = null;
    Renderer.prototype.indicators = null;
    Renderer.prototype.connectors = null;
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

                    self.connectors = new ConnectorOverlay({
                        targetElement: self.container,
                        viewer: self.viewer,
                        className: 'connectors'
                    });

                    self.connectors.hide();

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
            this.connectors.show();
            this.indicators.hide();
        }else{
            this.connectors.hide();
            this.indicators.show();
        }
    };
    Renderer.prototype.hideOverlays = function(){
        this.connectors.hide();
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
    Renderer.prototype.changePattern = function(pattern){
        console.log("Renderer.prototype.changePattern()");
        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame.changePattern(pattern).then(function(newLegs){
                _.each(newLegs, function(leg){
                    if(leg.focused){
                        self.connectors.currentComp = leg;
                        self.connectors.render();
                    }
                });
                resolve(newLegs);
            });
        });
    };
    Renderer.prototype.changeLegs = function(leg){
        var self = this;
        return new Promise(function(resolve, reject){
            self.renderedFrame.changeLegs(leg).then(function(newLegs){
                _.each(newLegs, function(leg){
                    if(leg.focused){
                        self.connectors.currentComp = leg;
                        self.connectors.render();
                    }
                });
                resolve(newLegs);
            });
        });

    }
    return Renderer;
})