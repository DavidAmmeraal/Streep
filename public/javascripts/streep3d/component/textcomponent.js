define(['component/leaf-component'], function(LeafComponent){
	var TextComponent = function(){
		$.extend(this, arguments[0]);
	};
	TextComponent.prototype = Object.create(LeafComponent.prototype);
    TextComponent.prototype.text = null;
    TextComponent.prototype.size = null;
    TextComponent.prototype.height = null;
    TextComponent.prototype.curveSegments = 2;
    TextComponent.prototype.weight = "normal";
    TextComponent.prototype.style = "normal";
    TextComponent.prototype.load = function(){
        var self = this;
        this.geo = new THREE.TextGeometry(self.text, {
            size: self.size,
            height: self.height,
            curveSegments: self.curveSegments,
            weight: self.weight,
            style: self.style
        });
        this.createMesh();
        this.loaded = true;
        $(this).trigger('loaded', this);
    };
	return TextComponent;
});