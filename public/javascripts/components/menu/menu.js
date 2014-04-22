define(['text!./templates/menu.html'], function(MenuTemplate){
   var Menu = function(options){
       var self = this;

       $.extend(self, options);

       var template = _.template(MenuTemplate);

       var initialize = function(){
            render();
       };

       var render = function(){
           console.log("Menu.render()");
           self.element.html(template({pages: self.pages}));
           for(var i = 0; i < self.pages.length; i++){
               var page = self.pages[i];
               var pageElement = self.element.find('#' + page.id);
               page.element = pageElement;
               pageElement.data('page', page);
               page.render();
           }
           self.element.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
               $($(e.target).attr('href')).data('page').activate();
           });
       };

       initialize();
   };

    Menu.prototype.element = null;
    Menu.prototype.pages = [];

    return Menu;
});