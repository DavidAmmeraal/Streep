define(['./component', './json-component'], function(Component, JSONComponent){
    var ParentComponent = function(){
        var self = this;
        $.extend(self, arguments[0]);

        var initialize = function(){
            for(var i = 0; i < self.children.length; i++){
                self.children[i].parent = self;
            }
        }

        initialize();
    };

    ParentComponent.prototype = Object.create(Component.prototype);
    ParentComponent.prototype.children = [];
    ParentComponent.prototype.mesh = [];
    ParentComponent.prototype.load = function(){
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

    ParentComponent.prototype.translate = function(directions){
        for(var i = 0; i < this.children; i++){
            var child = this.children[i];
            child.translate(directions);
        }
    };

    ParentComponent.prototype.rotate = function(directions){
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            child.rotate(directions);
        }
    };

    ParentComponent.prototype.scale = function(directions){
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            child.scale(directions);
        }
    };

    ParentComponent.prototype.addChild = function(comp){
        comp.parent = this;
        this.children.push(comp);
    };

    ParentComponent.prototype.remove = function(){
        this.children.map(function(child){
            child.remove();
        });
    }

    ParentComponent.prototype.removeChild = function(comp){
        if(comp && typeof comp.remove === "function"){
            comp.remove();
            this.children.splice(this.children.indexOf(comp), 1);
        }
    }

    ParentComponent.prototype.getMesh = function(){
        var meshes = [];
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            meshes.push(child.getMesh());
        }
        return meshes;
    };

    ParentComponent.prototype.setColor = function(color){
        this.color = color;
        for(var i = 0; i < this.children.length; i++){
            this.children[i].setColor(color);
        }
    };

    ParentComponent.prototype.exportSTL = function(){
        var object = {};
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            object[child.name] = child.exportSTL();
        }
        object.length = this.children.length;
        return object;
    };

    ParentComponent.parseFromDB = function(data){
        for(var i = 0; i < data.children.length; i++){
            var child = data.children[i];
            child = JSONComponent.parseFromDB(child);
            data.children[i] = child;
        }

        data.focusPosition = new THREE.Vector3(data.focusPosition.x, data.focusPosition.y, data.focusPosition.z);

        return new ParentComponent(data);
    };
    return ParentComponent;
});