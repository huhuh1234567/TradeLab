
var fs = require("fs");

var K_HTTPCLIENT = require("../k/k-httpclient");
var request = K_HTTPCLIENT.request;

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var df = new DateFormat("yyyy-MM-dd");

var variety = "all";
var type = 0;
var ymds = [
	'2018-03-16',
	'2018-03-19',
	'2018-03-20',
	'2018-03-21',
	'2018-03-22',
	'2018-03-23',
	'2018-03-26',
	'2018-03-27',
	'2018-03-28',
	'2018-03-29',
	'2018-03-30',
	'2018-04-02',
	'2018-04-03',
	'2018-04-04',
	'2018-04-09',
	'2018-04-10',
	'2018-04-11',
	'2018-04-12',
	'2018-04-13',
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