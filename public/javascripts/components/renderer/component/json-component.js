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
        var self = this;
        return new Promise(function(resolve, reject){
            if(self.src){
                var splits = self.src.split(".");
                var extension = splits[splits.length - 1];
                var loader;
                switch(extension){
                    case "js":
                        loader = new THREE.JSONLoader();
                        break;
                    case "stl":
                        loader = new THREE.STLLoader();
                        break;
                }
                loader.load(self.src, function(geo, material){
                    self.material = new THREE.MeshLambertMaterial({shading: THREE.FlatShading});
                    self.geo = geo;
                    self.redraw();
                    self.loaded = true;
                    resolve(self);

                });
            }
        });
    };

    JSONComponent.parseFromDB = function(data){
        try{
            if(data.connectors){
                for(var i = 0; i < data.connectors.length; i++){
                    data.connectors[i] = Connector.parseFromDB(data.connectors[i]);
                }
            }

            if(data.focusPerspective){
                data.focusPerspective.cameraPosition = new THREE.Vector3(data.focusPerspective.cameraPosition.x, data.focusPerspective.cameraPosition.y, data.focusPerspective.cameraPosition.z);
                data.focusPerspective.lookAt = new THREE.Vector3(data.focusPerspective.lookAt.x, data.focusPerspective.lookAt.y, data.focusPerspective.lookAt.z);
            }

            if(data.indicator)
                data.indicator = new THREE.Vector3(data.indicator.x, data.indicator.y, data.indicator.z);

            switch(data.material){
                case "MeshLambertMaterial":
                    data.material = new THREE.MeshLambertMaterial();
                case "MeshPhongMaterial":
                    data.material = new THREE.MeshPhongMaterial();
            }
            return new JSONComponent(data);
        }catch(err){
            console.log(err);
        }

    }
	return JSONComponent;
});