define(function(){
   var Frame = Backbone.Model.extend({
       urlRoot: function(){
           return "/models_api/frames";
       }
   });
   return Frame;
});