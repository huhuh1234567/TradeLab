global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("../ktl/ktl"));
merge(global,require("../ktl/ktl-date"));
merge(global,require("../ktl/ktl-db"));
merge(global,require("../ktl/ktl-data"));
merge(global,require("./ktl-future"));

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyy-MM-dd");


var serie = findSeries(testdb,"m",["01","05","09"],"close",60,200);

console.error("date\t"+object_(serie).map_(function(kv){
	return kv.$;
}).toArray().join("\t"));

Data.zip_(object_(serie).map_(function(kv){
	return kv._;
}).toArray()).foreach(function(kv){
	var display = array_(kv._).foreach(function(v){
		if(!isNaN(v)){
			return true;
		}
	});
	if(display){
		console.error(df.format(offset2date(kv.$))+"\t"+kv._.join("\t"));
	}
});