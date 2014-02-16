define(function(){
	var TextEngraveDialog = function(mod){
		var self = this;
		this.mod = null;
		this.html = $('#engravetextdialog_template').children().first().clone();
		this.textInput = this.html.find('input[name="engravetext"]');
        this.fontInput = this.html.find('select[name="engravefont"]');
		this.submitButton = this.html.find('button.submit');
		
		var initialize = function(){
			self.mod = mod;
			self.html.dialog();	
			self.submitButton.on('click', function(){
				self.html.dialog('close');
				self.mod.setText(self.textInput.val(), self.fontInput.val(), 8);
				self.mod.execute();
			});
		};
		
		initialize();
	};
	return TextEngraveDialog;
});