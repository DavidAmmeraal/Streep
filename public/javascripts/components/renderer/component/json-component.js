define(['./leaf-component', './connector/connector'], function(LeafComponent, Connector){
	var JSONComponent = function(){
		var self = this;
		this.src = null;
		
		LeafComponent.apply(this, arguments);

        $(self).on('request-render', function(){
            console.log("RENDER FOR THIS COMPONENT REQUESTED!");
            console.log(self.name);
        });

        console.log(this._id);
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
                    var materialArgs = {
                        shading: THREE.FlatShading
                    };

                    function createMaterial(){
                        try{
                            self.material = new THREE.MeshPhongMaterial(materialArgs);
                            self.geo = geo;
                            self.redraw();
                            self.loaded = true;
                        }
                        catch(err){
                            alert("ERROR!!!!!");
                        }
                        console.log("LOADED!");
                        setTimeout(function(){
                            self.redraw();
                            resolve(self);
                        }, 250);

                    }



                    if(self.texture){
                        materialArgs.map = THREE.ImageUtils.loadTexture(self.texture, undefined, function(){
                            createMaterial();
                        });
                        materialArgs.reflectivity = 0.25
                        materialArgs.transparent = true;
                        materialArgs.opacity = parseFloat(self.opacity);
                    }else{
                        if(self.opacity){
                            materialArgs.transparent = true;
                            materialArgs.opacity = parseFloat(self.opacity);
                        };
                        if(self.color){
                            materialArgs.color = self.color;
                        }
                        createMaterial();
                    }

                });
            }
        });
    };

    JSONComponent.prototype.toJSON = function(){
        return {
            name: this.name
        }
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

            return new JSONComponent(data);
        }catch(err){
            console.log(err);
        }

    }
	return JSONComponent;
});