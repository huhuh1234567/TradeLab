(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var KTL = require("./ktl");
	var MS_OF_DAY = KTL.MS_OF_DAY;

	var TIMEZONE_OFFSET = new Date().getTimezoneOffset()*60000;

	function formatDate(date,sep){
		if(sep===undefined){
			sep = "-";
		}
		var y = date.getFullYear();
		var m = date.getMonth();
		var d = date.getDate();
		return y+sep+(m<9?"0"+(m+1):""+(m+1))+sep+(d<10?"0"+d:""+d);
	}

	function formatTime(date,sep){
		if(sep===undefined){
			sep = ":";
		}
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		return (h<10?"0"+h:""+h)+sep+(m<10?"0"+m:""+m)+sep+(s<10?"0"+s:""+s);
	}

	function format(date,sep,dsep,tsep){
		if(sep===undefined){
			sep = " ";
		}
		return formatDate(date,dsep)+sep+formatTime(date,tsep);
	}

	function parseDate(str,offset,date){
		if(offset===undefined){
			offset = 0;
			date = new Date(0);
		}
		else if(date===undefined){
			if(offset instanceof Date){
				date = offset;
				offset = 0;
			}
			else{
				date = new Date(TIMEZONE_OFFSET);
			}
		}
		var y = str.substring(offset,offset+4);
		var m = str.substring(offset+5,offset+7);
		var d = str.substring(offset+8,offset+10);
		date.setFullYear(parseInt(y));
		date.setMonth(parseInt(m)-1);
		date.setDate(parseInt(d));
		return date;
	}

	function parseTime(str,offset,date){
		if(offset===undefined){
			offset = 0;
			date = new Date(0);
		}
		else if(date===undefined){
			if(offset instanceof Date){
				date = offset;
				offset = 0;
			}
			else{
				date = new Date(TIMEZONE_OFFSET);
			}
		}
		var h = str.substring(offset,offset+2);
		var m = str.substring(offset+3,offset+5);
		var s = str.substring(offset+6,offset+8);
		date.setHours(parseInt(h));
		date.setMinutes(parseInt(m));
		date.setSeconds(parseInt(s));
		return date;
	}

	function parse(str,offset,date){
		if(offset===undefined){
			offset = 0;
			date = new Date(0);
		}
		else if(date===undefined){
			if(offset instanceof Date){
				date = offset;
				offset = 0;
			}
			else{
				date = new Date(TIMEZONE_OFFSET);
			}
		}
		parseDate(str,offset,date);
		parseTime(str,offset+11,date);
		return date;
	}

	function date2offset(date){
		return Math.floor((date.getTime()-TIMEZONE_OFFSET)/MS_OF_DAY)>>0;
	}

	function offset2date(offset){
		return new Date(offset*MS_OF_DAY+TIMEZONE_OFFSET);
	}

	merge(exports,{
		
		formatDate: formatDate,
		formatTime: formatTime,
		format: format,
		
		parseDate: parseDate,
		parseTime: parseTime,
		parse: parse,

		date2offset: date2offset,
		offset2date: offset2date
	});

})();