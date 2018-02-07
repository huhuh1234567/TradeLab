(function(){

	function merge(base,other){
		for(p in other){
			var v = other[p];
			if(v!==undefined){
				base[p] = v;
			}
			else{
				delete base[p];
			}
		}
		return base;
	}

	function inherit(constructor,base){
		var prototype = Object.create(base.prototype);
		prototype.constructor = constructor;
		constructor.prototype = prototype;
	}

	function Iterator(next){
		this.next = next;
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
		map: function(func){
			var self = this;
			var end = false;
			return new Iterator(function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					var last = self.next();
					if(last!==undefined){
						v = func(last);
					}
					else{
						end = true;
					}
					return v;
				}
			});
		},
		filter: function(pred){
			var self = this;
			var end = false;
			return new Iterator(function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					while(!end&&v===undefined){
						var last = self.next();
						if(last!==undefined){
							v = pred(last)?last:undefined;
						}
						else{
							end = true;
						}
					}
					return v;
				}
			});
		},
		flatMap: function(func){
			var self = this;
			var end = false;
			var buffer = undefined;
			return new Iterator(function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					while(!end&&v===undefined){
						while(!end&&buffer===undefined){
							var last = self.next();
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
			});
		}
	});

	function RemovableIterator(next,remove){
		Iterator.call(this,next)
		this.remove = remove;
	};

	inherit(RemovableIterator,Iterator);

	function ListNode(value){
		this._ = value;
		this.next$ = null;
		this.previous$ = null;
	}

	function List(){
		this.length = 0;
		this.head$ = null;
		this.tail$ = null;
	}

	List.$ = function(value){
		return new ListNode(value);
	};

	List.$$ = function(arr){
		var rst = new List();
		for(var i=0; i<arr.length; i++){
			List.push(arr[i]);
		}
		return rst;
	};

	List.isBefore$ = function(l$,r$){
		for(; r$!==null&&r$!==l$; r$=r$.next$){
		}
		return r$===null;
	};

	merge(List.prototype,{
		insert$: function(target$,next$){
			var previous$ = next$!==null?next$.previous$:this.tail$;
			target$.next$ = next$;
			target$.previous$ = previous$;
			if(previous$){
				previous$.next$ = target$
			}
			else{
				this.head$ = target$
			}
			if(next$){
				next$.previous$ = target$;
			}
			else{
				this.tail$ = target$;
			}
			this.length++;
			return target$;
		},
		remove$: function(target$){
			var next$ = target$.next$;
			var previous$ = target$.previous$;
			if(previous$){
				previous$.next$ = next$;
			}
			else{
				this.head$ = next$;
			}
			if(next$){
				next$.previous$ = previous$;
			}
			else{
				this.tail$ = previous$;
			}
			this.length--;
			return next$;
		},
		push: function(value){
			return this.insert$(List.$(value),null);
		},
		pop = function(list){
			var rst = this.tail$._;
			this.remove$(this.tail$);
			return rst;
		},
		unshift: function(list,value){
			return list.insert$(List.$(value),list.head$);
		},
		shift: function(list){
			var rst = this.head$._;
			this.remove$(this.head$);
			return rst;
		},
		_: function(){
			var list = this;
			var end = false;
			var last$ = null;
			return new RemovableIterator(function(){
				if(!end){
					var v = undefined;
					last$ = last$===null?list.head$:last$.next$;
					if(last$!==null){
						v = last$._;
					}
					else{
						end = true;
					}
					return v;
				}
				else{
					return undefined;
				}
			},function(){
				if(last$!=null){
					var next$ = list.remove$(last$);
					last$ = next$===null?list.tail$:next$.previous$;
				}
			});
		},
		_r_: function(){
			var list = this;
			var end = false;
			var last$ = null;
			return new RemovableIterator(function(){
				if(!end){
					var v = undefined;
					last$ = last$===null?list.tail$:last$.previous$;
					if(last$!==null){
						v = last$._;
					}
					else{
						end = true;
					}
					return v;
				}
				else{
					return undefined;
				}
			},function(){
				if(last$!=null){
					last$ = list.remove$(last$);
				}
			});
		},
		__: function(){
			var rst = new Array(this.length);
			var current$ = this.head$;
			for(var i=0; i<this.length; i++){
				rst[i] = current$._;
				current$=current$.next$
			}
			return rst;
		},
		sort: function(less){
			var current$ = this.tail$;
			while(current$!==null){
				var next$ = current$.next$;
				var previous$ = current$.previous$;
				this.remove$(current$);
				while(next$!==null){
					if(less(next$._,current$._)){
						next$ = next$.next$;
					}
					else{
						break;
					}
				}
				this.insert$(current$,next$);
				current$ = previous$;
			}
		},
		pushAll: function(list){
			for(var current$=list.head$; current$!==null; current$=current$.next$){
				this.push(current$._);
			}
		},
		unshiftAll: function(list){
			for(var current$=list.tail$; current$!==null; current$=current$.previous$){
				this.unshift(current$._);
			}
		}
	});

	function count_(total){
		var count = 0;
		return new Iterator(function(){
			if(count<total){
				var v = count;
				count++;
				return v;
			}
			else{
				return undefined;
			}
		});
	}

	function count_r_(total){
		var count = total;
		return new Iterator(function(){
			if(count>0){
				count--;
				return count;
			}
			else{
				return undefined;
			}
		});
	}

	function array_(arr){
		var i = 0;
		var length = arr.length;
		return new Iterator(function(){
			if(i<length){
				var v = arr[i];
				i++;
				return v;
			}
			else{
				return undefined;
			}
		});
	}

	function array_r_(arr){
		var i = arr.length;
		return new Iterator(function(){
			if(i>0){
				i--;
				return arr[i];
			}
			else{
				return undefined;
			}
		});
	}

	function object_(obj){
		var keys = Object.keys(obj);
		return array_(keys).map(function(k){
			return {
				$: k,
				_: obj[k]
			};
		});
	}

	function nil_(){
		return new Iterator(function(){
			return undefined;
		});
	}

	function once_(func){
		var end = false;
		return new Iterator(function(){
			if(!end){
				end = true;
				return func();
			}
			else{
				return undefined;
			}
		});
	}

	function concat_(){
		return count_(arguments.length).flatMap(function(i){
			return arguments[i];
		});
	}

})();