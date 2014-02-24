define([
    'gui/overlay-menu/overlay-menu',
    'text!gui/overlay-menu/connector-menu/templates/connector-menu.html',
    'gui/dialog/object-engrave-dialog',
    'gui/dialog/text-engrave-dialog'
], function(
    OverlayMenu,
    ConnectorMenuTemplate,
    ObjectEngraveDialog,
    TextEngraveDialog
){
   var ConnectorMenu = function(options){
       var self = this;
       console.log(self);

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
               link.on('click', function(event){
                   event.preventDefault()
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
           console.log("ConnectorMenu.getDialog()");
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
   ConnectorMenu.prototype.closeable = false;
   return ConnectorMenu;
});