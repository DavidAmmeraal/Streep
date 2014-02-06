define(function(){
	var Observable = function(){
		
		this.properties = {};
		this.observers = [];
		this.changed = [];
		
		this.updateObservers = function(){
			$(this).trigger('changed', this.changed);
		};
		
		this.set = function(prop, val){
			this.properties[prop] = val;
			this.changed[prop] = val;
		};
		
		this.remove = function(prop){
			delete this.properties[prop];
			delete this.changed[prop];
		};
		
		this.get = function(prop){
			return this.properties[prop];
		};
		
	};
	return Observable;
});
