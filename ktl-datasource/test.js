(function(){

	var K_DATASOURCE = require("../ktl-datasource/ktl-datasource");
	var loadCzceFutureCrawlDataAll = K_DATASOURCE.loadCzceFutureCrawlDataAll;

	var K_DATE = require("../k/k-date");
	var DateFormat = K_DATE.DateFormat;

	var KTL_DATE = require("../ktl/ktl-date");
	var offset2date = KTL_DATE.offset2date;

	var KTL = require("../ktl/ktl");
	var print = KTL.print;

	var df = new DateFormat("yyyy-MM-dd");

	var data = loadCzceFutureCrawlDataAll("./test/CZCE/0_2018");
	data["sr_201809_close"]._().foreach(function(kv){
		if(!isNaN(kv._)){
			console.error(df.format(offset2date(kv.$))+"\t"+print(kv._,3));
		}
	});
})();