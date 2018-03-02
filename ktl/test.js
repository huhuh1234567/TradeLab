global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("./ktl"));
merge(global,require("./ktl-date"));
merge(global,require("./ktl-data"));
merge(global,require("./ktl-io"));

var datas = loadDceFutureDataAll("E:/test/dump20171225_all_0");

object_(datas).foreach(function(tag_mms){
	var tag = tag_mms[0];
	object_(tag_mms[1]).foreach(function(mm_dds){
		var mm = mm_dds[0];
		object_(mm_dds[1]).foreach(function(item_data){
			item_data[1].write("E:/test/dump_dce/"+tag+"_"+mm+"_"+item_data[0]+".ktld");
		});
	});
});

new Data().read("E:/test/dump_dce/m_1805_settle.ktld").output(function(o,v){
	if(!isNaN(v)&&isFinite(v)){
		console.error(formatDate(offset2date(o))+"\t"+formatNumber(v,2));
	}
});
