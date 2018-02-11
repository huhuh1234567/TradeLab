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
		this.size = 0;
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
		insert$: function($,previous$,next$){
			$.next$ = next$;
			$.previous$ = previous$;
			if(previous$!==null){
				previous$.next$ = $
			}
			else{
				this.head$ = $
			}
			if(next$!==null){
				next$.previous$ = $;
			}
			else{
				this.tail$ = $;
			}
			this.size++;
			return $;
		},
		insert$before: function($,next$){
			return this.insert$($,next$!==null?next$.previous$:this.tail$,next$);
		},
		insert$after: function($,previous$){
			return this.insert$($,previous$,previous$!==null?previous$.next$:this.head$);
		},
		remove$: function($){
			var next$ = $.next$;
			var previous$ = $.previous$;
			if(previous$!=null){
				previous$.next$ = next$;
			}
			else{
				this.head$ = next$;
			}
			if(next$!=null){
				next$.previous$ = previous$;
			}
			else{
				this.tail$ = previous$;
			}
			this.size--;
			return $;
		},
		push: function(value){
			return this.insert$(new DLinkNode(value),this.tail$,null);
		},
		pop: function(){
			if(this.size===0){
				return undefined;
			}
			else{
				return this.remove$(this.tail$)._;
			}
		},
		offer: function(list,value){
			return list.insert$(new DLinkNode(value),null,this.head$);
		},
		poll: function(list){
			if(this.size===0){
				return undefined;
			}
			else{
				return this.remove$(this.head$)._;
			}
		},
		head: function(){
			return this.size===0?undefined:this.head$._;
		},
		tail: function(){
			return this.size===0?undefined:this.tail$._;
		},
		_: function(){
			var dlink = this;
			var end = false;
			var last$ = null;
			var previous$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						var next$ = last$===null?dlink.head$:last$.next$;
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
						if(dlink.remove$(last$).next$===null){
							end = true;
						}
						last$ = previous$;
					}
					return v;
				},
				insert_before: function(value){
					var $ = dlink.insert$after(link,previous$,new LinkNode(value));
					if(last$===previous$){
						last$ = $;
					}
					previous$ = $;
				},
				insert_after: function(value){
					var $ = Link_insert$after(link,last$,new LinkNode(value));
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
		_r_: function(){
			var dlink = this;
			var end = false;
			var last$ = null;
			var next$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						var previous$ = last$===null?dlink.tail$:last$.previous$;
						if(previous$!==null){
							v = previous$._;
							if(next$!==last$){
								next$ = last$;
							}
							last$ = previous$;
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
					if(next$!==last$){
						v = last$._;
						if(dlink.remove$(last$).previous$===null){
							end = true;
						}
						last$ = next$;
					}
					return v;
				},
				insert_before: function(value){
					var $ = Link_insert$before(link,last$,new LinkNode(value));
					if(last$===next$){
						next$ = $;
					}
					else{
						next$ = last$;
					}
					last$ = $;
				},
				insert_after: function(value){
					var $ = dlink.insert$before(link,next$,new LinkNode(value));
					if(last$===next$){
						last$ = $;
					}
					next$ = $;
				}
			});
		},
		$_: function(){
			var dlink = this;
			var end = false;
			var last$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						last$ = last$===null?dlink.head$:last$.next$;
						if(last$!==null){
							v = last$;
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
			});
		},
		$_r_: function(){
			var dlink = this;
			var end = false;
			var last$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						last$ = last$===null?dlink.tail$:last$.previous$;
						if(last$!==null){
							v = last$;
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
		find_r_: function(target,block){
			var rv = undefined;
			var rit = undefined;
			var found = this._r_().foreach(function(v,it){
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
		},
		find_r: function(target){
			return this.find_(target,function(v){
				return v;
			});
		},
		remove_r: function(target){
			return this.find_(target,function(v,it){
				return it.remove();
			});
		},
		insert_r_before: function(target,value){
			this.find_(target,function(v,it){
				it.insert_before(value);
				return true;
			});
		},
		insert_r_after: function(target,value){
			this.find_(target,function(v,it){
				it.insert_after(value);
				return true;
			});
		}
	});

	exports.DLink = DLink;

})();