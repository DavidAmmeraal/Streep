define([
    './csg-modification',
    '../transformation/scale',
    '../transformation/translate',
    '../transformation/rotate'
], function(
    CSGModification,
    Scale,
    Translate,
    Rotate
){
	var CSGTextModification = function(options){
		CSGModification.apply(this, arguments);
	};

	CSGTextModification.prototype = Object.create(CSGModification.prototype);
    CSGTextModification.prototype.depth = null;
    CSGTextModification.prototype.setText = function(text, font, size){
        console.log("CSGTextModification.prototype.setText(" + text + ", " + font + ", " + size + ")");
        var self = this;
        var actualSize = self.sizes[size].fontSize;
        var actualDepth = self.sizes[size].depth;
        self.transformations = self.sizes[size].transformations;
        this.geo = new THREE.TextGeometry(text, {
            height: actualDepth,
            size: actualSize,
            curveSegments: 2,
            weight: "normal",
            style: "normal",
            font: font
        });
    }

    //Static
    CSGTextModification.parseFromDB = function(data){
        for(var sizeKey in data.sizes){
            var size = data.sizes[sizeKey];
            for(var c = 0; c < size.transformations.length; c++){
                var transformation = size.transformations[c];
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
                size.transformations[c] = transformation;
            }
            data.sizes[sizeKey] = size;
        }
        return new CSGTextModification(data);
    }
	return CSGTextModification;
});

