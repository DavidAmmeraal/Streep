define(function(){
	var ColorDialog = function(options){
		var self = this;
		this.comp = null;
		this.viewer = null;
		this.html = $('#colordialog_template').children().first().clone();
		this.colorinput = this.html.find('input');
		
		$.extend(self, options);
		
		var initialize = function(){
			self.html.dialog();
            console.log(self.colorinput[0]);
			self.colorinput.on('change', function(){
                console.log("color changed!");
				self.comp.setColor(self.colorinput.val());
			});
		};
		
		initialize();
	};
	return ColorDialog;
});