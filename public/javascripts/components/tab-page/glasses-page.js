define(['./tab-page', 'text!./templates/glasses-page.html'], function(TabPage, GlassesPageTemplate){
    var GlassesPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var glassesChooser = null;
        var reflectiveGlassesChooser = null;

        var createReflectiveGlassesChooser = function(){
            self.firstActiveTriggered = false;
            var html = self.element;
            if(reflectiveGlassesChooser)
                reflectiveGlassesChooser.destroy();

            var sliderFrame = html.find('.reflective-glasses > .frame');
            var scrollbar = html.find('.reflective-glasses > .scrollbar');

            var glasses = _.filter(self.glasses, function(glass){
                if(!glass.reflective){
                    return false;
                }
                return true;
            });

            var activeIndex = glasses.indexOf(_.find(self.glasses, function(glass){
                return glass.active;
            }));

            var options = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                scrollBar: scrollbar,
                scrollBy: 1,
                startAt: activeIndex,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });
            reflectiveGlassesChooser = new Sly(sliderFrame, options);

            sliderFrame.find('li.glass').on('click touchend', function(event){
                event.stopPropagation();
                var order = $(this).data('order');
                var selectedGlasses = _.find(self.glasses, function(glass){
                    return glass.order == order;
                });
                var index = self.glasses.indexOf(selectedGlasses);
                selectedGlasses.index = index;
                var relativeIndex = glasses.indexOf(_.find(glasses, function(glass){ return glass.order == order}));
                self.setActiveIndex(relativeIndex, true);
                $(self).trigger('glasses-changed', selectedGlasses);
            });

            sliderFrame.find('li.glass').on('mouseenter', function(event){
                var order = $(this).data('order');
                var selectedGlasses = _.find(self.glasses, function(glass){
                    return glass.order == order;
                });
                var index = self.glasses.indexOf(selectedGlasses);
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
                var order = $(this).data('order');
                var selectedGlasses = _.find(self.glasses, function(glass){
                    return glass.order == order;
                });
                var index = self.glasses.indexOf(selectedGlasses);
                var tooltip = self.element.find('.glass-tooltip:eq(' + index + ')');
                tooltip.hide();
                self.activeTooltip = null;
            });

            reflectiveGlassesChooser.on('active', function(event, itemIndex){
            });

            reflectiveGlassesChooser.init();
            var slidee = self.element.find('.glasses ul');
            if(slidee.width() < slidee.parent().width()){
                self.element.find('.glasses .scrollbar').hide();
            }
        };

        var createGlassesChooser = function(){
            self.firstActiveTriggered = false;
            var html = self.element;
            if(glassesChooser)
                glassesChooser.destroy();

            var sliderFrame = html.find('.glasses > .frame');
            var scrollbar = html.find('.glasses > .scrollbar');

            var glasses = _.filter(self.glasses, function(glass){
                return !glass.reflective;
            });

            var activeIndex = self.glasses.indexOf(_.find(glasses, function(glass){
                return glass.active;
            }));

            var options = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                scrollBar: scrollbar,
                scrollBy: 1,
                startAt: activeIndex,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });
            glassesChooser = new Sly(sliderFrame, options);

            sliderFrame.find('li.glass').on('click touchend', function(event){
                event.stopPropagation();
                var order = parseInt($(this).data('order'));
                var selectedGlasses = _.find(self.glasses, function(glass){
                    return glass.order == order;
                });
                var index = self.glasses.indexOf(selectedGlasses);
                var relativeIndex = glasses.indexOf(_.find(glasses, function(glass){ return glass.order == order}));
                selectedGlasses.index = index;
                self.setActiveIndex(relativeIndex);
                $(self).trigger('glasses-changed', selectedGlasses);
            });

            sliderFrame.find('li.glass').on('mouseenter', function(event){
                var order = $(this).data('order');
                var selectedGlasses = _.find(self.glasses, function(glass){
                    return glass.order == order;
                });
                var index = self.glasses.indexOf(selectedGlasses);
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
                var index = parseInt($(this).data('order'));
                var selectedGlasses = _.find(self.glasses, function(glass){
                    return glass.order == index;
                });
                var index = self.glasses.indexOf(selectedGlasses);
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

        this.setActiveIndex = function(index, reflective){
            this.element.find('.glasses li.glass img').removeClass('active');
            this.element.find('.reflective-glasses li.glass img').removeClass('active');
            if(!reflective){
                self.activeIndex = index;
                this.element.find('.glasses li.glass:eq('+ index + ') img').addClass('active');
            }else{
                self.activeReflectiveIndex = index;
                this.element.find('.reflective-glasses li.glass:eq('+ index + ') img').addClass('active');
            }
            self.element.find('.loading .message').remove();
            self.element.find('.loading').hide();
        };

        this.activate = function(){
            setTimeout(function(){
                createGlassesChooser();
                createReflectiveGlassesChooser();
            }, 1);
        };

        this.render = function(){
            try{
                var glasses = _.filter(self.glasses, function(glass){
                    if(glass.reflective)
                        return false;
                    return true;
                });
                var reflectiveGlasses = _.filter(self.glasses, function(glass){
                    if(glass.reflective)
                        return true;
                    return false;
                });

                var html = $(this.template({allGlasses: self.glasses, glasses: glasses, reflectiveGlasses: reflectiveGlasses}));
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