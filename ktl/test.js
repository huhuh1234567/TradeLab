global.merge = require("../k/k").merge;

merge(global,require("./ktl"));
merge(global,require("./ktl-date"));
merge(global,require("./ktl-db"));

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyy-MM-dd");

testdb.load("510050_10185_close")._().foreach(function(kv){
	if(!isNaN(kv._)){
		console.error(df.format(offset2date(kv.$))+"\t"+formatNumber(kv._,3));
	}
});
