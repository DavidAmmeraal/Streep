define(['component/transformation/transformation'], function(Transformation){
	var Translate = function(){
		Transformation.apply(this, arguments);
	};

	Translate.prototype = Object.create(Transformation.prototype);
    Translate.prototype.type = "translate";
    Translate.prototype.x = null;
    Translate.prototype.y = null;
    Translate.prototype.z = null;
    Translate.prototype.apply = function(geo){
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(this.x, this.y, this.z));
    };
    Translate.parseFromDB = function(data){
        return new Translate(data);
    }
	return Translate;
});