define(['menu/component-tree'], function(ComponentTree){
	var Menu = function(context){
		var self = this;
		
		this.element = $('#menu');
		this.context = context;
		this.tree = new ComponentTree(context);
	};
	return Menu;
});