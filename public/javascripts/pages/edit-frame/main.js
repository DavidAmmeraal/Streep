requirejs.config({
    //By default load any module IDs from js/lib
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    shim: {
        'facebook' : {
            exports: 'FB'
        }
    },
    paths: {
        text: '../../vendor/text',
        facebook: '//connect.facebook.net/en_US/all'
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
    '../../components/tab-page/nose-page',
    '../../vendor/facebook/fb'
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
    console.log(FB);
    var renderer = null;
    $('body').height($(window).height());

    var url = document.URL;
    var urlParts = url.split("/");
    var id = urlParts[urlParts.length - 1];

    //This object keeps track of the current engravings. If the legs are changed, and its possible to reapply the engravings on those legs it will do it through this.
    var appliedEngravings = {
        left: null,
        right: null
    }

    var frame = new Frame({
        id: id
    });

    var renderTarget = $('#renderer')[0];
    var engravePage = null;

    var changeButton = $('#buttons > .change');
    var facebookButton = $('a.facebook');
    var overviewLoading = $('#overview .loading');

    changeButton.on('click', function(){
        window.location = '/choose-frame';
    });

    facebookButton.on('click', function(event){
        overviewLoading.show();
        event.preventDefault();
        renderer.getScreenshot().then(function(screenshot){
            overviewLoading.hide();
            FB.ui({
                method: 'feed',
                link: 'http://local.streep.nl:3000',
                caption: 'Create your own 3D printed glasses!',
                picture: screenshot,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eu venenatis tellus. Aliquam fermentum, mi sit amet elementum molestie, justo nibh hendrerit purus, a hendrerit risus nulla quis ipsum. Aenean et tortor sed purus molestie bibendum sit amet at tellus. Aenean egestas vulputate velit, sit amet commodo augue tincidunt sed. Aliquam nec metus imperdiet, semper nunc ac, laoreet est. Morbi in mattis diam. Vivamus eget nulla sed purus pulvinar posuere. Duis vitae turpis arcu. Curabitur rhoncus quis ligula eget fringilla. Maecenas eget turpis dapibus, tempus nulla nec, sodales tortor. Nam sodales, massa in tristique mattis, libero ipsum fermentum quam, eget lobortis nisl elit tincidunt eros. Sed a ligula non nibh venenatis laoreet. ers.'
            });
        });

    });
    /*
    shareButton.on('click', function(){
        renderer.getScreenshot().then(function(screenshot){
            console.log(screenshot);
            $('#overview > .preview').append('<img src="' + screenshot + '" width="100%"/>');
        })
    });
    */

    frame.fetch({data: {depth: 3}}).then(function(){
        renderer = new Renderer({
            container: renderTarget,
            backgroundColor: '#FFFFFF'
        });
        renderer.loadFrame(frame).then(function(){
            $(renderer.viewer).on('viewer.focus', handleFocusChanged);
            $('#overview > .price').html('&euro;' + frame.get('basePrice'));
            $('.column-left > .loading').fadeOut(200);
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
            $('#menu').fadeOut(200);
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
                    applyEngravingsToNewLegs(_.find(newFrontObj.legs, function(legs){
                       return legs.active;
                    }));
                    console.log(newFrontObj);
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
        $('#menu').fadeIn(200);
    }

    function applyEngravingsToNewLegs(newLegs){
        var execute = [];
        for(var side in appliedEngravings){
            if(appliedEngravings[side]){
                var engraving = appliedEngravings[side];
                var connector = _.find(newLegs.currentPattern[side].connectors, function(connector){
                    return connector.name == engraving.connector;
                });
                var mod = _.find(connector.modifications, function(mod){
                    return mod.action_name == engraving.type;
                });
                mod.setText(engraving.text, engraving.font, engraving.size);
                engravePage.disableButtons();
                execute.push(mod.execute());
            }
        }
        Promise.all(execute).then(function(){
            engravePage.enableButtons();
        });
    };

    function focusedOnLeg(comp){
        $('#menu').html('');
        var legPage = new LegPage({
            frame: renderer.getRenderedFrameObj(),
            leg: comp
        });

        engravePage = new EngravePage();
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

        $(engravePage).on('engraving-applied', function(event, engraving){
            appliedEngravings[engraving.side] = engraving;
            console.log(appliedEngravings);
        });

        $(engravePage).on('leg-reset', function(event, side){
            appliedEngravings[side] = null;
            console.log(appliedEngravings);
        });

        var zoomoutButton = $('<button>Terug</button>');
        zoomoutButton.on('click', function(){
            renderer.viewer.focusTo(comp.parent);
        });
        $('#menu').append(zoomoutButton);
        $('#menu').fadeIn(200);
    }

    function resizeElements(){
        var menuHeight = $('#menu').height();
        var buttonHeight = $('#buttons').height();
        $('#renderer').height($(window).height() - menuHeight - buttonHeight);
        if(renderer){
            renderer.resize();
        }
    };
});