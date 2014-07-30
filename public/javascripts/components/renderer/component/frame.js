define(['./parent-component', './json-component'], function(ParentComponent, JSONComponent){
	var Frame = function(){
		var self = this;

        ParentComponent.apply(this);
		$.extend(self, arguments[0]);

        var initialize = function(){

        };

        initialize();
	};

	Frame.prototype = Object.create(ParentComponent.prototype);
    Frame.currentFront = null;
    Frame.currentLeftLeg = null;
    Frame.currentRightLeg = null;
    Frame.loaded = false;
    Frame.prototype.getPrice = function(){
        var self = this;
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

        if(self.currentFront.currentGlasses){
            price += parseFloat(self.currentFront.currentGlasses.priceExtra);
        }

        activeLegs.patterns.forEach(function(pattern){
            if(pattern.right.src == self.currentRightLeg.src){
                price += parseFloat(pattern.priceExtra);
            }

            if(pattern.left.src == self.currentLeftLeg.src){
                price += parseFloat(pattern.priceExtra);
            }
        });

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
    Frame.prototype.cancelModifications = function(){
        if(this.currentLeftLeg && this.currentRightLeg){
            _.each(this.currentLeftLeg.connectors, function(connector){
                _.each(connector.modifications, function(mod){
                    mod.terminate();
                });
            });
            _.each(this.currentRightLeg.connectors, function(connector){
                _.each(connector.modifications, function(mod){
                    mod.terminate();
                });
            });
        }
    };
    Frame.prototype.changeFront = function(newFront){
        console.log("Frame.prototype.changeFront()");
        this.cancelModifications();
        var self = this;
        var currentColor = null;
        if(self.currentFront.currentNose){
            currentColor = self.currentFront.currentNose.color;
        }
        var currentGlassesOrder = -1;
        if(self.currentFront.currentGlasses){
            currentGlassesOrder = self.currentFront.currentGlasses.order;
        }
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
                self.removeChild(self.currentLeftLeg);
                self.removeChild(self.currentRightLeg);

                if(self.currentFront.currentGlasses){
                    self.currentFront.currentGlasses.trigger('request-removal',  self.currentFront.currentGlasses);
                    self.removeChild(self.currentFront.currentGlasses);
                }

                if(self.currentFront.focused)
                    newFront.focused = true;

                self.currentFront = newFront;
                self.addChild(self.currentFront.currentNose);
                try{
                    self.currentFront.currentNose.trigger('request-render', self.currentFront.currentNose);
                }catch(err){
                    console.log(err);
                }
                if(self.currentFront.glasses && self.currentFront.glasses.length > 0){
                    var glassesIndex = 0;
                    if(currentGlassesOrder != -1){
                        glassesIndex = self.currentFront.glasses.indexOf(_.find(self.currentFront.glasses, function(glass){
                            return glass.order == currentGlassesOrder;
                        }));
                    }
                    Promise.all([self.changeLegs(self.currentFront.legs[0]), self.changeGlasses(self.currentFront.glasses[glassesIndex])]).then(function(){
                        resolve(self.currentFront);
                    })
                }else{
                    try{
                        self.changeLegs(self.currentFront.legs[0]).then(function(){
                            resolve(self.currentFront);
                        });
                    }catch(err){
                        console.log(err.stack);
                    }
                }


            });
        });
    };
    Frame.prototype.changePattern = function(leg, newPattern){
        var self = this;
        var currentColor = this.currentLeftLeg.color;
        return new Promise(function(resolve, reject){
            var newLeg;

            if(leg == self.currentRightLeg){
                newLeg = JSONComponent.parseFromDB(newPattern['right']);
                self.currentRightLeg = newLeg;
            }else{
                newLeg = JSONComponent.parseFromDB(newPattern['left']);
                self.currentLeftLeg = newLeg;
            }
            newLeg.load().then(function(){
                try{
                    self.removeChild(leg);
                    newLeg.focused = true;

                    if(currentColor){
                        newLeg.setColor(currentColor);
                    }
                    self.addChild(newLeg);
                    newLeg.trigger('request-render', newLeg);
                    var obj = {"right": self.currentRightLeg, "left": self.currentLeftLeg};
                    resolve(obj);
                }catch(err){
                    console.log(err);
                }
            });
        });
    };
    Frame.prototype.changeLegsColor = function(color){
        this.currentLeftLeg.setColor(color);
        this.currentRightLeg.setColor(color);
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
        var defaultPattern = newLegs.patterns[0];
        var self = this;
        return new Promise(function(resolve, reject){
            var leftLeg = JSONComponent.parseFromDB(defaultPattern['left']);
            var rightLeg = JSONComponent.parseFromDB(defaultPattern['right']);
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
                console.log(err);
                console.log(err.stack);
                reject(err);
            }
        });
    };
    Frame.prototype.changeGlasses = function(newGlasses){
        newGlasses = JSONComponent.parseFromDB(newGlasses);
        console.log(newGlasses.src);
        var self = this;
        return new Promise(function(resolve, reject){
            newGlasses.mesh = null;
            newGlasses.load().then(function(){
                console.log("NEW GLASSES LOADED!!!");
                try{
                    function finalize(){
                        console.log("FINALIZE!!");
                        self.currentFront.currentGlasses = newGlasses;
                        self.currentFront.currentGlasses.active = true;
                        self.addChild(self.currentFront.currentGlasses);
                        newGlasses.trigger('request-render', newGlasses);
                        resolve(newGlasses)

                    }
                    if(self.currentFront.currentGlasses){
                        self.currentFront.currentGlasses.trigger('request-removal', self.currentFront.currentGlasses);
                    }
                    setTimeout(function(){
                        finalize();
                    }, 50);

                }catch(err){
                    console.log("ERROR!!!!!");
                    console.log(err);
                }
            });
        });
        /*
        console.log("Frame.prototype.changeGlasses()");
        var self = this;
        this.cancelModifications();

        return new Promise(function(resolve, reject){
            var glassesObj = JSONComponent.parseFromDB(newGlasses);

            var finalize = function(){
                console.log("FINSALIZE IT DFSDFSDFSDF");
                try{
                    console.log(glassesObj);
                    glassesObj.active = true;
                    self.currentFront.priceExtra = glassesObj.priceExtra;
                    self.currentFront.currentGlasses.setTransparancy(glassesObj.opacity);
                }catch(err){
                    console.log(err);
                }
                resolve(glassesObj);
            };

            if(!self.currentFront.currentGlasses || (glassesObj.src != self.currentFront.currentGlasses.src)){
                if(self.currentFront.currentGlasses){
                    self.removeChild(self.currentFront.currentGlasses);
                }
                glassesObj.load().then(function(){
                    self.currentFront.currentGlasses = glassesObj;
                    self.addChild(self.currentFront.currentGlasses);
                    glassesObj.trigger('request-render', glassesObj);
                    setTimeout(function(){
                        finalize();
                    },10);

                });
            }else{
                finalize();
            }

        });
        */
    };
    Frame.prototype.toJSON = function(data){
        return {
            id: this._id,
            name: this.name
        }
    };
    Frame.parseFromDB = function(data){
        var front = data.fronts[0];
        data.currentFront = front;
        data.focusPerspective.cameraPosition = new THREE.Vector3(data.focusPerspective.cameraPosition.x, data.focusPerspective.cameraPosition.y, data.focusPerspective.cameraPosition.z);
        data.focusPerspective.lookAt = new THREE.Vector3(data.focusPerspective.lookAt.x, data.focusPerspective.lookAt.y, data.focusPerspective.lookAt.z);

        for(var i = 0; i < data.fronts.length; i++){
            var front = data.fronts[i];
            front.glasses = _.sortBy(front.glasses, function(glass){
                return parseInt(glass.order);
            });
        }
        return new Frame(data);
    };

    return Frame;
});