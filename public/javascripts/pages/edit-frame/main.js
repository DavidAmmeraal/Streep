$('body').height($(window).height());

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
    '../../domain/models/size',
    '../../domain/models/frame',
    '../../components/menu/menu',
    '../../components/tab-page/tab-page',
    '../../components/tab-page/leg-page',
    '../../components/tab-page/front-page',
    '../../components/tab-page/engrave-page',
    '../../components/tab-page/nose-page',
    '../../components/tab-page/glasses-page',
    '../../components/frame-chooser/frame-chooser',
    '../../components/size-chooser/size-chooser',
    '../../util/webgl-test',
    '../../components/server-rendering/server-renderer',
    '../../streep/renderer/client-rendering/client-renderer',
    '../../streep/renderer/proxy-rendering/renderer-proxy',
    '../../vendor/facebook/fb'
],
function(
    Renderer,
    Size,
    Frame,
    Menu,
    TabPage,
    LegPage,
    FrontPage,
    EngravePage,
    NosePage,
    GlassesPage,
    FrameChooser,
    SizeChooser,
    WebGLTest,
    ServerRenderer,
    ClientRenderer,
    RendererProxy
){
    var renderer = null;

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
    var sizesId = "536e393072e65c45ab8efee8";
    var sizes;

    var renderTarget = $('#renderer')[0];
    var engravePage = null;

    var sizeButton = $('#buttons > .change-size');
    var changeButton = $('#buttons > .change-frame');
    var facebookButton = $('a.facebook');
    var twitterButton = $('a.twitter');
    var overviewLoading = $('#overview .loading');
    var infoButton = $('#buttons > .switch');
    var previewButton = $('#buttons > .preview-mode');
    var exitPreviewButton = $('#buttons > .exit-preview-mode');
    var orderButton = $('button.order');
    var price = $('#overview > .price');
    var changeFrontButton = $('#buttons > .change-front');
    var changeLeftButton = $('#buttons > .change-left');
    var changeRightButton = $('#buttons > .change-right');

    orderButton.on('click', function(){
        renderer.finalize();
        $('.column-left > .command-loading').fadeIn(200);
    });

    changeFrontButton.on('click', function(){
        _.find($('.indicator'), function(element){
            var data = $(element).data('component');
            if(data.name != "poot_links" && data.name != "poot_rechts"){
                element.click();
            }
        });
    });

    changeLeftButton.on('click', function(){
        _.find($('.indicator'), function(element){
            var data = $(element).data('component');
            if(data.name == "poot_links"){
                element.click();
            }
        });
    });

    changeRightButton.on('click', function(){
        _.find($('.indicator'), function(element){
            var data = $(element).data('component');
            if(data.name == "poot_rechts"){
                element.click();
            }
        });
    });

    $(window).on('click touchstart', function(event){
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
    });

    previewButton.on('click', function(event){
        $('.column-left > .command-loading').fadeIn(200);
        renderer.enterPreviewMode();
        $(renderer).on('preview-mode-entered', function(){
            $('.column-left > .command-loading').fadeOut(200);
        });
        exitPreviewButton.show();
        previewButton.hide();
        $('#menu').hide();
    });

    exitPreviewButton.on('click', function(event){
        renderer.exitPreviewMode();
        $('.column-left > .command-loading').fadeIn(200);
        $(renderer).on('preview-mode-left', function(){
            $('.column-left > .command-loading').fadeOut(200);
        });
        exitPreviewButton.hide();
        previewButton.show();
    });

    facebookButton.on('click', function(event){
        overviewLoading.fadeIn(50);
        $('.column-left > .loading').fadeOut(50);
        event.preventDefault();
        renderer.getScreenshot().then(function(screenshot){
            overviewLoading.fadeOut(50);
            $('.column-left > .loading').fadeOut(50);
            FB.ui({
                method: 'feed',
                link: 'http://streep.nl',
                caption: 'STREEP - 3D geprinte zonnebrillen',
                picture: screenshot,
                description: 'Ik heb zojuist mijn eigen zonnebril ontworpen! Deze zal 3D geprint worden door streep.nl'
            });
        });

    });

    twitterButton.on('click', function(event){
        overviewLoading.fadeIn(50);
        $('.column-left > .loading').fadeOut(50);
        event.preventDefault();
        renderer.getScreenshot().then(function(screenshot){
            var width  = 575,
                height = 400,
                left   = ($(window).width()  - width)  / 2,
                top    = ($(window).height() - height) / 2,
                url    = twitterButton.attr('href'),
                opts   = 'status=1' +
                    ',width='  + width  +
                    ',height=' + height +
                    ',top='    + top    +
                    ',left='   + left;

            var text = "Ik heb zojuist mijn eigen zonnebril ontworpen! Deze zal 3D geprint worden door streep.nl";

            window.open(url + '?url=' + screenshot + '&text=' + encodeURI(text), 'twitter', opts);
            overviewLoading.fadeOut(50);
            return false;
        });
    })

    $(frameChooser).on('frame-chosen', function(event, chosenSizesId){
        $('.column-left > .loading').fadeIn(200);
        $('.indicator').remove();
        $('.streep-tooltip').remove();
        loadSizes(chosenSizesId).then(loadFrame);
    });

    $(sizeChooser).on('size-changed', function(event){
        $('.column-left > .loading').fadeIn(200);
        $('.indicator').remove();
        $('.streep-tooltip').remove();
        loadFrame();
    });

    var loadFrame = function(){
        $('button.preview-mode').show();
        $('button.exit-preview-mode').hide();
        var chosenSize = sizeChooser.getSelectedSize();
        var frameId = sizes.get('frames')[chosenSize];
        frame = new Frame({
            id: frameId
        });
        frame.fetch({data: {depth: 3}}).then(function(){
            if(!renderer){

                renderer = new RendererProxy({
                    container: renderTarget
                });

                $(renderer).on('commandLoading', function(event){
                    $('.column-left > .command-loading').fadeIn(200);
                });

                $(renderer).on('commandError', function(event){
                    $('.column-left > .command-error').fadeIn(200);
                });
                $(renderer).on('commandDone', function(event){
                    $('.column-left > .command-loading').fadeOut(200);
                });

                afterRendererReady();
            }else{
                renderer.destroy();
                afterRendererReady();
            }

            function afterRendererReady(){
                renderer.init().then(function(){
                    frameChooser.setActive(frame.id);
                    renderer.loadFrame(frame).then(function(){
                        $('.column-left > .loading').fadeOut(200);
                        $(renderer).off('focus-changed').on('focus-changed', handleFocusChanged);
                        $('#overview > .price').html('&euro;' + frame.get('basePrice'));

                        setTimeout(function(){
                            $('.streep-tooltip').fadeIn(500);
                            setTimeout(function(){
                                $('.streep-tooltip').fadeOut(1000);
                            }, 9000)
                        }, 10);

                    }).catch(function(err){
                        console.log(err);
                        console.log(err.stack);
                    });
                    $('#menu').html('');
                }).catch(function(err){
                    console.log(err);
                    console.log(err.stack);
                });
            }
        });
    };

    var loadSizes = function(sizeId){
        sizes = new Size({
            id: sizeId
        });
        return sizes.fetch();
    }

    loadSizes(sizesId).then(loadFrame);

    $(window).resize(resizeElements);
    resizeElements();

    function handleFocusChanged(event, comp, serverData){
        if(serverData){
            switch(serverData.focusedOn){
                case "front":
                    serverFocusedOnFront(serverData);
                    break;
                case "left_leg":
                case "right_leg":
                    serverFocusedOnLeg(serverData);
                    break;
            }
        }else{
            if(comp && comp.parent && !comp.children){
                var parent = comp.parent;
                if(comp == parent.currentFront.currentNose){
                    focusedOnFront(parent.currentFront);
                }else if(comp == parent.currentLeftLeg || comp == parent.currentRightLeg){
                    focusedOnLeg(comp);
                }
            }else{
                $('#menu').fadeOut(200);
            }
        }

    };

    function updatePrice(){
        renderer.getPrice().then(function(newPrice){
            price.html("&euro;" + newPrice);
        });
    };

    function serverFocusedOnLeg(data){
        $('#menu').html('');
        var legPage = new LegPage({
            patterns: data.legPage.patterns,
            side: data.legPage.side,
            colors: data.legPage.colors
        });

        engravePage = new EngravePage({
            side: data.legPage.side,
            sizes: data.engravePage.sizes
        });

        var menu = new Menu({
            element: $('#menu'),
            pages: [
                legPage,
                engravePage
            ]
        });

        legPage.activate();

        if(data.engravePage.engraved){
            engravePage.setEngraved.apply(engravePage, [data.engravePage.engraved]);
        }

        if(!data.engravePage.sizes){
            engravePage.disable();
        }

        $(legPage).on('pattern-changed', function(event, side, pattern){
            try{
                renderer.changePattern(side, pattern).then(function(serverResponse){
                    var activePattern = _.find(serverResponse.data.legPage.patterns, function(pattern){
                        return pattern.active;
                    });
                    var index = serverResponse.data.legPage.patterns.indexOf(activePattern);
                    if(!serverResponse.data.engravePage.sizes){
                        engravePage.disable();
                    }else{
                        engravePage.sizes = serverResponse.data.engravePage.sizes;
                        engravePage.enable();
                    }
                    legPage.setActiveIndex(index);
                    updatePrice();
                });
            }catch(err){
                console.log(err.stack);
            }
        });

        $(legPage).on('color-changed', function(event, color){
            renderer.changeLegsColor(color);
        });


        $(engravePage).on('request-engraving', function(event, engraving){
            renderer.engraveLeg(engraving.side, engraving.size, engraving.font, engraving.text).then(function(serverResponse){
                engravePage.setEngraved(serverResponse.data.engravePage.engraved);
            });
        });

        $(engravePage).on('request-carving', function(event, carving){
            renderer.carveLeg(carving.side, carving.size, carving.font, carving.text).then(function(serverResponse){
                engravePage.setEngraved(serverResponse.data.engravePage.engraved);
            });
        });

        $(engravePage).on('reset-requested', function(event, side){
            renderer.resetLeg(side).then(function(serverResponse){
                engravePage.setEngraved(serverResponse.data.engravePage.engraved);
            });
        });

        /*
        $(engravePage).on('leg-reset', function(event, side){
            appliedEngravings[side] = null;
        });
        */

        $(menu).on('back', function(){
            renderer.zoomOut();
        });
        $('#menu').fadeIn(200);
    };

    function serverFocusedOnFront(data){
        $('#menu').html('');

        var pages = [];
        var frontPage = new FrontPage({
            fronts: data.frontPage.fronts,
            colors: data.frontPage.colors
        });
        pages.push(frontPage);

        var nosePage = new NosePage({
            noses: data.nosePage.noses,
            activeNoseIndex: data.nosePage.noseIndex
        });
        pages.push(nosePage);


        if(data.glassesPage){
            var glassesPage = new GlassesPage({
                glasses: data.glassesPage.glasses
            });
            pages.push(glassesPage);
        }

        var menu = new Menu({
            element: $('#menu'),
            pages: pages
        });

        frontPage.activate();
        nosePage.activate();

        $(frontPage).on('front-changed', function(event, replacementFront){
            renderer.changeFront(replacementFront).then(function(serverResponse){
                frontPage.fronts = serverResponse.data.frontPage.fronts;
                frontPage.newFrontLoaded();
                frontPage.activate();
                frontPage.render();
                nosePage.noses = serverResponse.data.nosePage.noses;
                nosePage.activate();
                nosePage.render();
                glassesPage.glasses = serverResponse.data.glassesPage.glasses;
                glassesPage.activate();
                glassesPage.render();
                updatePrice();
            }).catch(function(err){
                console.log(err);
                console.log(err.stack);
            });
        });

        $(frontPage).on('front-color-changed', function(event, color){
           renderer.changeFrontColor(color);
        });

        $(nosePage).on('nose-changed', function(event, newNose){
            renderer.changeNose(newNose).then(function(newNoseObj){
                nosePage.nose = newNoseObj;
                nosePage.newNoseLoaded();
                updatePrice();
            });
        });

        $(glassesPage).on('glasses-changed', function(event, newGlasses){
            renderer.changeGlasses(newGlasses).then(function(serverResponse){
                glassesPage.glasses = serverResponse.data.glassesPage.glasses;
                updatePrice();
            });
        });

        $(menu).on('back', function(){
            renderer.zoomOut();
        });
        $('#menu').fadeIn(200);
    };

    function focusedOnFront(comp){
        $('#menu').html('');

        var frontPage = new FrontPage({
            frame: renderer.getFrame(),
            front: comp
        });

        var nosePage = new NosePage({
           front: comp
        });

        var glassesPage = new GlassesPage({
            front: comp
        });

        var menu = new Menu({
            element: $('#menu'),
            pages: [
                frontPage,
                nosePage,
                glassesPage
            ]
        });

        frontPage.activate();

        $(frontPage).on('front-changed', function(event, replacementFront){
            try{
                renderer.changeFront(replacementFront).then(function(newFrontObj){
                    try{
                        applyEngravingsToNewLegs(_.find(newFrontObj.legs, function(legs){
                           return legs.active;
                        }));
                    }catch(err){
                        console.log(err);
                    }
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

        $(glassesPage).on('glasses-changed', function(event, newGlasses){
            try{
                renderer.changeGlasses(newGlasses).then(function(newGlasses){
                    glassesPage.newGlassesLoaded(newGlasses);
                    $('#overview > .price').html('&euro;' + renderer.getPrice());
                })
            }catch(err){
                console.log(err.stack);
            }
        });

        $(menu).on('back', function(){
            renderer.zoomOut();
        });
        $('#menu').fadeIn(200);
    }

    function applyEngravingsToNewLegs(newLegs){
        var execute = [];
        for(var side in appliedEngravings){
            if(appliedEngravings[side]){
                var engraving = appliedEngravings[side];
                var connector = _.find(newLegs.patterns[0][side].connectors, function(connector){
                    return connector.name == engraving.connector;
                });
                var mod = _.find(connector.modifications, function(mod){
                    return mod.action_name == engraving.type;
                });
                var sizes = _.keys(mod.sizes);
                mod.setText(engraving.text, engraving.font, sizes[sizes.length - 1]);
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
            frame: renderer.getFrame(),
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

        $(legPage).on('pattern-changed', function(event, leg, pattern){
            try{
                renderer.changePattern(leg, pattern).then(function(newLegs){
                    var focusedLeg = null;

                    if(newLegs.right.name == leg.name){
                        focusedLeg = newLegs.right;
                    }else{
                        focusedLeg = newLegs.left;
                    }

                    engravePage.setLeg.apply(engravePage, [focusedLeg]);
                    engravePage.render.apply(engravePage);
                    legPage.setLeg.apply(legPage, [focusedLeg]);
                    $('#overview > .price').html('&euro;' + renderer.getPrice());
                });
            }catch(err){
                console.log(err.stack);
            }
        });

        $(engravePage).on('engraving-applied', function(event, engraving){
            appliedEngravings[engraving.side] = engraving;
        });

        $(engravePage).on('leg-reset', function(event, side){
            appliedEngravings[side] = null;
        });

        $(menu).on('back', function(){
            renderer.zoomOut();
        });
        $('#menu').fadeIn(200);
    }

    function resizeElements(){
        var rendererElement = $('#renderer');
        var maxWidth = rendererElement.parent().width();
        var maxHeight = rendererElement.parent().height() - rendererElement.parent().find('#menu').height();

        var ratio = 21 / 9;
        var wantedWidth = 0;
        var wantedHeight = 0;
        var marginLeft = 0;
        var marginTop = 0;

        if(maxWidth > maxHeight){
            wantedHeight = maxHeight;
            wantedWidth = maxHeight * ratio;
        }else{
            wantedWidth = maxWidth;
            wantedHeight = maxWidth / ratio;
        }

        while(wantedWidth > maxWidth){
            wantedWidth -= 1;
            wantedHeight = wantedWidth / ratio;
        }

        while(wantedHeight > maxHeight){
            wantedHeight -= 1;
            wantedWidth = wantedHeight * ratio;
        }

        if(wantedWidth < maxWidth){
            marginLeft = (maxWidth - wantedWidth) / 2;
        }

        if(wantedHeight < maxHeight){
            marginTop = (maxHeight - wantedHeight) / 2;
        }

        rendererElement.css('width', wantedWidth);
        rendererElement.css('height', wantedHeight);
        rendererElement.css('left', marginLeft);
        rendererElement.css('top', marginTop);

        var menu = $('#menu');
        menu.css('left', ($(window).width() - menu.width()) / 2);

        if(renderer){
            renderer.resize();
        }
    };
});