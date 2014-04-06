define(['./tab-page', 'text!./templates/leg-page.html'], function(TabPage, LegPageTemplate){
    var LegPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var patternChooser = null;
        var colorChooser = null;

        var createPatternChooser = function(){
            var html = self.element;
            if(patternChooser)
                patternChooser.destroy();

            var activePatternIndex = _.indexOf(self.legs.patterns, _.find(self.legs.patterns, function(pattern){
                return pattern.active;
            }));

            var patternSliderFrame = html.find('.legs > .frame');
            var patternScrollbar = html.find('.legs > .scrollbar');
            var patternOptions = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                smart: 1,
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                startAt: activePatternIndex,
                scrollBar: patternScrollbar,
                scrollBy: 1,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });
            patternChooser = new Sly(patternSliderFrame, patternOptions);
            patternChooser.on('active', function(event, itemIndex){
                if(self.frame.currentLeftLeg && self.frame.currentLeftLeg.src != self.legs.patterns[itemIndex].left.src){
                    $(self).trigger('pattern-changed', self.legs.patterns[itemIndex]);
                    self.element.find('.loading').append('<div class="message">Poot wordt ingeladen</div>');
                    self.element.find('.loading').show();
                }
            });

            patternChooser.init();
            var patternSlidee = self.element.find('.legs ul');
            if(patternSlidee.width() < patternSlidee.parent().width()){
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

        this.activate = function(){
            createPatternChooser();
            createColorChooser();
        }

        this.render = function(){
            try{
                var self = this;
                self.legs = _.find(self.frame.currentFront.legs, function(legs){
                    return legs.active;
                });
                self.colors = self.legs.availableColors;
                var html = $(this.template({colors: self.colors, patterns: self.legs.patterns}));
                this.element.html(html);
                if(!_.find(self.legs.patterns, function(pattern){
                    return pattern.active;
                })){
                    $(this.element.find('li.leg > img').get(0)).addClass('active');
                }
            }catch(err){
                console.log(err.stack);
            }

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
        this.element.find('img.active').removeClass('active');
        this.legs = _.find(this.frame.currentFront.legs, function(legs){
            return legs.active;
        });
        var activePattern = _.find(this.legs.patterns, function(pattern){
           return pattern.active;
        });
        console.log(activePattern);
        this.element.find('#pattern-' + activePattern._id).addClass('active');
        this.leg = leg;
    };


    return LegPage;
})