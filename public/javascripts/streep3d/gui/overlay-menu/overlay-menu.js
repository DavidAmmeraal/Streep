define(['text!gui/overlay-menu/templates/overlay-menu.html'], function(OverlayMenuTemplate){
   var OverlayMenu = function(options){
       var self = this;

       $.extend(this, options);

       var initialize = function(){
           self.createElement();
           listenToActions();
       }

       var listenToActions = function(){
           console.log(self);
           if(self.closeAction){
               self.closeAction.on('click', function(){
                   self.hide();
               });
           }
       }

       initialize();
   }
   OverlayMenu.prototype.className = null;
   OverlayMenu.prototype.title = "Overlay Menu"
   OverlayMenu.prototype.overlay = null;
   OverlayMenu.prototype.element = null;
   OverlayMenu.prototype.contents = null;
   OverlayMenu.prototype.closeable = true;
   OverlayMenu.prototype.closeAction = null;
   OverlayMenu.prototype.createElement = function(){
       console.log("OverlayMenu.createElement()");
       this.element = $(OverlayMenuTemplate).hide();
       this.element.addClass(this.className);
       this.overlay.element.find('.menu-context').append($('<div class="menu-row"></div>').append(this.element));
       if(this.closeable){
           this.closeAction = this.element.find('.actions .close');
       }else{
           this.element.find('.actions .close').hide();
       }
   }

   OverlayMenu.prototype.positionElement = function(){
        var pWidth = this.overlay.element.width();
        var pHeight = this.overlay.element.height();

        var left = (pWidth - this.element.width()) / 2;

        this.element.css('left', left);
    }

    OverlayMenu.prototype.setContent = function(contents){
        this.contents = contents;
        this.element.find('.contents').html(this.contents);
    }

    OverlayMenu.prototype.show = function(){
        this.positionElement();
        var self = this;
        if(this.overlay.element.find('.overlay-menu.' + this.className + ':visible').get(0)){
            this.overlay.element.find('.overlay-menu.' + this.className + ':visible').fadeOut(200, function(){
                $(this).remove();
                self.element.fadeIn(200);
            })
        }else{
           self.element.fadeIn(200);
        }
    }

    OverlayMenu.prototype.hide = function(){
        this.element.fadeOut(200);
    }
   return OverlayMenu;
});