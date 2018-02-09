(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_ITERATOR = require("./k-iterator");
	var Iterator = K_ITERATOR.Iterator;

	function DLinkNode(value){
		this._ = value;
		this.next$ = null;
		this.previous$ = null;
	}

	function DLink(){
		this.length = 0;
		this.head$ = null;
		this.tail$ = null;
	}

	DLink.$ = function(value){
		return new DLinkNode(value);
	};

	DLink.$$ = function(arr){
		var rst = new DLink();
		for(var i=0; i<arr.length; i++){
			rst.push(arr[i]);
		}
		return rst;
	};

	merge(DLink.prototype,{
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
			return this.insert$(DLink.$(value),null);
		},
		pop: function(list){
			var rst = this.tail$._;
			this.remove$(this.tail$);
			return rst;
		},
		offer: function(list,value){
			return list.insert$(DLink.$(value),list.head$);
		},
		poll: function(list){
			var rst = this.head$._;
			this.remove$(this.head$);
			return rst;
		},
		_: function(){
			var list = this;
			var end = false;
			var last$ = null;
			return merge(new Iterator(),{
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
				},
				remove: function(){
					if(last$!=null){
						var next$ = list.remove$(last$);
						last$ = next$===null?list.tail$:next$.previous$;
					}
				}
			});
		},
		_r_: function(){
			var list = this;
			var end = false;
			var last$ = null;
			return merge(new Iterator(),{
				next: function(){
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
				},
				remove: function(){
					if(last$!=null){
						last$ = list.remove$(last$);
					}
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
		}
	});

	exports.DLink = DLink;

})();