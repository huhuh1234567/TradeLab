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

	function DLink(eq){
		this.size = 0;
		this.___head$ = null;
		this.___tail$ = null;
		if(eq!==undefined){
			this.___eq = eq;
		}
	}

	DLink.$$ = function(arr){
		var rst = new DLink();
		for(var i=0; i<arr.length; i++){
			rst.push(arr[i]);
		}
		return rst;
	};

	function DLink_insert$(dlink,$,previous$,next$){
		$.next$ = next$;
		$.previous$ = previous$;
		if(previous$!==null){
			previous$.next$ = $
		}
		else{
			dlink.___head$ = $
		}
		if(next$!==null){
			next$.previous$ = $;
		}
		else{
			dlink.___tail$ = $;
		}
		dlink.size++;
		return $;
	};

	function DLink_insert$before(dlink,$,next$){
		return dlink.insert$($,next$!==null?next$.previous$:dlink.___tail$,next$);
	};

	function DLink_insert$after(dlink,$,previous$){
		return dlink.insert$($,previous$,previous$!==null?previous$.next$:dlink.___head$);
	};

	function DLink_remove$(dlink,$){
		var next$ = $.next$;
		var previous$ = $.previous$;
		if(previous$!=null){
			previous$.next$ = next$;
		}
		else{
			dlink.___head$ = next$;
		}
		if(next$!=null){
			next$.previous$ = previous$;
		}
		else{
			dlink.___tail$ = previous$;
		}
		dlink.size--;
		return $;
	};

	merge(DLink.prototype,{
		___eq: function(l,r){
			return l===r;
		},
		push: function(value){
			return DLink_insert$(this,new DLinkNode(value),this.___tail$,null);
		},
		pop: function(){
			if(this.size===0){
				return undefined;
			}
			else{
				return DLink_remove$(this,this.___tail$)._;
			}
		},
		offer: function(value){
			return DLink_insert$(this,new DLinkNode(value),null,this.___head$);
		},
		poll: function(list){
			if(this.size===0){
				return undefined;
			}
			else{
				return DLink_remove$(this,this.___head$)._;
			}
		},
		head: function(){
			return this.size===0?undefined:this.___head$._;
		},
		tail: function(){
			return this.size===0?undefined:this.___tail$._;
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
						var next$ = last$===null?dlink.___head$:last$.next$;
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
						if(DLink_remove$(dlink,last$).next$===null){
							end = true;
						}
						last$ = previous$;
					}
					return v;
				},
				insert_before: function(value){
					var $ = DLink_insert$after(dlink,previous$,new DLinkNode(value));
					if(last$===previous$){
						last$ = $;
					}
					previous$ = $;
				},
				insert_after: function(value){
					var $ = DLink_insert$after(dlink,last$,new DLinkNode(value));
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
						var previous$ = last$===null?dlink.___tail$:last$.previous$;
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
						if(DLink_remove$(dlink,last$).previous$===null){
							end = true;
						}
						last$ = next$;
					}
					return v;
				},
				insert_before: function(value){
					var $ = DLink_insert$before(dlink,last$,new DLinkNode(value));
					if(last$===next$){
						next$ = $;
					}
					else{
						next$ = last$;
					}
					last$ = $;
				},
				insert_after: function(value){
					var $ = DLink_insert$before(dlink,next$,new DLinkNode(value));
					if(last$===next$){
						last$ = $;
					}
					next$ = $;
				}
			});
		},
		__: function(){
			var rst = new Array(this.size);
			var current$ = this.___head$;
			for(var i=0; i<this.size; i++){
				rst[i] = current$._;
				current$=current$.next$
			}
			return rst;
		},
		sort: function(less){
			var current$ = this.___tail$;
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
			var found = this._().foreach(function(v,it){
				if(this.___eq(v,target)){
					return block(v,it);
				}
			});
		},
		find_r_: function(target,block){
			var found = this._r_().foreach(function(v,it){
				if(this.___eq(v,target)){
					return block(v,it);
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
	exports.___DLinkNode = DLinkNode;

})();