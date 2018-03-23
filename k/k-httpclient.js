(function(){

	var http = require("http");

	var K = require("./k");
	var merge = K.merge;

	function request(host,method,path,headers,data,callback,timeout){

		var params = {
			host: host,
			method: method,
			path: path
		};

		if(headers){
			params.headers = headers;
		}

		var req = http.request(params,function(res){

			var status = res.statusCode;

			if(status===200){

				var bufs = [];

				res.on("data",function(chunck){
					if(chunck){
						bufs.push(chunck);
					}
				});

				res.on("end",function(chunck){

					if(chunck){
						bufs.push(chunck);
					}

					callback(null,Buffer.concat(bufs));
				});

				if(timeout>0){
					res.setTimeout(timeout,function(){
						req.abort();
						callback("RESPONSE TIMEOUT");
					});
				}

				res.on("error",function(e){
					callback("RESPONSE ERROR");
				});
			}
			else{
				callback("STATUS "+status);
			}
		});

		req.setTimeout(timeout,function(){
			req.abort();
			callback("REQUEST TIMEOUT");
		});

		req.on("error",function(e){
			callback("REQUEST ERROR");
		});

		if(data){
			req.write(data);
		}

		req.end();
	}

	merge(exports,{
		request: request
	});

})();