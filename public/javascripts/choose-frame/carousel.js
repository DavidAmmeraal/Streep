define(['text!templates/carousel.html'], function(CarouselTemplate){
   var Carousel = function(options){
       var self = this;
       $.extend(self, options);

       var initialize = function(){
           getFrames().then(function(){
               self.render.apply(self);
               $(window).on('resize', function(){
                   self.resize.apply(self);
               });
               self.resize();
               self.setFocus();
           });
       };

       var getFrames = function(){
           return new Promise(function(resolve, reject){
               $.get('models_api/frame?skip=1&limit=3', function(data){
                   self.frames = JSON.parse(data);
                   console.log(self.frames);
                   resolve();
               })
           });
       }

       initialize();
   }

   Carousel.prototype = {
       width: 0,
       height: 0,
       element: null,
       frames: [],
       right: 0,
       template: _.template(CarouselTemplate),
       resize: function(){
           this.element.find('.viewer').width($(window).width());
           this.element.find('.frame').width($(window).width() / 3);
       },
       getFrames: function(){
           var reqData = arguments;
           return new Promise(function(resolve){
               $.get('models_api', reqData, function(data){
                   this.frame = JSON.parse(data);
                   resolve();
               });
           });
       },
       render: function(){
           var self = this;
           this.element.html(this.template({'frames': this.frames}));
           var frameElements = this.element.find('.frame');
           frameElements.on('click', function(){
               self.goTo(frameElements.index(this));
           })
       },
       move: function(){
           var frameWidth = this.element.find('.frame').first().width();
           this.element.find('.slider').css('left', (-((this.right - 1) * frameWidth)));
           this.setFocus();
       },
       setFocus: function(){
           console.log('Carousel.setFocus()');
           this.element.find('.frame').removeClass('focus');
       },
       goTo: function(r){
           console.log(r);
           if(r == 0){
               this.right = 1;
               this.element.find('.slider').prepend(this.element.find('.frame').last());
           }else{
               this.right = r;
           }
           this.move();
       }
   }

   return Carousel;
});