requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'javascripts/streep3d',
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
	'component/parent-component',
	'component/connector/connector',
	'component/modification/csg-object/csg-object',
	'component/modification/csg-text-modification',
	'component/modification/csg-object-modification',
	'component/transformation/rotate',
	'component/transformation/scale',
	'component/transformation/translate', 
	'menu/menu',
    'overlay/connector-overlay/connector-overlay',
    'keyboard-listener/keyboard-listener'
], 
function(
	Viewer, 
	ComponentContext,
	JSONComponent,
	ParentComponent,
	Connector,
	CSGObject,
	CSGTextModification,
	CSGObjectModification,
	Rotate,
	Scale,
	Translate,
	Menu,
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
        backgroundColor: "#363636",
        startPosition: new THREE.Vector3(0, 0, 400)
    });

    $.ajax({
        url: 'parent-components',
        success: function(data){
            var comps = JSON.parse(data);
            var parentComps = [];
            for(var i = 0; i < comps.length; i++){
                var comp = comps[i];
                parentComps.push(ParentComponent.parseFromDB(comp));
            }
            var bril = parentComps[0];
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
