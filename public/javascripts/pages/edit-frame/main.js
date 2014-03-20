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
    '../../components/tab-page/front-page',
    '../../components/tab-page/engrave-page',
    '../../components/tab-page/nose-page'
],
function(
    Renderer,
    Frame,
    Menu,
    TabPage,
    LegPage,
    FrontPage,
    EngravePage,
    NosePage
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

    frame.fetch({data: {depth: 3}}).then(function(){
        renderer = new Renderer({
            container: renderTarget,
            backgroundColor: '#FFFFFF'
        });
        renderer.loadFrame(frame).then(function(){
            $(renderer.viewer).on('viewer.focus', handleFocusChanged);
            $('#overview > .price').html('&euro;' + frame.get('basePrice'));
            $('.column-left > .loading').hide();
        });

    });

    $(window).resize(resizeElements);
    resizeElements();

    function handleFocusChanged(event, comp){
        if(comp.parent && !comp.children){
            var parent = comp.parent;
            if(comp == parent.currentFront.currentNose){
                focusedOnFront(parent.currentFront);
            }else if(comp == parent.currentLeftLeg || comp == parent.currentRightLeg){
                focusedOnLeg(comp);
            }
        }else{
            $('#menu').hide();
        }
    };

    function focusedOnFront(comp){
        $('#menu').html('');

        var frontPage = new FrontPage({
            frame: renderer.getRenderedFrameObj(),
            front: comp
        });

        var nosePage = new NosePage({
           front: comp
        });

        var menu = new Menu({
            element: $('#menu'),
            pages: [
                frontPage,
                nosePage
            ]
        });

        frontPage.activate();

        $(frontPage).on('front-changed', function(event, replacementFront){
            try{
                renderer.changeFront(replacementFront).then(function(newFrontObj){
                    frontPage.front = newFrontObj;
                    frontPage.newFrontLoaded();
                    nosePage.front = newFrontObj;
                    nosePage.newFrontLoaded();
                    $('#overview > .price').html('&euro;' + renderer.getPrice());
                });

            }catch(err){
                console.log(err.stack);
            }
        });

        $(nosePage).on('nose-changed', function(event, replacementNose){
            try{
                renderer.changeNose(replacementNose).then(function(newNoseObj){
                    nosePage.newNoseLoaded();
                    $('#overview > .price').html('&euro;' + renderer.getPrice());
                });

            }catch(err){
                console.log(err.stack);
            }
        });

        var zoomoutButton = $('<button>Terug</button>');
        zoomoutButton.on('click', function(){
            renderer.viewer.focusTo(comp.currentNose.parent);
        });
        $('#menu').append(zoomoutButton);
        $('#menu').show();
    }

    function focusedOnLeg(comp){
        $('#menu').html('');
        var legPage = new LegPage({
            frame: renderer.getRenderedFrameObj(),
            leg: comp
        });

        var engravePage = new EngravePage();
        engravePage.setLeg(comp);

        var menu = new Menu({
            element: $('#menu'),
            pages: [
                legPage,
                engravePage
            ]
        });
        setTimeout(function(){
            legPage.activate();
        }, 1);


        $(legPage).on('pattern-changed', function(event, newPattern){
            try{
                renderer.changePattern(newPattern).then(function(newLegs){
                    var focusedLeg = null;
                    if(newLegs.right.focused){
                        focusedLeg = newLegs.right;
                    }else{
                        focusedLeg = newLegs.left;
                    }
                    engravePage.setLeg(focusedLeg);
                    legPage.setLeg(focusedLeg);
                    $('#overview > .price').html('&euro;' + renderer.getPrice());
                });
            }catch(err){
                console.log(err.stack);
            }
        });
        var zoomoutButton = $('<button>Terug</button>');
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