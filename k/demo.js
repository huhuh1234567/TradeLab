
global.merge = require("./k").merge;

merge(global,require("./k-dlink"));

DLink.$$(["hjq","zb"])._().foreach(function(name){
	console.error("hello "+name);
});
