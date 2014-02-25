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
            "click .frame": "focusFrame",
        },
        selected: 0,
        amountItems: 3,
        rendered: false,
        initialize: function(){
            this.fetchFrames();
            var self = this;
            $(window).on('resize', function(){
                self.resizeImages.apply(self);
            });
        },
        render: function(){
            this.$el.html(this.template({'frames': this.collection.toJSON(), 'offset': this.offset, 'selected': this.selected, 'amountItems': this.amountItems}));
            this.resizeImages();
        },
        fetchFrames: function(){
            var self = this;
            var limit = this.amountItems;
            var skip = 0;
            if(this.selected < (this.amountItems - 1)){
                limit = Math.ceil(this.amountItems / 2) + this.selected;
            }else{
                skip = this.selected - Math.floor(this.amountItems / 2);
            }
            this.collection.fetch({data: {limit: limit, skip: skip}}).then(function(){
                self.$el.fadeOut(100, function(){
                    self.render();
                    self.$el.fadeIn(100);
                });
            })
        },
        resizeImages: function(){
            function resize(){
                var element = $(this);
                var parentWidth = element.parent().width();
                var parentHeight = element.parent().height();

                var ratio = this.naturalWidth / this.naturalHeight;

                if(ratio > 1){
                    element.width(parentWidth);
                    if(element.height() > parentHeight){
                        var height = element.height();
                        height -= height - parentHeight;
                        element.width(height * ratio);
                        element.height(height);
                    }else{
                        element.css('margin-top', (parentHeight - element.height()));
                    }
                }else{
                    element.height(parentHeight);
                }
            }
            this.$el.find('.img img').each(function(){
                var element = this;
                if(this.naturalWidth){
                    resize.apply(element);
                }else{
                    $(this).on('load', resize);
                }
            })
        },
        focusFrame: function(event, target){
            var clicked = this.$(event.currentTarget);
            if(!clicked.hasClass('filler')){
                this.selected = parseInt(clicked.attr('data-order'));
                this.fetchFrames();
            }
        }
    });
    return FrameChooser;
});