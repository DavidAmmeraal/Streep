define([
    '../viewer-overlay',
    'text!/javascripts/components/renderer/gui/overlay/indicator-overlay/templates/indicator-overlay-template.html'
], function(
    ViewerOverlay,
    IndicatorOverlayTemplate
){
    var IndicatorOverlay = function(options){
        var self = this;
        ViewerOverlay.apply(this, arguments);

        var switchButton = $("<div class='switch on'></div>");
        switchButton.on('click', function(){
            var src = $(this);
            if(src.hasClass('on')){
                src.removeClass('on');
                src.addClass('off');
                self.hideIndicators();
            }else if(src.hasClass('off')){
                src.removeClass('off');
                src.addClass('on');
                self.showIndicators();
            }
        });
        this.element.append(switchButton);
    }
    IndicatorOverlay.prototype = ViewerOverlay.prototype;
    IndicatorOverlay.template = _.template(IndicatorOverlayTemplate);
    IndicatorOverlay.prototype.indicatorsVisible = true;
    IndicatorOverlay.prototype.render = function(){
        this.renderIndicators();
        this.renderTooltips();
    };
    IndicatorOverlay.prototype.hideIndicators = function(){
      this.element.find('.indicator, .indicator-tooltip').animate({
        opacity: 0
      }, 200);
      this.indicatorsVisible = false;
    };
    IndicatorOverlay.prototype.showIndicators = function(){
        this.render();
        this.element.find('.indicator, .indicator-tooltip').animate({
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
        var self = this;
        this.element.find('.indicator-tooltip').remove();
        this.element.find('.indicator').each(function(){
            var offset = $(this).offset();
            var comp = $(this).data('component');
            var contents;
            var position;
            if(comp.name == "poot_links" || comp.name == "poot_rechts"){
                contents = "Wijzig hier uw poten";
                if(comp.name == "poot_links"){
                    position = "right";
                }else{
                    position = "left";
                }
            }else{
                contents = "Wijzig hier uw voorkant";
                position = "top";
            }

            var div = $("<div class='indicator-tooltip " + position + "'><div class='arrow'>&nbsp;</div><div class='text'>" + contents + "</div></div>");
            if(!self.indicatorsVisible){
                div.css('opacity', 0);
            }
            self.element.append(div);
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
        var self = this;
        this.element.find('.indicator').remove();

        var comps = this.viewer.getComponents();

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
            var xyPosition = toScreenXY(comp.indicator, self.viewer.camera, self.viewer.renderer.domElement);

            var div = $("<div class='indicator'>&nbsp;</div>");
            div.css('left', xyPosition.x);
            div.css('top', xyPosition.y);
            div.data('component', comp);

            if(!self.indicatorsVisible){
                div.css('opacity', 0);
            }

            div.on('click', function(){
                self.viewer.focusTo($(this).data('component'));
            });

            self.element.append(div);
        }
    };
    return IndicatorOverlay;
})