define(['menu/context-menu/connector-menu', 'menu/context-menu/component-menu', 'component/connector/connector'], function(ConnectorMenu, ComponentMenu, Connector){
	var MenuFactory = {
		createMenu: function(obj){
			if(obj instanceof Connector){
				return new ConnectorMenu({connector: obj}).getItems();
			}else{
				return new ComponentMenu({component: obj}).getItems();
			}
		}
	};
	return MenuFactory;
});