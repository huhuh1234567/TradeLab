(function(){

	var K = require("./k");
	var merge = K.merge;

	var K_TREE = require("./k-tree");
	var Tree = K_TREE.Tree;
	var TreeNode = K_TREE.___TreeNode;

	function AVLTreeNode(value){
		TreeNode.call(this,value);
		this.height = 1;
	}

	function AVLTreeNode_left$height($){
		return $.left$===null?0:$.left$.height;
	}

	function AVLTreeNode_right$height($){
		return $.right$===null?0:$.right$.height;
	}

	function height(lh,rh){
		return (lh<rh?rh:lh)+1;
	}

	function AVLTreeNode_height($){
		return height(AVLTreeNode_left$height($),AVLTreeNode_right$height($))
	}

	function AVLTree(comp){
		Tree.call(this,comp);
	}

	merge(AVLTreeNode.prototype,TreeNode.prototype);

	merge(AVLTreeNode.prototype,{
		update: function(){
			this.height = AVLTreeNode_height(this);
		}
	});

	merge(AVLTree.prototype,Tree.prototype);

	/*
	 *   B               D
	 *  / \             / \
	 * A   D     =>    B   E
	 *    / \         / \
	 *   C   E       A   C
	 */
	function AVLTree_rotate_left(tree,$){
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
	function AVLTree_rotate_right(tree,$){
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

	function AVLTree_fix_left(tree,$){
		var right$ = $.right$;
		var lh = AVLTreeNode_left$height(right$);
		var rh = AVLTreeNode_right$height(right$);
		if(lh>rh){
			right$ = AVLTree_rotate_right(tree,right$);
			right$.right$.update();
			right$.update();
		}
		$ = AVLTree_rotate_left(tree,$);
		$.left$.update();
		$.update();
		return $;
	}

	function AVLTree_fix_right(tree,$){
		var left$ = $.left$;
		var lh = AVLTreeNode_left$height(left$);
		var rh = AVLTreeNode_right$height(left$);
		if(lh<rh){
			left$ = AVLTree_rotate_left(tree,left$);
			left$.left$.update();
			left$.update();
		}
		$ = AVLTree_rotate_right(tree,$);
		$.right$.update();
		$.update();
		return $;
	}

	function AVLTree_rebalance(tree,$){
		while($!==null){
			var lh = AVLTreeNode_left$height($);
			var rh = AVLTreeNode_right$height($);
			var h = height(lh,rh);
			var d = lh-rh;
			//check if fix over
			if($.height===h&&d>=-1&&d<=1){
				break;
			}
			//update height
			$.height = h;
			//check rebalance
			if(d<-1){
				$ = AVLTree_fix_left(tree,$);
			}
			else if(d>1){
				$ = AVLTree_fix_right(tree,$);
			}
			//go to next
			$ = $.parent$;
		}
	}

	merge(AVLTree.prototype,{
		___comp: function(l,r){
			return l===r?0:l<r?-1:1;
		},
		___insert$: function(parent$,value,diff){
			var $ = new AVLTreeNode(value);
			if(parent$===null){
				//root node
				this.___root$ = $;
			}
			else{
				//new node
				$.parent$ = parent$;
				if(diff<0){
					parent$.left$ = $;
				}
				else{
					parent$.right$ = $;
				}
				//rebalance
				while(parent$!==null){
					$ = parent$;
					var lh = AVLTreeNode_left$height($);
					var rh = AVLTreeNode_right$height($);
					var h = height(lh,rh);
					//check if fix over
					if($.height===h){
						break;
					}
					//update height
					$.height = h;
					//check rebalance
					var d = lh-rh;
					if(d<-1){
						$ = AVLTree_fix_left(this,$);
					}
					else if(d>1){
						$ = AVLTree_fix_right(this,$);
					}
					//go to next
					parent$ = $.parent$;
				}
			}
		},
		___remove$: function($){
			var parent$;
			if($.left$!==null&&$.right$!==null){
				//find next$ to replace $
				var next$ = $.next$();
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
					this.___root$ = next$;
				}
				next$.parent$ = $.parent$;
				//move $ left$
				next$.left$ = $.left$;
				$.left$.parent$ = next$;
				//check if whole sub tree replace
				if(parent$===$){
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
					this.___root$ = child$;
				}
				if(child$!==null){
					child$.parent$ = parent$;
				}
			}
			if(parent$!==null){
				AVLTree_rebalance(this,parent$);
			}
		}
	});

	exports.AVLTree = AVLTree;
	exports.___AVLTreeNode = AVLTreeNode;

})();