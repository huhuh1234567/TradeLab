(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var KTL_STAT_MOV = require("./ktl-stat-move");
	var moveSum_ = KTL_STAT_MOV.moveSum_;
	var moveMerge_ = KTL_STAT_MOV.moveMerge_;

	var Data = require("../ktl/ktl-data").Data;

	var KTL = require("../ktl/ktl");
	var DAY_OF_YEAR = KTL.DAY_OF_YEAR;

	var Gamma = require("../k-math/k-math-special-gamma").Gamma;

	var SQRT_DOY = Math.sqrt(DAY_OF_YEAR);

	function hvc2c(data,n,modify){
		var rst = new Data();
		var rate = modify?Math.sqrt(2.0/n)*Gamma.gamma(n*0.5)/Gamma.gamma((n-1)*0.5):Math.sqrt(n/(n-1));
		var last = Number.NaN;
		moveSum_(data._().map_(function(kv){
			var rst = Number.NaN;
			var val = kv._;
			if(!isNaN(val)){
				if(!isNaN(last)){
					rst = Math.log(val/last);
				}
				last = val;
			}
			kv._ = rst;
			return kv;
		}),n,function(v){
			return v*v;
		},function(sum){
			return Math.sqrt(sum/n)*SQRT_DOY*rate;
		}).foreach(function(kv){
			if(!isNaN(kv._)){
				rst.update(kv.$,kv._);
			}
		});
		return rst;
	}

	merge(exports,{
		hvc2c: hvc2c
	});

})();