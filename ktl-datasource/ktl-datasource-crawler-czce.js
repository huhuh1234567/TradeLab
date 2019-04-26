
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
	'2019-01-02',
	'2019-01-03',
	'2019-01-04',
	'2019-01-07',
	'2019-01-08',
	'2019-01-09',
	'2019-01-10',
	'2019-01-11',
	'2019-01-14',
	'2019-01-15',
	'2019-01-16',
	'2019-01-17',
	'2019-01-18',
	'2019-01-21',
	'2019-01-22',
	'2019-01-23',
	'2019-01-24',
	'2019-01-25',
	'2019-01-28',
	'2019-01-29',
	'2019-01-30',
	'2019-01-31',
	'2019-02-01',
	'2019-02-11',
	'2019-02-12',
	'2019-02-13',
	'2019-02-14',
	'2019-02-15',
	'2019-02-18',
	'2019-02-19',
	'2019-02-20',
	'2019-02-21',
	'2019-02-22',
	'2019-02-25',
	'2019-02-26',
	'2019-02-27',
	'2019-02-28',
	'2019-03-01',
	'2019-03-04',
	'2019-03-05',
	'2019-03-06',
	'2019-03-07',
	'2019-03-08',
	'2019-03-11',
	'2019-03-12',
	'2019-03-13',
	'2019-03-14',
	'2019-03-15',
	'2019-03-18',
	'2019-03-19',
	'2019-03-20',
	'2019-03-21',
	'2019-03-22',
	'2019-03-25',
	'2019-03-26',
	'2019-03-27',
	'2019-03-28',
	'2019-03-29',
	'2019-04-01',
	'2019-04-02',
	'2019-04-03',
	'2019-04-04',
	'2019-04-08',
	'2019-04-09',
	'2019-04-10',
	'2019-04-11',
	'2019-04-12',
	'2019-04-15',
	'2019-04-16',
	'2019-04-17',
	'2019-04-18',
	'2019-04-19',
	'2019-04-22',
	'2019-04-23'
];

var index = 0;

(function run(){

	if(index<ymds.length){

		var ymd = ymds[index];
		index++;

		var timeout = Math.round((Math.random()*2+3)*1000);

		var date = df.parse(ymd);

		var fname = variety+"_"+type+"_"+ymd+".txt";

		if(fs.existsSync(fname)){
			run();
		}
		else{

			console.error(ymd+" starting in "+timeout+"ms");

			setTimeout(function(){

				console.error(ymd+" started");

				var prefix = type===0?"Future":"Option";
	
				request("www.czce.com.cn","GET","/cn/DFSStaticFiles/"+prefix+"/"+df3.format(date)+"/"+df2.format(date)+"/"+prefix+"DataDaily.txt",null,null,function(error,buf){
					if(!error){
						var fd = 0;
						try{
							fd = fs.openSync(fname,"w");
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
						console.error(ymd+" succeed!");
					}
					else{
						console.error(ymd+" failed!");
						console.error(error);
					}
					run();
				},10*1000);
			},timeout);
		}
	}
})();