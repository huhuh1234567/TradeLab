(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_UTIL = require("../k/k-util");
	var kv = K_UTIL.kv;

	function Iterator(){

	}

	merge(Iterator.prototype,{
		toArray: function(){
			var rst = [];
			this.foreach(function(v){
				rst.push(v);
			});
			return rst;
		},
		toObject: function(){
			var rst = {};
			this.foreach(function(kv){
				rst[kv.$] = kv._;
			});
			return rst;
		},
		foreach: function(block){
			var end = false;
			var v = undefined;
			while(!end&&v===undefined){
				var last = this.next();
				if(last!==undefined){
					v = block(last,this);
				}
				else{
					end = true;
				}
			}
			return v;
		},
		map_: function(func){
			var src = this;
			var end = false;
			return merge(new Iterator(),{
				next: function(){
					if(end){
						return undefined;
					}
					else{
						var v = undefined;
						var last = src.next();
						if(last!==undefined){
							v = func(last);
						}
						else{
							end = true;
						}
						return v;
					}
				}
			});
		},
		filter_: function(pred){
			var src = this;
			var end = false;
			return merge(new Iterator(),{
				next: function(){
					if(end){
						return undefined;
					}
					else{
						var v = undefined;
						while(!end&&v===undefined){
							var last = src.next();
							if(last!==undefined){
								v = pred(last)?last:undefined;
							}
							else{
								end = true;
							}
						}
						return v;
					}
				}
			});
		},
		flatMap_: function(func){
			var src = this;
			var end = false;
			var buffer = undefined;
			return merge(new Iterator(),{
				next: function(){
					if(end){
						return undefined;
					}
					else{
						var v = undefined;
						while(!end&&v===undefined){
							while(!end&&buffer===undefined){
								var last = src.next();
								if(last!==undefined){
									buffer = func(last);
								}
								else{
									end = true;
								}
							}
							if(buffer!==undefined){
								v = buffer.next();
							}
						}
						return v;
					}
				}
			});
		}
	});

	function count_(total){
		var count = 0;
		return merge(new Iterator(),{
			next: function(){
				if(count<total){
					var v = count;
					count++;
					return v;
				}
				else{
					return undefined;
				}
			}
		});
	}

	function count_r_(total){
		var count = total;
		return merge(new Iterator(),{
			next: function(){
				if(count>0){
					count--;
					return count;
				}
				else{
					return undefined;
				}
			}
		});
	}

	function array_(arr,offset,length){
		if(offset===undefined||length===undefined){
			offset = 0;
			length = arr.length;
		}
		return count_(length).map_(function(i){
			return arr[offset+i];
		});
	}

	function array_r_(arr,offset,length){
		if(offset===undefined||length===undefined){
			offset = 0;
			length = arr.length;
		}
		return count_r_(length).map_(function(i){
			return arr[offset+i];
		});
	}

	function object_(obj){
		return array_(Object.keys(obj)).map_(function(k){
			return kv(k,obj[k]);
		});
	}

	function nil_(){
		return merge(new Iterator(),{
			next: function(){
				return undefined;
			}
		});
	}

	function once_(func){
		var end = false;
		return merge(new Iterator(),{
			next: function(){
				if(!end){
					end = true;
					return func();
				}
				else{
					return undefined;
				}
			}
		});
	}

	function union_(){
		return count_(arguments.length).flatMap_(function(i){
			return arguments[i];
		});
	}

	exports.Iterator = Iterator;
	exports.count_ = count_;
	exports.count_r_ = count_r_;
	exports.array_ = array_;
	exports.array_r_ = array_r_;
	exports.object_ = object_;
	exports.nil_ = nil_;
	exports.once_ = once_;
	exports.union_ = union_;

})();