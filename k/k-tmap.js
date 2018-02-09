(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_ITERATOR = require("./k-iterator");
	var Iterator = K_ITERATOR.Iterator;

	function TMapNode(key,value){
		this.key = key;
		if(value!==undefined){
			this.value = value;
		}
	}

	function TMap(comparator){
		this.___comp = comparator;
	}

	merge(TMap.prototype,{
		put: function(key,value){
			var $ = new TMapNode(key,value);
		}
	});

})();