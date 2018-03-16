(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var array_ = K_ITERATOR.array_;
	var object_ = K_ITERATOR.object_;

	var K_AVLTREE = require("../k/k-avltree");
	var AVLTree = K_AVLTREE.AVLTree;

	var KTL = require("./ktl");
	var MS_OF_DAY = KTL.MS_OF_DAY;

	var TIMEZONE_OFFSET = new Date().getTimezoneOffset()*60000;

	function CopyProcessorCreator(pattern){
		return {
			length: function(){
				return pattern.length;
			},
			parse: function(str,offset,date){
				return date;
			},
			format: function(date){
				return pattern;
			}
		}
	}

	var processors = {
		"yyyy": {
			length: function(){
				return 4;
			},
			parse: function(str,offset,date){
				date.setFullYear(parseInt(str.substring(offset,offset+4)));
				return date;
			},
			format: function(date){
				var v = date.getFullYear();
				return v<10?"000"+v:v<100?"00"+v:v<1000?"0"+v:""+v;
			}
		},
		"MM": {
			length: function(){
				return 2;
			},
			parse: function(str,offset,date){
				date.setMonth(parseInt(str.substring(offset,offset+2))-1);
				return date;
			},
			format: function(date){
				var v = date.getMonth()+1;
				return v<10?"0"+v:""+v;
			}
		},
		"dd": {
			length: function(){
				return 2;
			},
			parse: function(str,offset,date){
				date.setDate(parseInt(str.substring(offset,offset+2)));
				return date;
			},
			format: function(date){
				var v = date.getDate();
				return v<10?"0"+v:""+v;
			}
		},
		"HH": {
			length: function(){
				return 2;
			},
			parse: function(str,offset,date){
				date.setHours(parseInt(str.substring(offset,offset+2)));
				return date;
			},
			format: function(date){
				var v = date.getDate();
				return v<10?"0"+v:""+v;
			}
		},
		"mm": {
			length: function(){
				return 2;
			},
			parse: function(str,offset,date){
				date.setMinutes(parseInt(str.substring(offset,offset+2)));
				return date;
			},
			format: function(date){
				var v = date.getDate();
				return v<10?"0"+v:""+v;
			}
		},
		"ss": {
			length: function(){
				return 2;
			},
			parse: function(str,offset,date){
				date.setSeconds(parseInt(str.substring(offset,offset+2)));
				return date;
			},
			format: function(date){
				var v = date.getDate();
				return v<10?"0"+v:""+v;
			}
		},
		"SSS": {
			length: function(){
				return 3;
			},
			parse: function(str,offset,date){
				date.setMilliseconds(parseInt(str.substring(offset,offset+2)));
				return date;
			},
			format: function(date){
				var v = date.getDate();
				return v<10?"00"+v:v<100?"0"+v:""+v;
			}
		}
	};

	function DateFormat(pattern){

		//find pattern splits
		var splits = [];
		object_(processors).foreach(function(tag_processor){
			var ti = pattern.indexOf(tag_processor.$);
			if(ti>=0){
				splits.push({
					$: ti,
					_: tag_processor._
				});
			}
		});
		splits.sort(function(l,r){
			return l.$-r.$;
		});

		//list pattern processors
		var offset = 0;
		var index = 0;
		this.___ps = [];
		while(offset<pattern.length){
			if(index<splits.length){
				
				var split = splits[index];
				index++;

				if(offset<split.$){
					this.___ps.push(CopyProcessorCreator(pattern.substring(offset,split.$)));
					offset = split.$;
				}
				this.___ps.push(split._);
				offset += split._.length();
			}
			else{
				this.___ps.push(CopyProcessorCreator(pattern.substring(offset,pattern.length)));
				offset = pattern.length;
			}
		}
	}

	merge(DateFormat.prototype,{
		parse: function(str,offset,date){
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
			var offset = 0;
			array_(this.___ps).foreach(function(proc){
				proc.parse(str,offset,date);
				offset += proc.length();
			});
			return date;
		},
		format: function(date){
			var rst = "";
			array_(this.___ps).foreach(function(proc){
				rst += proc.format(date);
			});
			return rst;
		}
	});

	function date2offset(date){
		return Math.floor((date.getTime()-TIMEZONE_OFFSET)/MS_OF_DAY)>>0;
	}

	function offset2date(offset){
		return new Date(offset*MS_OF_DAY+TIMEZONE_OFFSET);
	}

	merge(exports,{

		DateFormat: DateFormat,

		date2offset: date2offset,
		offset2date: offset2date
	});

})();