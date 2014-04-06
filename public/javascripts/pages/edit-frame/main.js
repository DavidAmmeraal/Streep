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
    '../../components/frame-chooser/frame-chooser',
    '../../components/size-chooser/size-chooser',
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
    NosePage,
    FrameChooser,
    SizeChooser
){
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

    var frameChooser = new FrameChooser({el: $('#menus > .frames')[0]});
    var sizeChooser = new SizeChooser({el: $('#menus > .size')[0]})
    var frame;

    var renderTarget = $('#renderer')[0];
    var engravePage = null;

    var sizeButton = $('#buttons > .change-size');
    var changeButton = $('#buttons > .change-frame');
    var facebookButton = $('a.facebook');
    var overviewLoading = $('#overview .loading');
    var infoButton = $('#buttons > .switch');
    var STLButton = $('#buttons > .download-stl');

    STLButton.on('click', function(){
        var blob = new Blob([renderer.getSTL()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "stl.stl");
    });

    $(window).on('click', function(event){
        if(frameChooser.$el.is(':visible')){
            var box = frameChooser.getVisibleBox();
            if(!(event.clientX > box.x[0] &&
                event.clientX < box.x[1] &&
                event.clientY > box.y[0] &&
                event.clientY < box.y[1]
            )){
                frameChooser.hide();
            }
        }

        if(sizeChooser.$el.is(':visible')){
            var box = sizeChooser.getVisibleBox();
            if(!(event.clientX > box.x[0] &&
                event.clientX < box.x[1] &&
                event.clientY > box.y[0] &&
                event.clientY < box.y[1]
                )){
                sizeChooser.hide();
            }
        }
    });

    infoButton.on('click', function(){
        if($($('.streep-tooltip').get(0)).is(':visible')){
            $('.streep-tooltip').fadeOut(200);
        }else{
            $('.streep-tooltip').fadeIn(200);
        }

    });

    changeButton.on('click', function(event){
        frameChooser.show();
        sizeChooser.hide();
        event.stopPropagation();
    });

    sizeButton.on('click', function(event){
        sizeChooser.show();
        frameChooser.hide();
        event.stopPropagation();
    })

    facebookButton.on('click', function(event){
        overviewLoading.fadeIn(50);
        $('.column-left > .loading').fadeOut(50);
        event.preventDefault();
        renderer.getScreenshot().then(function(screenshot){
            overviewLoading.fadeOut(50);
            $('.column-left > .loading').fadeOut(50);
            FB.ui({
                method: 'feed',
                link: 'http://local.streep.nl:3000',
                caption: 'Create your own 3D printed glasses!',
                picture: screenshot,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eu venenatis tellus. Aliquam fermentum, mi sit amet elementum molestie, justo nibh hendrerit purus, a hendrerit risus nulla quis ipsum. Aenean et tortor sed purus molestie bibendum sit amet at tellus. Aenean egestas vulputate velit, sit amet commodo augue tincidunt sed. Aliquam nec metus imperdiet, semper nunc ac, laoreet est. Morbi in mattis diam. Vivamus eget nulla sed purus pulvinar posuere. Duis vitae turpis arcu. Curabitur rhoncus quis ligula eget fringilla. Maecenas eget turpis dapibus, tempus nulla nec, sodales tortor. Nam sodales, massa in tristique mattis, libero ipsum fermentum quam, eget lobortis nisl elit tincidunt eros. Sed a ligula non nibh venenatis laoreet. ers.'
            });
        });

    });

    $(frameChooser).on('frame-chosen', function(event, id){
        $('.column-left > .loading').fadeIn(200);
        loadFrame(id);
    });

    var loadFrame = function(id){
        frame = new Frame({
            id: id
        });
        frame.fetch({data: {depth: 3}}).then(function(){
            if(renderer){
                renderer.destroy();
            }
            renderer = new Renderer({
                container: renderTarget,
                backgroundColor: '#FFFFFF'
            });
            frameChooser.setActive(frame.id);
            renderer.loadFrame(frame).then(function(){
                $(renderer.viewer).on('viewer.focus', handleFocusChanged);
                $('#overview > .price').html('&euro;' + frame.get('basePrice'));
                $('.column-left > .loading').fadeOut(200);
                $('.streep-tooltip').fadeIn(500);
                setTimeout(function(){
                    $('.streep-tooltip').fadeOut(1000);
                }, 9000)
            });
            $('#menu').html('');
        })
    }

    loadFrame(id);

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
                    console.log("DONE CHANGING PATTERN!");
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
        var columnLeftWidth = $('.column-left').width();
        var buttonWidth = $('.column-left > #buttons').width();
        $('#renderer').height($(window).height() - menuHeight - buttonHeight);
        $('#renderer').width(columnLeftWidth - buttonWidth);
        if(renderer){
            renderer.resize();
        }
    };
});