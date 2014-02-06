define(['menu/context-menu/menu-factory', 'component/parent-component', 'component/leaf-component', 'menu/dialog/color-dialog'], function(MenuFactory, ParentComponent, LeafComponent, ColorDialog){
	var ComponentTree = function(context){
		var self = this;
		this.context = context;
		this.components = {};
		this.element = $('#streep3d #tree');
		
		var initialize = function(){
			createTree();
			$(this.context).on('changed', createTreeHTML);
		};
		
		var createTree = function(){
			createTreeHTML();
			
			self.element.jstree({
				"core" : { "initially_open" : [ "root" ] },
	       		"plugins" : [ "themes", "html_data", "contextmenu" ],
	       		"contextmenu": {
			        "items": function ($node) {
			        	var obj = $node.data('streep3d-comp');
			        	return MenuFactory.createMenu(obj);
			        }
	    		}
	
	    	}).bind('loaded.jstree', function(event, data){
	    		$(this).jstree("open_all");
	    		setupContextMenu();
	    	});
		};
		
		var createTreeHTML = function(comp, parent){
			var comps = null;
			if(!comp){
				comps = self.context.get('components');
			}else{
				comps = comp.children;
			}
			
			if(!parent){
				parent = self.element;
				parent.append('<ul></ul>');
			}
			
			for(var key in comps){
				var element = null;
				var comp = comps[key];
				if(comp instanceof ParentComponent){
					element = $("<li><a href=\"#\">" + comp.name + "</a><ul></ul></li>");
					element.data('streep3d-comp', comp);
					createTreeHTML(comp, element);
				}else if(comp instanceof LeafComponent){
					element = $("<li><a href=\"#\">" + comp.name + "</a></li>");
					element.data('streep3d-comp', comp);
					for(var conKey in comp.connectors){
						var connector = comp.connectors[conKey];
						var conElement = $("<li><a href=\"#\" class=\"connector\">" + connector.name + "</a></li>");
						conElement.data('streep3d-comp', connector);
						element.append(conElement);
					}
				}
				parent.find('ul').append(element);
			}
		};
		
		var setupContextMenu = function(){
			self.element.find('a').on('click', function(event){
				setCameraTo($(this).parent().data('streep3d-comp'));
				event.stopPropagation();
			});
		};
		
		var setCameraTo = function(comp){
			comp.focus();
		};
		
		var color = function(node){
			var connector = node.data('streep3d-comp');
			new ColorDialog({connector: connector});
		};
		initialize();
		
	};
	return ComponentTree;
});