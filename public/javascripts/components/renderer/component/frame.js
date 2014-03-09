define(['./parent-component', './json-component'], function(ParentComponent, JSONComponent){
	var Frame = function(){
		var self = this;
		$.extend(self, arguments[0]);

        var initialize = function(){
            console.log("Frame._initialize()");

        };

        initialize();
	};

	Frame.prototype = Object.create(ParentComponent.prototype);
    Frame.currentFront = null;
    Frame.currentLeftLeg = null;
    Frame.currentRightLeg = null;
    Frame.loaded = false;
    Frame.prototype.getPrice = function(){
        var price = parseFloat(this.basePrice);

        var activeFront = _.find(this.fronts, function(front){
            return front.active;
        });

        var activeLegs = _.find(this.legs, function(legs){
            return legs.active;
        });

        price += parseFloat(activeFront.priceExtra);
        price += parseFloat(activeLegs.priceExtra);
        return price;
    };
    Frame.prototype.changeFront = function(newFront){
        var self = this;
        console.log("Frame.changeFront()");
        var currentColor = self.currentFront.color;
        _.each(this.fronts, function(front){
            if(front.active)
                front.active = false;
            if(front.default)
                front.default = false;
        });
        newFront.active = true;
        return new Promise(function(resolve, reject){
            var frontObj = JSONComponent.parseFromDB(newFront);
            frontObj.load().then(function(){
                var isCurrentColorAvailableInNewFrame = _.find(frontObj.availableColors, function(color){
                    return color.hex.replace("#", "0x") == currentColor;
                });
                if(isCurrentColorAvailableInNewFrame){
                    frontObj.setColor(currentColor);
                }else{
                    var defaultColor = _.find(frontObj.availableColors, function(color){
                        return color.default;
                    });
                    frontObj.setColor(defaultColor.hex);
                }

                self.removeChild(self.currentFront);
                if(self.currentFront.focused)
                    frontObj.focused = true;

                self.currentFront = frontObj;
                self.addChild(self.currentFront);
                self.currentFront.trigger('request-render', self.currentFront);
                resolve(self.currentFront);
            });
        });
    };
    Frame.prototype.changeLegs = function(newLegs){
        console.log("Frame.changeLegs()");
        _.each(this.legs, function(legs){
            if(legs.active)
                legs.active = false;
            if(legs.default)
                legs.default = false;
        });

        var currentColor = null;

        if(this.currentLeftLeg){
            currentColor = this.currentLeftLeg.color;
        }else{
            console.log(newLegs);
            currentColor = _.find(newLegs.availableColors, function(color){
                return color.active || color.default;
            }).hex;
        }

        newLegs.active = true;
        var self = this;
        return new Promise(function(resolve, reject){
            var leftLeg = JSONComponent.parseFromDB(newLegs['left']);
            var rightLeg = JSONComponent.parseFromDB(newLegs['right']);
            Promise.all([leftLeg.load(), rightLeg.load()]).then(function(){
                try{
                    self.removeChild(self.currentRightLeg);
                    self.removeChild(self.currentLeftLeg);

                    if(self.currentRightLeg && self.currentRightLeg.focused){
                        rightLeg.focused = true;
                    }else if(self.currentLeftLeg && self.currentLeftLeg.focused){
                        leftLeg.focused = true;
                    }

                    self.currentLeftLeg = leftLeg;
                    self.currentRightLeg = rightLeg;
                    if(currentColor){
                        self.currentLeftLeg.setColor(currentColor);
                        self.currentRightLeg.setColor(currentColor);
                    }
                    self.addChild(leftLeg);
                    self.addChild(rightLeg);
                    leftLeg.trigger('request-render', leftLeg);
                    rightLeg.trigger('request-render', rightLeg);
                }catch(err){
                    console.log(err.stack);
                }
                console.log("RESOLVING LEGS NOW!");
                resolve({"right": rightLeg, "left": leftLeg});
            });
        });
    };
    Frame.prototype.load = function(){
        console.log("Frame.load()");
        var self = this;
        return new Promise(function(resolve, reject){
            try{
                if(self.loaded){
                    resolve();
                }else{
                    Promise.all([
                        self.changeFront(self.currentFront),
                        self.changeLegs(self.currentLegs)
                    ]).then(function(){
                        self.loaded = true;
                        resolve();
                    });
                }
            }catch(err){
                console.log("ERROR!");
                reject(err);
            }
        });
    };
    Frame.parseFromDB = function(data){
        var front = _.find(data.fronts, function(front){
            return front.default;
        });

        var legs = _.find(data.legs, function(leg){
            return leg.default;
        });

        data.currentFront = front;
        data.currentLegs = legs;

        data.focusPerspective.cameraPosition = new THREE.Vector3(data.focusPerspective.cameraPosition.x, data.focusPerspective.cameraPosition.y, data.focusPerspective.cameraPosition.z);
        data.focusPerspective.lookAt = new THREE.Vector3(data.focusPerspective.lookAt.x, data.focusPerspective.lookAt.y, data.focusPerspective.lookAt.z);
        return new Frame(data);
    };

    return Frame;
});