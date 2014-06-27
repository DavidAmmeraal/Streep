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
    Renderer.prototype.backgroundColor = "#f3f1f1";
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

        var comps = [];
        comps.push(self.frame.currentFront.currentNose);
        comps.push(self.frame.currentLeftLeg);
        comps.push(self.frame.currentRightLeg);

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
            console.log(comp);
            if(comp.indicator){
                var indicator = {
                    position: toScreenXY(comp.indicator, self.viewer.camera, self.viewer.renderer.domElement),
                    component: comp.toJSON()
                };

                indicators.push(indicator);
            }
        }

        return indicators;
    };
    Renderer.prototype.exitPreviewMode = function(data){
        var self = this;
        return new Promise(function(resolve, reject){
            self.viewer.focusTo(self.frame, 0);
            var indicators = self.getIndicators();
            resolve({
                'commandID': data.commandID,
                'img': self.viewer.getScreenshot(),
                'indicators': indicators
            });
        });
    };
    Renderer.prototype.enterPreviewMode = function(data){
        console.log("Renderer.prototype.enterPreviewMode()");
        var self = this;

        self.viewer.focusTo(self.frame.previewPerspective.lookAt);
        self.viewer.setDistance(self.frame.previewPerspective.cameraPosition.z);
        self.viewer.positionCamera(self.frame.previewPerspective.cameraPosition);

        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve({
                    'commandID': data.commandID,
                    'img': self.viewer.getScreenshot()
                });
            }, 1);
        });
    };
    Renderer.prototype.rotateLeft = function(data){
        console.log("Renderer.prototype.rotateLeft()");
        var self = this;
        self.viewer.rotate(-45, 0);

        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve({
                    'commandID': data.commandID,
                    'img': self.viewer.getScreenshot()
                });
            }, 1);
        });
    };
    Renderer.prototype.rotateRight = function(data){
        console.log("Renderer.prototype.rotateRight()");
        var self = this;
        self.viewer.rotate(45, 0);
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve({
                    'commandID': data.commandID,
                    'img': self.viewer.getScreenshot()
                });
            }, 1);
        });
    };
    Renderer.prototype.changeGlasses = function(data){
        console.log("Renderer.prototype.changeGlasses()");
        console.log(data);

        var self = this;

        return new Promise(function(resolve, reject){
            var actualGlasses = self.frame.currentFront.glasses[data.glasses.index];
            self.frame.changeGlasses(actualGlasses).then(function(newGlasses){
                var glasses = _.map(self.frame.currentFront.glasses, function(glass){
                    var returnObj = {
                        img: glass.img,
                        priceExtra: glass.priceExtra,
                        active: false,
                        title: glass.title,
                        description: glass.description
                    }

                    if(glass._id == self.frame.currentFront.currentGlasses._id){
                        returnObj.active = true;
                    }
                    return returnObj;
                });

                resolve({
                    'commandID': data.commandID,
                    'img': self.viewer.getScreenshot(),
                    'indicators': false,
                    'data': {
                        'glassesPage': {
                            glasses: glasses
                        }
                    }
                })
            });
        });
    }
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

                var glasses = [];
                if(self.frame.currentFront.glasses){
                    glasses = _.map(self.frame.currentFront.glasses, function(glass){
                        return {
                            img: glass.img,
                            priceExtra: glass.priceExtra,
                            active: glass.active,
                            title: glass.title,
                            description: glass.description
                        }
                    })
                }

                var finish = function(){
                    console.log("finished()");
                    var resolveData = {
                        'frontPage': {
                            fronts: fronts
                        },
                        'nosePage': {
                            noses: self.frame.currentFront.noses
                        },
                        'glassesPage':{
                            glasses: glasses
                        }
                    };

                    resolve({
                        'commandID': data.commandID,
                        'img': self.viewer.getScreenshot(),
                        'indicators': false,
                        'data': resolveData
                    });
                }

                if(self.appliedModificationArguments){
                    var modsToDo = [];
                    for(var legStr in self.appliedModificationArguments){
                        if(self.appliedModificationArguments[legStr].text){
                            var text = self.appliedModificationArguments[legStr].text;
                            var font = self.appliedModificationArguments[legStr].font;
                            var leg
                            if(legStr == "right_leg" && self.appliedModificationArguments[legStr].text){
                                leg = self.frame.currentRightLeg;
                            }else if(self.appliedModificationArguments[legStr].text){
                                leg = self.frame.currentLeftLeg;
                            }

                            if(leg.connectors && leg.connectors[0] && leg.connectors[0].modifications){
                                var mod = _.find(leg.connectors[0].modifications, function(mod){
                                    return mod.action_name == self.appliedModificationArguments[legStr].type
                                });

                                var size;
                                if(mod.sizes['l']){
                                    size = 'l';
                                }else if(mod.sizes['m']){
                                    size = 'm';
                                }else {
                                    size = 's';
                                }

                                mod.setText(text, font, size);
                                modsToDo.push(mod);
                            }
                        }
                    }

                    if(modsToDo.length){
                        var chainModifications = function(key){
                            if(!key){
                                key = 0;
                            }
                            modsToDo[key].execute().then(function(){
                                if(modsToDo[key + 1]){
                                    chainModifications(key + 1);
                                }else{
                                    finish();
                                }
                            })
                        };
                        chainModifications();
                    }else{
                        finish();
                    }
                }else{
                    finish();
                }
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
        this.appliedModificationArguments[side] = {};
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

                var obj;
                switch(data.side){
                    case "right_leg":
                        obj = self.frame.currentRightLeg;
                        break;
                    case "left_leg":
                        obj = self.frame.currentLeftLeg;
                        break;
                }

                var sizes = [];
                try{
                    if(obj.connectors && obj.connectors[0] && obj.connectors[0].modifications && obj.connectors[0].modifications[0]){
                        for(var size in obj.connectors[0].modifications[0].sizes){
                            sizes.push(size);
                        }
                    }else{
                        sizes = false
                    }
                }catch(err){
                    console.log(err);
                    console.log(err.stack);
                }

                self.appliedModificationArguments.left_leg = {};
                self.appliedModificationArguments.right_leg = {};
                self.appliedModifications.left_leg = {};
                self.appliedModifications.right_leg = {};

                var engravePageObj = {};
                engravePageObj.side = data.side;
                engravePageObj.sizes = sizes;

                resolve({
                    'commandID': data.commandID,
                    'img': self.viewer.getScreenshot(),
                    'indicators': false,
                    'data': {
                        'legPage': {
                            'patterns': patterns
                        },
                        'engravePage':engravePageObj
                    }
                });
            });
        });
    };
    Renderer.prototype.changeNose = function(data){
        console.log("Renderer.prototype.changeNose()");
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
            return this._handleLegFocused(comp);
        }else{
            console.log("ITS NEITHER!");
        }

    };
    Renderer.prototype._handleFrontFocused = function(comp){
        var self = this;
        var fronts = _.map(this.frame.fronts, function(front){
            return {
                img: front.img,
                priceExtra: front.priceExtra,
                active: front.active
            }
        });

        var glasses = [];

        if(this.frame.currentFront.glasses){
            glasses = _.map(this.frame.currentFront.glasses, function(glass){
                var active = false;
                if(glass._id == self.frame.currentFront.currentGlasses._id){
                    active = true;
                }
                return {
                   img: glass.img,
                   priceExtra: glass.priceExtra,
                   active: active,
                   title: glass.title,
                   description: glass.description
                }
            });
        }

        var returnObject = {
            'focusedOn': 'front',
            'frontPage':{
                fronts: fronts,
                colors: this.frame.fronts[0].availableColors
            },
            'nosePage': {
                noses: this.frame.currentFront.noses
            },
            'glassesPage': {
                glasses: glasses
            }
        }

        return returnObject;
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
        try{
            if(obj.connectors && obj.connectors[0] && obj.connectors[0].modifications && obj.connectors[0].modifications[0]){
                for(var size in obj.connectors[0].modifications[0].sizes){
                    sizes.push(size);
                }
            }else{
                sizes = false
            }
        }catch(err){
            console.log(err);
            console.log(err.stack);
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

                if(self.viewer){
                    self.viewer.destroy();
                }

                self.context = new ComponentContext();
                self.viewer = new Viewer(self.container, self.context, {
                    backgroundColor: self.backgroundColor,
                    startPosition: new THREE.Vector3(-100, 20, 400)
                });

                window['globalviewer'] = self.viewer;

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
        var objects = self.frame.exportSTL();

        $.post('http://localhost:3000/server-rendering/receive-stl/' + data.commandID, {amount: objects.length}).then(function(){
            for(key in objects){
                $.post('http://localhost:3000/server-rendering/receive-stl/' + data.commandID, {name: key, stl: objects[key]});
            }
        });

        return Promise.resolve({
            'commandID': data.commandID
        });
    };
    Renderer.prototype.getPrice = function(data){
        return Promise.resolve({'commandID': data.commandID, 'price': this.frame.getPrice()});
    };
    Renderer.prototype.finalize = function(data){
        console.log("Renderer.prototype.finalize()");
        console.log(this.frame);
        var commandID = data.commandID;
        var self = this;
        var frame = {
            id: this.frame.id,
            name: this.frame.name,
            basePrice: this.frame.basePrice
        };
        var nose = {
            name: this.frame.currentFront.currentNose.name,
            priceExtra: this.frame.currentFront.currentNose.priceExtra,
            color: this.frame.currentFront.currentNose.color
        };
        var glasses;
        if(this.frame.currentFront.currentGlasses){
            glasses = {
                name: this.frame.currentFront.currentGlasses.name,
                color: this.frame.currentFront.currentGlasses.color,
                opacity: this.frame.currentFront.currentGlasses.opacity,
                priceExtra: this.frame.currentFront.currentGlasses.priceExtra
            }
        };
        var legs = {
            color: this.frame.currentLeftLeg.color
        };

        var creation = {
            "frame": frame,
            "nose": nose,
            "glasses": glasses,
            "legs": legs
        };

        var checkoutParams = {
            frame_name: frame.name,
            frame_base_price: frame.basePrice,
            nose_name: nose.name,
            nose_price_extra: nose.priceExtra,
            nose_color: nose.color,
            legs_color: legs.color
        };

        if(glasses){
            checkoutParams.glasses_color = glasses.color;
            checkoutParams.glasses_opacity = glasses.opacity;
            checkoutParams.glasses_name = glasses.name;
            checkoutParams.glasses_price_extra = glasses.priceExtra;
        }

        return new Promise(function(resolve, reject){
            $.post('http://localhost:3000/creations/add', {creation: creation}).then(function(data){
                var objects = self.frame.exportSTL();
                var creationId = data.creationId;

                $.post('http://localhost:3000/creations/receive-stl/' + creationId, {amount: objects.length}).then(function(){
                    var i = 1;
                    for(key in objects){
                        $.post('http://localhost:3000/creations/receive-stl/' + creationId, {name: key, stl: objects[key]}).then(function(data){
                            i++;
                            if(i == objects.length){
                                checkoutParams.stl_file = creationId + ".stl";
                                resolve({'commandID': commandID, 'creationID': creationId, 'checkoutParams': checkoutParams});
                            }
                        });
                    }
                });
            });
        });
    };

    Renderer.prototype.createScreenshot = function(data){
        console.log("Renderer.prototype.createScreenshot()");
        var self = this;
        var focusedAt = self.viewer.lookingAt;
        self.viewer.focusTo(self.frame);
        var commandID = data.commandID;
        return new Promise(function(resolve, reject){
            $.post('http://localhost:3000/screenshot/save', {data: self.viewer.getScreenshot()}).then(function(data){
               data = JSON.parse(data);
               self.viewer.focusTo(focusedAt);
               var resolveData = {'commandID': commandID, 'screenshot': data.screenshot};
               resolve(resolveData);
            });
        });

    };

    return Renderer;
});