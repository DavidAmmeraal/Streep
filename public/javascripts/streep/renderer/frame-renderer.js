define([
    '../overlays/indicator-overlay/indicator-overlay'
], function(
    IndicatorOverlay
){
    var FrameRenderer = function(options){
        $.extend(this, options);
        console.log("FrameRenderer");
        console.log(this);
    };

    FrameRenderer.prototype = {
        container: null,
        backgroundColor: "#000000",
        frame: null,
        renderedFrame: null,
        container: null,
        viewer: null,
        indicators: null,
        focusedComp: null,
        init: function(){
            var self = this;
            return new Promise(function(resolve, reject){
                self.indicators = new IndicatorOverlay({
                    targetElement: self.container,
                    className: 'indicators'
                });

                $(self.indicators).on('focus-requested', function(event, comp){
                    console.log(self);
                    self.focus.apply(self, [comp]);
                });
                resolve();
            });
        },
        loadFrame: function(frame, renderCallback){

        },
        handleFocusChanged: function(event, comp){

        },
        showOverlays: function(){
            this.indicators.show();
        },
        hideOverlays: function(){
            this.indicators.hide();
        },
        resize: function(){

        },
        getFrame: function(){
          return this.frame;
        },
        getPrice: function(){

        },
        changeFront: function(front){

        },
        changeNose: function(nose){

        },
        changePattern: function(pattern){

        },
        changeGlasses: function(glasses){

        },
        changeLegs: function(legs){

        },
        destroy: function(){

        },
        getSTL: function(){

        },
        getScreenshot: function(){

        },
        focus: function(comp){
            console.log("FrameRenderer.focus()");
            console.log(comp);
        }
    };

    return FrameRenderer;
});