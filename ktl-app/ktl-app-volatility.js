(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;
	var array_ = K_ITERATOR.array_;

	var KTL = require("../ktl/ktl")
	var print = KTL.print;
	
	var KTL_STAT = require("../ktl-stat/ktl-stat");
	var percents = KTL_STAT.percents;
	var histogram = KTL_STAT.histogram;

	function displayVolStat(vss,n,poss,sep){
		//histo
		var histo = histogram(vss,n);
		var min = histo.min;
		var max = histo.max;
		var gap = (max-min)/n;
		console.error("histo"+sep+count_(n+1).map_(function(i){
			return print((min+gap*i)*100.0,2)+"%";
		}).toArray().join(sep));
		console.error(sep+histo.histo.join(sep));
		//percents
		var ivpcs = percents(vss,poss);
		console.error("p-cents"+sep+poss.join(sep));
		console.error(sep+array_(ivpcs).map_(function(v){
			return print(v*100.0,2)+"%";
		}).toArray().join(sep));
	}

	merge(exports,{
		displayVolStat: displayVolStat
	});

})();