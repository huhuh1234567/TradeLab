(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var NormalDistribution = require("../k-math/k-math-distribution-normal").NormalDistribution;

	var PricingModel = require("./ktl-option-pricing").PricingModel;

	function BlackScholesModel(){
		PricingModel.call(this);
		this.___normdist = new NormalDistribution();
	}

	merge(BlackScholesModel.prototype,PricingModel.prototype);

	merge(BlackScholesModel.prototype,{
		___price: function(s, k, r, sigma, ytm, d){
			if(s > 0 && sigma > 0){
				var d1 = (Math.log(s / k) + (r + sigma * sigma * 0.5) * ytm) / (sigma * Math.sqrt(ytm))
				var d2 = d1 - sigma * Math.sqrt(ytm);
				if(d > 0){
					return this.___normdist.cumulativeProbability(d1) * s - this.___normdist.cumulativeProbability(d2) * k * Math.exp(-r * ytm)
				}
				else{
					return -this.___normdist.cumulativeProbability(-d1) * s + this.___normdist.cumulativeProbability(-d2) * k * Math.exp(-r * ytm)
				}
			}
			else{
				return 0.0;
			}
		}
	});

	exports.BlackScholesModel = BlackScholesModel;

})();