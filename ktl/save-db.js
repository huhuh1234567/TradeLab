global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("./ktl-db"));
merge(global,require("./ktl-io"));

var testdb = new Database("./test/db","test");

var datas = {};

combineData(datas,loadShiborCrawlData("./test/shibor_on_2018-03-15.txt","on"));
combineData(datas,loadDceFutureCrawlDataAll("./test/0_2018"));
combineData(datas,loadDceOptionCrawlDataAll("./test/1_2018"));
combineData(datas,loadDceFutureHistoryDataAll("./test/DCE"));
combineData(datas,loadDceOptionHistoryDataAll("./test/DCE"));

var total = Object.keys(datas).length;

var count = 0;
object_(datas).foreach(function(tag_data){
	testdb.save(tag_data.$,tag_data._);
	count++;
	console.error("("+count+"/"+total+") "+tag_data.$);
});

testdb.sync();
