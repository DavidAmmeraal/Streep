define(['gui/overlay/overlay'], function(Overlay){
   var ViewerOverlay = function(options){
       var self = this;
       this.viewer = null;
       Overlay.apply(this, arguments);

       var initialize = function(){
           $(self.viewer).on('editor.render', function(){
               self.render();
           });

           $(self.viewer).on('editor.focus', function(event, comp){
               self.focus(comp);
           });
       }

       initialize();
   }
   ViewerOverlay.prototype = Overlay.prototype;
   return ViewerOverlay;
});