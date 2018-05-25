
var fs = require("fs");

var K_HTTPCLIENT = require("../k/k-httpclient");
var request = K_HTTPCLIENT.request;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var df = new DateFormat("yyyy-MM-dd");
var df2 = new DateFormat("yyyyMMdd");
var df3 = new DateFormat("yyyy");

var variety = "all";
var type = 1;
var ymds = [
	'2018-04-16',
	'2018-04-17',
	'2018-04-18',
	'2018-04-19',
	'2018-04-20',
	'2018-04-23',
	'2018-04-24',
	'2018-04-25',
	'2018-04-26',
	'2018-04-27',
	'2018-05-02',
	'2018-05-03',
	'2018-05-04',
	'2018-05-07',
	'2018-05-08',
	'2018-05-09',
	'2018-05-10',
	'2018-05-11',
	'2018-05-14',
	'2018-05-15',
	'2018-05-16',
	'2018-05-17',
	'2018-05-18',
	'2018-05-21',
	'2018-05-22',
	'2018-05-23',
	'2018-05-24',
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

			var date = df.parse(ymd);

			var prefix = type===0?"Future":"Option";

			request("www.czce.com.cn","GET","/portal/DFSStaticFiles/"+prefix+"/"+df3.format(date)+"/"+df2.format(date)+"/"+prefix+"DataDaily.txt",null,null,function(error,buf){
				if(!error){
					var fd = 0;
					try{
						fd = fs.openSync(variety+"_"+type+"_"+ymd+".txt","w");
						fs.writeSync(fd,buf);
					}
					catch(e){
						error = e.toString();
					}
					if(fd!==0){
						try{
							fs.closeSync(fd);
						}
						catch(e){
							error = !error?e.toString():error+"\n"+e.toString();
						}
						fd = 0;
					}
				}
				if(!error){
					console.error("date "+ymd+" succeed!");
				}
				else{
					console.error("date "+ymd+" failed!");
					console.error(error);
				}
				run();
			},15*1000);
		},timeout);
	}
})();