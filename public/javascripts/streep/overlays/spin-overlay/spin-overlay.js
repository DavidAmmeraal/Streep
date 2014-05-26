define([
    '../overlay',
    'text!/javascripts/streep/overlays/spin-overlay/templates/spin-overlay-template.html'
], function(
    Overlay,
    SpinOverlayTemplate
){
    var SpinOverlay = function(options){
        Overlay.apply(this, arguments);
        console.log("new SpinOverlay()");
    }
    SpinOverlay.prototype = Overlay.prototype;
    SpinOverlay.prototype.indicators = null;
    SpinOverlay.prototype.template = _.template(SpinOverlayTemplate);
    SpinOverlay.prototype.indicatorsVisible = true;
    SpinOverlay.prototype.indicators = [];
    SpinOverlay.prototype.render = function(){
        var self = this;
        this.element.children().remove();
        this.element.append(this.template);
        this.element.find('.arrow_left').on('click', function(){
            $(self).trigger('rotate-left-requested');
        });
        this.element.find('.arrow_right').on('click', function(){
            $(self).trigger('rotate-right-requested');
        });
    };

    return SpinOverlay;
});