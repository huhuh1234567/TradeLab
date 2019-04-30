
var K = require("../k/k");
var merge = K.merge;

var K_ITERATOR = require("../k/k-iterator");
var count_ = K_ITERATOR.count_;
var array_ = K_ITERATOR.array_;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var KTL = require("../ktl/ktl");
var print = KTL.print;
var price = KTL.price;

var KTL_DATE = require("../ktl/ktl-date");
var date2offset = KTL_DATE.date2offset;

var Black76Model = require("../ktl-option/ktl-option-pricing-black-76").Black76Model;

var KTL_DATASOURCE_QUERY = require("../ktl-datasource/ktl-datasource-query");
var queryDceDelayFuture = KTL_DATASOURCE_QUERY.queryDceDelayFuture;
var queryDceDelayOption = KTL_DATASOURCE_QUERY.queryDceDelayOption;
var queryCzceDelayFuture = KTL_DATASOURCE_QUERY.queryCzceDelayFuture;
var queryCzceDelayOption = KTL_DATASOURCE_QUERY.queryCzceDelayOption;

var singleLine = count_(12).map_(function(){
	return "----------";
}).toArray().join("");

var doubleLine = count_(12).map_(function(){
	return "==========";
}).toArray().join("");

var b76m = new Black76Model();

var df = new DateFormat("yyyyMM");


var PROFILE_SR = {
	c: "sr",
	step: 100,
	mdelay: 26,
	queryOption: queryCzceDelayOption,
	queryUnderlying: queryCzceDelayFuture
};

var PROFILE_M = {
	c: "m",
	step: 50,
	mdelay: 23,
	queryOption: queryDceDelayOption,
	queryUnderlying: queryDceDelayFuture
};

var PROFILE_CF = {
	c: "cf",
	step: 200,
	mdelay: 26,
	queryOption: queryCzceDelayOption,
	queryUnderlying: queryCzceDelayFuture
};

var PROFILE_C = {
	c: "c",
	step: 20,
	mdelay: 23,
	queryOption: queryDceDelayOption,
	queryUnderlying: queryDceDelayFuture
};

var profile = PROFILE_C;

var c = profile.c;
var mm = "201909";
var step = profile.step;
var range = 10;
var srate = 0.05;
var spread = profile.step*srate;
var queryOption = profile.queryOption;
var queryUnderlying = profile.queryUnderlying;
var ir = 0.0252;

var day = date2offset(new Date());
var mday = date2offset(df.parse(mm))-profile.mdelay;

queryUnderlying(c,function(uls){
	if(uls){
		var ul = uls[mm];
		if(ul){
			var ulp = price(ul[0],ul[1],ul[2],spread,srate);
			if(ulp.liquidity){
				queryOption(c,mm,function(opts){
					if(opts){

						var ulavg = Math.round(ulp.average);
						var ulspread = Math.round(ulp.spread);

						var legacy = 0;
						var atm = Math.round(ulavg/step)*step;
						// var atmc = opts["c_"+atm];
						// var atmp = opts["p_"+atm];
						// if(atmc&&atmp){
						// 	var atmcp = price(atmc[0],atmc[1],atmc[2],spread,srate);
						// 	var atmpp = price(atmp[0],atmp[1],atmp[2],spread,srate);
						// 	if(atmcp.liquidity&&atmpp.liquidity){
						// 		legacy = ulavg;
						// 		ulavg = Math.round(impliedFuturePrice(atmcp.average,atmpp.average,atm,ir,day,mday));
						// 	}
						// }

						console.error("c="+c+", mm="+mm+", price="+ulavg+", spread="+ulspread+", legacy="+legacy);
						console.error(singleLine);
						console.error(["c/p","strike","price","spread","impvol","delta","gamma","theta","vega"].join("\t"));
						console.error(singleLine);

						count_(range*2+1).foreach(function(i){
							var strike = atm+(i-range)*step;
							array_(["c","p"]).foreach(function(cp){
								var name = cp+"_"+strike;
								var opt = opts[name];
								if(opt){
									var optp = price(opt[0],opt[1],opt[2],spread,srate);
									if(optp.liquidity){
										var optavg = Math.round(optp.average*2.0)*0.5;
										var optspread = Math.round(optp.spread*2.0)*0.5;
										var d = cp==="c"?1:-1;
										var iv = b76m.iv(optavg,ulavg,strike,ir,day,mday,d);
										var delta = b76m.delta(ulavg,strike,ir,iv,day,mday,d);
										var gamma = b76m.gamma(ulavg,strike,ir,iv,day,mday,d);
										var theta = b76m.theta(ulavg,strike,ir,iv,day,mday,d);
										var vega = b76m.vega(ulavg,strike,ir,iv,day,mday,d);
										console.error([cp,print(strike,0),print(optavg,1),print(optspread,1),print(iv*100.0,2)+"%",print(delta,4),print(gamma,4),print(theta,4),print(vega,4)].join("\t"));
									}
								}
							});
							if(strike+step>ulavg&&strike<=ulavg){
								console.error(doubleLine);
							}
							else{
								console.error(singleLine);
							}
						});
					}
				});
			}
		}
	}
});
