var K = require("../k/k");
global.merge = K.merge;

merge(global,require("../k/k-iterator"));
merge(global,require("../ktl/ktl"));
merge(global,require("../ktl/ktl-date"));
merge(global,require("../ktl/ktl-database"));
merge(global,require("../ktl/ktl-data"));
merge(global,require("./ktl-stat"));
merge(global,require("./ktl-stat-vol"));

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyy-MM-dd");

var close = testdb.load("m_201805_close");
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

var hvh = histogram([hv.vals],10);
console.error("min="+print(hvh.min*100.0,2)+"%, max="+print(hvh.max*100.0,2)+"%, histo="+hvh.histo.join(","));

var pcs = percents([hv.vals],[95,75,50,25,5]);
console.error(array_(pcs).map_(function(v){
	return print(v*100.0,2)+"%";
}).toArray().join("\t"));