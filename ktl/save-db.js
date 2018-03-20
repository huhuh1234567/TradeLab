global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("./ktl-db"));
merge(global,require("./ktl-io"));

var testdb = new Database("./test/db","test");

var datas = {};

combineData(datas,loadShiborEastmoneyCrawlDataAll("./test/SHIBOR"));
combineData(datas,loadDceFutureCrawlDataAll("./test/DCE/0_2018"));
combineData(datas,loadDceOptionCrawlDataAll("./test/DCE/1_2018"));
combineData(datas,loadDceFutureHistoryDataAll("./test/DCE/0"));
combineData(datas,loadDceOptionHistoryDataAll("./test/DCE/1"));
combineData(datas,loadCzceFutureHistoryDataAll("./test/CZCE/0"));
combineData(datas,loadCzceOptionHistoryDataAll("./test/CZCE/1"));
combineData(datas,loadSseOptionWikitterDataAll("./test/SSE"));

var total = Object.keys(datas).length;

var count = 0;
object_(datas).foreach(function(tag_data){
	testdb.save(tag_data.$,tag_data._);
	count++;
	console.error("("+count+"/"+total+") "+tag_data.$);
});

testdb.sync();
