var K = require("../k/k");
var merge = K.merge;

var K_ITERATOR = require("../k/k-iterator");
var array_ = K_ITERATOR.array_;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var KTL_DATE = require("../ktl/ktl-date");
var date2offset = KTL_DATE.date2offset;
var offset2date = KTL_DATE.offset2date;

var Database = require("../ktl/ktl-database").Database;

var KTL_MODEL_DATASOURCE = require("../ktl-model/ktl-model-datasource");
var generateStrikes = KTL_MODEL_DATASOURCE.generateStrikes;

var Data = require("../ktl/ktl-data").Data;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var PROFILE = require("../ktl-app/ktl-app-profile");
var dayfix = PROFILE.dayfix;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var dfYM = new DateFormat("yyyyMM");
var dfYMD = new DateFormat("yyyy-MM-dd");

var PROFILE_SR = merge(PROFILE.SR,{
	lowK: 5000,
	highK: 7500
});

var PROFILE_M = merge(PROFILE.M,{
	lowK: 2350,
	highK: 3650
});

var PROFILE_CF = merge(PROFILE.CF,{
	lowK: 14000,
	highK: 17400
});

var PROFILE_C = merge(PROFILE.C,{
	lowK: 1680,
	highK: 2100
});

var profile = PROFILE_M;

var cp = 1;

var shibor = db2.load("shibor_on");

var c = profile.c;
var mm = "201809";
var dfx = dayfix(c,mm);
var mday = date2offset(dfYM.parse(mm))-profile.mdelay+dfx;

var cm = c+"_"+mm;
var future = db2.load(cm+"_close");

var strikes = generateStrikes(profile.lowK,profile.highK,profile.step);
var options = array_(strikes).map_(function(strike){
	return db2.load([cm,cp>0?"c":"p",strike,"close"].join("_"));
}).toArray();

console.error("date|curr|"+strikes.join("|"));
Data.zip_([future].concat(options)).foreach(function(kvs){
	var day = kvs.$;
	var vs = kvs._;
	var fv = vs.shift();
	var rate = shibor.find(day);
	if(!isNaN(fv)&&!isNaN(rate)){
		var buffer = [dfYMD.format(offset2date(day)),fv];
		var i = 0;
		array_(vs).foreach(function(v){
			if(!isNaN(v)){
				var k = parseFloat(strikes[i]);
				var iv = b76m.iv(v,fv,k,rate,day,mday,cp);
				buffer.push(print(iv*100,2)+"%");
			}
			else{
				buffer.push("--");
			}
			i++;
		});
		console.error(buffer.join("|"));
	}
});
