global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("./ktl"));
merge(global,require("./ktl-date"));
merge(global,require("./ktl-data"));
merge(global,require("./ktl-io"));

var datas = loadDceFutureCrawlDataMulti("E:/test/dump20171225_all_0");

var df = new DateFormat("yyyy-MM-dd");

object_(datas).foreach(function(tag_dds){
	object_(tag_dds._).foreach(function(item_data){
		item_data._.write("E:/test/dump_dce/"+tag_dds.$+"_"+item_data.$+".ktld");
	});
});

new Data().read("E:/test/dump_dce/m_1805_settle.ktld")._().foreach(function(kv){
	if(!isNaN(kv._)){
		console.error(df.format(offset2date(kv.$))+"\t"+formatNumber(kv._,2));
	}
});
