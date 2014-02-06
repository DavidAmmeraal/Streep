define(['text!overlay/templates/overlay.html'], function(OverlayTemplate){
    var Overlay = function(options){
        var self = this;
        this.targetElement = null;
        this.element = null;
        this.className = null;
        this.id = null;
        $.extend(this, options);

        var initialize = function(){
            self.createElement();
        };

        this.createElement = function(){
            self.element = $(OverlayTemplate).addClass(self.className);
            self.targetElement.append(self.element);
        };

        this.render = function(){

        };

        initialize();
    }

    return Overlay;
});