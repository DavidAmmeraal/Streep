requirejs.config({
    //By default load any module IDs from js/lib
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        text: '../vendor/text'
    }
});

require([
    'viewer',
    'component-context',
    'component/json-component',
    'component/frame',
    'component/connector/connector',
    'component/modification/csg-object/csg-object',
    'component/modification/csg-text-modification',
    'component/modification/csg-object-modification',
    'component/transformation/rotate',
    'component/transformation/scale',
    'component/transformation/translate',
    'gui/overlay/connector-overlay/connector-overlay',
    'keyboard-listener/keyboard-listener'
],
function(
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
    ConnectorOverlay,
    KeyboardListener
){
    var viewer = null;
    var container = document.getElementById('container');
    var menuContainer = $('#menu');
    var menu = null;

    $(container).width($(document).width() - $(menuContainer).width() - 15);
    $(container).height($(document).height() - 5);


    var context = new ComponentContext();

    viewer = new Viewer(container, context, {
        backgroundColor: "#FFFFFF",
        startPosition: new THREE.Vector3(-100, 20, 400)
    });

    var urlSplits = document.URL.split("/");
    var frameId = urlSplits[urlSplits.length - 1];
    console.log(frameId);

    $.ajax({
        url: '/models_api/frames/' + frameId,
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

                menu = new Menu(context);

                console.log("end");
            });
        }
    });

    new KeyboardListener({viewer: viewer});
});