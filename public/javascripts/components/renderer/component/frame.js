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

        var activeLegs = _.find(activeFront.legs, function(legs){
            return legs.active;
        });

        var activeNose = _.find(activeFront.noses, function(nose){
            return nose.active;
        });

        price += parseFloat(activeFront.priceExtra);
        price += parseFloat(activeLegs.priceExtra);
        price += parseFloat(activeNose.priceExtra);
        price += parseFloat(activeLegs.currentPattern.priceExtra);

        return price;
    };
    Frame.prototype.changeNose = function(newNose){
        var self = this;
        var currentColor = self.currentFront.currentNose.color;
        _.find(this.currentFront.noses, function(nose){
            return nose.active;
        }).active = false;
        newNose.active = true;
        return new Promise(function(resolve, reject){
            var noseObj = JSONComponent.parseFromDB(newNose);
            noseObj.load().then(function(){
                noseObj.setColor(currentColor);
                self.removeChild(self.currentFront.currentNose);
                self.currentFront.currentNose = noseObj;
                self.addChild(self.currentFront.currentNose);
                self.currentFront.currentNose.trigger('request-render', self.currentFront.currentNose);
                resolve(self.currentFront.currentNose);
            });
        });
    };
    Frame.prototype.changeFront = function(newFront){
        var self = this;
        var currentColor = self.currentFront.color;
        _.each(this.fronts, function(front){
            if(front.active)
                front.active = false;
            if(front.default)
                front.default = false;
        });
        newFront.active = true;
        newFront.currentNose = newFront.noses[0];
        newFront.currentNose.active = true;
        return new Promise(function(resolve, reject){
            var noseObj = JSONComponent.parseFromDB(newFront.currentNose);
            noseObj.load().then(function(){
                noseObj.active = true;
                newFront.currentNose = noseObj;
                var isCurrentColorAvailableInNewFrame = _.find(newFront.availableColors, function(color){
                    return color.hex.replace("#", "0x") == currentColor;
                });
                if(isCurrentColorAvailableInNewFrame){
                    noseObj.setColor(currentColor);
                }else{
                    var defaultColor = _.find(newFront.availableColors, function(color){
                        return color.default;
                    });
                    noseObj.setColor(defaultColor.hex);
                }

                self.removeChild(self.currentFront.currentNose);

                if(self.currentFront.focused)
                    newFront.focused = true;

                self.currentFront = newFront;
                self.addChild(self.currentFront.currentNose);
                try{
                    self.currentFront.currentNose.trigger('request-render', self.currentFront.currentNose);
                }catch(err){
                    console.log(err);
                }
                self.changeLegs(self.currentFront.legs[0]).then(function(){
                    resolve(self.currentFront);
                });
            });
        });
    };
    Frame.prototype.changePattern = function(newPattern){
        var activeLegs = _.find(this.currentFront.legs, function(legs){
            return legs.active;
        });
        activeLegs.currentPattern.active = false;
        var currentColor = this.currentLeftLeg.color;
        newPattern.active = true;
        activeLegs.currentPattern = newPattern;
        var self = this;
        return new Promise(function(resolve, reject){
            var leftLeg = JSONComponent.parseFromDB(activeLegs.currentPattern['left']);
            var rightLeg = JSONComponent.parseFromDB(activeLegs.currentPattern['right']);
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
                resolve({"right": rightLeg, "left": leftLeg});
            });
        });
    };
    Frame.prototype.changeLegs = function(newLegs){
        _.each(this.currentFront.legs, function(legs){
            if(legs.active)
                legs.active = false;
            if(legs.default)
                legs.default = false;
        });

        var currentColor = null;

        if(this.currentLeftLeg){
            currentColor = this.currentLeftLeg.color;
        }else{
            currentColor = _.find(newLegs.availableColors, function(color){
                return color.active || color.default;
            }).hex;
        }

        newLegs.active = true;
        newLegs.currentPattern = newLegs.patterns[0];
        var self = this;
        return new Promise(function(resolve, reject){
            var leftLeg = JSONComponent.parseFromDB(newLegs.currentPattern['left']);
            var rightLeg = JSONComponent.parseFromDB(newLegs.currentPattern['right']);
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
                resolve({"right": rightLeg, "left": leftLeg});
            });
        });
    };
    Frame.prototype.load = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            try{
                if(self.loaded){
                    resolve();
                }else{
                    Promise.all([
                        self.changeFront(self.currentFront)
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
        var front = data.fronts[0];
        data.currentFront = front;
        data.focusPerspective.cameraPosition = new THREE.Vector3(data.focusPerspective.cameraPosition.x, data.focusPerspective.cameraPosition.y, data.focusPerspective.cameraPosition.z);
        data.focusPerspective.lookAt = new THREE.Vector3(data.focusPerspective.lookAt.x, data.focusPerspective.lookAt.y, data.focusPerspective.lookAt.z);
        return new Frame(data);
    };

    return Frame;
});