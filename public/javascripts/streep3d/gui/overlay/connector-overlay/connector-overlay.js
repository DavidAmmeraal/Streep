define([
    'gui/overlay/viewer-overlay',
    'gui/overlay-menu/connector-menu/connector-menu',
    'gui/overlay-menu/color-chooser/color-chooser',
    'text!gui/overlay/connector-overlay/templates/connector.html',
    'text!gui/overlay/connector-overlay/templates/switcher.html'
], function(
    ViewerOverlay,
    ConnectorMenu,
    ColorChooser,
    ConnectorTemplate,
    SwitcherTemplate
 ){
    var ConnectorOverlay = function(options){
        console.log("ConnectorOverlay()");
        var self = this;
        this.connectorsVisible = true;
        this.switcher = null;

        var currentComp = null;

        ViewerOverlay.apply(this, arguments);

        var initialize = function(){
            self.renderStatic();
        }

        this.renderStatic = function(){
            self.renderSwitcher();
        };

        this.focus = function(comp){
            console.log("FOCUSSED ON COMP:");
            console.log(comp);
            currentComp = comp;
            self.renderConnectors();
        }

        this.render = function(){
            self.renderConnectors();
        };

        this.toggleConnectors = function(){
            if(self.connectorsVisible){
                self.connectorsVisible = false;
                self.hideConnectors();
            }else{
                self.connectorsVisible = true;
                self.showConnectors();
            }
        };

        this.hideConnectors = function(){
            self.element.find('.connector-indicator').fadeOut(200);
            self.switcher.find('.show').show();
            self.switcher.find('.hide').hide();
        };

        this.showConnectors = function(){
            self.element.find('.connector-indicator').fadeIn(200);
            self.switcher.find('.hide').show();
            self.switcher.find('.show').hide();
        }

        this.renderSwitcher = function(){
            self.switcher = $(SwitcherTemplate);
            self.switcher.find('a').click(function(event){
                event.preventDefault();
                self.toggleConnectors();
            });
            self.element.append(self.switcher);
        }

        this.renderConnectors = function(){
            var comp = currentComp;
            self.element.find('.connector-indicator').remove();

            function toScreenXY( position, camera, div ) {
                var pos = position.clone();
                projScreenMat = new THREE.Matrix4();
                projScreenMat.multiplyMatrices(self.viewer.camera.projectionMatrix, camera.matrixWorldInverse );
                // projScreenMat.multiplyVector3( pos );
                pos.applyProjection(projScreenMat);

                var offset = findOffset(div);

                return { x: ( pos.x + 1 ) * div.width / 2 + offset.left,
                    y: ( - pos.y + 1) * div.height / 2 + offset.top };

            }

            function findOffset(element) {
                var pos = new Object();
                pos.left = pos.top = 0;
                if (element.offsetParent)
                {
                    do
                    {
                        pos.left += element.offsetLeft;
                        pos.top += element.offsetTop;
                    } while (element = element.offsetParent);
                }
                return pos;
            }

            var findConnectors = function(comp){
                var connectors = [];
                if(comp.connectors){
                    for(var c = 0; c < comp.connectors.length; c++){
                        var connector = comp.connectors[c];
                        connectors.push(connector);
                    }
                }
                if(comp.children){
                    for(var c = 0; c < comp.children.length; c++){
                        var child = comp.children[c];
                        var childConnectors = findConnectors(child);
                        for(var s = 0; s < childConnectors.length; s++){
                            connectors.push(childConnectors[s]);
                        }
                    }
                }
                return connectors;
            }

            var connectors = findConnectors(comp);
            for(var c = 0; c < connectors.length; c++){
                var connector = connectors[c];
                var xyPosition = toScreenXY(connector.position, self.viewer.camera, self.viewer.renderer.domElement);
                var div = $(ConnectorTemplate);
                div.data('connector', connector);
                div.on('click', function(){
                    var connector = $(this).data('connector');
                    self.viewer.focusTo(connector.component);
                    new ConnectorMenu({
                        connector: connector,
                        overlay: self
                    }).show();
                });
                div.css('left', xyPosition.x);
                div.css('top', xyPosition.y);
                self.element.append(div);
            }
        };

        initialize();
    }
    ConnectorOverlay.prototype = ViewerOverlay.prototype;
    return ConnectorOverlay;
})