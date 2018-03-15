(function(){

	var fs = require("fs");
	var iconv = require("iconv-lite");

	var K = require("./k");
	var merge = K.merge;

	var K_ITERATOR = require("./k-iterator");
	var Iterator = K_ITERATOR.Iterator;

	var BUFFER_SIZE = 4096;

	var LF = "\n".charCodeAt(0);
	var CR = "\r".charCodeAt(0);

	function clone(buf, start, end){
		var len = end-start;
		var neo = new Buffer(len);
		if(len>0){
			buf.copy(neo,0,start,end);
		}
		return neo;
	}

	function FileLineIterator(path,encoding){
		var fd = fs.openSync(path,"r");
		var buf = new Buffer(BUFFER_SIZE);
		var pending = [];
		var last = 0;
		var bufs = [];
		var len = 1;
		var end = false;
		return merge(new Iterator(),{
			next: function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					if(bufs.length===0&&len>0){
						while(bufs.length===0&&len>0){
							len = fs.readSync(fd,buf,0,BUFFER_SIZE);
							if(len>0){
								//split
								var neos = [];
								//...\r \n...
								var start = last===CR&&buf[0]===LF?1:0;
								var curr = start;
								while(curr<len){
									var sep = -1;
									if(buf[curr]===LF){
										//\n
										sep = curr;
										curr++;
									}
									else if(buf[curr]===CR){
										//\r
										sep = curr;
										curr++;
										if(curr<len&&buf[curr]===LF){
											//\r\n
											curr++;
										}
									}
									else{
										//this line
										curr++;
									}
									if(sep>=0){
										neos.push(clone(buf,start,sep));
										start = curr;
									}
								}
								if(neos.length>0){
									//concat head
									if(pending.length>0){
										pending.push(neos.shift());
										bufs.push(Buffer.concat(pending));
										pending = [];
									}
									//push mid
									while(neos.length>0){
										bufs.push(neos.shift());
									}
								}
								if(start<curr){
									//pending tail
									pending.push(clone(buf,start,curr));
								}
								//save last char
								last = buf[len-1];
							}
							else{
								//end of file
								if(pending.length>0){
									bufs.push(Buffer.concat(pending));
									pending = [];
								}
							}
						}
					}
					if(bufs.length>0){
						var b = bufs.shift();
						v = encoding===undefined?b.toString():iconv.decode(b,encoding);
					}
					else{
						fs.closeSync(fd);
						end = true;
					}
					return v;
				}
			},
			close: function(){
				if(!end){
					fs.closeSync(fd);
					end = true;
				}
			}
		});
	}

	exports.FileLineIterator = FileLineIterator;

})();