define(['./tab-page', 'text!./templates/nose-page.html'], function(TabPage,NosePageTemplate){
    var NosePage = function(options){
        console.log("NosePage()");
        var self = this;
        TabPage.apply(this, [options]);

        var noseChooser = null;
        var activated = false;

        var createNoseChooser = function(){
            var html = self.element;
            if(noseChooser)
                noseChooser.destroy();

            var activeNoseIndex;

            if(!self.activeNoseIndex){
                activeNoseIndex = self.noses.indexOf(_.find(self.noses, function(nose){
                   return nose.active
                }));
            }else{
                activeNoseIndex = self.activeNoseIndex;
            }

            if(activeNoseIndex == -1){
                activeNoseIndex = 0;
            }

            var noseSliderFrame = html.find('.noses > .frame');
            var noseScrollbar = html.find('.noses > .scrollbar');
            var noseOptions = $.extend(Sly.defaults, {
                horizontal: 1,
                itemNav: 'basic',
                smart: 1,
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                startAt: activeNoseIndex,
                scrollBar: noseScrollbar,
                scrollBy: 1,
                activatePageOn: 'click',
                speed: 300,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            });

            noseChooser = new Sly(noseSliderFrame, noseOptions);
            noseChooser.on('active', function(event, itemIndex){
                if(self.nose != self.noses[itemIndex]){
                    self.activeNoseIndex = itemIndex;
                    self.noses[itemIndex].index = itemIndex;
                    $(self).trigger('nose-changed', self.noses[itemIndex]);
                    self.element.find('.loading').append('<div class="message">Neusbrug wordt ingeladen</div>')
                    self.element.find('.loading').show();
                }
            });
            noseChooser.init();
        };

        this.render = function(){
            var self = this;
            var html = $(this.template({noses: self.noses}));
            this.element.html(html);
        };

        this.activate = function(){
            var self = this;
            setTimeout(function(){
                self.parseNoses();
                activated = true;
                createNoseChooser();
            }, 1)

        }

        this.newNoseLoaded = function(){
            self.element.find('.loading > .message').remove();
            self.element.find('.loading').hide();
        }
    };

    NosePage.prototype = Object.create(TabPage.prototype);
    NosePage.prototype.id = "front_nose";
    NosePage.prototype.tabTitle = "Stijl";
    NosePage.prototype.nose = null;
    NosePage.prototype.noses = [];
    NosePage.prototype.activeIndex = null;
    NosePage.prototype.parseNoses = function(){
        this.nose = _.find(this.noses, function(nose){
            return nose.active;
        });
    };
    NosePage.prototype.colors = [];
    NosePage.prototype.template = _.template(NosePageTemplate);

    return NosePage;
});