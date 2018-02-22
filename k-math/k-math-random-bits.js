(function(){

	var K = require("../k/k");
	var merge = K.merge;

	function BitsRandom(){
		this.___nextGaussian = Number.NaN;
	}

	merge(BitsRandom.prototype,{
		nextBoolean: function(){
			return this.___next(1)!==0;
		},
		nextDouble: function(){
			var high = this.___next(26);
			var low = this.___next(26);
			//          0x1.0p-26d                0x1.0p-52d
			return high*1.4901161193847656E-8+low*2.220446049250313e-16
		},
		nextFloat: function(){
			//                      0x1.0p-23f
			return this.___next(23)*1.1920928955078125E-7;
		},
		nextGaussian: function(){

			var random;
			if (isNaN(this.___nextGaussian)) {
				// generate a new pair of gaussian numbers
				var x = nextDouble();
				var y = nextDouble();
				var alpha = 2 * Math.PI * x;
				var r     = Math.sqrt(-2 * Math.log(y));
				random               = r * Math.cos(alpha);
				this.___nextGaussian = r * Math.sin(alpha);
			} else {
				// use the second element of the pair already generated
				random = this.___nextGaussian;
				this.___nextGaussian = Number.NaN;
			}

			return random;
		},
		nextInt: function(){
			return this.___next(32);
		},
		nextLong: function(){
			var high = this.___next(32);
			var low = this.___next(32);
			return new Int32Array([low,high]);
		}
	});

	exports.BitsRandom = BitsRandom;

})();