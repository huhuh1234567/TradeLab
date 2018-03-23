
var fs = require("fs");

var K_HTTPCLIENT = require("../k/k-httpclient");
var request = K_HTTPCLIENT.request;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var df = new DateFormat("yyyy-MM-dd");

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

			var date = df.parse(ymd);

			var datas = [
				"dayQuotes.variety="+variety,
				"dayQuotes.trade_type="+type,
				"year="+date.getFullYear(),
				"month="+date.getMonth(),
				"day="+date.getDate(),
				"exportFlag=txt"
			];

			request("www.dce.com.cn","POST","/publicweb/quotesdata/exportDayQuotesChData.html",{
				"Content-Type": "application/x-www-form-urlencoded"
			},datas.join("&"),function(error,buf){
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