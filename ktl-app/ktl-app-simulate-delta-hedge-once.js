
var K = require("../k/k");
var merge = K.merge;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var Database = require("../ktl/ktl-database").Database;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_MODEL_SIMULATE = require("../ktl-model/ktl-model-simulate");
var deltaHedgeOnce = KTL_MODEL_SIMULATE.deltaHedgeOnce;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var PROFILE_SR = {
	c: "sr",
	mdelay: 26,
	step: 100,
	plex: 10,
	dprice: 5,
	fee: 3.3,
	spread: 2
};

var PROFILE_M = {
	c: "m",
	mdelay: 23,
	step: 50,
	plex: 10,
	dprice: 0,
	fee: 0,
	spread: 0
};

var PROFILE_CF = {
	c: "cf",
	mdelay: 26,
	step: 200,
	plex: 5,
	dprice: 25,
	fee: 4.95,
	spread: 10
};

var PROFILE_C = {
	c: "c",
	mdelay: 23,
	step: 20,
	plex: 10,
	dprice: 5,
	fee: 1.1,
	spread: 2
};

var profile = PROFILE_M;

var cp = -1;

var iv = 0.1723;

var cnt = 10;

var th = 1.0;

var md = profile.mdelay
var ld = md+53;
var d0 = md+171;

var name = profile.c+"_201801_close";
var future = db2.load(name);
var shibor = db2.load("shibor_on");

var pnl = deltaHedgeOnce(name,future,shibor,b76m,cp,iv,md,ld,d0,cnt,th,profile.step,profile.plex,profile.dprice,profile.fee,profile.spread,true);

console.error(print(pnl,2));
