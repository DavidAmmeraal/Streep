define([
    '../viewer-overlay',
    'text!/javascripts/components/renderer/gui/overlay/indicator-overlay/templates/indicator-overlay-template.html'
], function(
    ViewerOverlay,
    IndicatorOverlayTemplate
){
    var IndicatorOverlay = function(options){
        ViewerOverlay.apply(this, arguments);
    }
    IndicatorOverlay.prototype = ViewerOverlay.prototype;
    IndicatorOverlay.template = _.template(IndicatorOverlayTemplate);
    IndicatorOverlay.prototype.render = function(){
        this.renderIndicators();
    };
    IndicatorOverlay.prototype.hide = function(){
        this.element.hide();
    };
    IndicatorOverlay.prototype.show = function(){
        this.element.show();
    }
    IndicatorOverlay.prototype.renderIndicators = function(){
        var self = this;
        this.element.find('.indicator').remove();

        var comps = this.viewer.getComponents();

        function toScreenXY( position, camera, div ) {
            var pos = position.clone();
            var projScreenMat = new THREE.Matrix4();
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
                do
                {
                    pos.left += element.offsetLeft;
                    pos.top += element.offsetTop;
                } while (element = element.offsetParent);
            }
            return pos;
        }

        for(var c = 0; c < comps.length; c++){
            var comp = comps[c];
            var xyPosition = toScreenXY(comp.indicator, self.viewer.camera, self.viewer.renderer.domElement);

            var div = $("<div class='indicator'>+</div>");
            div.css('left', xyPosition.x);
            div.css('top', xyPosition.y);
            div.data('component', comp);

            div.on('click', function(){
                self.viewer.focusTo($(this).data('component'));
            });

            self.element.append(div);
        }
    };
    return IndicatorOverlay;
})