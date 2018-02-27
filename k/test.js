global.merge = require("./k").merge;

merge(global,require("./k-iterator"));
merge(global,require("./k-dlink"));
merge(global,require("./k-avltree"));
merge(global,require("./k-file-line-iterator"));

array_r_(["hjq","zb"]).foreach(function(name){
	console.error("hello "+name);
});

count_(20).foreach(function(){

	var ins = ["a","b","c","d","e","f","g","h","i","j"];
	var outs = ["a","b","c","d","e","f","g","h","i","j"];
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

var ln = 0;
new FileLineIterator("E:\\test\\test.txt").foreach(function(v){
	ln++;
	console.error(ln+": "+v);
});
console.error("total: "+ln);
