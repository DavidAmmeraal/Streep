define(['text!./templates/menu.html'], function(MenuTemplate){
   var Menu = function(options){
       var self = this;
       this.element = null;
       this.pages = [];

       $.extend(self, options);

       var template = _.template(MenuTemplate);

       var initialize = function(){
            render();
       };

       var render = function(){
           self.element.html(template({pages: self.pages}));
           for(var i = 0; i < self.pages.length; i++){
               var page = self.pages[i];
               var pageElement = self.element.find('#' + page.id);
               pageElement.html(page.render());
           }
       };

       initialize();
   };

    return Menu;
});