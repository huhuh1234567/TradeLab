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

	function formatNumber(num,nop){
		var current;
		var part1 = "";
		var part2 = "";
		//prefix
		var prefix = "";
		if(num<0){
			prefix = "-";
			num = -num;
		}
		//split part
		var scale = Math.pow(10,nop);
		var integer = Math.floor(num);
		var point = Math.round((num-integer)*scale);
		// check round error
		if(point===scale){
			point = 0;
			integer++;
		}
		//check 0
		if(integer===0){
			part1 = "0";
			if(point===0){
				prefix = ""
			}
		}
		//integer part
		var count = 0;
		if(integer>0){
			while(integer>0){
				//add thousandth separator
				if(count>0&&count%3===0){
					part1 = ","+part1;
				}
				count++;
				//add current digit
				current = integer%10;
				part1 = current+part1;
				//move to next without round error
				integer = Math.round((integer-current)/10);
			}
		}
		//point part
		if(nop>0){
			while(nop>0){
				//add current digit
				current = point%10;
				part2 = current+part2;
				//move to next without round error
				point = Math.round((point-current)/10);
				nop--;
			}
			part2 = "."+part2;
		}
		//conbine
		return prefix+part1+part2;
	}

	merge(exports,{
		MS_OF_DAY: MS_OF_DAY,
		DAY_OF_YEAR: DAY_OF_YEAR,
		dtm: dtm,
		ytm: ytm,
		formatNumber: formatNumber
	});

})();