
var K_ITERATOR = require("../k/k-iterator");
var array_ = K_ITERATOR.array_;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var KTL_DATE = require("../ktl/ktl-date");
var offset2date = KTL_DATE.offset2date;

var Data = require("../ktl/ktl-data").Data;

var Database = require("../ktl/ktl-database").Database;

var KTL_MODEL_PUREDELTA = require("../ktl-model/ktl-model-puredelta");
var findHighLow = KTL_MODEL_PUREDELTA.findHighLow;
var findHighLow2 = KTL_MODEL_PUREDELTA.findHighLow2;

var KTL_STAT_INTERPOLATION = require("../ktl-stat/ktl-stat-interpolation");
var linearInterpolation = KTL_STAT_INTERPOLATION.linearInterpolation;

var db2 = new Database("./test/db2","option");

var df = new DateFormat("yyyy-MM-dd");

var hdata = db2.load("sr_201809_high");
var ldata = db2.load("sr_201809_low");
var hldata = findHighLow(5,hdata,ldata);
var hldata2 = findHighLow2(5,hdata,ldata);

Data.allValid_(array_([hdata,ldata,hldata,hldata2]).map_(linearInterpolation).toArray()).foreach(function(kv){
	console.error(df.format(offset2date(kv.$))+"\t"+kv._.join("\t"));
});
