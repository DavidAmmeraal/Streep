define(['./tab-page', 'text!./templates/front-page.html'], function(TabPage, FrontPageTemplate){
    var FrontPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);
    };

    FrontPage.prototype = Object.create(TabPage.prototype);
    FrontPage.prototype.id = "front_color";
    FrontPage.prototype.tabTitle = "Kleur en type";
    FrontPage.prototype.fronts = [];
    FrontPage.prototype.front = null;
    FrontPage.prototype.colors = [];
    FrontPage.prototype.template = _.template(FrontPageTemplate);
    FrontPage.prototype.newFrontLoaded = function(){
        this.element.find('.loading').hide();
    };
    FrontPage.prototype.render = function(){
        var self = this;
        self.colors = self.frame.get('availableColors');
        self.fronts = self.frame.get('fronts');
        var html = $(this.template({colors: self.colors, fronts: self.fronts}));
        this.html = html;
        this.html.find('.colors > .color').on('click', function(){
            html.find('.colors > .color.active').removeClass('active');
            $(this).addClass('active');
            self.front.setColor($(this).attr('data-color'));
        });

        this.html.find('.fronts .front>img').on('click', function(){
            self.element.find('.loading').show();
            self.html.find('.fronts .front>img.active').removeClass('active');
            $(this).addClass('active');
            $(self).trigger('front-changed', self.fronts[$(this).attr('data-number')]);
        });

        /*
        this.html.find('.fronts img.front').on('click', function(){
            html.find('.fronts img.front.active').removeClass('active');
            $(this).addClass('active');
            $(self).trigger('front-changed', self.fronts[$(this).attr('data-number')]);
        });
        */
        this.element.html(this.html);
    };

    return FrontPage;
});