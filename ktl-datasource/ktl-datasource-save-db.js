var K = require("../k/k");
global.merge = K.merge;

merge(global,require("../k/k-iterator"));
merge(global,require("../ktl/ktl-database"));
merge(global,require("./ktl-datasource"));

var db = new Database("./test/db","option");

var datas = {};

combineData(datas,loadDceFutureHistoryDataAll("./test/DCE/0_history"));
combineData(datas,loadDceOptionHistoryDataAll("./test/DCE/1_history"));
combineData(datas,loadDceFutureCrawlDataAll("./test/DCE/0_2019_tmp"));
combineData(datas,loadDceOptionCrawlDataAll("./test/DCE/1_2019_tmp"));
combineData(datas,loadCzceFutureHistoryDataAll("./test/CZCE/0_history"));
combineData(datas,loadCzceOptionHistoryDataAll("./test/CZCE/1_history"));
combineData(datas,loadCzceFutureCrawlDataAll("./test/CZCE/0_2019_tmp"));
combineData(datas,loadCzceOptionCrawlDataAll("./test/CZCE/1_2019_tmp"));
combineData(datas,loadShiborEastmoneyCrawlDataAll("./test/SHIBOR"));

var total = Object.keys(datas).length;

var count = 0;
object_(datas).foreach(function(tag_data){
	db.save(tag_data.$,tag_data._);
	count++;
	console.error("("+count+"/"+total+") "+tag_data.$);
});

db.sync();
