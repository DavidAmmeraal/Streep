define([
    'text!/javascripts/components/size-chooser/templates/size-chooser.html'
], function(
    SizeChooserTemplate
){

    var SizeChooser = Backbone.View.extend({
        template: _.template(SizeChooserTemplate),
        events: {
        },
        initialize: function(){
            var self = this;
            this.render();
            this.$el.find('.input-row').on('click', function(event){
                self.$el.find('input[type="radio"].streep').removeClass('checked');
                var radio = $(this).find('input');
                if(radio.hasClass('checked')){
                    radio.removeClass('checked');
                }else{
                    radio.addClass('checked');
                }
                $(self).trigger('size-changed');
            });
        },
        render: function(){
            this.$el.html(this.template());
        },
        show: function(){
            this.$el.fadeIn(200);
        },
        hide: function(){
            this.$el.fadeOut(200);
        },
        getSelectedSize: function(){
            return this.$el.find('input[type="radio"].checked').val();
        },
        setSize: function(size){

        },
        getVisibleBox: function(){
            var offset = this.$el.offset();
            return {
                x: [offset.left, offset.left + this.$el.width()],
                y: [offset.top, offset.top + this.$el.height()]
            }
        }
    });

    return SizeChooser;
});