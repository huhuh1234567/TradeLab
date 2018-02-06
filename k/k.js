(function(){

	function foreach_(itor,block){
		var end = false;
		var v = undefined;
		while(!end&&v===undefined){
			var last = itor.next();
			if(last!==undefined){
				v = block(last);
			}
			else{
				end = true;
			}
		}
		return v;
	}

	function map_(itor,func){
		return {
			next: function(){
				var last = itor.next();
				return last!==undefined?func(last):undefined;
			}
		}
	}

	function filter_(itor,pred){
		var end = false;
		return {
			next: function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					while(!end&&v===undefined){
						var last = itor.next();
						if(last!==undefined){
							v = pred(last)?last:undefined;
						}
						else{
							end = true;
						}
					}
					return v;
				}
			}
		}
	}

	function flatMap_(itor,func){
		var end = false;
		var buffer = undefined;
		return {
			next: function(){
				if(end){
					return undefined;
				}
				else{
					var v = undefined;
					while(!end&&v===undefined){
						while(!end&&buffer===undefined){
							var last = itor.next();
							if(last!==undefined){
								buffer = func(last);
							}
							else{
								end = true;
							}
						}
						if(buffer!==undefined){
							v = buffer.next();
						}
					}
					return v;
				}
			}
		}
	}

	function count_(total){
		var count = 0;
		return {
			next: function(){
				if(count<total){
					var v = count;
					count++;
					return v;
				}
				else{
					return undefined;
				}
			}
		}
	}

	function array_(arr,offset,length){
		if(offset===undefined){
			offset = 0;
		}
		if(length===undefined){
			length = arr.length-offset;
		}
		var i = offset;
		return {
			next: function(){
				if(i<length){
					var v = arr[i];
					i++;
					return v;
				}
				else{
					return undefined;
				}
			}
		}
	}

	function nil_(){
		return {
			next: function(){
				return undefined;
			}
		}
	}

	function once_(func){
		var end = false;
		return {
			next: function(){
				if(!end){
					end = true;
					return func();
				}
				else{
					return undefined;
				}
			}
		};
	}

})();