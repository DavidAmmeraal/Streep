Streep3D.session.Session = function(options){
	this.viewer = null;
	
	$.extend(this, options);
	
	var initialize = function(){
		if(!this.viewer){
			throw "No viewer passed to Facade!";
		}
	};
	
	
};