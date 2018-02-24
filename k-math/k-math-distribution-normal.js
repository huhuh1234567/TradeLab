(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var DEFAULT_INVERSE_ABSOLUTE_ACCURACY = 1e-9;

	var SQRT2 = Math.sqrt(2.0);

	var Well19937cRandom = require("./k-math-random-well19937c").Well19937cRandom;
	var Erf = require("./k-math-special-erf").Erf;

	function NormalDistribution(mean,sd,args){

		if(mean===undefined){
			mean = 0;
		}
		if(sd===undefined){
			sd = 1;
		}
		if(args===undefined){
			args = {};
		}
		if(args.rng===undefined){
			args.rng = new Well19937cRandom();
		}

		if(sd <= 0){
			throw "NotStrictlyPositiveException: "+sd;
		}

		this.___random = args.rng;

		this.mean = mean;
		this.standardDeviation = sd;
		this.___logStandardDeviationPlusHalfLog2Pi = Math.log(sd) + 0.5 * Math.log(2 * Math.PI);
	}

	merge(NormalDistribution.prototype,{
		density: function(x){
			return Math.exp(this.logDensity(x));
		},
		logDensity: function(x){
			var x0 = x - this.mean;
			var x1 = x0 / this.standardDeviation;
			return -0.5 * x1 * x1 - this.___logStandardDeviationPlusHalfLog2Pi;
		},
		cumulativeProbability: function(x){
			var dev = x - this.mean;
			if (Math.abs(dev) > 40 * this.standardDeviation) {
				return dev < 0 ? 0.0 : 1.0;
			}
			return 0.5 * Erf.erfc(-dev / (this.standardDeviation * SQRT2));	
		},
		inverseCumulativeProbability: function(p){
			if (p < 0.0 || p > 1.0) {
				throw "OutOfRangeException: "+p;
			}
			return mean + standardDeviation * SQRT2 * Erf.erfInv(2 * p - 1);
		},
		probability: function(x0,x1){
			if (x0 > x1) {
				throw "NumberIsTooLargeException: "+x0+","+x1;
			}
			var denom = this.standardDeviation * SQRT2;
			var v0 = (x0 - this.mean) / denom;
			var v1 = (x1 - this.mean) / denom;
			return 0.5 * Erf.erf(v0, v1);
		},
		sample: function(){
			return this.standardDeviation * this.___random.nextGaussian() + this.mean;
		}
	});

	exports.NormalDistribution = NormalDistribution;

})();