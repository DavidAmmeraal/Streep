define(['component/modification/csg-modification', 'component/transformation/scale', 'component/transformation/translate', 'component/transformation/rotate'], function(CSGModification, Scale, Rotate, Translate){
	var CSGTextModification = function(options){
		CSGModification.apply(this, arguments);
	};

	CSGTextModification.prototype = Object.create(CSGModification.prototype);
    CSGTextModification.prototype.depth = null;
    CSGTextModification.prototype.setText = function(text, font, size){
        this.geo = new THREE.TextGeometry(text, {
            size: size,
            height: this.depth,
            curveSegments: 2,
            weight: "normal",
            style: "normal"
        });
    }
    CSGTextModification.parseFromDB = function(data){
        for(var i = 0; i < data.transformations.length; i++){
            var transformation = data.transformations[i];
            switch(transformation.type){
                case "Translate":
                    transformation = Translate.parseFromDB(transformation.implementation);
                    break;
                case "Rotate":
                    transformation = Rotate.parseFromDB(transformation.implementation);
                    break;
                case "Scale":
                    transformation = Scale.parseFromDB(transformation.implementation);
                    break;
            }
            data.transformations[i] = transformation;
        }
        return new CSGTextModification(data);
    }
	return CSGTextModification;
});

