define(['menu/context-menu/context-menu', 'exporter/stl-exporter', 'menu/dialog/color-dialog'], function(ContextMenu, STLExporter, ColorDialog){
	var ComponentMenu = function(options){
		ContextMenu.apply(this);
		this.items = {
			'properties': {
				'label': 'Properties',
				'action': function(node){
					properties(node);
				}
			},
			'export': {
				'label': 'Export STL',
				'action': function(node){
					var comp = node.data('streep3d-comp');
					new STLExporter().export(comp);
				}
			},
			'color': {
				'label': 'Color',
				'action': function(node){
					var comp = node.data('streep3d-comp');
					new ColorDialog({comp: comp});
				}
			},
			'remove': {
				'label': 'Remove',
				'action': function(node){
					remove(node);
				}
			}
		};
	};

	ComponentMenu.prototype = ContextMenu.prototype;
	ComponentMenu.prototype.getItems = function(){
		return this.items;
	};

	return ComponentMenu;
});
