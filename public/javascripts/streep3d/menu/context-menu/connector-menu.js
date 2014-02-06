define(['menu/context-menu/context-menu', 'menu/dialog/object-engrave-dialog', 'menu/dialog/text-engrave-dialog'], function(ContextMenu, ObjectEngraveDialog, TextEngraveDialog){
	var ConnectorMenu = function(options){
		ContextMenu.apply(this, arguments);
		var self = this;
		
		var menuFunctions = [];
		var createMenu = function(){
			var menu = [];
			
			var menuFunctions = [];
			
			for(var i = 0; i < self.connector.modifications.length; i++){
				(function(x){
					var mod = self.connector.modifications[x];
					menu.push({
						label: mod.readable,
						action: function(){
							getDialog(mod);
						}
					});
				})(i);
			}
			
			menu.push({
				label: "Reset",
				action: self.connector.reset
			});
			
			return menu;
		};
		
		var getDialog = function(mod){
			if(mod.objects){
				new ObjectEngraveDialog(mod);
			}else{
				new TextEngraveDialog(mod);
			}
		};
		
		self.items = createMenu();
	};

	ConnectorMenu.prototype = ContextMenu.prototype;
	ConnectorMenu.prototype.getItems = function(){
		return this.items;
	};
	return ConnectorMenu;
});