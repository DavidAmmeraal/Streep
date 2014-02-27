requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'javascripts/editor',
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
	'../edit-frame/viewer',
	'../edit-frame/component-context',
	'./json-component',
	'./frame',
	'./connector/connector',
	'./modification/csg-object/csg-object',
	'./modification/csg-text-modification',
	'./modification/csg-object-modification',
	'./transformation/rotate',
	'./transformation/scale',
	'./transformation/translate',
    './overlay/connector-overlay/connector-overlay',
    './keyboard-listener'
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

    $.ajax({
        url: 'models_api/frames',
        success: function(data){
            var comps = JSON.parse(data);
            var compositions = [];
            for(var i = 0; i < comps.length; i++){
                var comp = comps[i];
                compositions.push(Frame.parseFromDB(comp));
            }
            var bril = compositions[0];
            bril.load().then(function(){
                context.add(bril);
                viewer.focusTo(bril);

                var cOverlay = new ConnectorOverlay({
                    targetElement: $('#container'),
                    viewer: viewer,
                    className: 'connectors',
                });

                cOverlay.render();

                window['globalviewer'] = viewer;

                menu = new Menu(context);

                console.log("end");
            });
        }
    });

    var keyboardListener = new KeyboardListener({viewer: viewer});
});
