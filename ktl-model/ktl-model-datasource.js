(function(){
	
	var K = require("../k/k");
	var merge = K.merge;
	var kv$ = K.kv$;

	var K_ITERATOR = require("../k/k-iterator");
	var array_ = K_ITERATOR.array_;
	var count_  = K_ITERATOR.count_;
	var union_ = K_ITERATOR.union_;

	var K_UTIL = require("../k/k-util");
	var Set = K_UTIL.Set;

	var K_DATE = require("../k/k-date");
	var TIMEZONE_OFFSET = K_DATE.TIMEZONE_OFFSET;
	var DateFormat = K_DATE.DateFormat;

	var KTL_DATE = require("../ktl/ktl-date");
	var date2offset = KTL_DATE.date2offset;

	var DF_YM = new DateFormat("yyyyMM");

	function generateMatureMonths(first,last,mms){

		var date;

		var fdate = DF_YM.parse(first);
		var ldate = DF_YM.parse(last);
		if(ldate<fdate){
			date = fdate;
			fdate = ldate;
			ldate = date;
		}

		date = new Date(TIMEZONE_OFFSET);

		var fy = fdate.getFullYear();
		var fm = fdate.getMonth();
		var ly = ldate.getFullYear();
		var lm = ldate.getMonth();

		mms = array_(mms).map_(function(mm){
			return parseInt(mm)-1;
		}).toArray();

		var rst = [];

		if(fy===ly){
			date.setFullYear(fy);
			array_(mms).foreach(function(mm){
				if(mm>=fm&&mm<=lm){
					date.setMonth(mm);
					rst.push(DF_YM.format(date));
				}
			});
		}
		else{
			//first year
			date.setFullYear(fy);
			array_(mms).foreach(function(mm){
				if(mm>=fm){
					date.setMonth(mm);
					rst.push(DF_YM.format(date));
				}
			});
			//mid years
			count_(ly-fy-1).foreach(function(my){
				date.setFullYear(my);
				array_(mms).foreach(function(mm){
					date.setMonth(mm);
					rst.push(DF_YM.format(date));
				});
			});
			//last year
			date.setFullYear(ly);
			array_(mms).foreach(function(mm){
				if(mm<=lm){
					date.setMonth(mm);
					rst.push(DF_YM.format(date));
				}
			});
		}

		return rst;
	}

	function generateStrikes(first,last,step,format){
		return count_((((last-first)/step)>>0)+1).map_(function(i){
			return first+step*i;
		}).map_(function(v){
			return format?format(v):""+v;
		}).toArray();
	}

	function findFutureSerieAll(db,c,mms,type,nd,fd){
		var mmSet = new Set(mms);
		return db.loadAll(function(name){
			var rst = false;
			var vs = name.split("_");
			if(vs.length===3&&vs[0]===c&&vs[2]===type){
				var mym = vs[1];
				var mm = mym.substring(mym.length-2);
				rst = mmSet[mm]||false;
			}
			return rst;
		},-fd,fd-nd);
	}

	function findOptionSerieAll(db,c,mm,cp,type,nd,fd){
		var all = cp!=="c"&&cp!=="p"
		return db.loadAll(function(name){
			var vs = name.split("_");
			return vs.length===5&&vs[0]===c&&vs[1]===mm&&(all||vs[2]===cp)&&vs[4]===type;
		},-fd,fd-nd);
	}

	function findFutureSerieWithin(db,c,mms,type,nd,fd){
		var indices = db.indices();
		return array_(mms).map_(function(mm){
			return kv$([c,mm,type].join("_"),mm);
		}).filter_(function(kv){
			return indices[kv.$]!==undefined;
		}).map_(function(kv){
			kv._ = db.load(kv.$,date2offset(DF_YM.parse(kv._))-fd,fd-nd);
			return kv;
		}).toObject();
	}

	function findOptionSerieWithin(db,c,mm,cp,strikes,type,nd,fd){
		var cps = cp!=="c"&&cp!=="p"?["c","p"]:[cp];
		var indices = db.indices();
		return array_(strikes).flatMap_(function(strike){
			return array_(cps).map_(function(cp){
				return name = [c,mm,cp,strike,type].join("_");
			});
		}).filter_(function(name){
			return indices[name]!==undefined;
		}).map_(function(name){
			return kv$(name,db.load(name,date2offset(DF_YM.parse(mm))-fd,fd-nd));
		}).toObject();
	}

	merge(exports,{

		generateMatureMonths: generateMatureMonths,
		generateStrikes: generateStrikes,
		
		findFutureSerieAll: findFutureSerieAll,
		findOptionSerieAll: findOptionSerieAll,

		findFutureSerieWithin: findFutureSerieWithin,
		findOptionSerieWithin: findOptionSerieWithin
	});

})();