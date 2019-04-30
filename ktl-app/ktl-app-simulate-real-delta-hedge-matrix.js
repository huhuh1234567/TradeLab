
var K = require("../k/k");
var merge = K.merge;
var kv$ = K.kv$;

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

var KTL_MODEL_SIMULATE = require("../ktl-model/ktl-model-simulate");
var realDeltaHedge = KTL_MODEL_SIMULATE.realDeltaHedge;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var PROFILE_SR = {
	c: "sr",
	mdelay: 36,
	lowK: 3000,
	highK: 10000,
	ivlb: 0.08,
	ivub: 0.115,
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
	ivlb: 0.12,
	ivub: 0.16,
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
	ivlb: 0.10,
	ivub: 0.15,
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
	ivlb: 0.065,
	ivub: 0.095,
	step: 20,
	plex: 10,
	fee: 1.1,
	spread: 2
};

var profile = PROFILE_SR;

var cp = 0;

var cnt = 20;

var th = 1.0;

var md = profile.mdelay
var ld = md+45;
var nd = md+75;
var fd = md+195;

var shibor = db2.load("shibor_on");

var mms = generateMatureMonths("201709","201905",["01","05","09"])
var futures = findFutureSerieWithin(db2,profile.c,mms,"close",md,fd);

var strikes = generateStrikes(profile.lowK,profile.highK,profile.step);

var ivlbs = count_(11).map_(function(i){
	return profile.ivlb+i*0.003;
}).toArray();
var ivubs = count_(11).map_(function(i){
	return profile.ivub+i*0.003;
}).toArray();

var matrix = [];

array_(ivlbs).foreach(function(ivlb){
	array_(ivubs).foreach(function(ivub){
		var sum = 0;
		var count = 0;
		var minv = undefined;
		var maxv = undefined;
		object_(futures).foreach(function(kv){
			var name = kv.$;
			var data = kv._;
			var names = name.split("_");
			var options = findOptionSerieWithin(db2,names[0],names[1],"cp",strikes,"close",md,fd);
			var trades = realDeltaHedge(name,data,options,shibor,b76m,cp,ivlb,ivub,md,ld,nd,fd,cnt,th,profile.step,profile.plex,profile.fee,profile.spread);
			array_(trades).foreach(function(trade){
				var pnl = trade[2];
				sum += pnl;
				count++;
				minv = minv===undefined?pnl:Math.min(minv,pnl);
				max = maxv===undefined?pnl:Math.max(maxv,pnl);
			});
		});
		matrix.push([count,sum/count,minv,maxv]);
		if(matrix.length%10==0){
			console.error("simulate "+matrix.length+" finished");
		}
	});
});

var index = 0;
console.error();
console.error("count|"+ivubs.join("|"));
array_(ivlbs).foreach(function(ivlb){
	var fields = [];
	array_(ivubs).foreach(function(){
		fields.push(print(matrix[index][0],0));
		index++;
	});
	console.error(ivlb+"|"+fields.join("|"));
});

index = 0;
console.error();
console.error("avg|"+ivubs.join("|"));
array_(ivlbs).foreach(function(ivlb){
	var fields = [];
	array_(ivubs).foreach(function(){
		fields.push(print(matrix[index][1],2));
		index++;
	});
	console.error(ivlb+"|"+fields.join("|"));
});

index = 0;
console.error();
console.error("min|"+ivubs.join("|"));
array_(ivlbs).foreach(function(ivlb){
	var fields = [];
	array_(ivubs).foreach(function(){
		fields.push(print(matrix[index][2],2));
		index++;
	});
	console.error(ivlb+"|"+fields.join("|"));
});
