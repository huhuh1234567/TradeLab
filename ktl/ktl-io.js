(function(){

	var fs = require("fs");

	var K = require("../k/k");
	var merge = K.merge;

	var K_UTIL = require("../k/k-util");
	var object$ = K_UTIL.object$;
	var upsert$ = K_UTIL.upsert$;

	var K_ITERATOR = require("../k/k-iterator");
	var object_ = K_ITERATOR.object_;
	var array_ = K_ITERATOR.array_;

	var AVLTree = require("../k/k-avltree").AVLTree;

	var FileLineIterator = require("../k/k-file-line-iterator").FileLineIterator;

	var KTL_DATE = require("../ktl/ktl-date");
	var parseDate = KTL_DATE.parseDate;
	var date2offset = KTL_DATE.date2offset;

	var Data = require("../ktl/ktl-data").Data;

	var DCE_NAME_CODE = [
		["豆一","A"],
		["豆二","B"],
		["胶合板","BB"],
		["玉米","C"],
		["玉米淀粉","CS"],
		["纤维板","FB"],
		["铁矿石","I"],
		["焦炭","J"],
		["鸡蛋","JD"],
		["焦煤","JM"],
		["聚乙烯","L"],
		["豆粕","M"],
		["棕榈油","P"],
		["聚丙烯","PP"],
		["聚氯乙烯","V"],
		["豆油","Y"],
	];

	var DCE_NAME_MAP = new AVLTree(function(l,r){
		return l[0]===r[0]?0:l[0]<r[0]?-1:1;
	});
	array_(DCE_NAME_CODE).foreach(function(v){
		DCE_NAME_MAP.put(v);
	});

	function upsert(dst,offset,src){
		object_(src).foreach(function(kv){
			upsert$(dst,kv[0],function(){
				return new Data(offset,kv[1]);
			},function(d){
				d.update(offset,kv[1]);
			});
		});
	}

	function combine(dst,src){
		object_(src).foreach(function(kv){
			var d = upsert$(dst,kv[0],function(){
				return new Data();
			});
			d.update(kv[1].offset,kv[1].data);
		});
	}

	function combineAll(dst,src){
		object_(src).foreach(function(tag_smms){
			var dmms = object$(dst,tag_smms[0]);
			object_(tag_smms[1]).foreach(function(mm_sdds){
				var ddds = object$(dmms,mm_sdds[0]);
				combine(ddds,mm_sdds[1]);
			});
		});
	}

	function loadDceFutureData(path,date){

		var rst = {};

		var offset = date2offset(date);
		
		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(/\s+/);
			var name_code = DCE_NAME_MAP.find([vs[0],""]);
			if(name_code!==undefined){
				upsert(object$(object$(rst,name_code[1]),vs[1]),offset,{
					open: parseFloat(vs[2].replace(/,/g,"")),
					high: parseFloat(vs[3].replace(/,/g,"")),
					low: parseFloat(vs[4].replace(/,/g,"")),
					close: parseFloat(vs[5].replace(/,/g,"")),
					settle: parseFloat(vs[7].replace(/,/g,"")),
					vol: parseFloat(vs[10].replace(/,/g,"")),
					oi: parseFloat(vs[11].replace(/,/g,""))
				});
			}
		});

		return rst;
	}

	function loadDceFutureDataAll(path){

		var rst = {};

		array_(fs.readdirSync(path)).foreach(function(fn){
			var name_suffix = fn.split(/\./);
			if(name_suffix[1]==="txt"){
				var tag_type_date = name_suffix[0].split(/_/);
				var date = parseDate(tag_type_date[2]);
				combineAll(rst,loadDceFutureData(path+"/"+fn,date))
			}
		});

		return rst;
	}

	merge(exports,{
		loadDceFutureData: loadDceFutureData,
		loadDceFutureDataAll: loadDceFutureDataAll
	});

})();