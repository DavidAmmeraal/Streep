define(['./overlay'], function(Overlay){
   var ViewerOverlay = function(options){
       var self = this;
       this.viewer = null;
       Overlay.apply(this, arguments);

       var initialize = function(){
           $(self.viewer).on('viewer.render', function(){
               self.render();
           });

           $(self.viewer).on('viewer.focus', function(event, comp){
               self.focus(comp);
           });
       }

       initialize();
   }
   ViewerOverlay.prototype = Overlay.prototype;
   ViewerOverlay.prototype.renderStatic = function(){};
   ViewerOverlay.prototype.focus = function(){};
   return ViewerOverlay;
});