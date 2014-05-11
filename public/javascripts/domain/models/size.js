define(function(){
    var Size = Backbone.Model.extend({
        urlRoot: function(){
            return "/models_api/sizes";
        }
    });
    return Size;
});