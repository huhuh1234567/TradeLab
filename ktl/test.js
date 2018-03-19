global.merge = require("../k/k").merge;

merge(global,require("./ktl"));
merge(global,require("./ktl-date"));
merge(global,require("./ktl-db"));

var testdb = new Database("./test/db","test");

var df = new DateFormat("yyyy-MM-dd");

testdb.load("m_1805_p_2800_close")._().foreach(function(kv){
	if(!isNaN(kv._)){
		console.error(df.format(offset2date(kv.$))+"\t"+formatNumber(kv._,1));
	}
});

merge(global,require("../k/k-iterator"));
merge(global,require("../k/k-file-line-iterator"));
merge(global,require("../k/k-avltree"));

var ks = [];

new FileLineIterator("./test/db/test").foreach(function(line){
	var vs = line.split("|");
	var name = vs[0];
	var cluster = parseInt(vs[1]);
	var slot = parseInt(vs[2]);
	var offset = parseInt(vs[3]);
	var length = parseInt(vs[4]);
	ks.push([name,[cluster,slot,offset,length]]);
});

var start = new Date().getTime();
count_(1000).foreach(function(){
	var fibers = {};
	array_(ks).foreach(function(a){
		fibers[a[0]] = a[1];
		var fiber = fibers[a[0]];
	});
});
console.error(new Date().getTime()-start);

start = new Date().getTime();
count_(1000).foreach(function(){
	var fibertree = new AVLTree(function(l,r){
		return l.$===r.$?0:l.$<r.$?-1:1;
	});
	array_(ks).foreach(function(a){
		fibertree.put({
			$: a[0],
			_: a[1]
		});
		var fiber = fibertree.find({
			$: a[0]
		})._;
	});
});
console.error(new Date().getTime()-start);
