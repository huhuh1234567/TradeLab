
var K = require("../k/k");
var merge = K.merge;

var KTL = require("../ktl/ktl")
var print = KTL.print;

var Database = require("../ktl/ktl-database").Database;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_MODEL_SIMULATE = require("../ktl-model/ktl-model-simulate");
var deltaHedgeOnce = KTL_MODEL_SIMULATE.deltaHedgeOnce;

var PROFILE = require("../ktl-app/ktl-app-profile");
var dayfix = PROFILE.dayfix;

var b76m = new Black76Model();

var db2 = new Database("./test/db","option");

var profile = PROFILE.M;

var cp = 0;

var iv = 0.1723;

var cnt = 10;

var th = 1.0;

var c = profile.c;
var mm = "201805";

var md = profile.mdelay-dayfix(c,mm);
var ld = md+53;
var d0 = md+172;

var name = [c,mm,"close"].join("_");
var future = db2.load(name);
var shibor = db2.load("shibor_on");

var pnl = deltaHedgeOnce(name,future,shibor,b76m,cp,iv,md,ld,d0,cnt,th,profile.step,profile.plex,profile.fee,profile.spread,true);

console.error(print(pnl,2));
