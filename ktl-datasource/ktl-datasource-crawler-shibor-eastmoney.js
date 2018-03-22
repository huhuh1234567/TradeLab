
var http = require("http");
var fs = require("fs");

var iconv = require("iconv-lite");
var cheerio = require("cheerio");

var p = 0;
var last = 1;

var flag = new Date().getTime();

var outfile = fs.openSync("shibor_"+flag+".txt","w");

function finish(){
	console.error("end p="+p);
	fs.closeSync(outfile);
}

(function run(){

	p++;

	if(p<=last){

		var timeout = Math.round((Math.random()*5+2)*1000);
		console.error("p="+p+" starting in "+timeout+"ms");

		setTimeout(function(){

			var request = http.request({
				host: "data.eastmoney.com",
				path: "/shibor/shibor.aspx?m=sh&t=99&d=99221&cu=cny&type=009016&p="+p,
				method: "GET"
			},(response)=>{
				
				var status = response.statusCode;
			
				if(status===200){
			
					var bufs = [];
			
					response.on("data",(chunck)=>{
	
						if(chunck){
							bufs.push(chunck);
						}
					});
			
					response.on("end",(chunck)=>{
	
						if(chunck){
							bufs.push(chunck);
						}
	
						console.error("current p="+p);
			
						try{
							var $ = cheerio.load(iconv.decode(Buffer.concat(bufs),"gb18030"));
							var trs = $("table tbody tr");
							for(var i=1; i<trs.length; i++){
								var tds = trs[i].children;
								var vs = [];
								for(var j=0; j<tds.length; j++){
									var td = tds[j];
									if(td.type==="tag"){
										vs.push(td.children[0].data);
									}
								}
								fs.writeSync(outfile,iconv.encode(vs.join("|")+"\n","utf8"));
							}
							fs.fsyncSync(outfile);
							run();
						}
						catch(e){
							console.error("[EXCEPTION]");
							console.error(e);
							finish();
						}
					});
			
					response.setTimeout(5*1000,()=>{
						request.abort();
						console.error("[RESPONSE TIMEOUT]");
						finish();
					})
			
					response.on("error",(e)=>{
						console.error("[RESPONSE ERROR]");
						console.error(e);
						finish();
					});
				}
				else{
					console.error("[STATUS "+status+"]");
					finish();
				}
			});
			
			request.setTimeout(5*1000,()=>{
				request.abort();
				console.error("[REQUEST TIMEOUT]");
				finish();
			});
			
			request.on("error",(e)=>{
				console.error("[REQUEST ERROR]");
				console.error(e);
				finish();
			});
			
			request.end();
		},timeout);
	}
	else{
		finish();
	}

})();