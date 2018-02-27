(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var NormalDistribution = require("../k-math/k-math-distribution-normal").NormalDistribution;

	var PricingModel = require("./ktl-option-pricing").PricingModel;

	function Black76Model(){
		PricingModel.call(this);
		this.___normdist = new NormalDistribution();
	}

	merge(Black76Model.prototype,PricingModel.prototype);

	merge(Black76Model.prototype,{
		___price: function(f, k, r, sigma, ytm, d){
			if(f > 0 && sigma > 0){
				var d1 = (Math.log(f / k) + sigma * sigma * 0.5 * ytm) / (sigma * Math.sqrt(ytm));
				var d2 = d1 - sigma * Math.sqrt(ytm);
				if(d > 0){
					return (this.___normdist.cumulativeProbability(d1) * f - this.___normdist.cumulativeProbability(d2) * k) * Math.exp(-r * ytm)
				}
				else{
					return (-this.___normdist.cumulativeProbability(-d1) * f + this.___normdist.cumulativeProbability(-d2) * k) * Math.exp(-r * ytm)
				}
			}
			else{
				return 0.0;
			}
		}
	});

	exports.Black76Model = Black76Model;

})();