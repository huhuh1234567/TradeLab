(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_DATE = require("../k/k-date");
	var DateFormat = K_DATE.DateFormat;

	var KTL = require("../ktl/ktl")
	var print = KTL.print;
	
	var KTL_DATE = require("../ktl/ktl-date");
	var date2offset = KTL_DATE.date2offset;
	var offset2date = KTL_DATE.offset2date;

	var df = new DateFormat("yyyyMM");

	var dfp = new DateFormat("yyyy-MM-dd");

	function display(verbose,offset,op,cash,cost,){
		if(verbose){
			if(offset===0){
				console.error("date|op|cash|fee");
			}
			else{
				console.error([dfp.format(offset2date(offset)),op,print(cash,2),print(cost,2)].join("|"));
			}
		}
	}

	function hedgeSimulate(data,day0,price0,oprice0,ulhc0,getsoprice,getulhc,ocnt,plex,fee,sprd,verbose){

		display(verbose,0);

		//init
		var pnl = 0;
		var ulcnt = 0;

		//base info
		var day = day0;
		var price = price0;
		var oprice = oprice0;
		var ulhc = ulhc0;

		//buy call option
		pnl -= ocnt*plex*oprice;
		display(verbose,day,"buy option @ "+print(oprice,2),-ocnt*plex*oprice,0);

		//hedge by underlying
		ulcnt += ulhc;
		var hcash = ulhc*plex*price;
		var hcost = Math.abs(ulhc)*(fee+plex*sprd);
		pnl -= hcash+hcost;
		display(verbose,day,"hedge "+ulhc+" @ "+price,-hcash,-hcost);

		data._().foreach(function(kv){

			day = kv.$;
			price = kv._;
			if(!Number.isNaN(price)&&day>day0){
				
				//test sell
				oprice = getsoprice(day,price);
				if(oprice!==undefined&&!Number.isNaN(oprice)&&oprice!==0){
					hcash = -ulcnt*plex*price;
					hcost = Math.abs(ulcnt)*(fee+plex*sprd);
					pnl -= hcash+hcost;
					display(verbose,day,"hedge "+(-ulcnt)+" @ "+price,-hcash,-hcost);
					pnl -= -ocnt*plex*oprice;
					display(verbose,day,"sell option @ "+print(oprice,2),ocnt*plex*oprice,0);
					return true;
				}
				
				//get hedge count
				ulhc = getulhc(day,price,ulcnt);
				if(ulhc!==undefined&&!Number.isNaN(ulhc)&&ulhc!==0){
					ulcnt += ulhc;
					hcash = ulhc*plex*price;
					hcost = Math.abs(ulhc)*(fee+plex*sprd);
					pnl -= hcash+hcost;
					display(verbose,day,"hedge "+ulhc+" @ "+price,-hcash,-hcost);
				}
			}
		});

		return pnl;
	}

	function deltaHedgeOnce(name,data,rdata,pm,cp,iv,md,ld,d0,ocnt,th,step,plex,dp,fee,sprd,verbose){
		
		var vs = name.split("_");
		var mm = vs[1];
		var fmday = date2offset(df.parse(mm));
		var mday = fmday-md;
		var lday = fmday-ld;
		var day = fmday-d0;

		var price = data.find(day);
		var rate = rdata.find(day);
		var strike = Math.round(price/step)*step;
		var oprice = pm.price(price,strike,rate,iv,day,mday,cp);
		var delta = ocnt*pm.delta(price,strike,rate,iv,day,mday,cp);
		var ulhc = -Math.round(delta);

		var pnl = hedgeSimulate(data,day,price,oprice,ulhc,function(day,price){
			if(day>lday){
				return pm.price(price,strike,rate,iv,day,mday,cp);
			}
		},function(day,price,ulcnt){
			var rate = rdata.find(day);
			var delta = ocnt*pm.delta(price,strike,rate,iv,day,mday,cp)+ulcnt;
			delta = ocnt*pm.delta(price-Math.sign(delta)*dp,strike,rate,iv,day,mday,cp)+ulcnt;
			var dsign = Math.sign(delta);
			var dval = dsign*delta;
			if(dval>th){
				return -dsign*Math.max(1,(dval>>0));
			}
		},ocnt,plex,fee,sprd,verbose);

		return pnl;
	}

	function deltaHedge(name,data,rdata,pm,cp,iv,md,ld,nd,fd,ocnt,th,step,plex,dp,fee,sprd){

		var rst = [];
		
		var vs = name.split("_");
		var mm = vs[1];
		var fmday = date2offset(df.parse(mm));
		data._().foreach(function(kv){
			var d = fmday-kv.$;
			var price = kv._;
			if(!Number.isNaN(price)&&d<=fd){
				if(d<=nd){
					return true;
				}
				rst.push(deltaHedgeOnce(name,data,rdata,pm,cp,iv,md,ld,d,ocnt,th,step,plex,dp,fee,sprd));
			}
		});

		return rst;
	}

	function deltaHedgeVolatilityOnce(name,data,rdata,pm,cp,md,ld,d0,ocnt,th,step,plex,dp,fee,sprd){
	
		var EPSILON = 1e-6;

		var miniv = 0.0;
		var maxiv = 1.0;

		while(maxiv-miniv>EPSILON){
			var iv = (maxiv + miniv) * 0.5;
			var piv = deltaHedgeOnce(name,data,rdata,pm,cp,iv,md,ld,d0,ocnt,th,step,plex,dp,fee,sprd);
			if(piv>0){
				miniv = iv;
			}
			else{
				maxiv = iv;
			}
		}

		return miniv;
	}

	function deltaHedgeVolatility(name,data,rdata,pm,cp,md,dur,nd,fd,ocnt,th,step,plex,dp,fee,sprd){

		var rst = [];
		
		var vs = name.split("_");
		var mm = vs[1];
		var fmday = date2offset(df.parse(mm));
		data._().foreach(function(kv){
			var d = fmday-kv.$;
			var price = kv._;
			if(!Number.isNaN(price)&&d<=fd){
				if(d<=nd){
					return true;
				}
				rst.push(deltaHedgeVolatilityOnce(name,data,rdata,pm,cp,md,d-dur,d,ocnt,th,step,plex,dp,fee,sprd));
			}
		});

		return rst;
	}

	function calculateOption(day,price,optcs,optps,rates,pm,strike,mday,cp){
		var rst = undefined;
		//find data
		var opricec = optcs.find(day);
		var opricep = optps.find(day);
		var rate = rates.find(day);
		//calc values
		if(!Number.isNaN(rate)){
			if(cp===0){
				if(!Number.isNaN(opricec)&&!Number.isNaN(opricep)){
					var ivc = pm.iv(opricec,price,strike,rate,day,mday,1);
					var ivp = pm.iv(opricep,price,strike,rate,day,mday,-1);
					if(!Number.isNaN(ivc)&&ivc>0&&!Number.isNaN(ivp)&&ivp>0){
						rst = {
							oprice: 0.5*(opricec+opricep),
							iv: 0.5*(ivc+ivp),
							delta: 0.5*(pm.delta(price,strike,rate,ivc,day,mday,1)+pm.delta(price,strike,rate,ivp,day,mday,-1))
						};
					}
					else{
						rst = {
							oprice: 0.5*(opricec+opricep)
						};
					}
				}
			}
			else{
				var oprice = cp<0?opricep:opricec;
				if(!Number.isNaN(oprice)){
					var iv = pm.iv(oprice,price,strike,rate,day,mday,cp);
					if(!Number.isNaN(iv)&&iv>0){
						rst = {
							oprice: oprice,
							iv: iv,
							delta: pm.delta(price,strike,rate,iv,day,mday,cp),
						};
					}
					else{
						rst = {
							oprice: oprice
						};
					}
				}
			}
		}
		return rst;
	}

	function realDeltaHedge(name,uls,optss,rates,pm,cp,ivlb,ivub,md,ld,nd,fd,ocnt,th,step,plex,fee,sprd){

		var verbose = false;

		var rst = [];
		
		var vs = name.split("_");
		var c = vs[0];
		var mm = vs[1];
		var fmday = date2offset(df.parse(mm));
		var mday = fmday-md;
		var lday = fmday-ld;
		var nday = fmday-nd;
		var fday = fmday-fd;
		uls._().foreach(function(kv){
			var day = kv.$;
			var price = kv._;
			if(!Number.isNaN(price)&&day>=fday){
				if(day>=nday){
					return true;
				}
				var strike = Math.round(price/step)*step;
				var optcs = optss[[c,mm,"c",strike,"close"].join("_")];
				var optps = optss[[c,mm,"p",strike,"close"].join("_")];
				if(optcs!==undefined&&optps!==undefined){
					var option = calculateOption(day,price,optcs,optps,rates,pm,strike,mday,cp);
					//check iv
					if(option!==undefined&&option.iv!==undefined&&option.iv<ivlb){
						//enter trade
						var day1 = day;
						var ulhc = -Math.round(ocnt*option.delta);
						var pnl = hedgeSimulate(uls,day,price,option.oprice,ulhc,function(day,price){
							var option = calculateOption(day,price,optcs,optps,rates,pm,strike,mday,cp);
							if(option!==undefined){
								if(day>lday){
									day1 = day;
									return option.oprice;
								}
								if(option.iv!==undefined&&option.iv>ivub){
									day1 = day;
									return option.oprice;
								}
							}
						},function(day,price,ulcnt){
							var option = calculateOption(day,price,optcs,optps,rates,pm,strike,mday,cp);
							if(option!==undefined&&option.delta!==undefined){
								var delta = ocnt*option.delta+ulcnt;
								var dsign = Math.sign(delta);
								var dval = dsign*delta;
								if(dval>th){
									return -dsign*Math.max(1,(dval>>0));
								}
							}
						},ocnt,plex,fee,sprd,verbose);
						rst.push([day,day1,pnl]);
					}
				}
			}
		});

		return rst;
	}

	merge(exports,{
		deltaHedgeOnce: deltaHedgeOnce,
		deltaHedge: deltaHedge,
		deltaHedgeVolatilityOnce: deltaHedgeVolatilityOnce,
		deltaHedgeVolatility: deltaHedgeVolatility,
		realDeltaHedge: realDeltaHedge
	});

})();