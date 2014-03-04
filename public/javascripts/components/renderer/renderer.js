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
    './keyboard-listener/keyboard-listener'
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
    KeyboardListener
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
            self.renderedFrame = Frame.parseFromDB(self.frame.toJSON());

            self.renderedFrame.load().then(function(){
                self.context.add(self.renderedFrame);
                self.viewer.focusTo(self.renderedFrame);

                window['globalviewer'] = self.viewer;
            });

            /*
            $.ajax({
                url: '/models_api/frames/' + self.frameId,
                success: function(data){
                    console.log(data);
                    var bril = Frame.parseFromDB(JSON.parse(data));
                    bril.load().then(function(){
                        context.add(bril);
                        viewer.focusTo(bril);

                        var cOverlay = new ConnectorOverlay({
                            targetElement: $('#container'),
                            viewer: viewer,
                            className: 'connectors'
                        });

                        cOverlay.render();

                        window['globalviewer'] = viewer;
                    });
                }
            });
            */
            new KeyboardListener({viewer: self.viewer});
        };

        initialize();
    };

    Renderer.prototype.backgroundColor = "#FFFFFF";
    Renderer.prototype.frame = null;
    Renderer.prototype.renderedFrame = null;
    Renderer.prototype.container = null;
    Renderer.prototype.context = null;
    Renderer.prototype.viewer = null;
    Renderer.prototype.resize = function(){
        this.viewer.resize();
    }
    Renderer.prototype.setFrameColor = function(color){
        this.renderedFrame.setColor(color);
    }
    Renderer.prototype.changeLegs = function(leg){
        console.log("Renderer.changeLegs(" + leg + ")");
        this.renderedFrame.changeLegs(leg);
    }
    return Renderer;
})