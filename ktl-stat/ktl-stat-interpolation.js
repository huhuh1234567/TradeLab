(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;

	var KTL_DATA = require("../ktl/ktl-data");
	var Data = KTL_DATA.Data;

	function linearInterpolation(data){
		var offset0 = 0;
		var offset1 = 0;
		var val0 = Number.NaN;
		var val1 = Number.NaN;
		var rst = new Data();
		data._().foreach(function(kv){
			var offset = kv.$;
			var val = kv._;
			if(!isNaN(val)){
				rst.update(offset,val);
				if(isNaN(val0)){
					offset0 = offset;
					val0 = val;
				}
				else{
					if(!isNaN(val1)){
						offset0 = offset1;
						val0 = val1;
					}
					offset1 = offset;
					val1 = val;
					if(offset1-offset0>1){
						var slope = (val1-val0)/(offset1-offset0);
						count_(offset1-offset0-1).foreach(function(i){
							var o = offset0+i+1;
							var v = val0+slope*(i+1);
							rst.update(o,v);
						});
					}
				}
			}
		});
		return rst;
	}

	merge(exports,{
		linearInterpolation: linearInterpolation
	});

})();