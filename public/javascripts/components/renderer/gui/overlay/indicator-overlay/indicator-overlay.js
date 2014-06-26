define([
    '../viewer-overlay',
    'text!/javascripts/components/renderer/gui/overlay/indicator-overlay/templates/indicator-overlay-template.html'
], function(
    ViewerOverlay,
    IndicatorOverlayTemplate
){
    var IndicatorOverlay = function(options){
        ViewerOverlay.apply(this, arguments);
    }
    IndicatorOverlay.prototype = ViewerOverlay.prototype;
    IndicatorOverlay.prototype.indicators = null;
    IndicatorOverlay.template = _.template(IndicatorOverlayTemplate);
    IndicatorOverlay.prototype.indicatorsVisible = true;
    IndicatorOverlay.prototype.render = function(){
        this.renderIndicators();
        this.renderTooltips();
    };
    IndicatorOverlay.prototype.hideIndicators = function(){
      this.element.find('.indicator, .streep-tooltip').animate({
        opacity: 0
      }, 200);
      this.indicatorsVisible = false;
    };
    IndicatorOverlay.prototype.showIndicators = function(){
        this.render();
        this.element.find('.indicator, .streep-tooltip').animate({
            opacity: 1
        }, 200);
        this.indicatorsVisible = true;
    };
    IndicatorOverlay.prototype.hide = function(){
        this.element.hide();
    };
    IndicatorOverlay.prototype.show = function(){
        this.element.show();
    }
    IndicatorOverlay.prototype.renderTooltips = function(){
        console.log("RENDER TOOLTIPS!");
        var self = this;
        this.element.find('.indicator').each(function(){
            var offset = $(this).position();
            var comp = $(this).data('component');
            var position = "top";
            switch(comp.name){
                case "poot_links":
                    contents = "Wijzig hier uw linkerpoot";
                    break;
                case "poot_rechts":
                    contents = "Wijzig hier uw rechterpoot";
                    break;
                default:
                    contents = "Wijzig hier uw voorkant";
                    position = "bottom";
                    break;
            }

            var div;
            if(!$(this).data('tooltip')){
                div = $("<div class='streep-tooltip " + position + "'><img src='/images/tooltip_" + position + ".png' width='100%' height='100%'/><div class='text'>" + contents + "</div></div>");
                self.element.append(div);
                $(this).data('tooltip', div);
            }else{
                div = $(this).data('tooltip');
            }

            if(!self.indicatorsVisible){
                div.css('opacity', 0);
            }

            if(self.element.find('.streep-tooltip').length < self.element.find('.indicator')){
                self.element.append(div);
            }
            div.css('top', offset.top);
            if(position == "top" || position == "bottom"){
                div.css('left', offset.left);
            }else if(position == "left"){
                div.css('left', offset.left - div.width());
            }else{
                div.css('left', offset.left);
            }
        });

    };
    IndicatorOverlay.prototype.renderIndicators = function(){
        console.log("RENDER INDICATORS!!!!");
        var self = this;
        var comps = this.viewer.getComponents();
        var indicators = self.element.find('.indicator');

        for(var i = 0; i < indicators.length; i++){
            var indicator = $(indicators[i]);
            if(!_.find(comps, function(comp){
                return comp == indicator.data('component');
            })){
                if(indicator.data('tooltip')){
                    indicator.data('tooltip').remove();
                }
                indicator.remove();
            }
        }

        function toScreenXY( position, camera, div ){
            var pos = position.clone();
            var projScreenMat = new THREE.Matrix4();
            projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
            pos.applyProjection(projScreenMat);

            return { x: ( pos.x + 1 ) * $(div).width() / 2,
                y: ( - pos.y + 1) * $(div).height() / 2 };
        }

        for(var c = 0; c < comps.length; c++){
            var comp = comps[c];
            if(comp.indicator){
                var xyPosition = toScreenXY(comp.indicator, self.viewer.camera, self.viewer.renderer.domElement);

                var indicator = $(comp).data('indicatorElement');
                if(!indicator){
                    indicator = $("<div class='indicator'>&nbsp;</div>");
                    indicator.data('component', comp);
                    $(comp).data('indicatorElement', indicator);
                    self.element.append(indicator);
                    indicator.on('click', (function(comp){
                        return function(){
                            self.viewer.focusTo(comp, 500);
                        }
                    })(comp));
                }
                indicator.css('left', xyPosition.x);
                indicator.css('top', xyPosition.y);

                if(!self.indicatorsVisible){
                    indicator.css('opacity', 0);
                }
            }
        }
    };
    return IndicatorOverlay;
});