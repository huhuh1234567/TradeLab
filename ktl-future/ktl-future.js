(function(){
	
	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var array_ = K_ITERATOR.array_;

	var K_UTIL = require("../k/k-util");
	var kv = K_UTIL.kv;
	var Set = K_UTIL.Set;

	var KTL_DATE = require("../ktl/ktl-date");
	var DateFormat = KTL_DATE.DateFormat;
	var date2offset = KTL_DATE.date2offset;

	var DF_YMD = new DateFormat("yyyyMMdd");

	function findSeries(db,c,mms,type,nd,fd){
		var mmSet = new Set(mms);
		return array_(db.names()).map_(function(name){
			var rst = null;
			var vs = name.split("_");
			if(vs.length===3&&vs[0]===c&&vs[2]===type){
				var mym = vs[1];
				var mm = mym.substring(mym.length-2);
				if(mmSet[mm]){
					rst = kv(name,nd!==undefined&&fd!==undefined?db.load(name,date2offset(DF_YMD.parse(mym+"01"))-fd,fd-nd+1):db.load(name));
				}
			}
			return rst;
		}).filter_(function(kv){
			return kv!==null;
		}).toObject();
	}

	merge(exports,{
		findSeries: findSeries
	});

})();