define(['./csg-modification', './csg-object/csg-object'], function(CSGModification, CSGObject){
	var CSGObjectModification = function(options){
		var self = this;
		this.objects = null;
		CSGModification.apply(this, arguments);
		
		this.execute = function(object){
			if(!self.connector.originalGeo){
				self.connector.originalGeo = self.component.geo;
			}

			object.load().then(function(){
                self.geo = object.geo;
                self.transformations = object.transformations;
                CSGModification.prototype.execute.apply(self);
            });
		};
		
		this.getObjects = function(){
			return self.objects;
		};
		
		var executeTransformations = function(){
			for(var i = 0; i < self.transformations.length; i++){
				var transformation = self.transformations[i];
				transformation.apply(self.geo);
			}
		};
		
		var requestGeo = function(){
			self.apply();
		};
	};

	CSGObjectModification.prototype = Object.create(CSGModification.prototype);
    CSGObjectModification.parseFromDB = function(data){
        var objects = data.objects;
        for(var i = 0; i < objects.length; i++){
            var object = objects[i];
            object = CSGObject.parseFromDB(object);
            data.objects[i] = object;
        }
        return new CSGObjectModification(data);
    }
	return CSGObjectModification;
});