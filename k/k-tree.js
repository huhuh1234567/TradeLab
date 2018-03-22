(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_ITERATOR = require("./k-iterator");
	var Iterator = K_ITERATOR.Iterator;

	function TreeNode(value){
		this._ = value;
		this.parent$ = null;
		this.left$ = null;
		this.right$ = null;
	}

	merge(TreeNode.prototype,{
		next$: function(){
			var $ = this;
			if($.right$!==null){
				$ = $.right$;
				while($.left$!=null){
					$ = $.left$;
				}
			}
			else{
				var child$ = $;
				$ = $.parent$;
				while($!==null&&child$===$.right$){
					child$ = $;
					$ = $.parent$;
				}
			}
			return $;
		},
		previous$: function(){
			var $ = this;
			if($.left$!==null){
				$ = $.left$;
				while($.right$!=null){
					$ = $.right$;
				}
			}
			else{
				var child$ = $;
				$ = $.parent$;
				while($!==null&&child$===$.left$){
					child$ = $;
					$ = $.parent$;
				}
			}
			return $;
		}
	});

	function Tree(comp){
		this.size = 0;
		this.___root$ = null;
		if(comp!==undefined){
			this.___comp = comp;
		}
	}

	merge(Tree.prototype,{
		___comp: function(l,r){
			return l<r?-1:l===r?0:1;
		},
		___first$: function(){
			var $ = this.___root$;
			if($!==null){
				while($.left$!==null){
					$ = $.left$;
				}
			}
			return $;
		},
		___last$: function(){
			var $ = this.___root$;
			if($!==null){
				while($.right$!==null){
					$ = $.right$;
				}
			}
			return $;
		},
		___find$: function(target,block){
			var $ = this.___root$;
			if($===null){
				//root node
				return block(null,null,this.___comp(target,target));
			}
			else{
				var parent$ = null;
				var diff = 0;
				while($!=null){
					diff = this.___comp(target,$._);
					if(diff===0){
						//found
						break;
					}
					else{
						parent$ = $;
						if(diff<0){
							$ = $.left$;
						}
						else{
							$ = $.right$;
						}
					}
				}
				//closest node
				return block(parent$,$,diff)
			}
		},
		find: function(target){
			return this.___find$(target,function(parent$,$,diff){
				return $===null?undefined:$._;
			});
		},
		put: function(value){
			var tree = this;
			this.___find$(value,function(parent$,$,diff){
				if($!==null){
					//old node
					$._ = value;
				}
				else{
					tree.size++;
					tree.___insert$(parent$,value,diff);
				}
			});
		},
		remove: function(target){
			var tree = this;
			this.___find$(target,function(parent$,$,diff){
				if($===null){
					return undefined;
				}
				else{
					var v = $._;
					tree.___remove$($);
					tree.size--;
					return v;
				}
			});
		},
		first: function(){
			var $ = this.___first$();
			return $===null?undefined:$._;
		},
		last: function(){
			var $ = this.___last$();
			return $===null?undefined:$._;
		},
		_: function(){
			var tree = this;
			var end = false;
			var last$ = null;
			var previous$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						var next$ = last$===null?tree.___first$():last$.next$();
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
						tree.___remove$(last$);
						last$ = previous$;
					}
					return v;
				}
			});
		},
		_r_: function(){
			var tree = this;
			var end = false;
			var last$ = null;
			var next$ = null;
			return merge(new Iterator(),{
				next: function(){
					if(!end){
						var v = undefined;
						var previous$ = last$===null?tree.___last$():last$.previous$();
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
						tree.___remove$(last$);
						last$ = next$;
					}
					return v;
				}
			});
		}
	});

	exports.Tree = Tree;
	exports.___TreeNode = TreeNode;

})();