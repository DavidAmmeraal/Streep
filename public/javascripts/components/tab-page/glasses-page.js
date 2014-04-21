define(['./tab-page', 'text!./templates/glasses-page.html'], function(TabPage, GlassesPageTemplate){
    var GlassesPage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var glassesChooser = null;

        var createGlassesChooser = function(){
            var html = self.element;
            if(glassesChooser)
                glassesChooser.destroy();

            var sliderFrame = html.find('.glasses > .frame');
            var scrollbar = html.find('.glasses > .scrollbar');
            var options = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                smart: 1,
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
            glassesChooser.on('active', function(event, itemIndex){
                var selectedGlasses = self.front.glasses[itemIndex];
                $(self).trigger('glasses-changed', selectedGlasses);
                self.element.find('.loading').append('<div class="message">Glazen worden ingeladen</div>');
                self.element.find('.loading').show();

            });
            glassesChooser.init();
            var slidee = self.element.find('.glasses ul');
            if(slidee.width() < slidee.parent().width()){
                self.element.find('.glasses .scrollbar').hide();
            }
        };

        this.activate = function(){
            createGlassesChooser();
        }


        this.render = function(){
            try{
                var id = self.front.currentGlasses._id;
                var html = $(this.template({colors: self.colors, glasses: self.front.glasses}));
                this.element.html(html);
                this.element.find('#glass-' + id).addClass('active');
            }catch(err){
                console.log(err.stack);
            }

        };

        this.newGlassesLoaded = function(loadedGlasses){
            console.log("GlassesPage.newGlassesLoaded()");
            this.element.find('.active').removeClass('active');
            this.element.find('#glass-' + loadedGlasses._id).addClass('active');
            self.element.find('.loading').hide();
        };
    };

    GlassesPage.prototype = Object.create(TabPage.prototype);
    GlassesPage.prototype.id = "glasses";
    GlassesPage.prototype.tabTitle = "Glazen";
    GlassesPage.prototype.leg = null;
    GlassesPage.prototype.legs = [];
    GlassesPage.prototype.colors = [];
    GlassesPage.prototype.template = _.template(GlassesPageTemplate);


    return GlassesPage;
})