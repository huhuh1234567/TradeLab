(function(){

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
		for(; r$&&r$!==l$; r$ = r$.next$){
		}
		return r$===null;
	};

	List.prototype = {
		constructor: List,
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
			return {
				remove: function(){
					if(last$!=null){
						var next$ = list.remove$(last$);
						last$ = next$===null?list.tail$:next$.previous$;
					}
				},
				next: function(){
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
				}
			}
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
	};

	function foreach_(itor,block){
		var end = false;
		var v = undefined;
		while(!end&&v===undefined){
			var last = itor.next();
			if(last!==undefined){
				v = block(last);
			}
			else{
				end = true;
			}
		}
		return v;
	}

	function map_(itor,func){
		return {
			next: function(){
				var last = itor.next();
				return last!==undefined?func(last):undefined;
			}
		}
	}

	function filter_(itor,pred){
		var end = false;
		return {
			next: function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					while(!end&&v===undefined){
						var last = itor.next();
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
		}
	}

	function flatMap_(itor,func){
		var end = false;
		var buffer = undefined;
		return {
			next: function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					while(!end&&v===undefined){
						while(!end&&buffer===undefined){
							var last = itor.next();
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
		}
	}

	function count_(total){
		var count = 0;
		return {
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
		}
	}

	function array_(arr,offset,length){
		if(offset===undefined){
			offset = 0;
		}
		if(length===undefined){
			length = arr.length-offset;
		}
		var i = offset;
		return {
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
		}
	}

	function nil_(){
		return {
			next: function(){
				return undefined;
			}
		}
	}

	function once_(func){
		var end = false;
		return {
			next: function(){
				if(!end){
					end = true;
					return func();
				}
				else{
					return undefined;
				}
			}
		};
	}

})();