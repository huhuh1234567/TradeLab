(function(){

	var fs = require("fs");

	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;
	var array_ = K_ITERATOR.array_;
	var array_r_ = K_ITERATOR.array_r_;

	var BUFFER_SIZE = 4096;

	function Data(offset,data){
		this.offset = offset===undefined?0:offset;
		this.data = data===undefined?[]:data instanceof Array?data:[data];
	}

	merge(Data.prototype,{
		find: function(offset){
			var self = this;
			var index = offset-self.offset;
			return index>=0&&index<self.data.length?self.data[index]:Number.NaN;
		},
		update: function(offset,data){
			var self = this;
			if(!(data instanceof Array)){
				data = [data];
			}
			if(data.length>0){
				if(self.data.length==0){
					self.offset = offset;
					array_(data).foreach(function(v){
						self.data.push(v);
					});
				}
				else{
					var first = self.offset-offset;
					var second = first+self.data.length;
					if(first<0){
						first = -first;
						if(second<0){
							//push 0
							count_(-second).foreach(function(){
								self.data.push(Number.NaN);
							});
							//push data
							array_(data).foreach(function(v){
								self.data.push(v);
							});
						}
						else if(second<data.length){
							//set data
							count_(second).foreach(function(i){
								self.data[first+i] = data[first+i];
							});
							//push data
							array_(data,second,data.length-second).foreach(function(v){
								self.data.push(v);
							});
						}
						else{
							//set data
							count_(data.length).foreach(function(i){
								self.data[first+i] = data[i];
							});
						}
					}
					else{
						if(data.length<first){
							//unshift 0
							count_(first-data.length).foreach(function(){
								self.data.unshift(Number.NaN);
							});
							//unshift data
							array_r_(data).foreach(function(v){
								self.data.unshift(v);
							});
						}
						else if(data.length<second){
							//unshift data
							array_r_(data,0,first).foreach(function(v){
								self.data.unshift(v);
							});
							//set data
							count_(data.length-first).foreach(function(i){
								self.data[first+i] = data[first+i];
							});
						}
						else{
							//unshift data
							array_r_(data,0,first).foreach(function(v){
								self.data.unshift(v);
							});
							//set data
							count_(second-first).foreach(function(i){
								self.data[first+i] = data[first+i];
							});
							//push data
							array_(data,second,data.length-second).foreach(function(v){
								self.data.push(v);
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
			return count_(self.data.length).map_(function(i){
				var v = self.data[i];
				return {
					$: self.offset+i,
					_: v
				};
			});
		}
	});

	Data.zip_ = function(datas){
		var len = datas.length;
		var start = datas[0].offset;
		var end = start+datas[0].data.length;
		array_(datas,1).foreach(function(data){
			start = Math.min(data.offset,start);
			end = Math.max(data.offset+data.data.length,end);
		});
		return count_(end-start).map_(function(i){
			var offset = start+i;
			var rst = new Array(len);
			count_(len).foreach(function(i){
				rst[i] = datas[i].find(offset);
			});
			return {
				$: offset,
				_: rst
			};
		});
	}

	exports.Data = Data;

})();