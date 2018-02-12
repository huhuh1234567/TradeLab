(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var K_MATH_RANDOM_BITS = require("./k-math-random-bits");
	var BitsRandom = K_MATH_RANDOM_BITS.BitsRandom;

	var K_MATH_RANDOM_WELL = require("./k-math-random-well");
	var WellRandom = K_MATH_RANDOM_WELL.WellRandom;

	function Well19937cRandom(seed){
		BitsRandom.call(this);
		WellRandom.call(this,19937,70,179,449,seed);
	}

	merge(Well19937cRandom.prototype,BitsRandom.prototype);

	merge(Well19937cRandom.prototype,WellRandom.prototype);

	merge(Well19937cRandom.prototype,{
		___next: function(bits){

			var indexRm1 = this.___iRm1[index];
			var indexRm2 = this.___iRm2[index];
	
			var v0       = this.___v[index];
			var vM1      = this.___v[i1[index]];
			var vM2      = this.___v[i2[index]];
			var vM3      = this.___v[i3[index]];
	
			var z0 = (0x80000000 & this.___v[indexRm1]) ^ (0x7FFFFFFF & this.___v[indexRm2]);
			var z1 = (v0 ^ (v0 << 25))  ^ (vM1 ^ (vM1 >>> 27));
			var z2 = (vM2 >>> 9) ^ (vM3 ^ (vM3 >>> 1));
			var z3 = z1      ^ z2;
			var z4 = z0 ^ (z1 ^ (z1 << 9)) ^ (z2 ^ (z2 << 21)) ^ (z3 ^ (z3 >>> 21));
	
			this.___v[index]     = z3;
			this.___v[indexRm1]  = z4;
			this.___v[indexRm2] &= 0x80000000;
			this.___index        = indexRm1;
	
	
			// add Matsumoto-Kurita tempering
			// to get a maximally-equidistributed generator
			z4 ^= (z4 <<  7) & 0xe46e1700;
			z4 ^= (z4 << 15) & 0x9b868000;
	
			return z4 >>> (32 - bits);
		}
	});

	exports.Well19937cRandom = Well19937cRandom;
	
})()