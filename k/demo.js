
global.merge = require("./k").merge;

merge(global,require("./k-iterator"));
merge(global,require("./k-link"));
merge(global,require("./k-dlink"));

Link.$$(["hjq","zb"])._().foreach(function(name){
	console.error("hello "+name);
});
