
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
var generateStrikes = KTL_MODEL_DATASOURCE.generateStrikes;
var findFutureSerieWithin = KTL_MODEL_DATASOURCE.findFutureSerieWithin;
var findOptionSerieWithin = KTL_MODEL_DATASOURCE.findOptionSerieWithin;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_STAT = require("../ktl-stat/ktl-stat");
var histogram = KTL_STAT.histogram;

var KTL_MODEL_SIMULATE = require("../ktl-model/ktl-model-simulate");
var realDeltaHedge = KTL_MODEL_SIMULATE.realDeltaHedge;

var PROFILE = require("../ktl-app/ktl-app-profile");
var dayfix = PROFILE.dayfix;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var profile = PROFILE.SR;

var cp = -1;

var ivlb = 0.1016;
var ivub = 0.1414;

var cnt = 10;

var th = 1.0;
var adj = 1.0;

var md = profile.mdelay
var ld = md+15;
var nd = md+75;
var fd = md+165;

var n = 10;

var verbose = false;

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201709","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",md-5,fd+15);

var strikes = generateStrikes(profile.lowK,profile.highK,profile.step);

var pnlss = [];
object_(futures).foreach(function(kv){
	var name = kv.$;
	var data = kv._;
	var names = name.split("_");
	var c = names[0];
	var mm = names[1];
	var dfx = dayfix(c,mm);
	var options = findOptionSerieWithin(db2,c,mm,"cp",strikes,"close",md-dfx,fd-dfx);
	pnlss.push(array_(realDeltaHedge(name,data,options,shibor,b76m,cp,ivlb,ivub,md-dfx,ld-dfx,nd-dfx,fd-dfx,cnt,th,adj,profile.step,profile.plex,profile.fee,profile.spread,verbose)).map_(function(trade){
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
