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

	function Tree(comp){
		this.size = 0;
		this.___root$ = null;
		if(comp!==undefined){
			this.___comp = comp;
		}
	}

	function Tree_first$(tree){
		var $ = tree.___root$;
		if($!==null){
			while($.left$!==null){
				$ = $.left$;
			}
		}
		return $;
	}

	function Tree_last$(tree){
		var $ = tree.___root$;
		if($!==null){
			while($.right$!==null){
				$ = $.right$;
			}
		}
		return $;
	}

	function Tree_next$(tree,$){
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
	}

	function Tree_previous$(tree,$){
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

	function Tree_find$(tree,value,block){
		var $ = tree.___root$;
		if($===null){
			//root node
			return block(null,null,tree.___comp(value,value));
		}
		else{
			var parent$ = null;
			var diff = 0;
			while($!=null){
				diff = tree.___comp(value,$._);
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
	}

	merge(Tree.prototype,{
		___comp: function(l,r){
			return l===r?0:l<r?-1:1;
		},
		find: function(target,block){
			return Tree_find$(this,target,function(parent$,$,diff){
				return $===null?undefined:$._;
			});
		},
		put: function(value){
			var tree = this;
			Tree_find$(tree,value,function(parent$,$,diff){
				if($!==null){
					//old node
					$._ = value;
				}
				else{
					tree.___insert$(parent$,new TreeNode(value),diff);
				}
			});
		},
		remove: function(target){
			var tree = this;
			this.size--;
			return Tree_find$(tree,target,function(parent$,$,diff){
				if($===null){
					return undefined;
				}
				else{
					var v = $._;
					tree.___remove$(tree,$);
					return v;
				}
			});
		},
		first: function(){
			var $ = Tree_first$(tree);
			return $===null?undefined:$._;
		},
		last: function(){
			var $ = Tree_last$(tree);
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
						var next$ = last$===null?Tree_first$(tree):Tree_next$(tree,last$);
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
						tree.___remove$(tree,last$);
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
						var previous$ = last$===null?Tree_last$(tree):Tree_previous$(tree,last$);
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
						tree.___remove$(tree,last$);
						last$ = next$;
					}
					return v;
				}
			});
		}
	});

	exports.Tree = Tree;

})();