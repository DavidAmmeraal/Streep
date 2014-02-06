define(['component/transformation/transformation'], function(Transformation){
	var Rotate = function(){
		Transformation.apply(this, arguments);
	};
	Rotate.prototype = Object.create(Transformation.prototype);
    Rotate.prototype.type = "rotate";
    Rotate.prototype.axis = null;
    Rotate.prototype.amount = null;
    Rotate.prototype.apply = function(geo){
        if(this.axis == "x"){
            geo.applyMatrix(new THREE.Matrix4().makeRotationX(this.amount * Math.PI / 180));
        }if(this.axis == "y"){
            geo.applyMatrix(new THREE.Matrix4().makeRotationY(this.amount * Math.PI / 180));
        }if(this.axis == "z"){
            geo.applyMatrix(new THREE.Matrix4().makeRotationZ(this.amount * Math.PI / 180));
        }
    };
    Rotate.parseFromDB = function(data){
        return new Rotate(data);
    }
	return Rotate;
});