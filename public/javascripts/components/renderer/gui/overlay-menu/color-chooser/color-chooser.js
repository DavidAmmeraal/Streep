define([
    'gui/overlay-menu/overlay-menu',
    'text!gui/overlay-menu/color-chooser/templates/color-chooser.html'
], function(
    OverlayMenu,
    ColorChooserTemplate
){
    var ColorChooser = function(options){
        var self = this;
        var template = $(ColorChooserTemplate).clone();

        OverlayMenu.apply(this, arguments);

        this.colors = [
            "#b81900",
            "#b3d4fc",
            "#440044",
            "#8000ff",
            "#f94c39",
            "#67abcd",
            "#abcdef",
            "#0155da"
        ];

        var initialize = function(){
            console.log("ColorChooser.initialize()");
            createMenu();
        }

        var createMenu = function(){
           console.log("ColorChooser.createMenu()");
           var currentTemplate = template.clone();
           var colorTemplate = template.find('.color').clone();
           currentTemplate.find('.color').remove();

           for(var i = 0; i < self.colors.length; i++){
               var color = self.colors[i];
               console.log(color);
               var currentColorTemplate = colorTemplate.clone();
               currentColorTemplate.css('background-color', color);
               currentTemplate.append(currentColorTemplate);
           }
           self.setContent(currentTemplate);
        }

        initialize();
    }
    ColorChooser.prototype = Object.create(OverlayMenu.prototype);
    ColorChooser.prototype.className = "color-chooser";
    return ColorChooser;
});