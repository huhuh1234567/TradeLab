global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("./ktl"));
merge(global,require("./ktl-date"));
merge(global,require("./ktl-data"));
merge(global,require("./ktl-db"));
merge(global,require("./ktl-io"));

var testdb = new Database("./test/db","test");

// var datas = loadDceFutureCrawlDataMulti("./test/0_2018");

// object_(datas).foreach(function(tag_dds){
// 	object_(tag_dds._).foreach(function(item_data){
// 		testdb.save((tag_dds.$+"_"+item_data.$).toLowerCase(),item_data._);
// 	});
// });

var df = new DateFormat("yyyy-MM-dd");

testdb.load("m_1805_settle")._().foreach(function(kv){
	if(!isNaN(kv._)){
		console.error(df.format(offset2date(kv.$))+"\t"+formatNumber(kv._,2));
	}
});
