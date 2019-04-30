
var K = require("../k/k");
var merge = K.merge;
var kv$ = K.kv$;

var K_ITERATOR = require("../k/k-iterator");
var count_ = K_ITERATOR.count_;
var array_ = K_ITERATOR.array_;
var object_ = K_ITERATOR.object_;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var Database = require("../ktl/ktl-database").Database;

var KTL_MODEL_DATASOURCE = require("../ktl-model/ktl-model-datasource");
var generateMatureMonths = KTL_MODEL_DATASOURCE.generateMatureMonths;
var generateStrikes = KTL_MODEL_DATASOURCE.generateStrikes;
var findFutureSerieWithin = KTL_MODEL_DATASOURCE.findFutureSerieWithin;
var findOptionSerieWithin = KTL_MODEL_DATASOURCE.findOptionSerieWithin;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_STAT = require("../ktl-stat/ktl-stat");
var histogram = KTL_STAT.histogram;

var KTL_MODEL_SIMULATE = require("../ktl-model/ktl-model-simulate");
var realDeltaHedge = KTL_MODEL_SIMULATE.realDeltaHedge;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var PROFILE_SR = {
	c: "sr",
	mdelay: 36,
	lowK: 3000,
	highK: 10000,
	step: 100,
	plex: 10,
	fee: 3.3,
	spread: 2
};

var PROFILE_M = {
	c: "m",
	mdelay: 23,
	lowK: 2000,
	highK: 4000,
	step: 50,
	plex: 10,
	fee: 1.65,
	spread: 2
};

var PROFILE_CF = {
	c: "cf",
	mdelay: 26,
	lowK: 10000,
	highK: 20000,
	step: 200,
	plex: 5,
	fee: 4.95,
	spread: 10
};

var PROFILE_C = {
	c: "c",
	mdelay: 23,
	lowK: 1000,
	highK: 3000,
	step: 20,
	plex: 10,
	fee: 1.1,
	spread: 2
};

var profile = PROFILE_SR;

var cp = -1;

var ivlb = 0.1016;
var ivub = 0.1414;

var cnt = 10;

var th = 1.0;

var md = profile.mdelay
var ld = md+15;
var nd = md+75;
var fd = md+165;

var n = 10;

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201709","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",md,fd);

var strikes = generateStrikes(profile.lowK,profile.highK,profile.step);

var pnlss = [];
object_(futures).foreach(function(kv){
	var name = kv.$;
	var data = kv._;
	var names = name.split("_");
	var options = findOptionSerieWithin(db2,names[0],names[1],"cp",strikes,"close",md,fd)
	pnlss.push(array_(realDeltaHedge(name,data,options,shibor,b76m,cp,ivlb,ivub,md,ld,nd,fd,cnt,th,profile.step,profile.plex,profile.fee,profile.spread)).map_(function(trade){
		return trade[2];
	}).toArray());
});

var sum = 0;
var count = 0;
array_(pnlss).foreach(function(pnls){
	array_(pnls).foreach(function(pnl){
		sum += pnl;
		count++;
	});
});
var histo = histogram(pnlss,n);
var min = histo.min;
var max = histo.max;
var gap = (max-min)/n;
var tt = [];
count_(n+1).foreach(function(i){
	tt.push(print(min+gap*i,2));
});
console.error("|avg|"+tt.join("|"));
console.error("|"+print(sum/count,2)+"|"+histo.histo.join("|"));
