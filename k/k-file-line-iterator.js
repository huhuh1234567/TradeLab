(function(){

	var fs = require("fs");

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
		var pending = null;
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
									//concat first
									if(pending!==null){
										bufs.push(Buffer.concat([pending,neos.shift()]));
										pending = null;
									}
									//push completed
									while(neos.length>0){
										bufs.push(neos.shift());
									}
									//pending last
									if(start<curr){
										pending = clone(buf,start,curr);
									}
								}
								else{
									//concat last
									if(pending!==null){
										pending = Buffer.concat([pending,buf.slice(start,curr)]);
									}
									else{
										pending = clone(buf,start,curr);
									}
								}
								last = buf[len-1];
							}
							else{
								//end of file
								if(pending!==null){
									bufs.push(pending);
									pending = null;
								}
							}
						}
					}
					if(bufs.length>0){
						var b = bufs.shift();
						v = encoding===undefined?b.toString():b.toString(encoding);
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