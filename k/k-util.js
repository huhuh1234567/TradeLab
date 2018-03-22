(function(){

	var K = require("./k");
	var merge = K.merge;

	function comp$(l,r){
		return l.$<r.$?-1:l.$===r.$?0:1;
	};

	function insure(x,def){
		return x===undefined?def:x;
	}

	function Set(keys){
		for(var i=0; i<keys.length; i++){
			this[keys[i]] = true;
		}
	}

	function array$(p,k){
		var pk = p[k];
		if(pk===undefined){
			pk = [];
			p[k] = pk;
		}
		return pk;
	}

	function object$(p,k){
		var pk = p[k];
		if(pk===undefined){
			pk = {};
			p[k] = pk;
		}
		return pk;
	}

	function upsert$(p,k,cf,uf){
		var pk = p[k];
		if(pk===undefined){
			pk = cf();
			p[k] = pk;
		}
		else{
			if(uf!==undefined){
				uf(pk);
			}
		}
		return pk
	}

	merge(exports,{

		comp$: comp$,

		insure: insure,

		Set: Set,

		array$: array$,
		object$: object$,
		upsert$: upsert$
	});

})();