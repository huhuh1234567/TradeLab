
var K = require("../k/k");
var merge = K.merge;

var K_ITERATOR = require("../k/k-iterator");
var count_ = K_ITERATOR.count_;
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

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_STAT = require("../ktl-stat/ktl-stat");
var percents = KTL_STAT.percents;
var histogram = KTL_STAT.histogram;

var PROFILE = require("../ktl-app/ktl-app-profile");
var dayfix = PROFILE.dayfix;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var df = new DateFormat("yyyyMM");

var profile = PROFILE.C;

var md = profile.mdelay
var nd = md+45;
var fd = md+195

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201905","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",nd-5,fd+15);

var strikes = generateStrikes(profile.lowK,profile.highK,profile.step);

var ivcs = [];
var ivps = [];
object_(futures).foreach(function(kv){
	var name = kv.$;
	var data = kv._;
	var vs = name.split("_");
	var c = vs[0];
	var mm = vs[1];
	var dfx = dayfix(c,mm);
	var mday = date2offset(df.parse(mm))-profile.mdelay+dfx;
	var options = findOptionSerieWithin(db2,profile.c,mm,"cp",strikes,"close",nd-dfx,fd-dfx);
	data._().foreach(function(kv){
		var day = kv.$;
		var price = kv._;
		if(!isNaN(price)){
			var rate = shibor.find(day);
			if(!isNaN(rate)){
				var atm = Math.round(kv._/profile.step)*profile.step;
				var optcs = options[[c,mm,"c",""+atm,"close"].join("_")];
				var optps = options[[c,mm,"p",""+atm,"close"].join("_")];
				array_([[1,optcs,ivcs],[-1,optps,ivps]]).foreach(function(param){
					var cp = param[0];
					var opts = param[1];
					var ivs = param[2];
					if(opts!==undefined){
						var oprice = opts.find(day);
						if(!isNaN(oprice)){
							var iv = b76m.iv(oprice,price,atm,rate,day,mday,cp);
							if(!isNaN(iv)&&iv>0){
								ivs.push(iv);
							}
						}
					}
				});
			}
		}
	});
});

var n = 20;
var poss = [1,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99]

array_([ivcs,ivps]).foreach(function(ivs){
	console.error();
	//histo
	var histo = histogram([ivs],n);
	var min = histo.min;
	var max = histo.max;
	var gap = (max-min)/n;
	console.error("histo\t"+count_(n+1).map_(function(i){
		return print((min+gap*i)*100.0,2)+"%";
	}).toArray().join("\t"));
	console.error("\t"+histo.histo.join("\t"));
	//percents
	var ivpcs = percents([ivs],poss);
	console.error("p-cents\t"+poss.join("\t"));
	console.error("\t"+array_(ivpcs).map_(function(v){
		return print(v*100.0,2)+"%";
	}).toArray().join("\t"));
});
