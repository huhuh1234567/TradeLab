(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var fixes = {
		"sr": {
			"201709": -11,
			"201801": -11,
			"201805": -9,
			"201809": -11,
			"201901": -9,
			"201905": -10,
			"201909": 0
		},
		"m": {
			"201709": 0,
			"201801": 0,
			"201805": 4,
			"201809": 0,
			"201901": 0,
			"201905": 2,
			"201909": 0
		},
		"cf": {
			"201909": 0
		},
		"c": {
			"201909": 0
		},
	};
	
	function dayfix(c,mm){
		var fix = fixes[c];
		if(fix!==undefined){
			fix = fix[mm];
		}
		return fix===undefined?0:fix;
	}
	
	merge(exports,{
		dayfix: dayfix,
		SR: {
			c: "sr",
			mdelay: 27,
			lowK: 3000,
			highK: 10000,
			step: 100,
			plex: 10,
			fee: 3.3,
			spread: 2
		},
		M: {
			c: "m",
			mdelay: 25,
			lowK: 2000,
			highK: 4000,
			step: 50,
			plex: 10,
			fee: 1.65,
			spread: 2
		},
		CF: {
			c: "cf",
			mdelay: 27,
			lowK: 10000,
			highK: 20000,
			step: 200,
			plex: 5,
			fee: 4.73,
			spread: 10
		},
		C: {
			c: "c",
			mdelay: 25,
			lowK: 1000,
			highK: 3000,
			step: 20,
			plex: 10,
			fee: 1.32,
			spread: 2
		}
	});
})();