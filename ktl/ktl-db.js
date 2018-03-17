(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;
	var array_ = K_ITERATOR.array_;
	var object_ = K_ITERATOR.object_;

	var FileLineIterator = require("../k/k-file-line-iterator").FileLineIterator;

	var AVLTree = require("../k/k-avltree").AVLTree;

	var Data = require("../ktl/ktl-data").Data;

	var LEN_SLOT = 1024;
	var LEN_SEGMENT = 8192;
	var LEN_VAL = 8;

	var LEN_BUFFER = LEN_SEGMENT*LEN_VAL;

	var SHIFT_SLOT = 10;
	var SHIFT_SEGMENT = 13;
	var SHIFT_VAL = 3;

	var SHIFT_BUFFER = SHIFT_SEGMENT+SHIFT_VAL;

	var $comp = function(l,r){
		return l.$===r.$?0:l.$<r.$?-1:1;
	};

	function Database(dir,tag){

		//load indices

		var fibers = {};

		var total = 0;

		new FileLineIterator(dir+"/"+tag).foreach(function(line){
			var vs = line.split("|");
			var name = vs[0];
			var cluster = parseInt(vs[1]);
			var slot = parseInt(vs[2]);
			var offset = parseInt(vs[3]);
			var length = parseInt(vs[4]);
			var index = cluster*LEN_SLOT+slot;
			fibers[name] = [cluster,slot,offset,length];
			if(index<=total){
				total = index+1;
			}
		});

		//load pages

		var cluster2pages = new AVLTree($comp);

		array_(fs.readdirSync(dir)).foreach(function(fn){
			var vs = fn.split("_");
			if(vs[0]===tag){
				var cluster = parseInt(vs[1]);
				var segment = parseInt(vs[2]);
				var cluster_pages = cluster2pages.find({
					$: cluster
				});
				if(cluster_pages===undefined){
					cluster_pages = {
						$: cluster,
						_: new AVLTree($comp)
					}
					cluster2pages.put(cluster_pages);
				}
				cluster_pages._.put({
					$: segment,
					_: dir+"/"+fn
				});
			}
		});

		return {
			load: function(name){
				var rst = new Data();
				var fiber = fibers[name];
				if(fiber!==undefined){
					var cluster = fiber[0];
					var slot = fiber[1];
					var offset = fiber[2];
					var length = fiber[3];
					if(length>0){

						rst.offset = offset;
						rst.data = new Array(length);

						var index = 0;

						var cluster_pages = cluster2pages.find({
							$: cluster
						});
						var pages = cluster_pages===undefined?undefined:cluster_pages._;
							
						var current = offset;

						var buf = new Buffer(LEN_BUFFER);

						var rest;
						while((rest=offset+length-current)>0){
							//truncate to within segment
							var segment = current>>SHIFT_SEGMENT;
							var start = current-(segment<<SHIFT_SEGMENT);
							rest = Math.min(rest,LEN_SEGMENT-start);
							//step to next
							current += rest;
							//int segment offset
							var len = 0;
							//find file
							var page = pages===undefined?undefined:pages.find({
								$: segment
							});
							if(page!==undefined){
								//read to buffer
								var fd = fs.openSync(page._,"r");
								len = fs.readSync(fd,buf,0,rest<<SHIFT_VAL,(slot<<SHIFT_BUFFER)+(start<<SHIFT_VAL))>>SHIFT_VAL;
								fs.closeSync(fd);
								//truncate to below rest
								if(len>rest){
									len = rest;
								}
								//fill data
								count_(len).foreach(function(i){
									rst.data[index] = buf.readDoubleLE(i<<SHIFT_VAL);
									index++;
								});
							}
							//pad NaN
							rest -= len;
							if(rest>0){
								count_(rest).foreach(function(i){
									rst.data[index] = Number.NaN;
									index++;
								});
							}
						}
					}
				}
				return rst;
			},
			save: function(name,target){
				var fiber = fibers[name];
				var cluster,slot,offset,length;
				if(fiber===undefined){
					var index = total;
					total++;
					cluster = index>>SHIFT_SLOT;
					slot = index-(cluster<<SHIFT_SLOT);
					offset = target.offset;
					length = target.data.length;
					fiber = [cluster,slot,offset,length];
					fibers[name] = fiber;
				}
				else{
					cluster = fiber[0];
					slot = fiber[1];
					if(target.length===0){
						offset = fiber[2];
						length = fiber[3];
					}
					else{
						offset = Math.min(target.offset,fiber[2]);
						length = Math.max(target.offset+target.data.length,fiber[2]+fiber[3])-offset;
					}
					fiber[2] = offset;
					fiber[3] = length;
				}
				if(target.data.length>0){
	
					offset = target.offset;
					length = target.data.length;

					var index = 0;

					var cluster_pages = cluster2pages.find({
						$: cluster
					});
					if(cluster_pages===undefined){
						cluster_pages = {
							$: cluster,
							_: new AVLTree($comp)
						};
						cluster2pages.put(cluster_pages);
					}
					var pages = cluster_pages._;
						
					var current = offset;

					var buf = new Buffer(LEN_BUFFER);

					var rest;
					while((rest=offset+length-current)>0){
						//truncate to within segment
						var segment = current>>SHIFT_SEGMENT;
						var start = current-(segment<<SHIFT_SEGMENT);
						rest = Math.min(rest,LEN_SEGMENT-start);
						//step to next
						current += rest;
						//find file
						var path;
						var page = pages.find({
							$: segment
						});
						if(page===undefined){
							path = dir+"/"+tag+"_"+cluster+"_"+segment;
							count_(LEN_SEGMENT).foreach(function(i){
								buf.writeDoubleLE(Number.NaN,i<<SHIFT_VAL);
							});
							var fd = fs.openSync(path,"w");
							count_(LEN_SLOT).foreach(function(i){
								fs.writeSync(fd,buf,0,LEN_BUFFER,i<<LEN_BUFFER);
							});
							fs.closeSync(fd);
							page = {
								$: segment,
								_: path
							};
							pages.put(page);
						}
						else{
							path = page._;
						}
						//write data
						count_(rest).foreach(function(i){
							buf.writeDoubleLE(target.data[index],i<<SHIFT_VAL);
							index++;
						});
						if(page!==undefined){
							//read to buffer
							var fd = fs.openSync(page._,"r");
							len = fs.readSync(fd,buf,0,rest<<SHIFT_VAL,(slot<<SHIFT_BUFFER)+(start<<SHIFT_VAL))>>SHIFT_VAL;
							fs.closeSync(fd);
							//truncate to below rest
							if(len>rest){
								len = rest;
							}
							//fill data
							count_(len).foreach(function(i){
								rst.data[index] = buf.readDoubleLE(i<<SHIFT_VAL);
								index++;
							});
						}
						//pad NaN
						rest -= len;
						if(rest>0){
							count_(rest).foreach(function(i){
								rst.data[index] = Number.NaN;
								index++;
							});
						}
					}
				}
			}
		};
	}

})();