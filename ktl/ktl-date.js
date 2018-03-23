(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_DATE = require("../k/k-date");
	var TIMEZONE_OFFSET = K_DATE.TIMEZONE_OFFSET;
	var MS_OF_DAY = K_DATE.MS_OF_DAY;

	function date2offset(date){
		return Math.floor((date.getTime()-TIMEZONE_OFFSET)/MS_OF_DAY)>>0;
	}

	function offset2date(offset){
		return new Date(offset*MS_OF_DAY+TIMEZONE_OFFSET);
	}

	merge(exports,{
		date2offset: date2offset,
		offset2date: offset2date
	});

})();