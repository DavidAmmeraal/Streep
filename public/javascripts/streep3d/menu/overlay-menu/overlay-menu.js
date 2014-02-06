define(['text!menu/overlay-menu/templates/overlay-menu.html'], function(OverlayMenuTemplate){
   var OverlayMenu = function(options){
       var self = this;
       this.title = "Overlay Menu"
       this.overlay = null;
       this.element = null;
       this.contents = null;
       this.closeAction = null;

       $.extend(this, options);

       var initialize = function(){
           self.createElement();
           listenToActions();
       }

       var listenToActions = function(){
           self.closeAction.on('click', function(){
               self.hide();
           });
       }

       this.createElement = function(){
           console.log(this);
           self.element = $(OverlayMenuTemplate).hide();
           self.element.addClass(this.className);
           self.overlay.element.find('.menu-context').append($('<div class="menu-row"></div>').append(self.element));
           self.closeAction = self.element.find('.actions .close');
       }

       self.positionElement = function(){
           var pWidth = self.overlay.element.width();
           var pHeight = self.overlay.element.height();

           var left = (pWidth - self.element.width()) / 2;

           self.element.css('left', left);
       }

       this.setContent = function(contents){
           self.contents = contents;
           self.element.find('.contents').html(self.contents);
       }

       this.show = function(){
           self.positionElement();
           if(self.overlay.element.find('.overlay-menu.' + self.className + ':visible').get(0)){
               self.overlay.element.find('.overlay-menu.' + self.className + ':visible').fadeOut(200, function(){
                   $(this).remove();
                   self.element.fadeIn(200);
               })
           }else{
               self.element.fadeIn(200);
           }
       }

       this.hide = function(){
           self.element.fadeOut(200);
       }

       initialize();
   }
   OverlayMenu.prototype.className = null;
   return OverlayMenu;
});