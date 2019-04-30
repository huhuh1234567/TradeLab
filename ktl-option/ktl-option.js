(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var KTL = require("../ktl/ktl");
	var ytm = KTL.ytm;

	function moneyness(k,s,cp){
		return cp*(s-k);
	}

	function ___impliedStockRate(pc,pp,s,k,ytm){
		return -Math.log((s-pc+pp)/k)/ytm;
	}

	function ___impliedFutureRate(pc,pp,f,k,ytm){
		return -Math.log((pp-pc)/(k-f))/ytm;
	}

	function ___impliedStockPrice(pc,pp,k,r,ytm){
		return pc-pp+k*Math.exp(-r*ytm);
	}

	function ___impliedFuturePrice(pc,pp,k,r,ytm){
		return (pc-pp)*Math.exp(r*ytm)+k;
	}

	function impliedStockRate(pc,pp,s,k,day,mday){
		return ___impliedStockRate(pc,pp,s,k,ytm(day,mday));
	}

	function impliedFutureRate(pc,pp,f,k,day,mday){
		return ___impliedFutureRate(pc,pp,f,k,ytm(day,mday));
	}

	function impliedStockPrice(pc,pp,k,r,day,mday){
		return ___impliedStockPrice(pc,pp,k,r,ytm(day,mday));
	}

	function impliedFuturePrice(pc,pp,k,r,day,mday){
		return ___impliedFuturePrice(pc,pp,k,r,ytm(day,mday));
	}

	merge(exports,{

		moneyness: moneyness,

		___impliedStockRate: ___impliedStockRate,
		___impliedFutureRate: ___impliedFutureRate,
		___impliedStockPrice: ___impliedStockPrice,
		___impliedFuturePrice: ___impliedFuturePrice,

		impliedStockRate: impliedStockRate,
		impliedFutureRate: impliedFutureRate,
		impliedStockPrice: impliedStockPrice,
		impliedFuturePrice: impliedFuturePrice
	});

})();