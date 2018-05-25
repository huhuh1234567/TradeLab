(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_DATE = require("../k/k-date");
	var TIMEZONE_OFFSET = K_DATE.TIMEZONE_OFFSET;
	var DateFormat = K_DATE.DateFormat;

	var K_MATH = require("../k-math/k-math");
	var div2 = K_MATH.div2;

	var df = new DateFormat("yyyyMMdd");
	var df2 = new DateFormat("yyyyMMddHHmmss");
	
	var ORIGIN_OFFSET = df.parse("20000101").getTime();
	var ORIGIN_YEAR_OFFSET = 2000;
	var ORIGIN_WEEKDAY_OFFSET = -5;

	console.error(div2(div2(new Date().getTime()-ORIGIN_OFFSET,86400000)[0]-ORIGIN_WEEKDAY_OFFSET,7)[1]);

	function Schema(date2offset,offset2date){
		this.date2offset = date2offset;
		this.offset2date = offset2date;
	}

	var YEAR_SCHEMA = new Schema(function(date){
		return date.getFullYear()-ORIGIN_YEAR_OFFSET;
	},function(offset){
		var date = new Date(TIMEZONE_OFFSET);
		date.setFullYear(offset+ORIGIN_YEAR_OFFSET);
		return date;
	});

	var MONTH_SCHEMA = new Schema(function(date){
		return YEAR_SCHEMA.date2offset(date)*12+date.getMonth();
	},function(offset){
		var date = YEAR_SCHEMA.offset2date(offset);
		date.setMonth(div2(offset,12)[1]);
		return date;
	});

	var WEEK_SCHEMA = new Schema(function(date){
		return div2(div2(date.getTime()-ORIGIN_OFFSET,86400000)[0]-ORIGIN_WEEKDAY_OFFSET,7)[0];
	},function(offset){
		return new Date((offset*7+ORIGIN_WEEKDAY_OFFSET)*86400000+ORIGIN_OFFSET);
	});

	var DAY_SCHEMA = new Schema(function(date){
		var wwd = div2(div2(date.getTime()-ORIGIN_OFFSET,86400000)[0]-ORIGIN_WEEKDAY_OFFSET,7);
		return wwd[1]>=0&&wwd[1]<=4?wwd[0]*5+wwd[1]:-1;
	},function(offset){
		var wwd = div2(offset,5);
		return new Date((wwd[0]*7+wwd[1]+ORIGIN_WEEKDAY_OFFSET)*86400000+ORIGIN_OFFSET);
	});

	merge(exports,{

		Schema: Schema,

		YEAR_SCHEMA: YEAR_SCHEMA,
		MONTH_SCHEMA: MONTH_SCHEMA,
		WEEK_SCHEMA: WEEK_SCHEMA,
		DAY_SCHEMA: DAY_SCHEMA
	});

})();