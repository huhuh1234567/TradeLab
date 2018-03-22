(function(){

	var fs = require("fs");

	var K = require("../k/k");
	var merge = K.merge;
	var kv$ = K.kv$;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;
	var array_ = K_ITERATOR.array_;
	var array_r_ = K_ITERATOR.array_r_;
	var nil_ = K_ITERATOR.nil_;

	var BUFFER_SIZE = 4096;

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
		update: function(offset,vals){
			var self = this;
			if(!(vals instanceof Array)){
				vals = [vals];
			}
			if(vals.length>0){
				if(self.vals.length==0){
					self.offset = offset;
					array_(vals).foreach(function(v){
						self.vals.push(v);
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
								self.vals[first+i] = vals[first+i];
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
		}
	});

	Data.zip_ = function(datas){
		var len = datas.length;
		if(len>0){
			var start = datas[0].offset;
			var end = start+datas[0].vals.length;
			array_(datas,1).foreach(function(data){
				start = Math.min(data.offset,start);
				end = Math.max(data.offset+data.vals.length,end);
			});
			return count_(end-start).map_(function(i){
				var offset = start+i;
				var rst = new Array(len);
				count_(len).foreach(function(i){
					rst[i] = datas[i].find(offset);
				});
				return kv$(offset,rst);
			});
		}
		else{
			return nil_();
		}
	}

	exports.Data = Data;

})();