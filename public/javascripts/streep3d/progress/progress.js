define(['text!progress/templates/progress.html'], function(ProgressTemplate){
   var Progress = function(options){
       this.element = null;
       this.template = ProgressTemplate;
       $.extend(this, options);

       var initialize = function(){

       };

       this.progress = function(id, options){
           var htmlElement = this.element.find('process_' + id);
           var append = false;
           if(!htmlElement.length){
               htmlElement = $(ProgressTemplate).clone();
               htmlElement.find('.progress').progressbar();
               append = true;
           }
           var bar = htmlElement.find('.progress');

           if(options.explanation){
               htmlElement.find('.explanation').text(options.explanation);
           }

           if(options.max){
               if(options.max != 0){
                   bar.progressbar("option", "max", options.max);
               }
           }else{
               bar.progressbar("option", "value", false);
           }



           this.element
       }

       this.clearProgress = function(id){

       }

       initialize();
   };
});