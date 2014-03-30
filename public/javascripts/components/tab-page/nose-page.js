define(['./tab-page', 'text!./templates/nose-page.html'], function(TabPage,NosePageTemplate){
    var NosePage = function(options){
        var self = this;
        TabPage.apply(this, [options]);

        var noseChooser = null;
        var activated = false;

        var createNoseChooser = function(){
            var html = self.element;
            if(noseChooser)
                noseChooser.destroy();

            var activeNoseIndex = self.front.noses.indexOf(_.find(self.front.noses, function(nose){
               return nose._id == self.front.currentNose._id;
            }));

            if(activeNoseIndex == -1){
                activeNoseIndex = 0;
            }

            var noseSliderFrame = html.find('.noses > .frame');
            var noseScrollbar = html.find('.fronts > .scrollbar');
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

                if(self.front.currentNose.src != self.front.noses[itemIndex].src){
                    $(self).trigger('nose-changed', self.front.noses[itemIndex]);
                    self.element.find('.loading').append('<div class="message">Neusbrug wordt ingeladen</div>')
                    self.element.find('.loading').show();
                }
            });
            var nosesSlidee = self.element.find('.noses ul');
            if(nosesSlidee.width() <= nosesSlidee.parent().width()){
                self.element.find('.noses .scrollbar').hide();
            }
            noseChooser.init();
        };

        this.render = function(){
            var self = this;
            self.noses = self.front.noses;
            var html = $(this.template({noses: self.noses}));
            this.element.html(html);
        };

        this.activate = function(){
            if(!activated){
                activated = true;
                createNoseChooser();
            }
        }

        this.newFrontLoaded = function(){
            self.element.find('.loading > .message').remove();
            self.element.find('.loading').hide();
            activated = false;
            self.render();
        };

        this.newNoseLoaded = function(){
            self.element.find('.loading > .message').remove();
            self.element.find('.loading').hide();
        }
    };

    NosePage.prototype = Object.create(TabPage.prototype);
    NosePage.prototype.id = "front_nose";
    NosePage.prototype.tabTitle = "Neusbruggen";
    NosePage.prototype.fronts = [];
    NosePage.prototype.front = null;
    NosePage.prototype.colors = [];
    NosePage.prototype.template = _.template(NosePageTemplate);

    return NosePage;
});