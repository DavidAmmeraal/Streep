define(['../transformation/transformation', '../transformation/translate', './modification', '../../util/geometry-helper'], function(Transformation, Translate, Modification, GeometryHelper){
	var CSGModification = function(options){
		var self = this;
		this.type = null;
		this.geo = null;
		this.transformations = [];
		
		$.extend(this, options);	
	};

	CSGModification.prototype = Object.create(Modification.prototype);
    CSGModification.prototype.types = ['subtract', 'union'];
    CSGModification.prototype.worker = new Worker('/javascripts/components/renderer/workers/csg-worker.js');
    CSGModification.prototype.type = null;
    CSGModification.transformations = [];
    CSGModification.prototype.busy = false;
    CSGModification.prototype.terminate = function(){
        console.log("CSGModification.terminate()");
        if(this.busy){
            this.busy = false;
            this.worker.terminate();
            $(this).trigger('worker-terminated');
        }
    };
    CSGModification.prototype.execute = function(){
        console.log("EXECUTE!");
        var self = this;
        if(!this.connector.originalGeo){
            this.connector.originalGeo = self.component.geo;
        }
        this.connector.used = true;
        self.executeTransformations();

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
            try{
                self.worker = new Worker('/javascripts/components/renderer/workers/csg-worker.js');
                self.busy = true;
                $(self).on('worker-terminated', function(){
                    reject();
                });
                self.worker.onmessage = function(e){
                    console.log("RESPONSE FROM WORKER!");
                    self.component.geo = GeometryHelper.createGeoFromJSON(JSON.parse(e.data))
                    self.component.refresh();
                    self.busy = false;
                    resolve();
                };

                self.worker.postMessage(message);
            }catch(err){
                console.log(err);
            }
        });


    };

    CSGModification.prototype.executeTransformations = function(){
        console.log("CSGModification.prototype.executeTransformations()");

        var self = this;


        if(self.inverseAlignment){
            self.geo.computeBoundingBox();
            var width = self.geo.boundingBox.max.x - self.geo.boundingBox.min.x;

            var alignmentTranslation = new Translate({
                x: -width,
                y: 0,
                z: 0
            });

            alignmentTranslation.apply(self.geo);

        }

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