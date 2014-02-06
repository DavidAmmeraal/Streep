define(function(){
	return {
		test: function(){
			try {
	        	return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
	    	} catch(e) {
	        	return false;
	    	}
		}
	};
});

