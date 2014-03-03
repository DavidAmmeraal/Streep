define(['./util/observable'], function(Observable){
	var ComponentContext = function(options){
		var self = this;
		this.properties = {
			'components': []
		};
		
		this.add = function(comp){
			var comps = self.get('components');
			comps.push(comp);
			self.set('components', comps);
			self.updateObservers();
		};
		
		this.remove = function(comp){
			var comps = self.get('components');
			comps.splice(comps.indexOf(comp), 0);
			self.set('components', comp);		
			self.updateObservers();
		};
	};
	ComponentContext.prototype = new Observable();
	return ComponentContext;
});
