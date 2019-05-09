
var K = require("../k/k");
var merge = K.merge;

var K_ITERATOR = require("../k/k-iterator");
var array_ = K_ITERATOR.array_;
var object_ = K_ITERATOR.object_;

var Database = require("../ktl/ktl-database").Database;

var KTL_MODEL_DATASOURCE = require("../ktl-model/ktl-model-datasource");
var generateMatureMonths = KTL_MODEL_DATASOURCE.generateMatureMonths;
var findFutureSerieWithin = KTL_MODEL_DATASOURCE.findFutureSerieWithin;

var KTL_APP_DISPLAY = require("../ktl-app/ktl-app-display");
var displayBasic = KTL_APP_DISPLAY.displayBasic;
var displayStat = KTL_APP_DISPLAY.displayStat;

var KTL_STAT_VOL = require("../ktl-stat/ktl-stat-vol");
var hvc2c = KTL_STAT_VOL.hvc2c;

var PROFILE = require("../ktl-app/ktl-app-profile");

var db2 = new Database("./test/db","option");

var profile = PROFILE.M;

var md = profile.mdelay
var nd = md+45;
var fd = md+195

var mms = generateMatureMonths("201709","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",nd,fd);

array_([22,44,66,88]).foreach(function(term){
	var hvss = [];
	object_(futures).foreach(function(kv){
		var data = kv._;
		var hvs = hvc2c(data,term);
		hvss.push(hvs.vals);
	});
	console.error();
	console.error("term="+term);
	displayBasic(hvss,100.0,2,"","%");
	displayStat(hvss,20,[1,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99],100.0,2,"","%","\t");
});
