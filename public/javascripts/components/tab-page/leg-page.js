define(['./tab-page', 'text!./templates/leg-page.html'], function(TabPage, LegPageTemplate){
    var LegPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var legChooser = null;
        var colorChooser = null;

        var createLegChooser = function(){
            var html = self.element;
            if(legChooser)
                legChooser.destroy();

            var activeLegIndex = _.indexOf(self.legs, _.find(self.legs, function(legs){
                return legs.active;
            }));

            var legsSliderFrame = html.find('.legs > .frame');
            var legsScrollbar = html.find('.legs > .scrollbar');
            var legsOptions = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                smart: 1,
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                startAt: activeLegIndex,
                scrollBar: legsScrollbar,
                scrollBy: 1,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });
            legChooser = new Sly(legsSliderFrame, legsOptions);
            legChooser.on('active', function(event, itemIndex){
                if(self.frame.currentLeftLeg && self.frame.currentLeftLeg.src != self.legs[itemIndex].left.src){
                    $(self).trigger('legs-changed', self.legs[itemIndex]);
                    self.element.find('.loading').append('<div class="message">Poot wordt ingeladen</div>');
                    self.element.find('.loading').show();
                }
            });

            legChooser.init();
            var legSlidee = self.element.find('.legs ul');
            if(legSlidee.width() < legSlidee.parent().width()){
                self.element.find('.legs .scrollbar').hide();
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
            self.colorChooser = new Sly(colorSliderFrame, colorOptions);
            self.colorChooser.on('active', function(event, itemIndex){
                var color = $($('.colors .color').get(itemIndex)).attr('data-color').replace('#', '0x');
                self.frame.currentLeftLeg.setColor(color);
                self.frame.currentRightLeg.setColor(color);
            });
            self.colorChooser.init();
            var colorsSlidee = self.element.find('.colors ul');
            if(colorsSlidee.width() < colorsSlidee.parent().width()){
                self.element.find('.colors .scrollbar').hide();
            }
        };

        this.render = function(){
            var self = this;
            self.legs = self.frame.currentFront.legs;
            self.colors = _.find(self.legs, function(legs){
                return legs.active;
            }).availableColors;
            var html = $(this.template({colors: self.colors, legs: self.legs}));
            this.element.html(html);
            setTimeout(function(){
                createLegChooser();
                createColorChooser();
            }, 1)
        };
    };

    LegPage.prototype = Object.create(TabPage.prototype);
    LegPage.prototype.id = "color";
    LegPage.prototype.tabTitle = "Patronen en kleur";
    LegPage.prototype.leg = null;
    LegPage.prototype.legs = [];
    LegPage.prototype.colors = [];
    LegPage.prototype.template = _.template(LegPageTemplate);
    LegPage.prototype.setLeg = function(leg){
        this.element.find('.loading > .message').remove();
        this.element.find('.loading').hide();
        this.leg = leg;
    };


    return LegPage;
})