(function(){

	function merge(base,other){
		for(p in other){
			var v = other[p];
			if(v!==undefined){
				base[p] = v;
			}
			else{
				delete base[p];
			}
		}
		return base;
	}

	exports.merge = merge;

})();