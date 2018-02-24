(function(){

	var K_MATH = require("./k-math");
	var long = K_MATH.long;
	var MAX_INT32 = K_MATH.MAX_INT32;

	var K_ITERATOR = require("../k/k-iterator");
	var count_ = K_ITERATOR.count_;

	var sn = 0;

	function WellRandom(k,m1,m2,m3,seed){

		var self = this;
		
		var w = 32;
		var r = (k+w-1)/w;
		this.___v = new Int32Array(r);
		this.___iRm1 = new Int32Array(r);
		this.___iRm2 = new Int32Array(r);
		this.___i1 = new Int32Array(r);
		this.___i2 = new Int32Array(r);
		this.___i3 = new Int32Array(r);
		count_(r).foreach(function(j){
            self.___iRm1[j] = (j + r - 1) % r;
            self.___iRm2[j] = (j + r - 2) % r;
            self.___i1[j]   = (j + m1)    % r;
			self.___i2[j]   = (j + m2)    % r;
            self.___i3[j]   = (j + m3)    % r;
		});

		if(!seed||seed.length===0){
			seed = [((Math.random()*2.0-1.0)*MAX_INT32)>>0,((Math.random()*2.0-1.0)*MAX_INT32)>>0];
		}

		var slen = seed.length;
		count_(r).foreach(function(i){
			if(i<slen){
				self.___v[i] = seed[i];
			}
			else{
				var l = self.___v[i-slen];
				self.___v[i] = (1812433253 * (l ^ (l >> 30)) + i) & 0xffffffff;
			}
		});

		this.___index = 0;
	}

	exports.WellRandom = WellRandom;

})();