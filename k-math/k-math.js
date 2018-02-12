(function(){

	function long2ints(long){
		var rst = new Int32Array(2);
		if(long===0x1000000000000000){
			rst[0] = 0;
			rst[1] = 0x10000000;
		}
		else{
			var minus = false;
			if(long<0){
				long = -long;
				minus = true;
			}
			var str = long.toString(16);
			var len = str.length;
			if(len<=8){
				rst[0] = parseInt(str,16)>>0;
				rst[1] = 0;
			}
			else{
				rst[0] = parseInt(str.substring(len-8),16)>>0;
				rst[1] = parseInt(str.substring(0,len-8),16)>>0;
			}
			if(minus){
				rst[0] = -rst[0];
				rst[1] = -rst[1]-1;
			}
		}
		return rst;
	}

	exports.long2ints = long2ints;

})();