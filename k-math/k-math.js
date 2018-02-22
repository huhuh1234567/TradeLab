(function(){

	var K = require("../k/k");
	var merge = K.merge;

	var MAX_INT32 = 0x7fffffff>>0;
	var MIN_INT32 = 0x80000000>>0;

	function Long(low,high){
		this.low = low;
		this.high = high;
	}

	function long(num){
		var rst = new Int32Array(2);
		var minus = false;
		if(num<0){
			num = -num;
			minus = true;
		}
		rst[0] = num%0x100000000;
		rst[1] = (num/0x100000000)>>0;
		if(minus){
			rst[0] = -rst[0];
			rst[1] = -rst[1]-1;
		}
		return new Long(rst[0],rst[1]);
	}

	function bits(num){
		var buf = new ArrayBuffer(8);
		var v1 = new Float64Array(buf);
		var v2 = new Int32Array(buf);
		v1[0] = num;
		return new Long(v2[0],v2[1]);
	}

	var POSITIVE_ZERO_BITS = bits(+0.0);
	var NEGATIVE_ZERO_BITS = bits(-0.0);

	function ulps(bits1,bits2){
		return bits1.high===bits2.high?bits1.low-bits2.low:bits1.high-bits2.high<0?MIN_INT32:MAX_INT32;
	}

	function within(x,y,maxUlps){
		
		var xInt = bits(x);
		var yInt = bits(y);

		var sgn = xInt.high<0&&yInt.high>0?-1:xInt.high>0&&yInt.high<0?1:0;

		var isEqual;
		if (sgn === 0) {
			// number have same sign, there is no risk of overflow
			isEqual = Math.abs(ulps(xInt,yInt)) <= maxUlps;
		} else {
			// number have opposite signs, take care of overflow
			var deltaPlus;
			var deltaMinus;
			if (sgn < 0) {
				deltaPlus  = ulps(yInt,POSITIVE_ZERO_BITS);
				deltaMinus = ulps(xInt,NEGATIVE_ZERO_BITS);
			} else {
				deltaPlus  = ulps(xInt,POSITIVE_ZERO_BITS);
				deltaMinus = ulps(yInt,NEGATIVE_ZERO_BITS);
			}

			if (deltaPlus > maxUlps) {
				isEqual = false;
			} else {
				isEqual = deltaMinus <= (maxUlps - deltaPlus);
			}

		}

		return isEqual && !isNaN(x) && !isNaN(y);
	}

	function equals(x,y,eps){
		return within(x, y, 1) || Math.abs(y - x) <= eps;
	}

	function ContinuedFraction(){

	}

	merge(ContinuedFraction.prototype,{
		evaluate: function(x,args){

			var epsilon = 10e-9;
			var maxIterations = 0x7fffffff>>0;

			if(args!==undefined){
				if(args.epsilon!==undefined){
					epsilon = args.epsilon;
				}
				if(args.maxIterations!==undefined){
					maxIterations = args.maxIterations;
				}
			}

			var small = 1e-50;
			var hPrev = this.___getA(0, x);

			// use the value of small as epsilon criteria for zero checks
			if (Precision.equals(hPrev, 0.0, small)) {
				hPrev = small;
			}

			var n = 1;
			var dPrev = 0.0;
			var cPrev = hPrev;
			var hN = hPrev;

			while (n < maxIterations) {
				var a = this.___getA(n, x);
				var b = this.___getB(n, x);

				var dN = a + b * dPrev;
				if (equals(dN, 0.0, small)) {
					dN = small;
				}
				var cN = a + b / cPrev;
				if (equals(cN, 0.0, small)) {
					cN = small;
				}

				dN = 1.0 / dN;
				var deltaN = cN * dN;
				hN = hPrev * deltaN;

				if (!isFinite(hN)) {
					throw "ConvergenceException";
				}
				if (isNaN(hN)) {
					throw "ConvergenceException";
				}

				if (Math.abs(deltaN - 1.0) < epsilon) {
					break;
				}

				dPrev = dN;
				cPrev = cN;
				hPrev = hN;
				n++;
			}

			if (n >= maxIterations) {
				throw "MaxCountExceededException: "+maxIterations;
			}

			return hN;
		}
	});

	function log1p(x){
		return log(1+x);
	}

	function rint(x){

		var y = Math.floor(x);
        var d = x - y;

        if (d > 0.5) {
            if (y === -1.0) {
                return -0.0; // Preserve sign of operand
            }
            return y+1.0;
        }
        if (d < 0.5) {
            return y;
        }

        /* half way, round to even */
        return y%2 === 0 ? y : y + 1.0;
	}

	merge(exports,{

		MAX_INT32: MAX_INT32,
		MIN_INT32: MIN_INT32,
	
		Long: Long,
		long: long,
		bits: bits,
	
		POSITIVE_ZERO_BITS: POSITIVE_ZERO_BITS,
		NEGATIVE_ZERO_BITS: NEGATIVE_ZERO_BITS,
	
		ulps: ulps,
		within: within,
		equals: equals,
	
		ContinuedFraction: ContinuedFraction,

		log1p: log1p,
		rint: rint
	});

})();