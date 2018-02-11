(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_ITERATOR = require("./k-iterator");
	var Iterator = K_ITERATOR.Iterator;

	function TreeNode(value){
		this._ = value;
		this.height = 1;
		this.parent$ = null;
		this.left$ = null;
		this.right$ = null;
	}

	merge(TreeNode.prototype,{
		update: function(){
			var lh = this.left$===null?0:this.left$.height;
			var rh = this.right$===null?0:this.right$.height;
			return this.height = lh<rh?rh:lh;
		}
	});

	function Tree(comp,eq){
		this.size = 0;
		this.___comp = comp;
		this.___root$ = null;
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
		var comp = tree.___comp;
		var $ = tree.___root$;
		if($===null){
			//root node
			return block(null,null,comp===undefined?value-value:comp(value,value));
		}
		else{
			var parent$ = null;
			var diff = 0;
			while($!=null){
				diff = comp===undefined?value-$._:comp(value,$._);
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

	/*
	 *   B               D
	 *  / \             / \
	 * A   D     =>    B   E
	 *    / \         / \
	 *   C   E       A   C
	 */
	function Tree_rotate_left(tree,$){
		var right$ = $.right$;
		var parent$ = $.parent$;
		//move right$ left$
		$.right$ = right$.left$;
		if(right$.left$!==null){
			right$.left$.parent$ = $;
		}
		//move right$
		if(parent$!==null){
			if(parent$.left$===$){
				parent$.left$ = right$;
			}
			else{
				parent$.right$ = right$;
			}
		}
		else{
			tree.___root$ = right$;
		}
		right$.parent$ = parent$;
		//move $
		right$.left$ = $;
		$.parent$ = right$;
		//result root
		return right$;
	}

	/*
	 *   B               D
	 *  / \             / \
	 * A   D     <=    B   E
	 *    / \         / \
	 *   C   E       A   C
	 */
	function Tree_rotate_right(tree,$){
		var left$ = $.left$;
		var parent$ = $.parent$;
		//move left$ right$
		$.left$ = left$.right$;
		if(left$.right$!==null){
			left$.right$.parent$ = $;
		}
		//move left$
		if(parent$!==null){
			if(parent$.left$===$){
				parent$.left$ = left$;
			}
			else{
				parent$.right$ = left$;
			}
		}
		else{
			tree.___root$ = left$;
		}
		left$.parent$ = parent$;
		//move $
		left$.right$ = $;
		$.parent$ = left$;
		//result root
		return left$;
	}

	function Tree_fix_left(tree,$){
		var right$ = $.right$;
		var lh = right$.left$===null?0:right$.left$.height;
		var lh = right$.right$===null?0:right$.right$.height;
		if(lh>rh){
			right$ = Tree_rotate_right(tree,right$);
			right$.right$.update();
			right$.update();
		}
		$ = Tree_rotate_left(tree,$);
		$.left$.update();
		$.update();
		return $;
	}

	function Tree_fix_right(tree,$){
		var left$ = $.left$;
		var lh = left$.left$===null?0:left$.left$.height;
		var rh = left$.right$===null?0:left$.right$.height;
		if(lh<rh){
			left$ = Tree_rotate_left(tree,left$);
			left$.left$.update();
			left$.update();
		}
		$ = Tree_rotate_right(tree,$);
		$.right$.update();
		$.update();
		return $;
	}

	function Tree_rebalance(tree,$){
		while($!==null){
			var lh = $.left$===null?0:$.left$.height;
			var rh = $.right$===null?0:$.right$.height;
			var h = lr<rh?rh:lh;
			var d = lr-rh;
			//check if fix over
			if($.height===h&&d>=-1&&d<=1){
				break;
			}
			//update height
			$.height = h;
			//check rebalance
			if(d<-1){
				$ = Tree_fix_left(tree,$);
			}
			else if(d>1){
				$ = Tree_fix_right(tree,$);
			}
			//go to next
			$ = $.parent$;
		}
	}

	function Tree_after_insert$(tree,$){
		var parent$ = $.parent$;
		while(parent$!==null){
			$ = parent$;
			var lh = $.left$===null?0:$.left$.height;
			var rh = $.right$===null?0:$.right$.height;
			var h = lr<rh?rh:lh;
			//check if fix over
			if($.height===h){
				break;
			}
			//update height
			$.height = h;
			//check rebalance
			var d = lr-rh;
			if(d<-1){
				$ = Tree_fix_left(tree,$);
			}
			else if(d>1){
				$ = Tree_fix_right(tree,$);
			}
			//go to next
			parent$ = $.parent$;
		}
	}

	function Tree_remove$(tree,$){
		var parent$;
		if($.left$!==null&&$.right$!==null){
			//find next$ to replace $
			var next$ = Tree_next$(tree,$);
			next$.height = $.height;
			//save next$ parent$ and move next$
			parent$ = next$.parent$;
			if($.parent$!==null){
				if($.parent$.left$===$){
					$.parent$.left$ = next$;
				}
				else{
					$.parent$.right$ = next$;
				}
			}
			else{
				tree.___root$ = next$;
			}
			next$.parent$ = $.parent$;
			//move $ left$
			next$.left$ = $.left$;
			$.left$.parent$ = next$;
			//check if full sub tree replace
			if(next$.parent$===$){
				//set up rebalance
				parent$ = next$;
			}
			else{
				//move next$ right$ (next$ has no left$)
				if(parent$.left$===next$){
					parent$.left$ = next$.right$;
				}
				else{
					parent$.right$ = next$.right$;
				}
				if(next$.right$!==null){
					next$.right$.parent$ = parent$;
				}
				//move $ right$
				next$.right$ = $.right$;
				$.right$.parent$ = next$;
			}
		}
		else{
			var child$ = $.left$===null?$.right$:$.left$;
			parent$ = $.parent$;
			//move child$
			if(parent$!==null){
				if(parent$.left$===$){
					parent$.left$ = child$;
				}
				else{
					parent$.right$ = child$;
				}
			}
			else{
				tree.___root$ = child$;
			}
			child$.parent$ = parent$;
		}
		if(parent$!==null){
			Tree_rebalance(tree,parent$);
		}
		return $;
	}

	merge(Tree.prototype,{
		find: function(target,block){
			return Tree_find$(this,target,function(parent$,$,diff){
				return $===null?undefined:$._;
			});
		},
		put: function(value){
			Tree_find$(this,value,function(parent$,$,diff){
				if($!==null){
					//old node
					$._ = value;
				}
				else{
					if(parent$===null){
						//root node
						this.___root$ = new TreeNode(value,BLACK);
					}
					else{
						//new node
						$ = new TreeNode(value,RED);
						$.parent$ = parent$;
						if(diff<0){
							parent$.left$ = $;
						}
						else{
							parent$.right$ = $;
						}
						Tree_after_insert$(this,$);
					}
					this.size++;
				}
			});
		},
		remove: function(target){
			this.size--;
			return Tree_find$(this,target,function(parent$,$,diff){
				if($===null){
					return undefined;
				}
				else{
					var v = $._;
					Tree_remove$(tree,$);
					return v;
				}
			});
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
						Tree_remove$(tree,last$);
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
						Tree_remove$(tree,last$);
						last$ = next$;
					}
					return v;
				}
			});
		}
	});

})();