(function(){

	var K = require("../k/k");
	var merge = K.merge;

	function div2(l,r){
		//check negative
		var nl = l<0;
		var nr = r<0;
		var ll = nl?-l:l;
		var rr = nr?-r:r;
		//divid
		var d = Math.floor(ll/rr);
		var m = Math.round(ll-rr*d);
		// check round error
		if(m===rr){
			d++;
			m = 0;
		}
		//negative back
		if(nl&&!nr||!nl&&nr){
			d = -d;
		}
		return [d,Math.round(l-d*r)];
	}

	function div(l,r){
		return div2(l,r)[0];
	}

	function mod(l,r){
		return div2(l,r)[1];
	}

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
		var view = new DataView(buf);
		view.setFloat64(0,num,true);
		return new Long(view.getInt32(0,true),view.getInt32(4,true));
	}

	var POSITIVE_ZERO_BITS = bits(+0.0);
	var NEGATIVE_ZERO_BITS = bits(-0.0);

	function ulp(bits1,bits2){
		return bits1.high===bits2.high?bits1.low-bits2.low:bits1.high-bits2.high<0?MIN_INT32:MAX_INT32;
	}

	function within(x,y,maxUlps){

		if(isNaN(x) || isNaN(y)){
			return false;
		}
		
		var xInt = bits(x);
		var yInt = bits(y);

		var sgn = xInt.high<0&&yInt.high>0?-1:xInt.high>0&&yInt.high<0?1:0;

		if (sgn === 0) {
			// number have same sign, there is no risk of overflow
			return Math.abs(ulp(xInt,yInt)) <= maxUlps;
		} else {
			// number have opposite signs, take care of overflow
			var deltaPlus;
			var deltaMinus;
			if (sgn < 0) {
				deltaPlus  = ulp(yInt,POSITIVE_ZERO_BITS);
				deltaMinus = ulp(xInt,NEGATIVE_ZERO_BITS);
			} else {
				deltaPlus  = ulp(xInt,POSITIVE_ZERO_BITS);
				deltaMinus = ulp(yInt,NEGATIVE_ZERO_BITS);
			}

			if (deltaPlus > maxUlps || deltaMinus > maxUlps) {
				return false;
			} else {
				return deltaMinus + deltaPlus <= maxUlps;
			}
		}
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
			if (equals(hPrev, 0.0, small)) {
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

	merge(exports,{

		div2: div2,
		div: div,
		mod: mod,

		MAX_INT32: MAX_INT32,
		MIN_INT32: MIN_INT32,
	
		Long: Long,
		long: long,
		bits: bits,
	
		POSITIVE_ZERO_BITS: POSITIVE_ZERO_BITS,
		NEGATIVE_ZERO_BITS: NEGATIVE_ZERO_BITS,
	
		ulp: ulp,
		within: within,
		equals: equals,
	
		ContinuedFraction: ContinuedFraction
	});

})();