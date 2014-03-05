requirejs.config({
    //By default load any module IDs from js/lib
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        text: '../../vendor/text'
    }
});

require([
    '../../components/renderer/renderer',
    '../../domain/models/frame',
    '../../components/menu/menu',
    '../../components/tab-page/tab-page',
    '../../components/tab-page/leg-page',
    '../../components/tab-page/engrave-page'
],
function(
    Renderer,
    Frame,
    Menu,
    TabPage,
    LegPage,
    EngravePage
){

    var renderer = null;
    $('body').height($(window).height());

    var url = document.URL;
    var urlParts = url.split("/");
    var id = urlParts[urlParts.length - 1];

    var frame = new Frame({
        id: id
    });

    var renderTarget = $('#renderer')[0];

    frame.fetch().then(function(){
        renderer = new Renderer({
            frame: frame,
            container: renderTarget,
            backgroundColor: '#FFFFFF'
        });

        $(renderer.viewer).on('viewer.focus', handleFocusChanged);

    });

    $(window).resize(resizeElements);
    resizeElements();

    function handleFocusChanged(event, comp){
        if(comp.parent && !comp.children){
            var parent = comp.parent;
            if(comp == parent.currentFront){
                focusedOnFront(comp);
            }else if(comp == parent.currentLeftLeg || comp == parent.currentRightLeg){
                focusedOnLeg(comp);
            }
        }else{
            $('#menu').hide();
        }
    };

    function focusedOnFront(comp){
        $('#menu').html('');
        var zoomoutButton = $('<button>Zoom out</button>');
        zoomoutButton.on('click', function(){
            renderer.viewer.focusTo(comp.parent);
        });
        $('#menu').append(zoomoutButton);
        $('#menu').show();
    }

    function focusedOnLeg(comp){
        $('#menu').html('');
        var legPage = new LegPage({
            frame: frame
        });

        var engravePage = new EngravePage();
        engravePage.setLeg(comp);

        var menu = new Menu({
            element: $('#menu'),
            pages: [
                legPage,
                new TabPage({
                    id: "patterns",
                    tabTitle: 'Patronen',
                    frame: frame
                }),
                engravePage
            ]
        });

        $(legPage).on('color-changed', function(event, color){
            color.replace("#", "0x");
            renderer.setFrameColor(color);
        });

        $(legPage).on('legs-changed', function(event, replacementLeg){
            try{
                renderer.changeLegs(replacementLeg).then(function(newLegs){
                    console.log(newLegs);
                    newLegs.right.focused ? engravePage.setLeg(newLegs.right) : engravePage.setLeg(newLegs.left);
                    engravePage.render();
                    legPage.render();
                });
            }catch(err){
                console.log(err.stack);
            }
        });
        var zoomoutButton = $('<button>Zoom out</button>');
        zoomoutButton.on('click', function(){
            renderer.viewer.focusTo(comp.parent);
        });
        $('#menu').append(zoomoutButton);
        $('#menu').show();
    }

    function resizeElements(){
        var menuHeight = $('#menu').height();
        $('#renderer').height($(window).height() - menuHeight);
        if(renderer){
            renderer.resize();
        }
    };
});