(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_DATE = require("../k/k-date");
	var MS_OF_DAY = K_DATE.MS_OF_DAY;

	var DAY_OF_YEAR = 365;

	function dtm(day,mday){
		return day instanceof Date?Math.round((mday.getTime()-day.getTime())/MS_OF_DAY)>>0:mday-day;
		return Math.round(diff/MS_OF_DAY)>>0
	}

	function ytm(day,mday){
		return dtm(day,mday)/365;
	}

	function price(last,bid,ask,limit,rate){
		var liquidity = false;
		var average = Number.NaN;
		var spread = Number.NaN;
		if(!isNaN(bid)&&!isNaN(ask)){
			spread = ask-bid;
			average = (bid+ask)*0.5;
			liquidity = spread<=limit||spread<=average*rate;
			if(!isNaN(last)&&last>bid&&last<ask){
				average = last;
				liquidity = true;
			}
		}
		return {
			liquidity: liquidity,
			average: average,
			spread: spread
		};
	}

	function print(num,nop){
		if(isNaN(num)){
			return "NaN";
		}
		else{
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
	}

	merge(exports,{
		DAY_OF_YEAR: DAY_OF_YEAR,
		dtm: dtm,
		ytm: ytm,
		price: price,
		print: print
	});

})();