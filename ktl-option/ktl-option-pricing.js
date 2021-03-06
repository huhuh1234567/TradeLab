(function(){

	var K = require("../k/k");
	var merge = K.merge;
	
	var KTL = require("../ktl/ktl");
	var DAY_OF_YEAR = KTL.DAY_OF_YEAR;
	var ytm = KTL.ytm;

	var EPSILON = 1e-9;

	var MAX_IV = 100.0;

	function PricingModel(){

	}

	merge(PricingModel.prototype,{
		___iv: function(p, s, k, r, ytm, d){
			if(p > 0 && s > 0 && p>(s-k)*d){
				var maxiv = 1.0;
				// while(maxiv < MAX_IV){
				// 	if(this.___price(s, k, r, maxiv, ytm, d) > p){
				// 		break;
				// 	}
				// 	else{
				// 		maxiv *= 2.0;
				// 	}
				// }
				if(maxiv<MAX_IV){
					var miniv = 0.0;
					while(maxiv - miniv > EPSILON){
						var iv = (maxiv + miniv) * 0.5;
						var piv = this.___price(s, k, r, iv, ytm, d)
						if(piv > p){
							maxiv = iv;
						}
						else{
							miniv = iv;
						}
					}
					return maxiv;
				}
				else{
					return MAX_IV;
				}
			}
			else{
				return 0.0;
			}
		},
		___delta: function(f, k, r, sigma, ytm, d){
			if(f > 0 && sigma > 0){
				return (this.___price(f + 0.005, k, r, sigma, ytm, d) - this.___price(f - 0.005, k, r, sigma, ytm, d)) * 100;
			}
			else{
				return 0.0;
			}
		},
		___gamma: function(f, k, r, sigma, ytm, d){
			if(f > 0 && sigma > 0){
				return (this.___delta(f + 0.005, k, r, sigma, ytm, d) - this.___delta(f - 0.005, k, r, sigma, ytm, d)) * 100;
			}
			else{
				return 0.0;
			}
		},
		___theta: function(f, k, r, sigma, ytm, d){
			if(f > 0 && sigma > 0){
				var ddoy = -0.005 / DAY_OF_YEAR;
				return (this.___price(f, k, r, sigma, ytm + ddoy, d) - this.___price(f, k, r, sigma, ytm - ddoy, d)) * 100;
			}
			else{
				return 0.0;
			}
		},
		___vega: function(f, k, r, sigma, ytm, d){
			if(f > 0 && sigma > 0){
				return (this.___price(f, k, r, sigma + 0.00005, ytm, d) - this.___price(f, k, r, sigma - 0.00005, ytm, d)) * 100;
			}
			else{
				return 0.0;
			}
		},
		___rho: function(f, k, r, sigma, ytm, d){
			if(f > 0 && sigma > 0){
				return (this.___price(f, k, r + 0.0000005, sigma, ytm, d) - this.___price(f, k, r - 0.0000005, sigma, ytm, d)) * 100;
			}
			else{
				return 0.0;
			}
		},
		___priceOf: function(delta, k, r, sigmac, sigmap, ytm, nc, np, mm){
			if(delta > -np && delta < nc){
				var f = k;
				var minf = 0;
				var maxf = f * 2;
				while(maxf - minf > mm * 0.5){
					var delta0 = nc*this.___delta(f, k, r, sigmac, ytm, 1)+np*this.___delta(f, k, r, sigmap, ytm, -1)
					if(delta0 - delta > 0){
						maxf = f;
					}
					else{
						minf = f;
					}
					f = (maxf + minf) * 0.5;
				}
				return Math.round(f / mm) * mm
			}
			else{
				return 0.0;
			}
		},
		model: function(){
			return "";
		},
		price: function(s, k, r, sigma, day, mday, d){
			return this.___price(s, k, r, sigma, ytm(day, mday), d)
		},
		iv: function(p, s, k, r, day, mday, d){
			return this.___iv(p, s, k, r, ytm(day, mday), d)
		},
		delta: function(s, k, r, sigma, day, mday, d){
			return this.___delta(s, k, r, sigma, ytm(day, mday), d)
		},
		gamma: function(s, k, r, sigma, day, mday, d){
			return this.___gamma(s, k, r, sigma, ytm(day, mday), d)
		},
		theta: function(s, k, r, sigma, day, mday, d){
			return this.___theta(s, k, r, sigma, ytm(day, mday), d)
		},
		vega: function(s, k, r, sigma, day, mday, d){
			return this.___vega(s, k, r, sigma, ytm(day, mday), d)
		},
		rho: function(s, k, r, sigma, day, mday, d){
			return this.___rho(s, k, r, sigma, ytm(day, mday), d)
		},
		priceOf: function(delta, k, r, sigmac, sigmap, day, mday, nc, np, mm){
			return this.___r_price(delta, k, r, sigmac, sigmap, ytm(day, mday), nc, np, mm)
		}
	});

	exports.PricingModel = PricingModel;

})();