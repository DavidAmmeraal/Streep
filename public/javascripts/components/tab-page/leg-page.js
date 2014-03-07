define(['./tab-page', 'text!./templates/leg-page.html'], function(TabPage, LegPageTemplate){
    var LegPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);
    };

    LegPage.prototype = Object.create(TabPage.prototype);
    LegPage.prototype.id = "color";
    LegPage.prototype.tabTitle = "Poot en kleur";
    LegPage.prototype.leg = null;
    LegPage.prototype.legs = [];
    LegPage.prototype.colors = [];
    LegPage.prototype.template = _.template(LegPageTemplate);
    LegPage.prototype.setLeg = function(leg){
        console.log("SET LEG!");
        this.html.find('.loading').hide();
        this.leg = leg;
    };
    LegPage.prototype.render = function(){
        var self = this;
        self.colors = self.frame.get('availableColors');
        self.legs = self.frame.get('legs');
        var html = $(this.template({colors: self.colors, legs: self.legs}));
        this.html = html;
        this.html.find('.colors > .color').on('click', function(){
            html.find('.colors > .color.active').removeClass('active');
            $(this).addClass('active');
            self.leg.setColor($(this).attr('data-color'));
           // $(self).trigger('color-changed', $(this).attr('data-color'));
        });
        this.html.find('.legs .leg>img').on('click', function(){
            html.find('.legs img.active').removeClass('active');
            $(this).addClass('active');
            self.html.find('.loading').show();
            $(self).trigger('legs-changed', self.legs[$(this).attr('data-number')]);
        });
        this.element.html(this.html);
    };

    return LegPage;
})