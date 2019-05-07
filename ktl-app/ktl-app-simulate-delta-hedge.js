
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

var PROFILE = require("../ktl-app/ktl-app-profile");
var dayfix = PROFILE.dayfix;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var profile = PROFILE.M;

var cp = 0;

var iv = 0.125;

var cnt = 20;

var th = 1.0;

var md = profile.mdelay
var ld = md+45;
var nd = md+75;
var fd = md+195;

var n = 10;

var verbose = false;

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201709","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",md-5,fd+15);

var pnlss = [];
object_(futures).foreach(function(kv){
	var name = kv.$;
	var data = kv._;
	var names = name.split("_");
	var c = names[0];
	var mm = names[1];
	var dfx = dayfix(c,mm);
	pnlss.push(deltaHedge(name,data,shibor,b76m,cp,iv,md-dfx,ld-dfx,nd-dfx,fd-dfx,cnt,th,profile.step,profile.plex,profile.fee,profile.spread,verbose));
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
console.error("avg|"+tt.join("|"));
console.error(print(sum/count,2)+"|"+histo.histo.join("|"));
