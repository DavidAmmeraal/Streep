define(function(){
	var EngraveDialog = function(options){
		var self = this;
		this.comp = null;
		this.viewer = null;
		this.html = $('#engravedialog_template').children().first().clone();
		this.textinput = this.html.find('input[name="engravetext"]');
		this.button = this.html.find('button');
		
		$.extend(self, options);
		
		var initialize = function(){
			self.html.dialog();		
			self.button.on('click', handleClick);
		};
		
		var handleClick = function(){
			self.html.dialog('close');
			var selectedCategory = self.html.find('input[name="engravetype"]:checked').val();
			switch(selectedCategory){
				case "object":
					handleObjectChosen();
					break; 
				case "text":
					handleTextChosen();
					break; 
			}
		};
		
		var handleObjectChosen = function(){
			var selectedObject = self.html.find('input[name="engraveobject"]:checked').val();
			self.comp.engrave.apply(self.comp, ["spot", "object", {"name": selectedObject}]);
		};
		
		var handleTextChosen = function(){
			self.comp.engrave.apply(self.comp, ["spot", "text", {"text": self.textinput.val()}]);
		};
		
		initialize();
	};
	return EngraveDialog;
});

