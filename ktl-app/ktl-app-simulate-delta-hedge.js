
var K = require("../k/k");
var merge = K.merge;

var K_ITERATOR = require("../k/k-iterator");
var count_ = K_ITERATOR.count_;
var array_ = K_ITERATOR.array_;
var object_ = K_ITERATOR.object_;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var Database = require("../ktl/ktl-database").Database;

var KTL_MODEL_DATASOURCE = require("../ktl-model/ktl-model-datasource");
var generateMatureMonths = KTL_MODEL_DATASOURCE.generateMatureMonths;
var findFutureSerieWithin = KTL_MODEL_DATASOURCE.findFutureSerieWithin;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_STAT = require("../ktl-stat/ktl-stat");
var histogram = KTL_STAT.histogram;

var KTL_MODEL_SIMULATE = require("../ktl-model/ktl-model-simulate");
var deltaHedge = KTL_MODEL_SIMULATE.deltaHedge;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var PROFILE_SR = {
	c: "sr",
	mdelay: 26,
	step: 100,
	plex: 10,
	dprice: 5,
	fee: 3.3,
	spread: 2
};

var PROFILE_M = {
	c: "m",
	mdelay: 23,
	step: 50,
	plex: 10,
	dprice: 5,
	fee: 1.65,
	spread: 2
};

var PROFILE_CF = {
	c: "cf",
	mdelay: 26,
	step: 200,
	plex: 5,
	dprice: 25,
	fee: 4.95,
	spread: 10
};

var PROFILE_C = {
	c: "c",
	mdelay: 23,
	step: 20,
	plex: 10,
	dprice: 5,
	fee: 1.1,
	spread: 2
};

var profile = PROFILE_M;

var cp = -1;

var iv = 0.119;

var cnt = 20;

var th = 1.0;

var md = profile.mdelay
var ld = md+30;
var nd = md+135;
var fd = md+165;

var n = 10;

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201709","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",md,fd);

var pnlss = [];
object_(futures).foreach(function(kv){
	var name = kv.$;
	var data = kv._;
	pnlss.push(deltaHedge(name,data,shibor,b76m,cp,iv,md,ld,nd,fd,cnt,th,profile.step,profile.plex,profile.dprice,profile.fee,profile.spread));
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
