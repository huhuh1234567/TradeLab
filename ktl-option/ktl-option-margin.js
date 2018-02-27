(function(){

	var K = require("../k/k");
	var merge = K.merge;

	function marginOption(p, f, k, r, d){
		var mf = f* r;
		return Math.max(p + mf - Math.max(d * (k - f), 0) * 0.5, p + mf * 0.5);
	}

	function marginCovered(p,f,r){
		return p+f*r;
	}

	function marginStrangle(pc,pp,f,kc,kp,r){
		var mc = marginOption(pc,f,kc,r,1);
		var mp = marginOption(pp,f,kp,r,-1);
		return mc<mp?mp+pc:mc+pp;
	}

	function marginStraddle(pc,pp,f,k,r){
		return marginStrangle(pc,pp,f,k,k,r);
	}

	merge(exports,{
		marginOption: marginOption,
		marginCovered: marginCovered,
		marginStrangle: marginStrangle,
		marginStraddle: marginStraddle
	});

})();