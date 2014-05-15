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
    Renderer.prototype.getIndicators = function(){
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
                    position: {},
                    tooltipText: ""
                };
                switch(comp.name){
                    case "poot_links":
                    case "poot-rechts":
                        indicator.tooltipText = "Wijzig hier uw poten";
                        break;
                    default:
                        indicator.tooltipText = "Wijzig hier uw voorkant";
                }
                indicator.position = toScreenXY(comp.indicator, self.viewer.camera, self.viewer.renderer.domElement);
                indicators.push(indicator);
            }
        }

        return indicators;
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
                        console.log(self.context.get('components'));
                        console.log("FRAME LOADED !!!!!!!!!");
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
    }

    return Renderer;
});