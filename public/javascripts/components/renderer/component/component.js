define(function(){
    var Component = function(){};
	Component.prototype = {
        positioning: [],
        loaded: false,
        parent: null,
        load: function(){
            this.loaded = true;
            $(this).trigger('loaded', this);
        },
        focus: function(){
            this.trigger('request-focus');
        },
        trigger: function(eventname, requester, data){
            console.log("Component.prototype.trigger()")
            if(this.parent != null){
                this.parent.trigger(eventname, requester, data);
            }else{
                $(this).trigger(eventname, requester, data);
            }
        }
    };

	return Component;
	
});