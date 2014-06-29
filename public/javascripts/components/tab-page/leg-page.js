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


            var activePatternIndex = _.indexOf(self.patterns, self.activePattern);

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

            patternSliderFrame.find('li.leg').on('click', function(event){
                var index = patternSliderFrame.find('li.leg').index(this);
                $(self).trigger('pattern-changed', [self.side, self.patterns[index]]);
                self.element.find('.loading .message').remove();
                self.element.find('.loading').append('<div class="message">Poot wordt ingeladen</div>');
                self.element.find('.loading').show();
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
                $(self).trigger('color-changed', color);
            });
            self.colorChooser.init();
            self.colorChooser.slideTo(0, true);
            var colorsSlidee = self.element.find('.colors ul');
            if(colorsSlidee.width() < colorsSlidee.parent().width()){
                self.element.find('.colors .scrollbar').hide();
            }
        };

        this.activate = function(){
            this.parse();
            setTimeout(function(){
                createPatternChooser();
                createColorChooser();
            }, 1);

        }

        this.setActiveIndex  = function(index){
            this.activePattern = this.patterns[index];
            self.element.find('.loading').find('.message').remove();
            self.element.find('.loading').hide();
            self.element.find('.legs .leg img.active').removeClass('active');
            self.element.find('.legs .leg:eq(' + index +') img').addClass('active');
        };

        this.parse = function(){
            this.activePattern = _.find(this.patterns, function(pattern){
                return pattern.active;
            });
        };

        this.render = function(){
            try{
                var html = $(this.template({colors: self.colors, patterns: self.patterns}));
                this.element.html(html);
            }catch(err){
                console.log(err.stack);
            }

        };
    };

    LegPage.prototype = Object.create(TabPage.prototype);
    LegPage.prototype.id = "color";
    LegPage.prototype.tabTitle = "Patronen en kleur";
    LegPage.prototype.side = null;
    LegPage.prototype.activePattern = null;
    LegPage.prototype.patterns = [];
    LegPage.prototype.colors = [];
    LegPage.prototype.template = _.template(LegPageTemplate);


    return LegPage;
})