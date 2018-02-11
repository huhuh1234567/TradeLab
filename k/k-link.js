(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_ITERATOR = require("./k-iterator");
	var Iterator = K_ITERATOR.Iterator;

	function LinkNode(value){
		this._ = value;
		this.next$ = null;
	}

	function Link(eq){
		this.size = 0;
		this.___head$ = null;
		this.___eq = eq;
	}

	Link.$$ = function(arr){
		var rst = new Link();
		for(var i=arr.length-1; i>=0; i--){
			rst.offer(arr[i]);
		}
		return rst;
	};

	function Link_remove$(link,previous$,$){
		if($!==null){
			if(previous$===null){
				link.___head$ = $.next$;
			}
			else{
				previous$.next$ = $.next$;
			}
			link.size--;
		}
		return $;
	}

	function Link_insert$(link,previous$,$){
		if(previous$===null){
			$.next$ = link.___head$;
			link.___head$ = $;
		}
		else{
			$.next$ = previous$.next$;
			previous$.next$ = $;
		}
		link.size++;
		return $;
	}

	merge(Link.prototype,{
		head: function(){
			return this.size===0?undefined:this.___head$._;
		},
		offer: function(value){
			Link_insert$(this,null,new LinkNode(value));
		},
		poll: function(){
			var v = undefined;
			if(this.size>0){
				v = this.___head$._;
				Link_remove$(this,null,this.___head$);
			}
			return v;
		},
		_: function(){
			var link = this;
			var end = false;
			var last$ = null;
			var previous$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						var next$ = last$===null?link.___head$:last$.next$;
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
				replace: function(value){
					if(last$!==null){
						last$._ = value;
					}
				},
				remove: function(){
					var v = undefined;
					if(previous$!==last$){
						v = last$._;
						if(Link_remove$(link,previous$,last$).next$===null){
							end = true;
						}
						last$ = previous$;
					}
					return v;
				},
				insert_before: function(value){
					var $ = Link_insert$(link,previous$,new LinkNode(value));
					if(last$===previous$){
						last$ = $;
					}
					previous$ = $;
				},
				insert_after: function(value){
					var $ = Link_insert$(link,last$,new LinkNode(value));
					if(last$===previous$){
						previous$ = $;
					}
					else{
						previous$ = last$;
					}
					last$ = $;
				}
			});
		},
		__: function(){
			var rst = new Array(this.size);
			var current$ = this.head$;
			for(var i=0; i<this.size; i++){
				rst[i] = current$._;
				current$=current$.next$
			}
			return rst;
		},
		find_: function(target,block){
			var rv = undefined;
			var rit = undefined;
			var found = this._().foreach(function(v,it){
				if(this.___eq!==undefined){
					if(this.___eq(v,target)){
						return block(v,it);
					}
				}
				else{
					if(v===target){
						return block(v,it);
					}
				}
			});
		},
		find: function(target){
			return this.find_(target,function(v){
				return v;
			});
		},
		remove: function(target){
			return this.find_(target,function(v,it){
				return it.remove();
			});
		},
		insert_before: function(target,value){
			this.find_(target,function(v,it){
				it.insert_before(value);
				return true;
			});
		},
		insert_after: function(target,value){
			this.find_(target,function(v,it){
				it.insert_after(value);
				return true;
			});
		}
	});

	exports.Link = Link;

})();