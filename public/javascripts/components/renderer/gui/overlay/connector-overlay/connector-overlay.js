define([
    '../viewer-overlay'
], function(
    ViewerOverlay
 ){
    var ConnectorOverlay = function(options){
        console.log("ConnectorOverlay()");
        ViewerOverlay.apply(this, arguments);
    }
    ConnectorOverlay.prototype = ViewerOverlay.prototype;
    ConnectorOverlay.prototype.currentComp = null;
    ConnectorOverlay.prototype.getSelectedComp = function(){
        _.find(this.currentComp.connectors, function(connector){
            return connector.selected;
        });
    };
    ConnectorOverlay.prototype.focus = function(comp){
        this.currentComp = comp;
        this.renderConnectors();
    };
    ConnectorOverlay.prototype.render = function(){
        this.element.is(':visible') && this.renderConnectors();
    };
    ConnectorOverlay.prototype.renderConnectors = function(){
        var self = this;
        var comp = this.currentComp;
        self.element.find('.indicator').remove();

        function toScreenXY( position, camera, div ) {
            var pos = position.clone();
            projScreenMat = new THREE.Matrix4();
            projScreenMat.multiplyMatrices(self.viewer.camera.projectionMatrix, camera.matrixWorldInverse );
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
                do{
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
                    if(!connector.used)
                        connectors.push(connector);
                }
            }
            if(comp.children){
                for(var c = 0; c < comp.children.length; c++){
                    var child = comp.children[c];
                    var childConnectors = findConnectors(child);
                    for(var s = 0; s < childConnectors.length; s++){
                        var connector = childConnectors[s];
                        if(!connector.used)
                            connectors.push(connector);
                    }
                }
            }
            return connectors;
        }

        var connectors = findConnectors(comp);
        for(var c = 0; c < connectors.length; c++){
            var connector = connectors[c];
            var xyPosition = toScreenXY(connector.position, self.viewer.camera, self.viewer.renderer.domElement);
            var div = $('<div class="indicator">&nbsp;</div>');

            if(connector.selected)
                div.addClass('selected');

            div.data('connector', connector);
            div.on('click', function(event){
                self.selectConnector.apply(self, [event])
            });
            div.css('left', xyPosition.x);
            div.css('top', xyPosition.y);
            self.element.append(div);
        }
    };
    ConnectorOverlay.prototype.selectConnector = function(event){
        var div = $(event.currentTarget);
        _.each(this.currentComp.connectors, function(connector){
           connector.selected = false;
        });

        var connector = div.data('connector');
        connector.selected = true;
        div.addClass('selected');
        $(connector).trigger('selected', connector);
    };

    return ConnectorOverlay;
})