define([
    '../overlay',
    'text!/javascripts/components/renderer/gui/overlay/indicator-overlay/templates/indicator-overlay-template.html'
], function(
    Overlay,
    IndicatorOverlayTemplate
){
    var IndicatorOverlay = function(options){
        Overlay.apply(this, arguments);
    }
    IndicatorOverlay.prototype = Overlay.prototype;
    IndicatorOverlay.prototype.indicators = null;
    IndicatorOverlay.template = _.template(IndicatorOverlayTemplate);
    IndicatorOverlay.prototype.indicatorsVisible = true;
    IndicatorOverlay.prototype.indicators = [];
    IndicatorOverlay.prototype.setIndicators = function(indicators){
        this.indicators = indicators;
    };
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
        console.log("IndicatorOverlay.prototpye.renderTooltips()");
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
                $(this).parent().append(div);
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
        var self = this;

        var elements = this.element.find('.indicator');
        var findIndicatorElementForComponent = function(comp){
            var foundElement = _.find(elements, function(element){
                return $(element).data('component') == comp;
            });

            if(foundElement){
                return $(foundElement);
            }
            return false;
        };

        _.each(elements, function(element){
            var $element = $(element);
            var component = $element.data('component');
            if(!_.find(self.indicators, function(indicator){
               return indicator.component == component;
            })){
                $element.data('tooltip').remove();
                $element.remove();
            }
        });


        for(var c = 0; c < this.indicators.length; c++){
            var indicator = this.indicators[c];

            var element = findIndicatorElementForComponent(indicator.component);
            if(!element){
                element = $("<div class='indicator'>&nbsp;</div>");
                element.data('component', indicator.component);
                self.element.append(element);
                element.on('click', (function(comp){
                    return function(){
                        $(self).trigger('focus-requested', comp);
                    }
                })(indicator.component));
            }

            element.css('left', indicator.position.x);
            element.css('top', indicator.position.y);

            if(!self.indicatorsVisible){
                element.css('opacity', 0);
            }
        }
    };
    return IndicatorOverlay;
});