define(['./tab-page', 'text!./templates/leg-page.html'], function(TabPage, LegPageTemplate){
    var LegPage = function(options){
        TabPage.apply(this, options);
    };

    LegPage.prototype = Object.create(TabPage.prototype);
    LegPage.prototype.id = "color";
    LegPage.prototype.tabTitle = "Poot en kleur";
    LegPage.prototype.legs = [];
    LegPage.prototype.colors = [
        '#282828',
        '#28affc',
        '#a8a8a8',
        '#e1fc28',
        '#fc2828'
    ];
    LegPage.prototype.template = _.template(LegPageTemplate);
    LegPage.prototype.render = function(){
        var self = $(this);
        this.html = $(this.template({colors: this.colors}));
        this.html.find('.colors > .color').on('click', function(){
            self.colorChanged(color);
        });
        return this.html;
    };

    return LegPage;
})