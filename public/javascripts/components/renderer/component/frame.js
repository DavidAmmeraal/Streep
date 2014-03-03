define(['./component', './json-component'], function(Component, JSONComponent){
	var Frame = function(){
		var self = this;
		$.extend(self, arguments[0]);

        var initialize = function(){
            for(var i = 0; i < self.children.length; i++){
                self.children[i].parent = self;
            }
        }

        initialize();
	};

	Frame.prototype = Object.create(Component.prototype);
    Frame.prototype.children = [];
    Frame.prototype.mesh = [];
    Frame.prototype.load = function(){
        var self = this;

        var checkLoaded = function(){
            var loaded = true;
            for(var i = 0; i < self.children.length; i++){
                if(!self.children[i].loaded){
                    loaded = false;
                }
            }

            return loaded;
        };

        return new Promise(function(resolve, reject){
            for(var i = 0; i < self.children.length; i++){
                var child = self.children[i];
                child.load().then(function(){
                    if(checkLoaded()){
                        self.loaded = true;
                        resolve();
                    }
                })
            }
        });
    };

    Frame.prototype.translate = function(directions){
        for(var i = 0; i < this.children; i++){
            var child = this.children[i];
            child.translate(directions);
        }
    };

    Frame.prototype.rotate = function(directions){
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            child.rotate(directions);
        }
    };

    Frame.prototype.scale = function(directions){
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            child.scale(directions);
        }
    };

    Frame.prototype.addChild = function(comp){
        comp.parent = this;
        this.children.push(comp);
    };

    Frame.prototype.getMesh = function(){
        var meshes = [];
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            meshes.push(child.getMesh());
        }
        return meshes;
    };

    Frame.prototype.setColor = function(color){
        for(var i = 0; i < this.children.length; i++){
            this.children[i].setColor(color);
        }
    };

    Frame.prototype.exportSTL = function(){
        var stl = "";
        for(var i = 0; i < this.children.length; i++){
            stl += this.children[i].exportSTL();
        }

        return stl;
    };

    Frame.parseFromDB = function(data){
        for(var i = 0; i < data.children.length; i++){
            var child = data.children[i];
            child = JSONComponent.parseFromDB(child);
            data.children[i] = child;
        }
        data.focusPosition = new THREE.Vector3(data.focusPosition.x, data.focusPosition.y, data.focusPosition.z);
        return new Frame(data);
    };
	return Frame;
});