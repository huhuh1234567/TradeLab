
var fs = require("fs");

var iconv = require("iconv-lite");
var cheerio = require("cheerio");

var K_HTTPCLIENT = require("../k/k-httpclient");
var request = K_HTTPCLIENT.request;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var df = new DateFormat("yyyy-MM-dd-HH-mm-ss");

var p = 1;
var last = 2;

var outfile = fs.openSync("shibor_on_"+df.format(new Date())+".txt","w");

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

			request("data.eastmoney.com","GET","/shibor/shibor.aspx?m=sh&t=99&d=99221&cu=cny&type=009016&p="+p,null,null,function(error,buf){
				if(!error){
					console.error("current p="+p);
					try{
						var $ = cheerio.load(iconv.decode(buf,"gb18030"));
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
					}
					catch(e){
						error = e.toString();
					}
				}
				if(error){
					console.error(error);
					finish();
				}
				else{
					run();
				}
			},5*1000);
		},timeout);
	}
	else{
		finish();
	}

})();