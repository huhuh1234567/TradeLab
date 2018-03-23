var K = require("../k/k");
global.merge = K.merge;

merge(global,require("../ktl/ktl"));

merge(global,require("../k/k-date"));
merge(global,require("../ktl/ktl-date"));
merge(global,require("../ktl/ktl-database"));

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyy-MM-dd");

testdb.load("510050_10185_close")._().foreach(function(kv){
	if(!isNaN(kv._)){
		console.error(df.format(offset2date(kv.$))+"\t"+print(kv._,3));
	}
});
