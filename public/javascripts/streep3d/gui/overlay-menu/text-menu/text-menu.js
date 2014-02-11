define(['gui/overlay-menu/overlay-menu'], function(OverlayMenu){
    var TextMenu = function(options){
        var self = this;

        OverlayMenu.apply(this, options)

        var initialize = function(){

        }
    }
    TextMenu.prototype = Object.create(OverlayMenu);
    TextMenu.prototype.connector = null;
})