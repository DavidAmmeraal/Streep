define(['./tab-page', 'text!./templates/glasses-page.html'], function(TabPage, GlassesPageTemplate){
    var GlassesPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var glassesChooser = null;

        var createGlassesChooser = function(){
            self.firstActiveTriggered = false;
            var html = self.element;
            if(glassesChooser)
                glassesChooser.destroy();

            var sliderFrame = html.find('.glasses > .frame');
            var scrollbar = html.find('.glasses > .scrollbar');
            var options = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                scrollBar: scrollbar,
                scrollBy: 1,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });
            glassesChooser = new Sly(sliderFrame, options);

            sliderFrame.find('li.glass').on('click', function(event){
                event.stopPropagation();
                var index = sliderFrame.find('li.glass').index(this);
                var selectedGlasses = self.glasses[index];
                selectedGlasses.index = index;
                $(self).trigger('glasses-changed', selectedGlasses);
            });

            sliderFrame.find('li.glass').on('mouseenter', function(event){
                var index = sliderFrame.find('li.glass').index(this);
                var tooltip = self.element.find('.glass-tooltip:eq(' + index + ')');
                tooltip.css('left', event.pageX);
                tooltip.css('top', event.pageY);
                tooltip.show();
                tooltip.animate({
                    opacity: 1
                }, 100);
                tooltip.css('margin-top', -(tooltip.height() + 10) + 'px');
                self.activeTooltip = tooltip;
            });

            self.element.on('mousemove', function(event){
                if(self.activeTooltip){
                    self.activeTooltip.css('left', event.pageX);
                    self.activeTooltip.css('top', event.pageY);
                }
            });

            sliderFrame.find('li.glass').on('mouseleave', function(event){
                var index = sliderFrame.find('li.glass').index(this);
                var tooltip = self.element.find('.glass-tooltip:eq(' + index + ')');
                tooltip.hide();
                self.activeTooltip = null;
            });

            glassesChooser.on('active', function(event, itemIndex){
            });

            glassesChooser.init();
            var slidee = self.element.find('.glasses ul');
            if(slidee.width() < slidee.parent().width()){
                self.element.find('.glasses .scrollbar').hide();
            }
        };

        this.setActiveIndex = function(index){
            this.element.find('li.glass img').removeClass('active');
            this.element.find('li.glass:eq('+ index + ') img').addClass('active');
            self.element.find('.loading .message').remove();
            self.element.find('.loading').hide();
        };

        this.activate = function(){
            setTimeout(function(){
                createGlassesChooser();
            }, 1);
        };

        this.render = function(){
            try{
                var html = $(this.template({glasses: self.glasses}));
                this.element.html(html);
            }catch(err){
                console.log(err.stack);
            }

        };

        this.newGlassesLoaded = function(loadedGlasses){
            this.element.find('.active').removeClass('active');
            this.element.find('#glass-' + loadedGlasses._id).addClass('active');
            self.element.find('.loading').hide();
        };
    };

    GlassesPage.prototype = Object.create(TabPage.prototype);
    GlassesPage.prototype.id = "glasses";
    GlassesPage.prototype.tabTitle = "Glazen";
    GlassesPage.prototype.template = _.template(GlassesPageTemplate);
    GlassesPage.prototype.activeGlasses = null;
    GlassesPage.prototype.firstActiveTriggered = false;
    GlassesPage.prototype.activeTooltip = null;


    return GlassesPage;
})