define([
    'domain/collections/frames',
    'text!views/templates/frame-chooser.html'
], function(
    Frames,
    FrameChooserTemplate
){
    var FrameChooser = Backbone.View.extend({
        tagName: "div",
        className: "frame-chooser",
        collection: new Frames(),
        template: _.template(FrameChooserTemplate),
        events: {
            "click .frame": "focusFrame"
        },
        offset: 0,
        initialize: function(){
            this.fetchFrames();
        },
        render: function(){
            this.$el.html(this.template({'frames': this.collection.toJSON(), 'offset': this.offset}));
            console.log(this.el);
        },
        fetchFrames: function(){
            var self = this;
            this.collection.fetch({data: {limit: 3, skip: this.offset}}).then(function(){
                self.render();
            })
        },
        focusFrame: function(event, target){
            console.log("FrameChooser.focusFrame()");
            var clicked = this.$(event.currentTarget);
            this.offset = parseInt(clicked.attr('data-order'));
            console.log(this.offset);
        }
    });
    return FrameChooser;
});