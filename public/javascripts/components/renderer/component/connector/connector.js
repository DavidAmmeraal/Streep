define(['../modification/modification', '../modification/csg-text-modification', '../modification/csg-object-modification'], function(Modification, CSGTextModification, CSGObjectModification){
	var Connector = function(options){
		var self = this;
		$.extend(this, options);
		
		var initialize = function(){
			for(var i = 0; i < self.modifications.length; i++){
				var mod = self.modifications[i];
				mod.connector = self;
			}
		};

		initialize();
	};

    Connector.prototype.name = null;
    Connector.prototype.position = new THREE.Vector3(0, 0, 0);
    Connector.prototype.component = null;
    Connector.prototype.modifications = [];
    Connector.prototype.originalGeo = null;
    Connector.prototype.indicator = null;
    Connector.prototype.loaded = false;

	Connector.prototype.addModification = function(mod){
		if(mod instanceof Modification){
			mod.setComponent(comp);
			mod.connector = this;
			this.modifications.push(mod);
		}else{
			throw "This is not a valid Modification!";
		}
	};

	Connector.prototype.removeModification = function(mod){
		this.availableModifications.splice(this.modifications.indexOf(mod), 1);
	};

	Connector.prototype.setComponent = function(comp){
		this.component = comp;
		for(var i = 0; i < this.modifications.length; i++){
			this.modifications[i].setComponent(comp);
		}
	};

    Connector.prototype.reset = function(){
        if(this.originalGeo){
            this.component.geo = this.originalGeo;
            this.component.refresh();
        }
        if(this.used){
            this.used = false;
        }
    };

    Connector.prototype.load = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            if(!this.indicator){
                this.loaded = true;
                resolve();
            }else{
                this.indicator().load().then(function(){
                    this.loaded = true;
                    resolve(self);
                }, function(err){
                    reject(err);
                })
            }
        });
    };

    Connector.parseFromDB = function(data){
        var modifications = data.modifications;

        data.position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);

        for(var i = 0; i < modifications.length; i++){
            var modification = modifications[i];
            switch(modification.type){
                case "CSGTextModification":
                    modification = CSGTextModification.parseFromDB(modification.implementation);
                    break
                case "CSGObjectModification":
                    modification = CSGObjectModification.parseFromDB(modification.implementation);
                    break;
            }
            data.modifications[i] = modification;
        }
        return new Connector(data);
    };
	
	return Connector;
});