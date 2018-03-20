(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var array_ = K_ITERATOR.array_;

	var Data = require("../ktl/ktl-data").Data;

	function moveCollect_(data_,period,map,reduce){
		var lasts = [];
		return data_.map_(function(kv){
			var rst = Number.NaN;
			var val = kv._;
			if(!isNaN(val)){
				lasts.push(map(val));
				if(period<lasts.length){
					lasts.shift();
				}
				if(period===lasts.length){
					rst = reduce(lasts);
				}
			}
			kv._ = rst;
			return kv;
		});
	}

	function moveMerge_(data_,op){
		var a = Number.NaN;
		return data_.map_(function(kv){
			var rst = Number.NaN;
			var val = kv._;
			if(!isNaN(val)){
				a = op(val,a);
				rst = a;
			}
			kv._ = rst;
			return kv;
		});
	}

	function moveSum_(data_,period,map,reduce){
		var sum = 0;
		var lasts = [];
		return data_.map_(function(kv){
			var rst = Number.NaN;
			var val = kv._;
			if(!isNaN(val)){
				if(map!==undefined){
					val = map(val);
				}
				lasts.push(val);
				sum += val;
				if(period<lasts.length){
					sum -= lasts[0];
					lasts.shift();
				}
				if(period===lasts.length){
					rst = reduce(sum);
				}
			}
			kv._ = rst;
			return kv;
		});
	}

	function ma(data,period){
		var rst = new Data();
		moveSum_(data._(),period,function(v){
			return v;
		},function(sum){
			return sum/period;
		}).foreach(function(kv){
			if(!isNaN(kv._)){
				rst.update(kv.$,kv._);
			}
		});
		return rst;
	}

	function sma(data,p0,p1){
		var rst = new Data();
		moveMerge_(data._(),function(val,sum){
			return isNaN(sum)?val:w0*a+w1*val;
		}).foreach(function(kv){
			if(!isNaN(kv._)){
				rst.update(kv.$,kv._);
			}
		});
		return rst;
	}

	function ema(data,p){
		return sma(data,p-1,2);
	}

	merge(exports,{

		moveCollect_,
		moveMerge_,
		moveSum_,
		
		ma: ma,
		sma: sma,
		ema: ema
	});

})();