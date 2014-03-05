define(['../transformation/transformation', './modification', '../../util/geometry-helper'], function(Transformation, Modification, GeometryHelper){
	var CSGModification = function(options){
		var self = this;
		this.type = null;
		this.geo = null;
		this.transformations = [];
		
		$.extend(this, options);	
	};

	CSGModification.prototype = Object.create(Modification.prototype);
    CSGModification.prototype.types = ['subtract', 'union'];
    CSGModification.prototype.type = null;
    CSGModification.transformations = [];
    CSGModification.prototype.execute = function(){
        var self = this;
        if(!this.connector.originalGeo){
            this.connector.originalGeo = self.component.geo;
        }
        self.executeTransformations();

        var worker = new Worker('/javascripts/components/renderer/workers/csg-worker.js');
        var message = {
            'type': self.type,
            'targetGeo': {
                'vertices': self.component.geo.vertices,
                'faces': self.component.geo.faces,
                'faceVertexUvs': self.component.geo.faceVertexUvs
            },
            'modGeo': {
                'vertices': self.geo.vertices,
                'faces': self.geo.faces,
                'faceVertexUvs': self.component.geo.faceVertexUvs
            }
        };
        return new Promise(function(resolve, reject){
            worker.onmessage = function(e){
                self.component.geo = GeometryHelper.createGeoFromJSON(JSON.parse(e.data))
                self.component.refresh();
                resolve();
            };

            worker.postMessage(message);
        });

        /*
        var mesh = new THREE.Mesh(self.geo, self.component.material);
        console.log(mesh);
        globalviewer.getScene().add(mesh);
        globalviewer.render();
        */
    };

    CSGModification.prototype.executeTransformations = function(){
        console.log("CSGModification.prototype.executeTransformations()");
        var self = this;
        for(var i = 0; i < self.transformations.length; i++){
            var transformation = self.transformations[i];
            transformation.apply(self.geo);
        }
    };

    CSGModification.prototype.setComponent = function(comp){
        this.component = comp;
    };

    CSGModification.prototype.setGeo = function(geo){
        if(geo instanceof THREE.Geometry){
            this.geo = geo;
        }else{
            throw "This is not a valid Geometry!";
        }
    };

    CSGModification.prototype.addTransformation = function(transformation){
        if(transformation instanceof Transformation){
            this.transformations.push(transformation);
        }else{
            throw "This is not a valid Transformation!";
        }
    };

    CSGModification.prototype.removeTransformation = function(transformation){
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
    };

	return CSGModification;
});