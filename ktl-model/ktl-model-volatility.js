(function(){

	var K = require("../k/k");
	var merge = K.merge;
	var kv$ = K.kv$;

	var K_ITERATOR = require("../k/k-iterator");
	var object_ = K_ITERATOR.object_;
	var array_ = K_ITERATOR.array_;

	var KTL_STAT = require("../ktl-stat/ktl-stat");
	var percents = KTL_STAT.percents;

	var KTL_STAT_VOL = require("../ktl-stat/ktl-stat-vol");
	var hvc2c = KTL_STAT_VOL.hvc2c;

	function volatilityCone(datas,terms,poss){
		return array_(terms).map_(function(term){
			return kv$(term,percents(object_(datas).map_(function(kv){
				return hvc2c(kv._,term).vals;
			}).toArray(),poss));
		}).toObject();
	}

	merge(exports,{
		volatilityCone: volatilityCone
	});

})();