define(['./component'], function(Component){
	var LeafComponent = function(){
		var self = this;
		
		$.extend(self, arguments[0]);
		
		var initialize = function(){
			for(var key in self.connectors){
				self.connectors[key].setComponent(self);
			}
		};
		
		initialize();
		
	};
	
	LeafComponent.prototype = Object.create(Component.prototype);
    LeafComponent.prototype.geo = null;
    LeafComponent.prototype.mesh = null;
    LeafComponent.prototype.hoverColor = "0x3333FF";
    LeafComponent.prototype.color = "0x28affc";
    LeafComponent.prototype.material = null;
    LeafComponent.prototype.loaded = false;
    LeafComponent.prototype.connectors = {};
    LeafComponent.prototype.translate = function(directions){
        this.geo.applyMatrix(new THREE.Matrix4().makeTranslation(directions.x, directions.y, directions.z));
    };
    LeafComponent.prototype.scale = function(directions){
        this.geo.applyMatrix(new THREE.Matrix4().makeScale(directions.x, directions.y, directions.z));
    };
    LeafComponent.prototype.rotate = function(directions){
        var geo = this.geo;
        if(directions.x > 0 || directions.x < 0){
            geo.applyMatrix(new THREE.Matrix4().makeRotationX(directions.x * Math.PI / 180));
        }if(directions.y > 0 || directions.y < 0){
            geo.applyMatrix(new THREE.Matrix4().makeRotationY(directions.y * Math.PI / 180));
        }if(directions.z > 0 || directions.z < 0){
            geo.applyMatrix(new THREE.Matrix4().makeRotationZ(directions.z * Math.PI / 180));
        }
    };
    LeafComponent.prototype.load = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            self.loadConnectors().then(function(){
                self.redraw();
                self.loaded = true;
                $(self).trigger('loaded', self);
                resolve();
            }, function(err){
                reject(err);
            })
        });
    };
    LeafComponent.prototype.redraw = function(){
        this.createMesh();
    };
    LeafComponent.prototype.loadConnectors = function(){
        var self = this;
        var connectorsLoaded = new Promise(function(resolve, reject){
            var loaded = true;
            for(var i = 0; i < self.connectors.length; i++){
                if(!self.connectors[i].loaded){
                    loaded = false;
                }
            }
            if(loaded){
                resolve()
            }
        });
        return connectorsLoaded;
    };
    LeafComponent.prototype.createMesh = function(){
        this.mesh = new THREE.Mesh(this.geo, this.material);
        $(this.mesh).data('streep-component', this);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    };
    LeafComponent.prototype.hover = function(){
        this.mesh.material.color.setHex(this.hoverColor);
    };
    LeafComponent.prototype.unhover = function(){
        this.mesh.material.color.setHex(this.color);
    };
    LeafComponent.prototype.getMesh = function(){
        return this.mesh;
    };
    LeafComponent.prototype.remove = function(){
        this.trigger('request-removal', this);
    };
    LeafComponent.prototype.setTransparancy = function(opacity){
        this.mesh.material = new THREE.MeshPhongMaterial({color: this.color, transparent: true, opacity: opacity});
    };
    LeafComponent.prototype.setColor = function(color){
        if(color.indexOf("#") != -1){
            color = color.replace("#", "0x");
        }
        this.color = color;

        if(this.mesh){
            try{
                this.mesh.material.color.setHex(this.color);
            }catch(err){
                console.log(err);
            }
            this.refresh();
        }else{
            this.material.color.setHex(this.color);
        }
    };

    LeafComponent.prototype.refresh = function(){
        this.trigger('request-render', this);
    };
    LeafComponent.prototype.exportSTL = function(){
        var vertices = this.geo.vertices;
        var tris     = this.geo.faces;

        function stringifyVector(vec){
            return ""+vec.x+" "+vec.y+" "+vec.z;
        }

        function stringifyVertex(vec){
            return "vertex "+stringifyVector(vec)+" \n";
        }

        var stl = "solid pixel";
        for(var i = 0; i<tris.length; i++){
            stl += ("facet normal "+stringifyVector( tris[i].normal )+" \n");
            stl += ("outer loop \n");
            stl += stringifyVertex( vertices[ tris[i].a ]);
            stl += stringifyVertex( vertices[ tris[i].b ]);
            stl += stringifyVertex( vertices[ tris[i].c ]);
            stl += ("endloop \n");
            stl += ("endfacet \n");
        }
        stl += ("endsolid");

        return stl;
    };
	return LeafComponent;
});