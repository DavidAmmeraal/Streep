define(['./leaf-component', './connector/connector'], function(LeafComponent, Connector){
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
        console.log("JSONComponent.parseFromDB");
        console.log(data);
        try{
            for(var i = 0; i < data.connectors.length; i++){
                data.connectors[i] = Connector.parseFromDB(data.connectors[i]);
            }
            data.focusPerspective.cameraPosition = new THREE.Vector3(data.focusPerspective.cameraPosition.x, data.focusPerspective.cameraPosition.y, data.focusPerspective.cameraPosition.z);
            data.focusPerspective.lookAt = new THREE.Vector3(data.focusPerspective.lookAt.x, data.focusPerspective.lookAt.y, data.focusPerspective.lookAt.z);
            data.indicator = new THREE.Vector3(data.indicator.x, data.indicator.y, data.indicator.z);

            switch(data.material){
                case "MeshLambertMaterial":
                    data.material = new THREE.MeshLambertMaterial();
            }
            return new JSONComponent(data);
        }catch(err){
            console.log(err);
        }

    }
	return JSONComponent;
});