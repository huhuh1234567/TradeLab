(function(){

	var fs = require("fs");

	var K = require("../k/k");
	var merge = K.merge;

	var KK = {};
	merge(KK,require("./k-iterator"));

	var BUFFER_SIZE = 4096;

	function Data(){
		this.offset = 0;
		this.data = [];
	}

	merge(Data.prototype,{
		update: function(offset,data){
			var self = this;
			if(!(data instanceof Array)){
				data = [data];
			}
			if(data.length>0){
				if(self.data.length==0){
					self.offset = offset;
					KK.array_(data).foreach(function(v){
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
							KK.count_(-second).foreach(function(){
								self.data.push(Number.NaN);
							});
							//push data
							KK.array_(data).foreach(function(v){
								self.data.put(v);
							});
						}
						else if(second<data.length){
							//set data
							KK.count_(second).foreach(function(i){
								self.data[first+i] = data[first+i];
							});
							//push data
							KK.array_(data,second,data.length-second).foreach(function(v){
								self.data.push(v);
							});
						}
						else{
							//set data
							KK.count_(data.length).foreach(function(i){
								self.data[first+i] = data[i];
							});
						}
					}
					else{
						if(data.length<first){
							//shift 0
							KK.count_(first-data.length).foreach(function(){
								self.data.shift(Number.NaN);
							});
							//shift data
							KK.array_r_(data).foreach(function(v){
								self.data.shift(v);
							});
						}
						else if(data.length<second){
							//shift data
							KK.array_r_(data,0,first).foreach(function(v){
								self.data.shift(v);
							});
							//set data
							KK.count_(data.length-first).foreach(function(i){
								self.data[first+i] = data[first+i];
							});
						}
						else{
							//shift data
							KK.array_r_(data,0,first).foreach(function(v){
								self.data.shift(v);
							});
							//set data
							KK.count_(second-first).foreach(function(i){
								self.data[first+i] = data[first+i];
							});
							//push data
							KK.array_(data,second,data.length-second).foreach(function(v){
								self.data.push(v);
							});
						}
						self.offset = offset;
					}
				}
			}
			return self;
		},
		write: function(path){
			var self = this;
			var buf = new Buffer(BUFFER_SIZE);
			var fd = fs.openSync(path,"w");
			var offset = 0;
			buf.writeInt32LE(self.offset,offset);
			offset += 4;
			buf.writeInt32LE(self.data.length,offset);
			offset += 4;
			KK.array_(self.data).foreach(function(v){
				buf.writeDoubleLE(v,offset);
				offset += 8;
				if(offset>=BUFFER_SIZE){
					fs.writeSync(fd,buf,0,offset);
					offset = 0;
				}
			});
			if(offset>0){
				fs.writeSync(fd,buf,0,offset);
			}
			fs.closeSync(fd);
			return self;
		},
		read: function(path){
			var self = this;
			var buf = new Buffer(BUFFER_SIZE);
			var fd = fs.openSync(path,"r");
			var len = fs.readSync(fd,buf,0,BUFFER_SIZE);
			if(len>=8){
				var offset = 0;
				self.offset = buf.readInt32LE(offset);
				offset += 4;
				self.data = new Array(buf.readInt32LE(offset));
				offset += 4;
				var i = 0;
				while(len>0){
					while(offset<len){
						self.data[i] = buf.readDoubleLE(offset);
						offset += 8;
						i++;
					}
					len = fs.readSync(fd,buf,0,BUFFER_SIZE);
				}
			}
			return self;
		}
	});

	exports.Data = Data;

})();