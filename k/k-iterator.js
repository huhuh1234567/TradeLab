(function(){

	var K = require("./k");
	var merge = K.merge;

	function Iterator(){

	}

	merge(Iterator.prototype,{
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

	function array_(arr){
		var i = 0;
		var length = arr.length;
		return merge(new Iterator(),{
			next: function(){
				if(i<length){
					var v = arr[i];
					i++;
					return v;
				}
				else{
					return undefined;
				}
			}
		});
	}

	function array_r_(arr){
		var i = arr.length;
		return merge(new Iterator(),{
			next: function(){
				if(i>0){
					i--;
					return arr[i];
				}
				else{
					return undefined;
				}
			}
		});
	}

	function object_(obj){
		return array_(Object.keys(obj)).map_(function(k){
			return [k,obj[k]];
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