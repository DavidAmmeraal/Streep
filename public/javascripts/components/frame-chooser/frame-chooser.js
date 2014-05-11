define([
    '../../domain/collections/sizes',
    'text!/javascripts/components/frame-chooser/templates/frame-chooser.html'
], function(
    Sizes,
    FrameChooserTemplate
){

    var FrameChooser = Backbone.View.extend({
        collection: new Sizes(),
        template: _.template(FrameChooserTemplate),
        frames: null,
        events: {
            "click .frame": function(event){
                $(this).trigger('frame-chosen', $(event.currentTarget).attr('data-frameId'));
            }
        },
        initialize: function(){
            var self = this;
            self.collection.fetch().then(function(){
                console.log(self.collection.toJSON());
                self.render.apply(self);
            });
        },
        render: function(){
            var self = this;
            this.$el.html(this.template({'frames': self.collection.toJSON()}));
        },
        setActive: function(frameId){
            console.log("FrameChooser.setActive(" + frameId + ")");
            this.$el.find('.frame.active').removeClass('active');
            this.$el.find('.frame[data-FrameId="' + frameId + '"]').addClass('active');
        },
        show: function(){
            this.$el.fadeIn(200);
        },
        hide: function(){
            this.$el.fadeOut(200);
        },
        getVisibleBox: function(){
            var offset = this.$el.offset();
            return {
                x: [offset.left, offset.left + this.$el.width()],
                y: [offset.top, offset.top + this.$el.height()]
            }
        }
    });

    return FrameChooser;
});