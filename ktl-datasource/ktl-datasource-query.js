(function(){

	var iconv = require("iconv-lite");
	var cheerio = require("cheerio");

	var K = require("../k/k");
	var merge = K.merge;

	var K_ITERATOR = require("../k/k-iterator");
	var array_ = K_ITERATOR.array_;
	var object_ = K_ITERATOR.object_;

	var K_HTTPCLIENT = require("../k/k-httpclient");
	var request = K_HTTPCLIENT.request;

	var KTL_DATASOURCE = require("../ktl-datasource/ktl-datasource");
	var formatMatureMonth = KTL_DATASOURCE.formatMatureMonth;

	function queryDceDelayFuture(c,callback){
		var date = new Date();
		request("www.dce.com.cn","GET","/webquote/futures_quote.jsp?varietyid="+c,null,null,function(error,buf){
			var rst = undefined;
			if(!error){
				rst = {};
				try{
					var $ = cheerio.load(iconv.decode(buf,"utf-8"));
					var trs = $("#dataT tbody tr");
					for(var i=1; i<trs.length; i++){
						var tds = $("td",trs[i]);
						var mm = tds[0].children[0].data;
						mm = formatMatureMonth(mm.substring(mm.length-4),date.getFullYear());
						var last = parseFloat(tds[4].children[0].data);
						var bid = parseFloat(tds[6].children[0].data);
						var ask = parseFloat(tds[8].children[0].data);
						rst[mm] = [last,bid,ask];
					}
				}
				catch(e){
					error = e.toString();
				}
			}
			if(error){
				console.error("query dce delay future error: "+error);
			}
			callback(rst);
		},10*1000);
	}

	function queryDceDelayOption(c,mm,callback){
		request("www.dce.com.cn","GET","/webquote/option_quote.jsp?varietyid="+c+"&contractid="+c+mm.substring(2),null,null,function(error,buf){
			var rst = null;
			if(!error){
				rst = {};
				try{
					var $ = cheerio.load(iconv.decode(buf,"utf-8"));
					var trs = $("#dataT tbody tr");
					for(var i=1; i<trs.length; i++){
						var tds = $("td",trs[i]);
						var strike = tds[15].children[0].data;
						var clast = parseFloat(tds[14].children[0].data);
						var cbid = parseFloat(tds[11].children[0].data);
						var cask = parseFloat(tds[9].children[0].data);
						var plast = parseFloat(tds[16].children[0].data);
						var pbid = parseFloat(tds[19].children[0].data);
						var pask = parseFloat(tds[21].children[0].data);
						rst["c_"+strike] = [clast,cbid,cask];
						rst["p_"+strike] = [plast,pbid,pask];
					}
				}
				catch(e){
					error = e.toString();
				}
			}
			if(error){
				console.error("query dce delay option error: "+error);
			}
			callback(rst);
		},10*1000);
	}

	function queryCzceDelayFuture(c,callback){
		var date = new Date();
		request("www.czce.com.cn","GET","/cn/DFSStaticFiles/Future/Quotation/ChineseFutureQuotation.htm",null,null,function(error,buf){
			var rst = undefined;
			if(!error){
				rst = {};
				try{
					var $ = cheerio.load(iconv.decode(buf,"utf-8"));
					var trs = $("table tbody tr");
					for(var i=1; i<trs.length; i++){
						var tds = $("td",trs[i]);
						var anchors = $("a",tds[0]);
						if(anchors.length>0){
							var cm = anchors[0].children[0].data.toLowerCase();
							var sep = cm.length-3;
							var cc = cm.substring(0,sep);
							if(c===cc){
								var mm = formatMatureMonth(cm.substring(sep),date.getFullYear());
								var last = parseFloat(tds[5].children[0].data);
								var bid = parseFloat(tds[7].children[0].data);
								var ask = parseFloat(tds[8].children[0].data);
								rst[mm] = array_([last,bid,ask]).map_(function(v){
									return v===0?Number.NaN:v;
								}).toArray();
							}
						}
					}
				}
				catch(e){
					error = e.toString();
				}
			}
			if(error){
				console.error("query czce delay future error: "+error);
			}
			callback(rst);
		},15*1000);
	}

	function queryCzceDelayOption(c,mm,callback){
		var date = new Date();
		request("www.czce.com.cn","GET","/cn/DFSStaticFiles/Option/Quotation/ChineseOptionQuotation.htm",null,null,function(error,buf){
			var rst = null;
			if(!error){
				rst = {};
				try{
					var $ = cheerio.load(iconv.decode(buf,"utf-8"));
					var trs = $("table tbody tr");
					for(var i=1; i<trs.length; i++){
						var tds = $("td",trs[i]);
						var anchors = $("a",tds[0]);
						if(anchors.length>0){
							var contract = anchors[0].children[0].data.toLowerCase();
							var indexC = contract.lastIndexOf("c");
							var indexP = contract.lastIndexOf("p");
							var indexCP = indexC>0?indexP>0?Math.max(indexC,indexP):indexC:indexP;
							if(indexCP>0){
								var cm = contract.substring(0,indexCP);
								var sep = cm.length-3;
								var cc = cm.substring(0,sep);
								var mmmm = formatMatureMonth(cm.substring(sep),date.getFullYear());
								if(c===cc&&mm===mmmm){
									var cp = contract.charAt(indexCP);
									var strike = contract.substring(indexCP+1);
									var last = parseFloat(tds[5].children[0].data);
									var bid = parseFloat(tds[7].children[0].data);
									var ask = parseFloat(tds[8].children[0].data);
									rst[cp+"_"+strike] = array_([last,bid,ask]).map_(function(v){
										return v===0?Number.NaN:v;
									}).toArray();
								}
							}
						}
					}
				}
				catch(e){
					error = e.toString();
				}
			}
			if(error){
				console.error("query czce delay option error: "+error);
			}
			callback(rst);
		},15*1000);
	}

	merge(exports,{
		queryDceDelayFuture: queryDceDelayFuture,
		queryDceDelayOption: queryDceDelayOption,
		queryCzceDelayFuture: queryCzceDelayFuture,
		queryCzceDelayOption: queryCzceDelayOption
	});

})();