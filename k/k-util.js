(function(){

	var K = require("./k");
	var merge = K.merge;

	function insure(x,def){
		return x===undefined?def:x;
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
		insure: insure,
		array$: array$,
		object$: object$,
		upsert$: upsert$
	});

})();