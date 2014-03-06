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
    Frame.prototype.changeFront = function(newFront){
        var self = this;
        return new Promise(function(resolve, reject){
            var front = JSONComponent.parseFromDB(newFront);
            front.load().then(function(){
                self.removeChild(self.currentFront);
                self.currentFront = front;
                self.addChild(front);
                front.setColor(self.color);
                front.trigger('request-render', front);
                resolve();
            });
        });
    },
    Frame.prototype.changeFront = function(newFront){
        var self = this;
        console.log("Frame.changeFront()");
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
                console.log("NEW FRONT LOADED");
                self.removeChild(self.currentFront);
                if(self.currentFront.focused)
                    frontObj.focused = true;

                self.currentFront = frontObj;
                self.addChild(self.currentFront);
                self.currentFront.setColor(self.color);
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
                    self.addChild(leftLeg);
                    self.addChild(rightLeg);
                    leftLeg.setColor(self.color);
                    rightLeg.setColor(self.color);
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
        console.log("Frame.load()");
        var self = this;
        return new Promise(function(resolve, reject){
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
        });
    };
    Frame.parseFromDB = function(data){
        var defaultColor = _.find(data.availableColors, function(element){
            return element.default;
        });

        defaultColor.hex.replace("#", "0x");
        data.color = defaultColor.hex;

        var front = _.find(data.fronts, function(front){
            return front.default;
        });

        var legs = _.find(data.legs, function(leg){
            return leg.default;
        });

        data.currentFront = front;
        data.currentLegs = legs;

        data.focusPosition = new THREE.Vector3(data.focusPosition.x, data.focusPosition.y, data.focusPosition.z);
        return new Frame(data);
    };

    return Frame;
});