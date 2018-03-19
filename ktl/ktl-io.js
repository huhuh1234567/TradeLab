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

	var K_MATH = require("../k-math/k-math");
	var div2 = K_MATH.div2;

	var KTL_DATE = require("../ktl/ktl-date");
	var DateFormat = KTL_DATE.DateFormat;
	var date2offset = KTL_DATE.date2offset;

	var Data = require("../ktl/ktl-data").Data;

	var DCE_NAME_CODE = [
		["豆一","a"],
		["豆二","b"],
		["胶合板","bb"],
		["玉米","c"],
		["玉米淀粉","cs"],
		["纤维板","fb"],
		["铁矿石","i"],
		["焦炭","j"],
		["鸡蛋","jd"],
		["焦煤","jm"],
		["聚乙烯","l"],
		["豆粕","m"],
		["棕榈油","p"],
		["聚丙烯","pp"],
		["聚氯乙烯","v"],
		["豆油","y"],
	];

	var DCE_NAME_MAP = new AVLTree(function(l,r){
		return l[0]===r[0]?0:l[0]<r[0]?-1:1;
	});
	array_(DCE_NAME_CODE).foreach(function(v){
		DCE_NAME_MAP.put(v);
	});

	var DF_Y_M_D = new DateFormat("yyyy-MM-dd");
	var DF_YMD = new DateFormat("yyyyMMdd");

	function formatMatureMonth(str,curr){
		var pos = str.length-2;
		var mm = str.substring(pos);
		var my = parseInt(str.substring(0,pos));
		var step = Math.pow(10,pos);
		var cy = div2(curr,step);
		var rst = cy[1]>=my?my+cy[0]:my+cy[0]-step;
		return rst+mm;
	}

	function upsertData(rst,name,offset,val){
		upsert$(rst,name,function(){
			return new Data(offset,val);
		},function(d){
			d.update(offset,val);
		});
	}

	function combineData(dst,src){
		object_(src).foreach(function(kv){
			var d = upsert$(dst,kv.$,function(){
				return new Data();
			});
			d.update(kv._.offset,kv._.data);
		});
	}

	function loadShiborCrawlData(path,type){

		var rst = {};
		
		new FileLineIterator(path).foreach(function(line){
			var vs = line.split("|");
			upsertData(rst,"shibor_"+type,date2offset(DF_Y_M_D.parse(vs[0])),parseFloat(vs[1])*0.01);
		});

		return rst;
	}

	function loadDceFutureCrawlData(path,date){

		var rst = {};

		var offset = date2offset(date);

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(/\s+/);
			var name_code = DCE_NAME_MAP.find([vs[0],""]);
			if(name_code!==undefined){
				var prefix = name_code[1]+"_"+vs[1];
				object_({
					open: parseFloat(vs[2].replace(/,/g,"")),
					high: parseFloat(vs[3].replace(/,/g,"")),
					low: parseFloat(vs[4].replace(/,/g,"")),
					close: parseFloat(vs[5].replace(/,/g,"")),
					settle: parseFloat(vs[7].replace(/,/g,"")),
					vol: parseFloat(vs[10].replace(/,/g,"")),
					oi: parseFloat(vs[11].replace(/,/g,"")),
					amount: parseFloat(vs[13].replace(/,/g,""))
				}).foreach(function(kv){
					upsertData(rst,prefix+"_"+kv.$,offset,kv._);
				});
			}
		});

		return rst;
	}

	function loadDceFutureCrawlDataAll(path){

		var rst = {};

		array_(fs.readdirSync(path)).foreach(function(fn){
			var name_suffix = fn.split(".");
			if(name_suffix[1]==="txt"){
				var tag_type_date = name_suffix[0].split("_");
				if(tag_type_date[1]==="0"){
					var date = DF_Y_M_D.parse(tag_type_date[2]);
					combineData(rst,loadDceFutureCrawlData(path+"/"+fn,date));
				}
			}
		});

		return rst;
	}

	function loadDceOptionCrawlData(path,date){

		var rst = {};

		var offset = date2offset(date);

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(/\s+/);
			var name_code = DCE_NAME_MAP.find([vs[0],""]);
			if(name_code!==undefined){
				var c = name_code[1];
				var issues = vs[1].split("-");
				var mm = issues[0].substring(c.length);
				var cp = issues[1].toLowerCase();
				var strike = issues[2];
				var prefix = [c,mm,cp,strike].join("_");
				object_({
					open: parseFloat(vs[2].replace(/,/g,"")),
					high: parseFloat(vs[3].replace(/,/g,"")),
					low: parseFloat(vs[4].replace(/,/g,"")),
					close: parseFloat(vs[5].replace(/,/g,"")),
					settle: parseFloat(vs[7].replace(/,/g,"")),
					vol: parseFloat(vs[11].replace(/,/g,"")),
					oi: parseFloat(vs[12].replace(/,/g,"")),
					amount: parseFloat(vs[14].replace(/,/g,"")),
					exercise: parseFloat(vs[15].replace(/,/g,""))
				}).foreach(function(kv){
					upsertData(rst,prefix+"_"+kv.$,offset,kv._);
				});
			}
		});

		return rst;
	}

	function loadDceOptionCrawlDataAll(path){

		var rst = {};

		array_(fs.readdirSync(path)).foreach(function(fn){
			var name_suffix = fn.split(".");
			if(name_suffix[1]==="txt"){
				var tag_type_date = name_suffix[0].split("_");
				if(tag_type_date[1]==="1"){
					var date = DF_Y_M_D.parse(tag_type_date[2]);
					combineData(rst,loadDceOptionCrawlData(path+"/"+fn,date));
				}
			}
		});

		return rst;
	}

	function loadDceFutureHistoryData(path){

		var rst = {};

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(",");
			var rn = parseInt(vs[0]);
			if(!isNaN(rn)){
				var cm = vs[1];
				var sep = cm.length-4;
				var c = cm.substring(0,sep);
				var mm = cm.substring(sep);
				var offset = date2offset(DF_YMD.parse(vs[2]));
				var prefix = c+"_"+mm;
				object_({
					open: parseFloat(vs[5].replace(/,/g,"")),
					high: parseFloat(vs[6].replace(/,/g,"")),
					low: parseFloat(vs[7].replace(/,/g,"")),
					close: parseFloat(vs[8].replace(/,/g,"")),
					settle: parseFloat(vs[9].replace(/,/g,"")),
					vol: parseFloat(vs[12].replace(/,/g,"")),
					oi: parseFloat(vs[14].replace(/,/g,"")),
					amount: parseFloat(vs[13].replace(/,/g,""))
				}).foreach(function(kv){
					upsertData(rst,prefix+"_"+kv.$,offset,kv._);
				});
			}
		});

		return rst;
	}

	function loadDceFutureHistoryDataAll(path){

		var rst = {};

		array_(fs.readdirSync(path)).foreach(function(fn){
			var name_suffix = fn.split(".");
			if(name_suffix[1]==="csv"){
				var tag_type_date = name_suffix[0].split("_");
				if(tag_type_date[1]==="0"){
					combineData(rst,loadDceFutureHistoryData(path+"/"+fn));
				}
			}
		});

		return rst;
	}

	function loadDceOptionHistoryData(path){

		var rst = {};

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(",");
			var rn = parseInt(vs[0]);
			if(!isNaN(rn)){
				var issues = vs[2].split("-");
				var cm = issues[0];
				var sep = cm.length-4;
				var c = cm.substring(0,sep);
				var mm = cm.substring(sep);
				var cp = issues[1].toLowerCase();
				var strike = issues[2];
				var offset = date2offset(DF_YMD.parse(vs[3]));
				var prefix = [c,mm,cp,strike].join("_");
				object_({
					open: parseFloat(vs[4].replace(/,/g,"")),
					high: parseFloat(vs[5].replace(/,/g,"")),
					low: parseFloat(vs[6].replace(/,/g,"")),
					close: parseFloat(vs[7].replace(/,/g,"")),
					settle: parseFloat(vs[9].replace(/,/g,"")),
					vol: parseFloat(vs[13].replace(/,/g,"")),
					oi: parseFloat(vs[14].replace(/,/g,"")),
					amount: parseFloat(vs[16].replace(/,/g,"")),
					exercise: parseFloat(vs[17].replace(/,/g,""))
				}).foreach(function(kv){
					upsertData(rst,prefix+"_"+kv.$,offset,kv._);
				});
			}
		});

		return rst;
	}

	function loadDceOptionHistoryDataAll(path){

		var rst = {};

		array_(fs.readdirSync(path)).foreach(function(fn){
			var name_suffix = fn.split(".");
			if(name_suffix[1]==="csv"){
				var tag_type_date = name_suffix[0].split("_");
				if(tag_type_date[1]==="1"){
					var date = DF_Y_M_D.parse(tag_type_date[2]);
					combineData(rst,loadDceOptionHistoryData(path+"/"+fn));
				}
			}
		});

		return rst;
	}

	merge(exports,{

		upsertData: upsertData,
		combineData: combineData,

		loadShiborCrawlData: loadShiborCrawlData,

		loadDceFutureCrawlData: loadDceFutureCrawlData,
		loadDceFutureCrawlDataAll: loadDceFutureCrawlDataAll,

		loadDceOptionCrawlData: loadDceOptionCrawlData,
		loadDceOptionCrawlDataAll: loadDceOptionCrawlDataAll,

		loadDceFutureHistoryData: loadDceFutureHistoryData,
		loadDceFutureHistoryDataAll: loadDceFutureHistoryDataAll,

		loadDceOptionHistoryData: loadDceOptionHistoryData,
		loadDceOptionHistoryDataAll: loadDceOptionHistoryDataAll
	});

})();