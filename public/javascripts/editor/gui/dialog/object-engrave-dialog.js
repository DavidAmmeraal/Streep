define(function(){
	var ObjectEngraveDialog = function(mod){
		var self = this;
		this.mod = null;
		this.html = $('#engraveobjectdialog_template').children().first().clone();
		this.optionsContainer = this.html.find('.options');
		this.objectTemplate = this.html.find('.template').clone();
		this.submitButton = this.html.find('button.submit');
		
		var initialize = function(){
			self.mod = mod;
			
			createObjects();
			
			self.html.dialog();	
			self.submitButton.on('click', function(){
				self.html.dialog('close');
				self.mod.execute(self.html.find('input[name="engraveobject"]:radio:checked').data('csgobject'));
			});
		};
		
		var createObjects = function(){
			self.html.find('.template').remove();
			var objects = mod.getObjects();
			for(var i = 0; i < objects.length; i++){
				var template = self.objectTemplate.clone();
				var object = objects[i];
				template.find('label').text(object.readable);
				template.find('input').data('csgobject', object);
				template.find('input').attr('value', object.name);
				
				if(i == 0){
					template.find('input').attr('checked', 'checked');
				}
				self.optionsContainer.append(template);
			}
		};
		
		initialize();
	};
	return ObjectEngraveDialog;
});