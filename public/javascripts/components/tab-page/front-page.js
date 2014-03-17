define(['./tab-page', 'text!./templates/front-page.html'], function(TabPage, FrontPageTemplate){
    var FrontPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var colorChooser = null;
        var frontChooser = null;

        var createFrontChooser = function(){
            var html = self.element;
            if(frontChooser)
                frontChooser.destroy();

            var activeFrontIndex = _.indexOf(self.fronts, _.find(self.fronts, function(front){
                return front.active;
            }));

            var frontsSliderFrame = html.find('.fronts > .frame');
            var frontsScrollbar = html.find('.fronts > .scrollbar');
            var frontsOptions = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                smart: 1,
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                startAt: activeFrontIndex,
                scrollBar: frontsScrollbar,
                scrollBy: 1,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });
            frontChooser = new Sly(frontsSliderFrame, frontsOptions);
            frontChooser.on('active', function(event, itemIndex){
                if(self.front.src != self.fronts[itemIndex].src){
                    $(self).trigger('front-changed', self.fronts[itemIndex]);
                    self.element.find('.loading').append('<div class="message">Montuur dikte wordt ingeladen</div>')
                    self.element.find('.loading').show();
                }
            });

            frontChooser.init();
            var frontsSlidee = self.element.find('.fronts ul');
            if(frontsSlidee.width() < frontsSlidee.parent().width()){
                self.element.find('.fronts .scrollbar').hide();
            }
        };

        var createColorChooser = function(){
            var html = self.element;
            if(colorChooser)
                colorChooser.destroy();

            var defaultColorIndex = _.indexOf(self.colors, _.find(self.colors, function(color){
                return color.active;
            }));

            var colorSliderFrame = html.find('.colors > .frame');
            var colorScrollbar = html.find('.colors > .scrollbar');
            var colorOptions = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                smart: 1,
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                startAt: defaultColorIndex,
                scrollBar: colorScrollbar,
                scrollBy: 1,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });
            colorChooser = new Sly(colorSliderFrame, colorOptions);
            colorChooser.on('active', function(event, itemIndex){
                var color = $($('.colors .color').get(itemIndex)).attr('data-color');
                self.front.setColor(color);
            });
            colorChooser.init();
            var colorsSlidee = self.element.find('.colors ul');
            if(colorsSlidee.width() < colorsSlidee.parent().width()){
                self.element.find('.colors .scrollbar').hide();
            }
        };

        this.render = function(){
            var self = this;
            self.colors = self.front.availableColors;
            self.fronts = self.frame.fronts;
            var html = $(this.template({colors: self.colors, fronts: self.fronts}));
            this.element.html(html);

            setTimeout(function(){
                createFrontChooser();
                createColorChooser();
            }, 1);
        };

        this.newFrontLoaded = function(){
            self.element.find('.loading > .message').remove();
            self.element.find('.loading').hide();
        };
    };

    FrontPage.prototype = Object.create(TabPage.prototype);
    FrontPage.prototype.id = "front_color";
    FrontPage.prototype.tabTitle = "Montuur dikte en kleur";
    FrontPage.prototype.fronts = [];
    FrontPage.prototype.front = null;
    FrontPage.prototype.colors = [];
    FrontPage.prototype.template = _.template(FrontPageTemplate);

    return FrontPage;
});