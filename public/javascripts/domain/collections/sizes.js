define(['../models/size'], function(Size){
    var Sizes = Backbone.Collection.extend({
        model: Size,
        url: '/models_api/sizes'
    });

    return Sizes;
});