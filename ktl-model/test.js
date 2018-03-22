var K = require("../k/k");
global.merge = K.merge;

merge(global,require("../k/k-iterator"));
merge(global,require("../ktl/ktl"));
merge(global,require("../ktl/ktl-date"));
merge(global,require("../ktl/ktl-database"));
merge(global,require("../ktl/ktl-data"));
merge(global,require("./ktl-model-datasource"));
merge(global,require("./ktl-model-volatility-cone"));

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyy-MM-dd");


// var serie = findFutureSerieAll(testdb,"m",["01","05","09"],"close",60,240);
// var serie = findOptionSerieAll(testdb,"m","201805","p","close",15,120);
// var serie = findFutureSerieWithin(testdb,"m",generateMatureMonths("201709","201809",["01","05","09"]),"close",45,225);
var serie = findOptionSerieWithin(testdb,"m","201805","p",generateStrikes(2000,4000,50),"close",45,225);

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
