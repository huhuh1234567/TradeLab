global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("./ktl"));
merge(global,require("./ktl-date"));
merge(global,require("./ktl-data"));
merge(global,require("./ktl-io"));

var datas = loadDceFutureDataAll("E:/test/dump20171225_all_0");

object_(datas).foreach(function(tag_mms){
	var tag = tag_mms.$;
	object_(tag_mms._).foreach(function(mm_dds){
		var mm = mm_dds.$;
		object_(mm_dds._).foreach(function(item_data){
			item_data._.write("E:/test/dump_dce/"+tag+"_"+mm+"_"+item_data.$+".ktld");
		});
	});
});

new Data().read("E:/test/dump_dce/m_1805_settle.ktld")._().foreach(function(kv){
	if(!isNaN(kv._)){
		console.error(formatDate(offset2date(kv.$))+"\t"+formatNumber(kv._,2));
	}
});
