global.merge = require("../k/k").merge;

merge(global,require("../k/k-iterator"));
merge(global,require("../ktl/ktl"));
merge(global,require("../ktl/ktl-date"));
merge(global,require("../ktl/ktl-db"));
merge(global,require("../ktl/ktl-data"));
merge(global,require("./ktl-stat-vol"));

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyy-MM-dd");

var close = testdb.load("m_1805_close");
var hv = hvc2c(close,10);

Data.zip_([close,hv]).foreach(function(kv){
	var display = array_(kv._).foreach(function(v){
		if(!isNaN(v)){
			return true;
		}
	});
	if(display){
		console.error(df.format(offset2date(kv.$))+"\t"+kv._.join("\t"));
	}
});