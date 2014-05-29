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
            console.log("ComponentContext.remove()");
			var comps = self.get('components');
			comps.splice(comps.indexOf(comp), 1);
			self.set('components', comps);
            comp.remove();
		};

        this.empty = function(){
            self.set('components', []);
            self.updateObservers();
        }
	};
	ComponentContext.prototype = Object.create(new Observable());
	return ComponentContext;
});
