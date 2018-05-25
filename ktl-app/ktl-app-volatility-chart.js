
var K = require("../k/k");
var merge = K.merge;

var K_ITERATOR = require("../k/k-iterator");
var array_ = K_ITERATOR.array_;
var object_ = K_ITERATOR.object_;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var KTL_DATE = require("../ktl/ktl-date");
var date2offset = KTL_DATE.date2offset;

var Database = require("../ktl/ktl-database").Database;

var KTL_MODEL_DATASOURCE = require("../ktl-model/ktl-model-datasource");
var generateMatureMonths = KTL_MODEL_DATASOURCE.generateMatureMonths;
var generateStrikes = KTL_MODEL_DATASOURCE.generateStrikes;
var findFutureSerieWithin = KTL_MODEL_DATASOURCE.findFutureSerieWithin;
var findOptionSerieWithin = KTL_MODEL_DATASOURCE.findOptionSerieWithin;

var KTL_OPTION = require("../ktl-option/ktl-option");
var findNearestStrike = KTL_OPTION.findNearestStrike;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_STAT = require("../ktl-stat/ktl-stat");
var percents = KTL_STAT.percents;

var KTL_MODEL_VOLATILITY = require("../ktl-model/ktl-model-volatility");
var volatilityCone = KTL_MODEL_VOLATILITY.volatilityCone;

var b76m = new Black76Model();

var db2 = new Database("./test/db2","option");

var df = new DateFormat("yyyyMM");

var PROFILE_SR = {
	c: "sr",
	nd: 45,
	fd: 285,
	lowK: 4000,
	highK: 8000,
	step: 100,
	mdelay: 37
};

var PROFILE_M = {
	c: "m",
	nd: 30,
	fd: 270,
	lowK: 2000,
	highK: 4000,
	step: 50,
	mdelay: 22
};

var profile = PROFILE_SR;

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201709","201809",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",profile.nd,profile.fd);

var strikes = generateStrikes(profile.lowK,profile.highK,profile.step);
var options = {};
array_(mms).foreach(function(mm){
	merge(options,findOptionSerieWithin(db2,profile.c,mm,"c",strikes,"close",profile.nd,profile.fd));
});

var ivs = [];
object_(futures).foreach(function(kv){
	var name = kv.$;
	var data = kv._;
	var vs = name.split("_");
	var c = vs[0];
	var mm = vs[1];
	var mday = date2offset(df.parse(mm))-profile.mdelay;
	data._().foreach(function(kv){
		var day = kv.$;
		var price = kv._;
		if(!isNaN(price)){
			var atm = findNearestStrike(kv._,profile.step);
			var optname = [c,mm,"c",""+atm,"close"].join("_");
			var optprice = options[optname].find(day);
			var rate = shibor.find(day);
			if(!isNaN(optprice)&&!isNaN(rate)){
				var iv = b76m.iv(optprice,price,atm,rate,day,mday,1);
				ivs.push(iv);
			}
		}
	});
});

var poss = [1,5,32,50,68,95,99]
console.error("dur\t"+poss.join("\t"));

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