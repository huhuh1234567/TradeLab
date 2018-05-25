var K = require("../k/k");
global.merge = K.merge;

merge(global,require("../k/k-iterator"));
merge(global,require("../ktl/ktl-database"));
merge(global,require("./ktl-datasource"));

var db2 = new Database("./test/db2","option");

var datas = {};

combineData(datas,loadShiborEastmoneyCrawlDataAll("./test/SHIBOR"));
// combineData(datas,loadDceFutureCrawlDataAll("./test/DCE/0_2018"));
// combineData(datas,loadDceOptionCrawlDataAll("./test/DCE/1_2018"));
// combineData(datas,loadDceFutureHistoryDataAll("./test/DCE/0"));
// combineData(datas,loadDceOptionHistoryDataAll("./test/DCE/1"));
// combineData(datas,loadCzceFutureHistoryDataAll("./test/CZCE/0"));
// combineData(datas,loadCzceOptionHistoryDataAll("./test/CZCE/1"));
// combineData(datas,loadCzceFutureCrawlDataAll("./test/CZCE/0_2018"));
// combineData(datas,loadCzceOptionCrawlDataAll("./test/CZCE/1_2018"));

var total = Object.keys(datas).length;

var count = 0;
object_(datas).foreach(function(tag_data){
	db2.save(tag_data.$,tag_data._);
	count++;
	console.error("("+count+"/"+total+") "+tag_data.$);
});

db2.sync();
