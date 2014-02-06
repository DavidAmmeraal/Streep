define([
    'menu/overlay-menu/overlay-menu',
    'text!menu/overlay-menu/connector-menu/templates/connector-menu.html',
    'menu/dialog/object-engrave-dialog',
    'menu/dialog/text-engrave-dialog'
], function(
    OverlayMenu,
    ConnectorMenuTemplate,
    ObjectEngraveDialog,
    TextEngraveDialog
){
   var ConnectorMenu = function(options){
       var self = this;
       OverlayMenu.apply(this, arguments);

       var initialize = function(){
           createMenu();
       }

       var createMenu = function(){
           var template = $(ConnectorMenuTemplate);
           for(var i = 0; i < self.connector.modifications.length; i++){
               var mod = self.connector.modifications[i];
               var link = $('<a href="#">' + mod.readable + '</a>');
               link.data('modification', mod);
               link.on('click', function(){
                   var mod = $(this).data('modification');
                   getDialog(mod);
               });
               template.append(link);

           }
           var reset = $('<a href="#">Reset</a>');
           reset.on('click', function(){
               self.connector.reset();
           });
           template.append(reset);
           self.setContent(template);
       }


       var getDialog = function(mod){
           if(mod.objects){
               new ObjectEngraveDialog(mod);
           }else{
               new TextEngraveDialog(mod);
           }
       };

       initialize();
   }
   ConnectorMenu.prototype = Object.create(OverlayMenu.prototype);
   ConnectorMenu.prototype.className = "connector-menu";
   return ConnectorMenu;
});