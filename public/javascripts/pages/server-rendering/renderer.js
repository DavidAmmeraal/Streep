define([
    './session',
    '../../components/renderer/viewer',
    '../../components/renderer/component-context',
    '../../components/renderer/component/frame'
], function(
    Session,
    Viewer,
    ComponentContext,
    Frame
){
    var Renderer = function(options){
        var self = this;
        $.extend(self, options);

        this.context = new ComponentContext();
    };

    Renderer.prototype.sessions = {};
    Renderer.prototype.backgroundColor = "#FFFFFF";
    Renderer.prototype.container = null;
    Renderer.prototype.context = null;
    Renderer.prototype.viewer = null;
    Renderer.prototype.frame = null;
    Renderer.prototype.focusedComp = null;
    Renderer.prototype.appliedModifications = {
        'left_leg': {},
        'right_leg': {}
    }
    Renderer.prototype.appliedModificationArguments = {
        'left_leg': {},
        'right_leg': {}
    };
    Renderer.prototype.getIndicators = function(){
        console.log("Renderer.getIndicators()");
        var self = this;
        var comps = this.viewer.getComponents();

        function toScreenXY( position, camera, div ){
            var pos = position.clone();
            var projScreenMat = new THREE.Matrix4();
            projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
            pos.applyProjection(projScreenMat);

            return { x: ( pos.x + 1 ) * $(div).width() / 2,
                y: ( - pos.y + 1) * $(div).height() / 2 };
        }

        var indicators = [];

        for(var c = 0; c < comps.length; c++){
            var comp = comps[c];
            if(comp.indicator){
                var indicator = {
                    position: toScreenXY(comp.indicator, self.viewer.camera, self.viewer.renderer.domElement),
                    component: comp.toJSON()
                };

                console.log(indicator);

                indicators.push(indicator);
            }
        }

        return indicators;
    };
    Renderer.prototype.changeFront = function(data){
        console.log("Renderer.prototype.changeFront()");
        console.log(data);
        var self = this;
        return new Promise(function(resolve, reject){
            var actualFront = self.frame.fronts[data.front.index];
            self.frame.changeFront(actualFront).then(function(newFront){
                var fronts = _.map(self.frame.fronts, function(front){
                    return {
                        img: front.img,
                        priceExtra: front.priceExtra,
                        active: front.active
                    }
                });
                resolve({
                    'commandID': data.commandID,
                    'img': self.viewer.getScreenshot(),
                    'indicators': false,
                    'data': {
                        'frontPage': {
                          fronts: fronts
                        },
                        'nosePage': {
                            noses: self.frame.currentFront.noses
                        }
                    }
                });
            });
        });
    };
    Renderer.prototype.resetLeg = function(data){
        var self = this;
        var side = data.side;
        var obj;
        if(side == "right_leg"){
            obj = this.frame.currentRightLeg;
        }else{
            obj = this.frame.currentLeftLeg;
        }
        obj.connectors[0].reset();
        this.appliedModifications[side] = {};
        return Promise.resolve({
            'commandID': data.commandID,
            'img': self.viewer.getScreenshot(),
            'indicators': false,
            'data': {
                'engravePage': {
                    'engraved': false
                }
            }
        })
    };
    Renderer.prototype.changePattern = function(data){
        console.log("Renderer.prototype.changePattern");
        console.log(data);
        var self = this;
        var leg;
        switch(data.side){
            case "right_leg":
                leg = this.frame.currentRightLeg;
                break;
            case "left_leg":
                leg = this.frame.currentLeftLeg;
                break;
        }

        var actualPattern = _.find(this.frame.currentFront.legs[0].patterns, function(pattern){
            return pattern.left.src == data.pattern.left.src;
        });

        var patterns = _.map(this.frame.currentFront.legs[0].patterns, function(pattern){
            var returnObj = {
                img: pattern.img,
                priceExtra: pattern.priceExtra,
                left: {
                    src: pattern.left.src
                },
                right: {
                    src: pattern.right.src
                }
            }
            if(pattern == actualPattern){
                returnObj.active = true;
            }
            return returnObj;
        });

        return new Promise(function(resolve){
            self.frame.changePattern(leg, actualPattern).then(function(){
                resolve({
                    'commandID': data.commandID,
                    'img': self.viewer.getScreenshot(),
                    'indicators': false,
                    'data': {
                        'legPage': {
                            'patterns': patterns
                        }
                    }
                });
            });
        });
    };
    Renderer.prototype.changeNose = function(data){
        console.log("Renderer.prototype.changeNose()");
        console.log(data);
        var self = this;
        return new Promise(function(resolve, reject){
           var actualNose = self.frame.currentFront.noses[data.nose.index];
           self.frame.changeNose(actualNose).then(function(newNose){
               resolve({
                   'commandID': data.commandID,
                   'img': self.viewer.getScreenshot(),
                   'indicators': false
               });
           })
        });
    };
    Renderer.prototype.changeFrontColor = function(data){
        console.log("Renderer.prototype.changeFrontColor()");
        var self = this;
        self.frame.currentFront.currentNose.setColor(data.color);
        return Promise.resolve({
            'commandID': data.commandID,
            'img': self.viewer.getScreenshot(),
            'indicators': false
        });
    };
    Renderer.prototype.changeLegsColor = function(data){
        console.log("Renderer.prototype.changeLegsColor()");
        var self = this;
        self.frame.changeLegsColor(data.color);
        return Promise.resolve({
            'commandID': data.commandID,
            'img': self.viewer.getScreenshot(),
            'indicators': false
        })
    };
    Renderer.prototype._getActualComp = function(comp){
        console.log("Renderer.prototype._getActualComp()");
        if(comp.name == this.frame.name){
            return this.frame;
        }else if(comp.name == this.frame.currentFront.currentNose.name){
            return this.frame.currentFront.currentNose;
        }else if(comp.name == this.frame.currentLeftLeg.name){
            return this.frame.currentLeftLeg;
        }else if(comp.name == this.frame.currentRightLeg.name){
            return this.frame.currentRightLeg;
        }
    };
    Renderer.prototype._handleComponent = function(comp){
        console.log("Renderer.prototype._handleComponent()");
        if(comp == this.frame.currentFront.currentNose){
            return this._handleFrontFocused(comp);
        }else if(comp == this.frame.currentLeftLeg || comp == this.frame.currentRightLeg){
            console.log("HAI DI HO ITS A FUCKING LEG!");
            return this._handleLegFocused(comp);
        }else{
            console.log("ITS NEITHER!");
        }

    };
    Renderer.prototype._handleFrontFocused = function(comp){
        var fronts = _.map(this.frame.fronts, function(front){
            return {
                img: front.img,
                priceExtra: front.priceExtra,
                active: front.active
            }
        });

        return{
            'focusedOn': 'front',
            'frontPage':{
                fronts: fronts,
                colors: this.frame.fronts[0].availableColors
            },
            'nosePage': {
                noses: this.frame.currentFront.noses
            }
        };
    };
    Renderer.prototype._handleLegFocused = function(comp){
        console.log("Renderer.prototype._handleLegFocused");
        var focusedStr;
        if(comp == this.frame.currentLeftLeg){
            var obj = this.frame.currentLeftLeg;
            focusedStr = "left_leg";
        }else{
            var obj = this.frame.currentRightLeg;
            focusedStr = "right_leg";
        }

        var patterns = _.map(this.frame.currentFront.legs[0].patterns, function(pattern){
            var returnObj = {
                img: pattern.img,
                priceExtra: pattern.priceExtra,
                left: {
                    src: pattern.left.src
                },
                right: {
                    src: pattern.right.src
                }
            }
            if(pattern.left.src == obj.src || pattern.right.src == obj.src){
                returnObj.active = true;
            }
            return returnObj;
        });

        var sizes = [];
        if(obj.connectors && obj.connectors[0].modifications && obj.connectors[0].modifications[0]){
            console.log(obj.connectors[0].modifications[0].sizes);
            for(var size in obj.connectors[0].modifications[0].sizes){
                console.log("SIZE: " + size);
                sizes.push(size);
            }
        }else{
            sizes = false
        }

        var engravePageObj = {};
        engravePageObj.side = focusedStr;
        engravePageObj.sizes = sizes;
        if(this.appliedModifications[focusedStr].action_name){
            engravePageObj.engraved = true;
        }

        return {
            'focusedOn': focusedStr,
            'legPage': {
                side: focusedStr,
                patterns: patterns,
                colors: this.frame.currentFront.legs[0].availableColors
            },
            'engravePage': engravePageObj
        }
    };
    Renderer.prototype.focus = function(data){
        console.log("Renderer.prototype.focus()");
        var self = this;
        return new Promise(function(resolve, reject){
            console.log(data.comp.name);
            var actualComp = self._getActualComp(data.comp);
            self.focusedComp = actualComp;
            self.viewer.focusTo(self._getActualComp(data.comp), 0);

            var componentSpecificResponses = self._handleComponent(actualComp);

            var indicators;
            if(actualComp == self.frame){
                indicators = self.getIndicators()
            }else{
                indicators = false;
            }
            resolve({
                'commandID': data.commandID,
                'img': self.viewer.getScreenshot(),
                'indicators': indicators,
                'data': componentSpecificResponses
            });
        });
    };
    Renderer.prototype.carveLeg = function(data){
        var font = data.font;
        var size = data.size;
        var text = data.text;
        var self = this;

        this.appliedModificationArguments[data.side] = {
            text: text,
            font: font,
            type: 'carve'
        }

        var leg;

        if(data.side == "right_leg"){
            leg = this.frame.currentRightLeg;
        }else{
            leg = this.frame.currentLeftLeg;
        }

        var modification = _.find(leg.connectors[0].modifications, function(modification){
            return modification.action_name == "carve";
        });

        this.appliedModifications[data.side] = modification;

        modification.setText(text, font, size);

        return new Promise(function(resolve, reject){
            modification.execute().then(function(){
                resolve({
                    commandID: data.commandID,
                    img: self.viewer.getScreenshot(),
                    indicators: false,
                    data: {
                        engravePage: {
                            engraved: true
                        }
                    }
                });
            });
        });
    };
    Renderer.prototype.engraveLeg = function(data){
        var font = data.font;
        var size = data.size;
        var text = data.text;
        var self = this;

        this.appliedModificationArguments[data.side] = {
            text: text,
            font: font,
            type: 'engrave'
        }

        var leg;

        if(data.side == "right_leg"){
            leg = this.frame.currentRightLeg;
        }else{
            leg = this.frame.currentLeftLeg;
        }

        var modification = _.find(leg.connectors[0].modifications, function(modification){
            return modification.action_name == "engrave";
        });

        this.appliedModifications[data.side] = modification;

        modification.setText(text, font, size);

        return new Promise(function(resolve, reject){
            modification.execute().then(function(){
                resolve({
                    commandID: data.commandID,
                    img: self.viewer.getScreenshot(),
                    indicators: false,
                    data: {
                        engravePage: {
                            engraved: true
                        }
                    }
                });
            });
        });
    };
    Renderer.prototype.loadFrame = function(data){
        var self = this;
        return new Promise(function(resolve){
            try{

                function doTheRest(){
                    self.frame = Frame.parseFromDB(data.frame);
                    self.container.width(data.containerDimensions[0]);
                    self.container.height(data.containerDimensions[1]);
                    self.viewer.resize();
                    self.frame.load().then(function(){
                        self.focusedComp = self.frame;
                        self.context.add(self.frame);
                        try{
                            self.viewer.focusTo(self.frame);
                        }catch(err){
                            console.log(err.stack);
                        }
                        resolve({
                            'commandID': data.commandID,
                            'img': self.viewer.getScreenshot(),
                            'indicators': self.getIndicators()
                        })
                    });
                }

                if(!self.viewer){
                    self.viewer = new Viewer(self.container, self.context, {
                        backgroundColor: self.backgroundColor,
                        startPosition: new THREE.Vector3(-100, 20, 400)
                    });
                }else{
                    self.viewer.destroy();
                }
                if(self.frame){
                    self.frame.remove();
                    setTimeout(function(){
                        doTheRest();
                    }, 1);
                }else{
                    doTheRest();
                }

            }catch(err){
                console.log(err.stack);
            }
        });
    };
    Renderer.prototype.handleCommand = function(data){
        console.log("Renderer.handleCommand()");
        return this[data.name](data);
    };
    Renderer.prototype.zoomOut = function(data){
        var self = this;
        return new Promise(function(resolve, reject){
            self.viewer.focusTo(self.frame, 0);
            self.focusedComp = self.frame;

            var indicators = self.getIndicators()
            resolve({
                'commandID': data.commandID,
                'img': self.viewer.getScreenshot(),
                'indicators': indicators
            });
        });
    };
    Renderer.prototype.resize = function(data){
        var self = this;
        console.log("Renderer.prototype.resize()");
        console.log(data);
        self.container.width(data.containerDimensions[0]);
        self.container.height(data.containerDimensions[1]);
        self.viewer.resize();

        var indicators = false;
        if(this.focusedComp == this.frame){
            indicators = self.getIndicators();
        }

        return Promise.resolve({
            'commandID': data.commandID,
            'img': self.viewer.getScreenshot(),
            'indicators': indicators
        })
    };
    Renderer.prototype.getSTL = function(data){
        var self = this;
        console.log("Renderer.prototype.getSTL()");
        var stl = self.frame.exportSTL();

        return Promise.resolve({
            'commandID': data.commandID,
            'stl': stl
        });
    };

    return Renderer;
});