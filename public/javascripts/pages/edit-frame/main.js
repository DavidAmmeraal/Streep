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
    '../../components/tab-page/leg-page'
],
function(
    Renderer,
    Frame,
    Menu,
    TabPage,
    LegPage
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
    });

    var menu = new Menu({
        element: $('#menu'),
        pages: [
            new LegPage(),
            new TabPage({
                id: "patterns",
                tabTitle: 'Patronen'
            }),
            new TabPage({
                id: "engrave",
                tabTitle: 'Graveren'
            })
        ]
    });

    $(window).resize(resizeElements);
    resizeElements();

    function resizeElements(){
        var menuHeight = $('#menu').height();
        $('#renderer').height($(window).height() - menuHeight);
        if(renderer){
            renderer.resize();
        }
    };
});