define(function(){
	var Modification = function(){};

    Modification.prototype.name = null;
    Modification.prototype.component = null;
    Modification.prototype.connector = null;
	Modification.prototype.setComponent = function(comp){
		this.component = comp;
	};

	return Modification;
});