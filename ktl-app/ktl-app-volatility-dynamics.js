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

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var dfYM = new DateFormat("yyyyMM");
var dfYMD = new DateFormat("yyyy-MM-dd");

var PROFILE_SR = {
	c: "sr",
	nd: 40,
	fd: 280,
	lowK: 5000,
	highK: 7500,
	step: 100,
	mdelay: 36
};

var PROFILE_M = {
	c: "m",
	nd: 37,
	fd: 277,
	lowK: 2350,
	highK: 3650,
	step: 50,
	mdelay: 23
};

var PROFILE_CF = {
	c: "cf",
	nd: 40,
	fd: 280,
	lowK: 14000,
	highK: 17400,
	step: 200,
	mdelay: 26
};

var PROFILE_C = {
	c: "c",
	nd: 37,
	fd: 277,
	lowK: 1680,
	highK: 2100,
	step: 20,
	mdelay: 23
};

var profile = PROFILE_M;

var cp = 1;

var shibor = db2.load("shibor_on");

var mm = "201809";
var mday = date2offset(dfYM.parse(mm))-profile.mdelay;

var cm = profile.c+"_"+mm;
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
