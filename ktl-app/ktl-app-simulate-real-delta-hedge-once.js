
var K = require("../k/k");
var merge = K.merge;

var K_ITERATOR = require("../k/k-iterator");
var count_ = K_ITERATOR.count_;
var array_ = K_ITERATOR.array_;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var Database = require("../ktl/ktl-database").Database;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var KTL_DATE = require("../ktl/ktl-date");
var offset2date = KTL_DATE.offset2date;

var KTL_MODEL_DATASOURCE = require("../ktl-model/ktl-model-datasource");
var generateStrikes = KTL_MODEL_DATASOURCE.generateStrikes;
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

var df = new DateFormat("yyyy-MM-dd");

var profile = PROFILE.SR;

var cp = 1;

var ivlb = 0.098;
var ivub = 0.13;

var cnt = 10;

var th = 1.0;

var c = profile.c;
var mm = "201905";

var md = profile.mdelay-dayfix(c,mm);
var ld = md+45;
var nd = md+75;
var fd = md+195;

var name = [c,mm,"close"].join("_");
var future = db2.load(name);
var shibor = db2.load("shibor_on");

var strikes = generateStrikes(profile.lowK,profile.highK,profile.step);
var options = findOptionSerieWithin(db2,c,mm,"cp",strikes,"close",md,fd);

var trades = realDeltaHedge(name,future,options,shibor,b76m,cp,ivlb,ivub,md,ld,nd,fd,cnt,th,profile.step,profile.plex,profile.fee,profile.spread);

var sum = 0;
var count = 0;
var pnls = [];
console.error(["buy","sell","pnl"].join("|"));
array_(trades).foreach(function(trade){
	console.error([df.format(offset2date(trade[0])),df.format(offset2date(trade[1])),print(trade[2],2)].join("|"));
	pnls.push(trade[2]);
	sum += trade[2];
	count++;
});

var n = 10;
var histo = histogram([pnls],n);
var min = histo.min;
var max = histo.max;
var gap = (max-min)/n;
var tt = [];
count_(n+1).foreach(function(i){
	tt.push(print(min+gap*i,2));
});
console.error("|avg|"+tt.join("|"));
console.error("|"+print(sum/count,2)+"|"+histo.histo.join("|"));
