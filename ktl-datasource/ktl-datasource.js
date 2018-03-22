(function(){

	var fs = require("fs");

	var K = require("../k/k");
	var merge = K.merge;
	var kv$ = K.kv$;

	var K_UTIL = require("../k/k-util");
	var upsert$ = K_UTIL.upsert$;

	var K_ITERATOR = require("../k/k-iterator");
	var object_ = K_ITERATOR.object_;
	var array_ = K_ITERATOR.array_;

	var FileLineIterator = require("../k/k-file-line-iterator").FileLineIterator;

	var K_MATH = require("../k-math/k-math");
	var div2 = K_MATH.div2;

	var KTL_DATE = require("../ktl/ktl-date");
	var DateFormat = KTL_DATE.DateFormat;
	var date2offset = KTL_DATE.date2offset;

	var Data = require("../ktl/ktl-data").Data;

	var CC_0 = "0".charCodeAt(0);
	var CC_9 = "9".charCodeAt(0);
	var CC_LA = "a".charCodeAt(0);
	var CC_LZ = "z".charCodeAt(0);
	var CC_UA = "A".charCodeAt(0);
	var CC_UZ = "Z".charCodeAt(0);

	var name2code = {
		"豆一": "a",
		"豆二": "b",
		"胶合板": "bb",
		"玉米": "c",
		"玉米淀粉": "cs",
		"纤维板": "fb",
		"铁矿石": "i",
		"焦炭": "j",
		"鸡蛋": "jd",
		"焦煤": "jm",
		"聚乙烯": "l",
		"豆粕": "m",
		"棕榈油": "p",
		"聚丙烯": "pp",
		"聚氯乙烯": "v",
		"豆油": "y"
	};

	var DF_Y_M_D = new DateFormat("yyyy-MM-dd");
	var DF_YMD = new DateFormat("yyyyMMdd");

	function formatMatureMonth(str,curr){
		var pos = str.length-2;
		var mm = str.substring(pos);
		var my = parseInt(str.substring(0,pos));
		var step = Math.pow(10,pos);
		var cy = div2(curr,step);
		var rst = cy[1]<=my?my+cy[0]*step:my+(cy[0]-1)*step;
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
			d.update(kv._.offset,kv._.vals);
		});
	}

	function loadAll(dir,load){

		var rst = {};

		array_(fs.readdirSync(dir)).foreach(function(fn){
			combineData(rst,load(dir,fn));
		});

		return rst;
	}

	function loadShiborEastmoneyCrawlData(path,type){

		var rst = {};

		new FileLineIterator(path).foreach(function(line){
			var vs = line.split("|");
			upsertData(rst,"shibor_"+type,date2offset(DF_Y_M_D.parse(vs[0])),parseFloat(vs[1])*0.01);
		});

		return rst;
	}

	function loadShiborEastmoneyCrawlDataAll(path){
		return loadAll(path,function(dir,fn){
			var name_suffix = fn.split(".");
			var tag_type_date = name_suffix[0].split("_");
			return loadShiborEastmoneyCrawlData(dir+"/"+fn,tag_type_date[1]);
		});
	}

	function loadDceFutureCrawlData(path,date){

		var rst = {};

		var offset = date2offset(date);

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(/\s+/);
			var c = name2code[vs[0]];
			if(c!==undefined){
				var prefix = c+"_"+formatMatureMonth(vs[1],date.getFullYear());
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
		return loadAll(path,function(dir,fn){
			var name_suffix = fn.split(".");
			var tag_type_date = name_suffix[0].split("_");
			var date = DF_Y_M_D.parse(tag_type_date[2]);
			return loadDceFutureCrawlData(dir+"/"+fn,date);
		});
	}

	function loadDceOptionCrawlData(path,date){

		var rst = {};

		var offset = date2offset(date);

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(/\s+/);
			var c = name2code[vs[0]];
			if(c!==undefined){
				var issues = vs[1].split("-");
				var mm = formatMatureMonth(issues[0].substring(c.length),date.getFullYear());
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
		return loadAll(path,function(dir,fn){
			var name_suffix = fn.split(".");
			var tag_type_date = name_suffix[0].split("_");
			var date = DF_Y_M_D.parse(tag_type_date[2]);
			return loadDceOptionCrawlData(dir+"/"+fn,date);
		});
	}

	function loadDceFutureHistoryData(path){

		var rst = {};

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(",");
			var rn = parseInt(vs[0]);
			if(!isNaN(rn)){
				var date = DF_YMD.parse(vs[2]);
				var cm = vs[1];
				var sep = cm.length-4;
				var c = cm.substring(0,sep);
				var mm = formatMatureMonth(cm.substring(sep),date.getFullYear());
				var offset = date2offset(date);
				var prefix = c+"_"+mm;
				object_({
					open: parseFloat(vs[5]),
					high: parseFloat(vs[6]),
					low: parseFloat(vs[7]),
					close: parseFloat(vs[8]),
					settle: parseFloat(vs[9]),
					vol: parseFloat(vs[12]),
					oi: parseFloat(vs[14]),
					amount: parseFloat(vs[13])
				}).foreach(function(kv){
					upsertData(rst,prefix+"_"+kv.$,offset,kv._);
				});
			}
		});

		return rst;
	}

	function loadDceFutureHistoryDataAll(path){
		return loadAll(path,function(dir,fn){
			return loadDceFutureHistoryData(dir+"/"+fn);
		});
	}

	function loadDceOptionHistoryData(path){

		var rst = {};

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(",");
			var rn = parseInt(vs[0]);
			if(!isNaN(rn)){
				var date = DF_YMD.parse(vs[3]);
				var issues = vs[2].split("-");
				var cm = issues[0];
				var sep = cm.length-4;
				var c = cm.substring(0,sep);
				var mm = formatMatureMonth(cm.substring(sep),date.getFullYear());
				var cp = issues[1].toLowerCase();
				var strike = issues[2];
				var offset = date2offset(date);
				var prefix = [c,mm,cp,strike].join("_");
				object_({
					open: parseFloat(vs[4]),
					high: parseFloat(vs[5]),
					low: parseFloat(vs[6]),
					close: parseFloat(vs[7]),
					settle: parseFloat(vs[9]),
					vol: parseFloat(vs[13]),
					oi: parseFloat(vs[14]),
					amount: parseFloat(vs[16]),
					exercise: parseFloat(vs[17])
				}).foreach(function(kv){
					upsertData(rst,prefix+"_"+kv.$,offset,kv._);
				});
			}
		});

		return rst;
	}

	function loadDceOptionHistoryDataAll(path){
		return loadAll(path,function(dir,fn){
			return loadDceOptionHistoryData(dir+"/"+fn);
		});
	}

	function loadCzceFutureHistoryData(path){

		var rst = {};

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split("|");
			var dateStr = vs[0].trim();
			var dateStrStartChar = dateStr.charCodeAt(0);
			if(dateStrStartChar>=CC_0&&dateStrStartChar<=CC_9){
				var date = DF_Y_M_D.parse(dateStr)
				var offset = date2offset(date);
				var cm = vs[1].trim().toLowerCase();
				var sep = cm.length-3;
				var c = cm.substring(0,sep);
				var mm = formatMatureMonth(cm.substring(sep),date.getFullYear());
				var prefix = c+"_"+mm;
				object_({
					open: parseFloat(vs[3].trim().replace(/,/g,"")),
					high: parseFloat(vs[4].trim().replace(/,/g,"")),
					low: parseFloat(vs[5].trim().replace(/,/g,"")),
					close: parseFloat(vs[6].trim().replace(/,/g,"")),
					settle: parseFloat(vs[7].trim().replace(/,/g,"")),
					vol: parseFloat(vs[10].trim().replace(/,/g,"")),
					oi: parseFloat(vs[11].trim().replace(/,/g,"")),
					amount: parseFloat(vs[13].trim().replace(/,/g,""))
				}).foreach(function(kv){
					upsertData(rst,prefix+"_"+kv.$,offset,kv._);
				});
			}
		});

		return rst;
	}

	function loadCzceFutureHistoryDataAll(path){
		return loadAll(path,function(dir,fn){
			return loadCzceFutureHistoryData(dir+"/"+fn);
		});
	}

	function loadCzceOptionHistoryData(path){

		var rst = {};

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split("|");
			var dateStr = vs[0].trim();
			var dateStrStartChar = dateStr.charCodeAt(0);
			if(dateStrStartChar>=CC_0&&dateStrStartChar<=CC_9){
				var date = DF_Y_M_D.parse(dateStr)
				var offset = date2offset(date);
				var contract = vs[1].trim().toLowerCase();
				var indexC = contract.lastIndexOf("c");
				var indexP = contract.lastIndexOf("p");
				var indexCP = indexC>0?indexP>0?Math.max(indexC,indexP):indexC:indexP;
				if(indexCP>0){
					var cm = contract.substring(0,indexCP);
					var sep = cm.length-3;
					var c = cm.substring(0,sep);
					var mm = formatMatureMonth(cm.substring(sep),date.getFullYear());
					var cp = contract.charAt(indexCP);
					var strike = contract.substring(indexCP+1);
					var prefix = [c,mm,cp,strike].join("_");
					object_({
						open: parseFloat(vs[3].trim().replace(/,/g,"")),
						high: parseFloat(vs[4].trim().replace(/,/g,"")),
						low: parseFloat(vs[5].trim().replace(/,/g,"")),
						close: parseFloat(vs[6].trim().replace(/,/g,"")),
						settle: parseFloat(vs[7].trim().replace(/,/g,"")),
						vol: parseFloat(vs[10].trim().replace(/,/g,"")),
						oi: parseFloat(vs[11].trim().replace(/,/g,"")),
						amount: parseFloat(vs[13].trim().replace(/,/g,"")),
						exercise: parseFloat(vs[16].trim().replace(/,/g,""))
					}).foreach(function(kv){
						upsertData(rst,prefix+"_"+kv.$,offset,kv._);
					});
				}
			}
		});

		return rst;
	}

	function loadCzceOptionHistoryDataAll(path){
		return loadAll(path,function(dir,fn){
			return loadCzceOptionHistoryData(dir+"/"+fn);
		});
	}

	function loadSseOptionWikitterData(path){

		var rst = {};

		var lines = new FileLineIterator(path);
		lines.foreach(function(line){
			var vs = line.split(",");
			var dateStr = vs[0];
			var dateStrStartChar = dateStr.charCodeAt(0);
			if(dateStrStartChar>=CC_0&&dateStrStartChar<=CC_9){
				var date = DF_YMD.parse(dateStr)
				var offset = date2offset(date);
				var contract = vs[2].toLowerCase();
				var indexC = contract.indexOf("c");
				var indexP = contract.indexOf("p");
				var indexCP = indexC>0?indexP>0?Math.min(indexC,indexP):indexC:indexP;
				if(indexCP>0){
					var c = contract.substring(0,indexCP);
					var cp = contract.charAt(indexCP);
					var mm = formatMatureMonth(contract.substring(indexCP+1,indexCP+5),date.getFullYear());
					var strike = contract.substring(indexCP+6);
					var mo = vs[11];
					var rate = parseFloat(mo)/10000.0;
					var prefix = [c,mo,mm,cp,strike].join("_");
					object_({
						open: parseFloat(vs[4])*rate,
						high: parseFloat(vs[5])*rate,
						low: parseFloat(vs[6])*rate,
						close: parseFloat(vs[7])*rate,
						vol: parseFloat(vs[8]),
						oi: parseFloat(vs[9]),
						amount: parseFloat(vs[10])*rate
					}).foreach(function(kv){
						upsertData(rst,prefix+"_"+kv.$,offset,kv._);
					});
					upsertData(rst,c+"_"+mo+"_close",offset,parseFloat(vs[14])*rate);
				}
			}
		});

		return rst;
	}

	function loadSseOptionWikitterDataAll(path){
		return loadAll(path,function(dir,fn){
			return loadSseOptionWikitterData(dir+"/"+fn);
		});
	}

	merge(exports,{

		upsertData: upsertData,
		combineData: combineData,

		loadAll: loadAll,

		formatMatureMonth: formatMatureMonth,

		loadShiborEastmoneyCrawlData: loadShiborEastmoneyCrawlData,
		loadShiborEastmoneyCrawlDataAll: loadShiborEastmoneyCrawlDataAll,

		loadDceFutureCrawlData: loadDceFutureCrawlData,
		loadDceFutureCrawlDataAll: loadDceFutureCrawlDataAll,

		loadDceOptionCrawlData: loadDceOptionCrawlData,
		loadDceOptionCrawlDataAll: loadDceOptionCrawlDataAll,

		loadDceFutureHistoryData: loadDceFutureHistoryData,
		loadDceFutureHistoryDataAll: loadDceFutureHistoryDataAll,

		loadDceOptionHistoryData: loadDceOptionHistoryData,
		loadDceOptionHistoryDataAll: loadDceOptionHistoryDataAll,

		loadCzceFutureHistoryData: loadCzceFutureHistoryData,
		loadCzceFutureHistoryDataAll: loadCzceFutureHistoryDataAll,

		loadCzceOptionHistoryData: loadCzceOptionHistoryData,
		loadCzceOptionHistoryDataAll: loadCzceOptionHistoryDataAll,

		loadSseOptionWikitterData: loadSseOptionWikitterData,
		loadSseOptionWikitterDataAll: loadSseOptionWikitterDataAll
	});

})();