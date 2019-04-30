(function(){

	var K = require("../k/k");
	var merge = K.merge;
	var kv$ = K.kv$;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;
	var array_ = K_ITERATOR.array_;
	var array_r_ = K_ITERATOR.array_r_;
	var nil_ = K_ITERATOR.nil_;

	var KTL = require("../ktl/ktl");
	var anyValid = KTL.anyValid;
	var allValid = KTL.allValid;

	function Data(offset,vals){
		this.offset = offset===undefined?0:offset;
		this.vals = vals===undefined?[]:vals instanceof Array?vals:[vals];
	}

	merge(Data.prototype,{
		find: function(offset){
			var self = this;
			var index = offset-self.offset;
			return index>=0&&index<self.vals.length?self.vals[index]:Number.NaN;
		},
		findNextValid: function(offset){
			var self = this;
			var i = offset-self.offset;
			var ri = i+1;
			var rv = Number.NaN;
			while(ri<self.vals.length){
				rv = self.vals[ri];
				if(!isNaN(rv)){
					break;
				}
				else{
					ri++;
				}
			}
			return isNaN(rv)?undefined:kv$(ri+self.offset,rv);
		},
		findPreviousValid: function(offset){
			var self = this;
			var i = offset-self.offset;
			var ri = i-1;
			var rv = Number.NaN;
			while(ri>0){
				rv = self.vals[ri];
				if(!isNaN(rv)){
					break;
				}
				else{
					ri--;
				}
			}
			return isNaN(rv)?undefined:kv$(ri+self.offset,rv);
		},
		findFirstValid: function(){
			var self = this;
			return self.findNextValid(self.offset-1);
		},
		findLastValid: function(){
			var self = this;
			return self.findPreviousValid(self.offset+self.vals.length);
		},
		update: function(offset,vals){
			var self = this;
			if(!(vals instanceof Array)){
				vals = [vals];
			}
			if(vals.length>0){
				if(self.vals.length==0){
					self.offset = offset;
					var count = 0;
					array_(vals).foreach(function(v){
						self.vals.push(v);
						count++;
					});
				}
				else{
					var first = self.offset-offset;
					var second = first+self.vals.length;
					if(first<0){
						first = -first;
						if(second<0){
							//push 0
							count_(-second).foreach(function(){
								self.vals.push(Number.NaN);
							});
							//push data
							array_(vals).foreach(function(v){
								self.vals.push(v);
							});
						}
						else if(second<vals.length){
							//set data
							count_(second).foreach(function(i){
								self.vals[first+i] = vals[i];
							});
							//push data
							array_(vals,second,vals.length-second).foreach(function(v){
								self.vals.push(v);
							});
						}
						else{
							//set data
							count_(vals.length).foreach(function(i){
								self.vals[first+i] = vals[i];
							});
						}
					}
					else{
						if(vals.length<first){
							//unshift 0
							count_(first-vals.length).foreach(function(){
								self.vals.unshift(Number.NaN);
							});
							//unshift data
							array_r_(vals).foreach(function(v){
								self.vals.unshift(v);
							});
						}
						else if(vals.length<second){
							//unshift data
							array_r_(vals,0,first).foreach(function(v){
								self.vals.unshift(v);
							});
							//set data
							count_(vals.length-first).foreach(function(i){
								self.vals[first+i] = vals[first+i];
							});
						}
						else{
							//unshift data
							array_r_(vals,0,first).foreach(function(v){
								self.vals.unshift(v);
							});
							//set data
							count_(second-first).foreach(function(i){
								self.vals[first+i] = vals[first+i];
							});
							//push data
							array_(vals,second,vals.length-second).foreach(function(v){
								self.vals.push(v);
							});
						}
						self.offset = offset;
					}
				}
			}
			return self;
		},
		_: function(){
			var self = this;
			return count_(self.vals.length).map_(function(i){
				var v = self.vals[i];
				return kv$(self.offset+i,v);
			});
		},
		_r_: function(){
			var self = this;
			return count_r_(self.vals.length).map_(function(i){
				var v = self.vals[i];
				return kv$(self.offset+i,v);
			});
		},
		valid_: function(){
			var self = this;
			return self._().filter(function(kv){
				return !isNaN(kv._);
			});
		},
		valid_r_: function(){
			var self = this;
			return self._r_().filter(function(kv){
				return !isNaN(kv._);
			});
		}
	});

	merge(Data,{
		startOf: function(datas){
			var start = undefined;
			array_(datas).foreach(function(data){
				var _start = data.offset
				start = start===undefined?_start:start<_start?start:_start;
			});
			return start;
		},
		endOf: function(datas){
			var end = undefined;
			array_(datas).foreach(function(data){
				var _end = data.offset+data.vals.length;
				end = end===undefined?_end:end<_end?_end:end;
			});
			return end;
		},
		find: function(datas,offset){
			var len = datas.length;
			if(len>0){
				var rst = new Array(len);
				count_(len).foreach(function(i){
					rst[i] = datas[i].find(offset);
				});
				return kv$(offset,rst);
			}
			else{
				return undefined;
			}
		},
		zip_: function(datas){
			var start = Data.startOf(datas);
			var end = Data.endOf(datas);
			if(start!==undefined&&end!=undefined){
				return count_(end-start).map_(function(i){
					return Data.find(datas,start+i);
				});
			}
			else{
				return nil_();
			}
		},
		zip_r_: function(datas){
			var start = Data.startOf(datas);
			var end = Data.endOf(datas);
			if(start!==undefined&&end!=undefined){
				return count_r_(end-start).map_(function(i){
					return Data.find(datas,start+i);
				});
			}
			else{
				return nil_();
			}
		},
		anyValid_: function(datas){
			return Data.zip_(datas).filter_(anyValid);
		},
		anyValid_r_: function(datas){
			return Data.zip_r_(datas).filter_(anyValid);
		},
		allValid_: function(datas){
			return Data.zip_(datas).filter_(allValid);
		},
		allValid_r_: function(datas){
			return Data.zip_r_(datas).filter_(allValid);
		},
		findNextAnyValid: function(datas,offset){
			var end = Data.endOf(datas);
			if(end!==undefined){
				offset++;
				var rst = undefined;
				while(offset<end){
					var rc = Data.find(datas,offset);
					if(anyValid(rc)){
						rst = rc;
						break;
					}
					else{
						offset++;
					}
				}
				return rst;
			}
			else{
				return undefined;
			}
		},
		findNextAllValid: function(datas,offset){
			var end = Data.endOf(datas);
			if(end!==undefined){
				offset++;
				var rst = undefined;
				while(offset<end){
					var rc = Data.find(datas,offset);
					if(allValid(rc)){
						rst = rc;
						break;
					}
					else{
						offset++;
					}
				}
				return rst;
			}
			else{
				return undefined;
			}
		},
		findPreviousAnyValid: function(datas,offset){
			var start = Data.startOf(datas);
			if(start!==undefined){
				offset--;
				var rst = undefined;
				while(offset>=start){
					var rc = Data.find(datas,offset);
					if(anyValid(rc)){
						rst = rc;
						break;
					}
					else{
						offset--;
					}
				}
				return rst;
			}
			else{
				return undefined;
			}
		},
		findPreviousAllValid: function(datas,offset){
			var start = Data.startOf(datas);
			if(start!==undefined){
				offset--;
				var rst = undefined;
				while(offset>=start){
					var rc = Data.find(datas,offset);
					if(anyValid(rc)){
						rst = rc;
						break;
					}
					else{
						offset--;
					}
				}
				return rst;
			}
			else{
				return undefined;
			}
		},
		findFirstAnyValid: function(datas){
			return Data.findNextAnyValid(datas,Data.startOf(datas)-1);
		},
		findFirstAllValid: function(datas){
			return Data.findNextAllValid(datas,Data.startOf(datas)-1);
		},
		findLastAnyValid: function(datas){
			return Data.findPreviousAnyValid(datas,Data.endOf(datas));
		},
		findLastAllValid: function(datas){
			return Data.findPreviousAllValid(datas,Data.endOf(datas));
		}
	});

	exports.Data = Data;

})();