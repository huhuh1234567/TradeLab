(function(){

	var K = require("../k/k");
	var merge = K.merge;
	var kv$ = K.kv$;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;
	var array_ = K_ITERATOR.array_;

	var K_UTIL = require("../k/k-util");
	var comp$ = K_UTIL.comp$;

	var AVLTree = require("../k/k-avltree").AVLTree;

	function histogram(valss,n){
		var min = Number.NaN;
		var max = Number.NaN;
		var histo = count_(n).map_(function(){
			return 0;
		}).toArray();
		if(valss.length>0){
			array_(valss).flatMap_(function(vals){
				return array_(vals);
			}).foreach(function(v){
				if(!isNaN(v)){
					if(isNaN(min)||v<min){
						min = v;
					}
					if(isNaN(max)||max<v){
						max = v;
					}
				}
			});
			if(!isNaN(min)&&!isNaN(max)){
				var gap = (max-min)/n;
				array_(valss).flatMap_(function(vals){
					return array_(vals);
				}).foreach(function(v){
					if(!isNaN(v)){
						var index = Math.floor((v-min)/gap);
						if(index>=n){
							index = n-1;
						}
						histo[index]++;
					}
				});
			}
		}
		return {
			min: min,
			max: max,
			histo: histo
		};
	}

	function percents(valss,poss){
		
		var vset = new AVLTree();
		array_(valss).flatMap_(function(vals){
			return array_(vals);
		}).foreach(function(v){
			if(!isNaN(v)){
				vset.put(v);
			}
		});
		var vlen = vset.size;

		var plen = poss.length;
		var pset = new AVLTree(comp$);
		count_(plen).foreach(function(i){
			var index = Math.round(vlen*poss[i]*0.01);
			index = index<0?0:index>=vlen?vlen-1:index;
			var pos = pset.find(kv$(index));
			if(pos===undefined){
				pos = kv$(index,[]);
				pset.put(pos);
			}
			pos._.push(i);
		});

		var count = 0;
		var rst = new Array(plen);
		vset._().foreach(function(v){
			var pos = pset.find(kv$(count));
			if(pos!==undefined){
				array_(pos._).foreach(function(i){
					rst[i] = v;
				});
			}
			count++;
		});
		return rst;
	}

	merge(exports,{
		histogram: histogram,
		percents: percents
	});

})();