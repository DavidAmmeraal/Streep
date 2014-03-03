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

        this.backgroundColor = null;
        this.frame = null;
        this.container = null;
        this.context = null;

        $.extend(self, options);

        var viewer = null;

        this.resize = function(){
            viewer.resize();
        };

        var initialize = function(){
            self.context = new ComponentContext();
            viewer = new Viewer(self.container, self.context, {
                backgroundColor: self.backgroundColor,
                startPosition: new THREE.Vector3(-100, 20, 400)
            });
            var frameRenderObj = Frame.parseFromDB(self.frame.toJSON());

            frameRenderObj.load().then(function(){
                self.context.add(frameRenderObj);
                viewer.focusTo(frameRenderObj);

                window['globalviewer'] = viewer;
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
            new KeyboardListener({viewer: viewer});
        };

        initialize();
    };
    return Renderer;
})