define([], function(){
   var TabPage =  function(options){
       $.extend(this, options);
   }

    TabPage.prototype.id = null;
    TabPage.prototype.frame = null;
    TabPage.prototype.tabTitle = "Unnamed Tab";
    TabPage.prototype.template = _.template("This tab doesn't have any content yet");
    TabPage.prototype.html = "<div>This tab doesn't have any content yet!</div>";
    TabPage.prototype.element = null;
    TabPage.prototype.render = function(){
        this.element.html($(this.html));
    }

    return TabPage;
});