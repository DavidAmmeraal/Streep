define(['./transformation'], function(Transformation){
	var Scale = function(){
		Transformation.apply(this, arguments);
	};
	Scale.prototype = Object.create(Transformation.prototype);
    Scale.prototype.type = "scale";
    Scale.prototype.x = null;
    Scale.prototype.y = null;
    Scale.prototype.z = null;
    Scale.prototype.apply = function(geo){
        geo.applyMatrix(new THREE.Matrix4().makeScale(this.x, this.y, this.z));
    };
    Scale.parseFromDB = function(data){
        return new Scale(data);
    }
	return Scale;
});