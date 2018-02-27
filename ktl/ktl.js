(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var MS_OF_DAY = 1000*60*60*24;

	var DAY_OF_YEAR = 365;

	function dtm(day,mday){
		return Math.round((mday.getTime()-day.getTime())/MS_OF_DAY)>>0
	}

	function ytm(day,mday){
		return dtm(day,mday)/DAY_OF_YEAR;
	}

	merge(exports,{
		MS_OF_DAY: MS_OF_DAY,
		DAY_OF_YEAR: DAY_OF_YEAR,
		dtm: dtm,
		ytm: ytm
	});

})();