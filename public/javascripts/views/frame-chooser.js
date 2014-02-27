define([
    'domain/collections/frames',
    'text!views/templates/frame-chooser.html'
], function(
    Frames,
    FrameChooserTemplate
){

    var FrameChooser = Backbone.View.extend({
        collection: new Frames(),
        template: _.template(FrameChooserTemplate),
        frames: null,
        initialize: function(){
            var self = this;
            self.collection.fetch().then(function(){
                self.render.apply(self);
            });
        },
        render: function(){
            var self = this;

            this.$el.html(this.template({'frames': this.collection.toJSON()}));

            this.$el.royalSlider({
                keyboardNavEnabled: true,
                globalCaption: true,
                loop: true,
                visibleNearby: {
                    enabled: true,
                    centerArea: 0.5,
                    center: true,
                    breakpoint: 650,
                    breakpointCenterArea: 0.64,
                    navigateByCenterClick: true
                }
            });

            var slider = this.$el.data('royalSlider');
            slider.currSlide.holder.find('.buy-frame').show();
            slider.ev.on('rsAfterSlideChange', function(){
                self.$el.find('.buy-frame').hide();
                slider.currSlide.holder.find('.buy-frame').show();
            });

            setTimeout(function(){
                slider.currSlide.holder.find('.buy-frame').show();
                self.$el.find('button.buy').on('click', function(event){
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    var id = $(this).attr('data-frameId');
                    window.location = 'edit-frame/' + id;
                });
            }, 500);

            this.$el.find('.rsGCaption').each(function(){
                var element = $(this);
                element.insertBefore(element.parent().find('.rsVisibleNearbyWrap'));
            });
        }
    });

    return FrameChooser;
});