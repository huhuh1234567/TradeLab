(function(){

	var http = require("http");
	var fs = require("fs");

	function safeclose(fd){
		if(fd!==0){
			try{
				fs.closeSync(fd);
			}
			catch(e){
				console.error(e);
			}
			fd = 0;
		}
	}

	function withfd(fd,op){
		try{
			op(fd);
			return true;
		}
		catch(e){
			console.error(e);
			safeclose(fd);
			return false;
		}
	}

	var variety = "all";
	var type = 0;
	var ymds = [
	];

	var index = 0;

	(function run(){

		if(index<ymds.length){

			const ymd = ymds[index];
			index++;

			const timeout = Math.round((Math.random()*10+5)*1000);
			console.error(ymd+" starting in "+timeout+"ms");

			setTimeout(()=>{

				console.error(ymd+" started");
	
				const year = parseInt(ymd.substring(0,4));
				const month = parseInt(ymd.substring(5,7));
				const day = parseInt(ymd.substring(8,10));
	
				var outfile = 0;
		
				const request = http.request({
					host: "www.dce.com.cn",
					path: "/publicweb/quotesdata/exportDayQuotesChData.html",
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				},(response)=>{
					
					const status = response.statusCode;
			
					if(status===200){
			
						outfile = fs.openSync(variety+"_"+type+"_"+ymd+".txt","w");
	
						response.on("data",(chunck)=>{
							if(chunck){
								if(!withfd(outfile,(fd)=>{
									fs.writeSync(fd,chunck);
								})){
									console.error("date "+ymd+" failed!");
								}
							}
						});
				
						response.on("end",(chunck)=>{
							var r = true;
							if(chunck){
								r = withfd(outfile,(fd)=>{
									fs.writeSync(fd,chunck);
								});
							}
							safeclose(outfile);
							if(r){
								console.error("date "+ymd+" succeed!");
								run();
							}
							else{
								console.error("date "+ymd+" failed!");
								run();
							}
						});
			
						response.setTimeout(15*1000,()=>{
							request.abort();
							console.error("response timeout");
							console.error("date "+ymd+" failed!");
							run();
						})
			
						response.on("error",(e)=>{
							safeclose(outfile);
							console.error(e);
							console.error("date "+ymd+" failed!");
							run();
						});
					}
					else{
						safeclose(outfile);
						console.error("HTTP STATUS "+status);
						console.error("date "+ymd+" failed!");
						run();
					}
				});
			
				request.setTimeout(15*1000,()=>{
					request.abort();
					console.error("request timeout");
					console.error("date "+ymd+" failed!");
					run();
				});

				request.on("error",(e)=>{
					safeclose(outfile);
					console.error(e);
					console.error("date "+ymd+" failed!");
					run();
				});
			
				var datas = [
					"dayQuotes.variety="+variety,
					"dayQuotes.trade_type="+type,
					"year="+year,
					"month="+(month-1),
					"day="+day,
					"exportFlag=txt"
				];
				request.write(datas.join("&"));
				request.end();
			},timeout);
		}
	})();

})();