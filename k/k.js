(function(){

	function merge(base,other){
		for(p in other){
			base[p] = other[p];
		}
		return base;
	}

	function kv$(k,v){
		var r = {
			$: k
		};
		if(v!==undefined){
			r._ = v;
		}
		return r;
	}

	merge(exports,{
		merge: merge,
		kv$: kv$
	});

})();