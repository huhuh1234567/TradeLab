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


	function print2(v,plex,nop,prefix,suffix){
		return prefix+print(v*plex,nop)+suffix;
	}


	function displayBasic(vss,plex,nop,prefix,suffix){
		var count = 0;
		var sum = 0;
		var sum2 = 0;
		array_(vss).foreach(function(vs){
			array_(vs).foreach(function(v){
				if(!isNaN(v)){
					count++;
					sum += v;
					sum2 += v*v;
				}
			});
		});
		console.error("avg="+print2(sum/count,plex,nop,prefix,suffix));
		console.error("sd="+print2(Math.sqrt((sum2-sum*sum/count)/(count-1)),plex,nop,prefix,suffix));
	}

	function displayStat(vss,n,poss,plex,nop,prefix,suffix,sep){
		//histo
		var histo = histogram(vss,n);
		var min = histo.min;
		var max = histo.max;
		var gap = (max-min)/n;
		console.error("histo"+sep+count_(n+1).map_(function(i){
			return print2((min+gap*i),plex,nop,prefix,suffix);
		}).toArray().join(sep));
		console.error(sep+histo.histo.join(sep));
		//percents
		var ivpcs = percents(vss,poss);
		console.error("p-cents"+sep+poss.join(sep));
		console.error(sep+array_(ivpcs).map_(function(v){
			return print2(v,plex,nop,prefix,suffix);
		}).toArray().join(sep));
	}

	merge(exports,{
		displayBasic: displayBasic,
		displayStat: displayStat
	});

})();