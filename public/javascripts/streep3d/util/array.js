define(function(){
	var ArrayUtils = {
		invokeOnChildren: function(target, fn, args){
			if(args !instanceof Array){
				args = [args];
			}
			for(var i = 0; i < target.length; i++){
				var child = target[i];
				child[fn].apply(args);
				target[i][fn].apply(child, args);
			}
		}
	}
	return ArrayUtils;
};
