define(['../../transformation/rotate', '../../transformation/scale', '../../transformation/translate'], function(Rotate, Translate, Scale){
	var CSGObject = function(options){
		var self = this;
		
		$.extend(this, options);
	};

    CSGObject.prototype.readable = "";
    CSGObject.prototype.geo = null;
    CSGObject.prototype.src = "";
    CSGObject.prototype.transformations = [];
    CSGObject.prototype.load = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            var loader = new THREE.JSONLoader();
            loader.load(self.src, function(object){
                self.geo = object;
                resolve();
            });
        });
    };
    CSGObject.parseFromDB = function(data){
        var transformations = data.transformations;
        for(var i = 0; i < transformations.length; i++){
            var transformation = transformations[i];
            switch(transformation.type){
                case "Scale":
                    transformation = Scale.parseFromDB(transformation.implementation)
                    break;
                case "Rotate":
                    transformation = Rotate.parseFromDB(transformation.implementation);
                    break;
                case "Translate":
                    transformation = Translate.parseFromDB(transformation.implementation);
                    break;
            }
            data.transformations[i] = transformation;
        }
        return new CSGObject(data);
    }
	return CSGObject;
});
