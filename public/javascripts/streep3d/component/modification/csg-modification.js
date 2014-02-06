define(['component/transformation/transformation', 'component/modification/modification', 'util/geometry-helper'], function(Transformation, Modification, GeometryHelper){
	var CSGModification = function(options){
		var self = this;
		this.type = null;
		this.geo = null;
		this.transformations = [];
		
		$.extend(this, options);	
	};

	CSGModification.prototype = Object.create(Modification.prototype);
    CSGModification.prototype.execute = function(){
        var self = this;
        if(!this.connector.originalGeo){
            this.connector.originalGeo = self.component.geo;
        }
        self.executeTransformations();

        var targetGeoBSP = new ThreeBSP(self.component.geo);
        var geoBSP = new ThreeBSP(self.geo);
        var worker = new Worker('js/streep3d/workers/csg-worker.js');
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
        }
        worker.onmessage = function(e){
            self.component.geo = GeometryHelper.createGeoFromJSON(JSON.parse(e.data))
            self.component.refresh();
            $('.processes').fadeOut(1000,
                function(){
                    $('.processes').html('');
                }
            );
        }
        $('.processes').html('<div class="entry"><div class="explanation">Executing CSG Operation</div><div class="progress"></div></div>').hide().fadeIn(1000);
        $('.processes').find('.progress').progressbar({
            'value': false
        });
        worker.postMessage(message);

        /*
        self.component.geo = targetGeoBSP[self.type](geoBSP).toGeometry();
        self.component.refresh();
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