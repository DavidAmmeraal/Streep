define(['./exporter/exporter'], function(Exporter){
	var STLExporter = function(options){
		
	};

	STLExporter.prototype = Object.create(Exporter.prototype);
	STLExporter.prototype.export = function(comp){
		var blob = new Blob([comp.exportSTL()], {type: 'text/plain'});
	  	saveAs(blob, comp.name + ".stl");
	};
	
	return STLExporter;
});

