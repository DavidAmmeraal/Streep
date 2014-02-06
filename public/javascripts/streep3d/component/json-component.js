define(['component/leaf-component', 'component/connector/connector'], function(LeafComponent, Connector){
	var JSONComponent = function(){
		var self = this;
		this.src = null;
		
		LeafComponent.apply(this, arguments);

		this.properties = function(){
		};
	};

	JSONComponent.prototype = Object.create(LeafComponent.prototype);
    JSONComponent.prototype.load = function(){
        console.log("JSONComponent.prototype.load()");
        var self = this;
        return new Promise(function(resolve, reject){
            if(self.src){
                var loader = new THREE.JSONLoader();
                loader.load(self.src, function(object){
                    self.geo = object;
                    self.redraw();
                    self.loaded = true;
                    resolve(self);
                });
            }
        });
    };

    JSONComponent.parseFromDB = function(data){
        for(var i = 0; i < data.connectors.length; i++){
            data.connectors[i] = Connector.parseFromDB(data.connectors[i]);
        }

        data.focusPosition = new THREE.Vector3(data.focusPosition.x, data.focusPosition.y, data.focusPosition.z);

        switch(data.material){
            case "MeshLambertMaterial":
                data.material = new THREE.MeshLambertMaterial();
        }
        console.log(data);
        return new JSONComponent(data);
    }
	return JSONComponent;
});