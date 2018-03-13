(function(){
	
	var K = require("../k/k");
	var merge = K.merge;

	var KTL = require("../ktl/ktl");
	var ytm = KTL.ytm;

	function ___stockNoArbitrageRate(pc,pp,s,k,ytm){
		return -Math.log((s-pc+pp)/k)/ytm;
	}

	function ___futureNoArbitrageRate(pc,pp,f,k,ytm){
		return -Math.log((pp-pc)/(k-f))/ytm;
	}

	function stockNoArbitrageRate(pc,pp,s,k,day,mday){
		return -Math.log((s-pc+pp)/k)/ytm(day,mday);
	}

	function futureNoArbitrageRate(pc,pp,f,k,ytm){
		return -Math.log((pp-pc)/(k-f))/ytm(day,mday);
	}

	merge(exports,{
		___stockNoArbitrageRate: ___stockNoArbitrageRate,
		___futureNoArbitrageRate: ___futureNoArbitrageRate,
		stockNoArbitrageRate: stockNoArbitrageRate,
		futureNoArbitrageRate: futureNoArbitrageRate
	});

})();