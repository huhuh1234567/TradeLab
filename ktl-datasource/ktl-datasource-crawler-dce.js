
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
var type = 1;
var ymds = [
	'2018-01-02',
	'2018-01-03',
	'2018-01-04',
	'2018-01-05',
	'2018-01-08',
	'2018-01-09',
	'2018-01-10',
	'2018-01-11',
	'2018-01-12',
	'2018-01-15',
	'2018-01-16',
	'2018-01-17',
	'2018-01-18',
	'2018-01-19',
	'2018-01-22',
	'2018-01-23',
	'2018-01-24',
	'2018-01-25',
	'2018-01-26',
	'2018-01-29',
	'2018-01-30',
	'2018-01-31',
	'2018-02-01',
	'2018-02-02',
	'2018-02-05',
	'2018-02-06',
	'2018-02-07',
	'2018-02-08',
	'2018-02-09',
	'2018-02-12',
	'2018-02-13',
	'2018-02-14',
	'2018-02-22',
	'2018-02-23',
	'2018-02-26',
	'2018-02-27',
	'2018-02-28',
	'2018-03-01',
	'2018-03-02',
	'2018-03-05',
	'2018-03-06',
	'2018-03-07',
	'2018-03-08',
	'2018-03-09',
	'2018-03-12',
	'2018-03-13',
	'2018-03-14',
	'2018-03-15'
];

var index = 0;

(function run(){

	if(index<ymds.length){

		var ymd = ymds[index];
		index++;

		var timeout = Math.round((Math.random()*10+5)*1000);
		console.error(ymd+" starting in "+timeout+"ms");

		setTimeout(function(){

			console.error(ymd+" started");

			var year = parseInt(ymd.substring(0,4));
			var month = parseInt(ymd.substring(5,7));
			var day = parseInt(ymd.substring(8,10));

			var outfile = 0;
	
			var request = http.request({
				host: "www.dce.com.cn",
				path: "/publicweb/quotesdata/exportDayQuotesChData.html",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			},function(response){
				
				var status = response.statusCode;
		
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