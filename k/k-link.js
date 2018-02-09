(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_ITERATOR = require("./k-iterator");
	var Iterator = K_ITERATOR.Iterator;

	function LinkNode(value){
		this._ = value;
		this.next$ = null;
	}

	function Link(){
		this.length = 0;
		this.___head$ = null;
	}

	Link.$$ = function(arr){
		var rst = new Link();
		for(var i=arr.length-1; i>=0; i--){
			rst.offer(arr[i]);
		}
		return rst;
	};

	merge(Link.prototype,{
		peek: function(){
			return this.___head$===null?undefined:___head$._;
		},
		offer: function(value){
			var $ = new LinkNode(value);
			$.next$ = this.___head$;
			this.___head$ = $;
			this.length++;
		},
		poll: function(){
			if(this.___head$===null){
				return undefined;
			}
			else{
				var $ = this.___head$;
				this.___head$ = $.next$;
				this.length--;
				return $._;
			}
		},
		_: function(){
			var list = this;
			var end = false;
			var last$ = null;
			var previous$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						var next$ = last$===null?list.___head$:last$.next$;
						if(next$!==null){
							v = next$._;
							if(previous$!==last$){
								previous$ = last$;
							}
							last$ = next$;
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
					if(previous$!==last$){
						if(previous$===null){
							list.___head$ = last$.next$;
						}
						else{
							previous$.next$ = last$.next$;
						}
						last$ = previous$;
						list.length--;
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
		}
	});

	exports.Link = Link;

})();