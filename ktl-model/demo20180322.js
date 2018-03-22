var K = require("../k/k");
global.merge = K.merge;

merge(global,require("../k/k-iterator"));
merge(global,require("../ktl/ktl"));
merge(global,require("../ktl/ktl-date"));
merge(global,require("../ktl/ktl-database"));
merge(global,require("../ktl/ktl-data"));
merge(global,require("../ktl-stat/ktl-stat"));
merge(global,require("../ktl-option/ktl-option"));
merge(global,require("../ktl-option/ktl-option-pricing-black-76"));
merge(global,require("./ktl-model-datasource"));
merge(global,require("./ktl-model-volatility-cone"));

var bsm = new Black76Model();

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyyMM");
var df2 = new DateFormat("yyyy-MM-dd");

var shibor = testdb.load("shibor_on");

var mms = generateMatureMonths("201709","201809",["01","05","09"])
var futures = findFutureSerieWithin(testdb,"m",mms,"close",30,270);

var step = 50;
var strikes = generateStrikes(2000,4000,step);
var options = {};
array_(mms).foreach(function(mm){
	merge(options,findOptionSerieWithin(testdb,"m",mm,"c",strikes,"close",30,270));
});

var ivs = [];
object_(futures).foreach(function(kv){
	var name = kv.$;
	var data = kv._;
	var vs = name.split("_");
	var c = vs[0];
	var mm = vs[1];
	var mday = date2offset(df.parse(mm))-22;
	data._().foreach(function(kv){
		var day = kv.$;
		var price = kv._;
		if(!isNaN(price)){
			var atm = findNearestStrike(kv._,step);
			var optname = [c,mm,"c",""+atm,"close"].join("_");
			var optprice = options[optname].find(day);
			var rate = shibor.find(day);
			if(!isNaN(optprice)&&!isNaN(rate)){
				var iv = bsm.iv(optprice,price,atm,rate,day,mday,1);
				console.error([optname,df2.format(offset2date(day)),price,optprice,rate,iv].join("\t"));
				ivs.push(iv);
				}
		}
	});
});

var poss = [1,15,30,50,70,85,99]

var volcone = volatilityCone(futures,[10,20,40,60],poss);
object_(volcone).foreach(function(kv){
	console.error(kv.$+"\t"+array_(kv._).map_(function(v){
		return print(v*100.0,2)+"%";
	}).toArray().join("\t"));
});

var ivpcs = percents([ivs],poss);
console.error("iv\t"+array_(ivpcs).map_(function(v){
	return print(v*100.0,2)+"%";
}).toArray().join("\t"));