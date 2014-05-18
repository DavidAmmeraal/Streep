define(['text!/javascripts/components/renderer/gui/overlay/templates/overlay.html'], function(OverlayTemplate){
    var Overlay = function(options){
        var self = this;
        $.extend(this, options);

        var initialize = function(){
            self.targetElement = $(self.targetElement);
            self.createElement();
        };

        initialize();
    }

    Overlay.prototype.targetElement = null;
    Overlay.prototype.element = null;
    Overlay.prototype.className = null;
    Overlay.prototype.id = null;
    Overlay.prototype.hide = function(){
        this.element.hide();
    };
    Overlay.prototype.show = function(){
        this.element.show();
    }
    Overlay.prototype.createElement = function(){
        this.element = $(OverlayTemplate).addClass(this.className);
        this.targetElement.append(this.element);
    };
    Overlay.prototype.render = function(){};

    return Overlay;
});