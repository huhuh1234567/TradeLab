
var K_ITERATOR = require("../k/k-iterator");
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
var percents = KTL_STAT.percents;

var KTL_MODEL_SIMULATE = require("../ktl-model/ktl-model-simulate");
var deltaHedgeVolatility = KTL_MODEL_SIMULATE.deltaHedgeVolatility;

var PROFILE = require("../ktl-app/ktl-app-profile");

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var profile = PROFILE.C;

var cp = 0

var cnt = 1000;

var fee = 0;//profile.fee;
var spread = 0;//profile.spread;

var th = 1.0;

var md = profile.mdelay
var lld = 45;
var ffd = 195;

var poss = [1,10,20,30,40,50,60,70,80,90,99]

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201709","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",md,md+ffd);

console.error("dur\t"+poss.join("\t"));
array_([30,60,90,120]).foreach(function(dur){
	var nd = md+dur+lld;
	var fd = md+ffd;
	var ivss = [];
	object_(futures).foreach(function(kv){
		var name = kv.$;
		var data = kv._;
		ivss.push(deltaHedgeVolatility(name,data,shibor,b76m,cp,md,dur,nd,fd,cnt,th,profile.step,profile.plex,fee,spread));
	});
	console.error(dur+"\t"+array_(percents(ivss,poss)).map_(function(v){
		return print(v*100.0,2)+"%";
	}).toArray().join("\t"))
});