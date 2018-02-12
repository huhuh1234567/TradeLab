
global.merge = require("./k").merge;

merge(global,require("./k-iterator"));
merge(global,require("./k-dlink"));
merge(global,require("./k-avltree"));

DLink.$$(["hjq","zb"])._r_().foreach(function(name){
	console.error("hello "+name);
});

count_(20).foreach(function(){

	var ins = [0,1,2,3,4,5,6,7,8,9];
	var outs = [0,1,2,3,4,5,6,7,8,9];
	var tree = new AVLTree();
	var r;
	
	//test insert
	count_(10).foreach(function(){
		var index = Math.floor(Math.random()*ins.length);
		var v = ins.splice(index,1)[0];
		tree.put(v);
	});
	r = "";
	tree._().foreach(function(v){
		r += v+" ";
	});
	console.error(r);

	//test remove
	count_(5).foreach(function(){
		var index = Math.floor(Math.random()*outs.length);
		var v = outs.splice(index,1)[0];
		tree.remove(v);
	});
	r = "";
	tree._().foreach(function(v){
		r += v+" ";
	});
	console.error(r);
});