define(['../models/frame'], function(Frame){
    var Frames = Backbone.Collection.extend({
        model: Frame,
        url: '/models_api/frames'
    });

    return Frames;
});