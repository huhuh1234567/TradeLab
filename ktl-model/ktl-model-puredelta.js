(function(){

	var K = require("../k/k");
	var merge = K.merge;
	var kv$ = K.kv$;

	var K_UTIL = require("../k/k-util");
	var comp$ = K_UTIL.comp$;

	var K_ITERATOR = require("../k/k-iterator");
	var array_ = K_ITERATOR.array_;
	var count_ = K_ITERATOR.count_;

	var AVLTree = require("../k/k-avltree").AVLTree;

	var KTL = require("../ktl/ktl");
	var highOf = KTL.highOf;
	var lowOf = KTL.lowOf;

	var KTL_DATA = require("../ktl/ktl-data");
	var Data = KTL_DATA.Data;

	function findHighLow(n,hdata,ldata){

		var rst = new Data();

		var datas = [hdata,ldata];

		var candidate = new AVLTree(comp$);
		
		var ahs = [];
		var bhs = [];
		var als = [];
		var bls = [];

		array_([[hdata,ahs],[ldata,als]]).foreach(function(arr){
			var xdata = arr[0];
			var axs = arr[1];
			var o = xdata.offset-1;
			count_(n).foreach(function(i){
				var r = xdata.findNextValid(o);
				if(r===undefined){
					return true;
				}
				else{
					axs.push(r);
					o = r.$;
				}
			});
		});

		while(ahs.length>0||als.length>0){
			//retrieve current
			var ch = undefined;
			var cl = undefined;
			if(ahs.length>0&&als.length>0){
				if(ahs[0].$===als[0].$){
					ch = ahs.shift();
					cl = als.shift();
				}
				else if(ch<cl){
					ch = ahs.shift();
				}
				else{
					cl = als.shift();
				}
			}
			else if(ahs.length>0){
				ch = ahs.shift();
			}
			else{
				cl = als.shift();
			}
			//prepare for current
			array_([[hdata,ahs,ch],[ldata,als,cl]]).foreach(function(arr){
				var xdata = arr[0];
				var axs = arr[1];
				var cx = arr[2];
				if(cx!==undefined){
					var axlen = axs.length;
					if(axlen>0){
						var latest = xdata.findNextValid(axs[axlen-1].$);
						if(latest!==undefined){
							axs.push(latest);
						}
					}
				}
			});
			var ahlen = ahs.length;
			var allen = als.length;
			var bhlen = bhs.length;
			var bllen = bls.length;
			//find high/low within n
			var ahh = highOf(ahs);
			var all = lowOf(als);
			var bhh = highOf(bhs);
			var bll = lowOf(bls);
			//prepare
			var valid = false;
			var ot = 0;
			var oh = 0;
			var ol = 0;
			var t = undefined;
			var hv = 0;
			var lv = 0;
			//process high
			if(ch!==undefined){
				//check whether high candidate
				if((ahh===undefined||ch._>ahh._)&&(bhh===undefined||ch._>bhh._)){
					//check nearest outer after high/low
					valid = true;
					if(ahlen>0){
						if(allen==0){
							ot = ahs[ahlen-1].$;
							while((t=hdata.findNextValid(ot))!==undefined){
								ot = t.$;
								hv = t._;
								if(hv>ch._){
									valid = false;
									break;
								}
							}
						}
						else{
							oh = ahs[ahlen-1].$;
							ol = als[allen-1].$;
							ot = oh<ol?oh:ol;
							while((t=Data.findNextAnyValid(datas,ot))!==undefined){
								ot = t.$;
								hv = t._[0];
								lv = t._[1];
								if(ot>oh&&!isNaN(hv)&&hv>ch._){
									valid = false;
									break;
								}
								else if(ot>ol&&!isNaN(lv)&&lv<all._&&(cl==undefined||lv<cl._)){
									valid = true;
									break;
								}
							}
						}
					}
					//check nearest outer before high/low
					if(valid&&bhlen>0){
						if(bllen==0){
							ot = bhs[0].$;
							while((t=hdata.findPreviousValid(ot))!==undefined){
								ot = t.$;
								hv = t._;
								if(hv>ch._){
									valid = false;
									break;
								}
							}
						}
						else{
							oh = bhs[0].$;
							ol = bls[0].$;
							ot = oh<ol?ol:oh;
							while((t=Data.findPreviousAnyValid(datas,ot))!==undefined){
								ot = t.$;
								hv = t._[0];
								lv = t._[1];
								if(ot<oh&&!isNaN(hv)&&hv>ch._){
									valid = false;
									break;
								}
								else if(ot<ol&&!isNaN(lv)&&lv<bll._&&(cl==undefined||lv<cl._)){
									valid = true;
									break;
								}
							}
						}
					}
					//save
					if(valid){
						ch.hl = 1;
						candidate.put(ch);
					}
				}
			}
			//process low
			if(cl!==undefined){
				//check whether low candidate
				if((all===undefined||cl._<all._)&&(bll===undefined||cl._<bll._)){
					//check nearest outer after high/low
					valid = true;
					if(allen>0){
						if(ahlen==0){
							ot = als[allen-1].$;
							while((t=ldata.findNextValid(ot))!==undefined){
								ot = t.$;
								lv = t._;
								if(lv<cl._){
									valid = false;
									break;
								}
							}
						}
						else{
							oh = ahs[ahlen-1].$;
							ol = als[allen-1].$;
							ot = oh<ol?oh:ol;
							while((t=Data.findNextAnyValid(datas,ot))!==undefined){
								ot = t.$;
								hv = t._[0];
								lv = t._[1];
								if(ot>ol&&!isNaN(lv)&&lv<cl._){
									valid = false;
									break;
								}
								else if(ot>oh&&!isNaN(hv)&&hv>ahh._&&(ch==undefined||hv>ch._)){
									valid = true;
									break;
								}
							}
						}
					}
					//check nearest outer before high/low
					if(valid&&bllen>0){
						if(bhlen==0){
							ot = bls[0].$;
							while((t=ldata.findPreviousValid(ot))!==undefined){
								ot = t.$;
								lv = t._;
								if(lv<cl._){
									valid = false;
									break;
								}
							}
						}
						else{
							oh = bhs[0].$;
							ol = bls[0].$;
							ot = oh<ol?ol:oh;
							while((t=Data.findPreviousAnyValid(datas,ot))!==undefined){
								ot = t.$;
								hv = t._[0];
								lv = t._[1];
								if(ot<ol&&!isNaN(lv)&&lv<cl._){
									valid = false;
									break;
								}
								else if(ot<oh&&!isNaN(hv)&&hv>bhh._&&(ch==undefined||hv>ch._)){
									valid = true;
									break;
								}
							}
						}
					}
					//save
					if(valid){
						cl.hl = -1;
						candidate.put(cl);
					}
				}
			}
			//prepare for next
			array_([[bhs,ch],[bls,cl]]).foreach(function(arr){
				var bxs = arr[0];
				var cx = arr[1];
				if(cx!==undefined){
					bxs.push(cx);
					if(bxs.length>n){
						bxs.shift();
					}
				}
			});
		}

		//remove continuous high/low
		var filtered = new AVLTree(comp$);
		var pending = undefined;
		candidate._().foreach(function(current){
			if(pending===undefined){
				pending = current;
			}
			else{
				if(pending.hl!==current.hl){
					filtered.put(pending);
					pending = current;
				}
				else if(pending.hl===1&&current._>pending._||pending.hl===-1&&current._<pending._){
					pending = current;
				}
			}
		});
		if(pending!==undefined){
			filtered.put(pending);
		}

		//add to result
		filtered._().foreach(function(current){
			rst.update(current.$,current._);
		})

		//complete first
		var first = filtered.first();
		var lfirst = ldata.findFirstValid();
		var hfirst = hdata.findFirstValid();
		if(first.hl===1&&first.$>lfirst.$){
			rst.update(lfirst.$,lfirst._);
		}
		else if(first.hl===-1&&first.$>hfirst.$){
			rst.update(hfirst.$,hfirst._);
		}

		//complete last
		var last = filtered.last();
		var llast = ldata.findLastValid();
		var hlast = hdata.findLastValid();
		if(last.hl===1&&last.$<llast.$){
			rst.update(llast.$,llast._);
		}
		else if(last.hl===-1&&last.$<hlast.$){
			rst.update(hlast.$,hlast._);
		}

		return rst;
	}

	function findHighLow2(n,hdata,ldata){

		var rst = new Data();

		var datas = [hdata,ldata];

		var candidate = new AVLTree(comp$);
		
		var ahs = [];
		var bhs = [];
		var als = [];
		var bls = [];

		array_([[hdata,ahs],[ldata,als]]).foreach(function(arr){
			var xdata = arr[0];
			var axs = arr[1];
			var o = xdata.offset-1;
			count_(n).foreach(function(i){
				var r = xdata.findNextValid(o);
				if(r===undefined){
					return true;
				}
				else{
					axs.push(r);
					o = r.$;
				}
			});
		});

		while(ahs.length>0||als.length>0){
			//retrieve current
			var ch = undefined;
			var cl = undefined;
			if(ahs.length>0&&als.length>0){
				if(ahs[0].$===als[0].$){
					ch = ahs.shift();
					cl = als.shift();
				}
				else if(ch<cl){
					ch = ahs.shift();
				}
				else{
					cl = als.shift();
				}
			}
			else if(ahs.length>0){
				ch = ahs.shift();
			}
			else{
				cl = als.shift();
			}
			//prepare for current
			array_([[hdata,ahs,ch],[ldata,als,cl]]).foreach(function(arr){
				var xdata = arr[0];
				var axs = arr[1];
				var cx = arr[2];
				if(cx!==undefined){
					var axlen = axs.length;
					if(axlen>0){
						var latest = xdata.findNextValid(axs[axlen-1].$);
						if(latest!==undefined){
							axs.push(latest);
						}
					}
				}
			});
			//find high/low within n
			var ahh = highOf(ahs);
			var all = lowOf(als);
			var bhh = highOf(bhs);
			var bll = lowOf(bls);
			//process high
			if(ch!==undefined){
				if((ahh===undefined||ch._>ahh._)&&(bhh===undefined||ch._>bhh._)){
					//high candidate
					ch.hl = 1;
					candidate.put(ch);
				}
			}
			//process low
			if(cl!==undefined){
				if((all===undefined||cl._<all._)&&(bll===undefined||cl._<bll._)){
					//low candidate
					cl.hl = -1;
					candidate.put(cl);
				}
			}
			//prepare for next
			array_([[bhs,ch],[bls,cl]]).foreach(function(arr){
				var bxs = arr[0];
				var cx = arr[1];
				if(cx!==undefined){
					bxs.push(cx);
					if(bxs.length>n){
						bxs.shift();
					}
				}
			});
		}

		//remove continuous high/low
		var filtered = new AVLTree(comp$);
		var pending = undefined;
		candidate._().foreach(function(current){
			if(pending===undefined){
				pending = current;
			}
			else{
				if(pending.hl!==current.hl){
					filtered.put(pending);
					pending = current;
				}
				else if(pending.hl===1&&current._>pending._||pending.hl===-1&&current._<pending._){
					pending = current;
				}
			}
		});
		if(pending!==undefined){
			filtered.put(pending);
		}

		//add to result
		filtered._().foreach(function(current){
			rst.update(current.$,current._);
		})

		//complete first
		var first = filtered.first();
		var lfirst = ldata.findFirstValid();
		var hfirst = hdata.findFirstValid();
		if(first.hl===1&&first.$>lfirst.$){
			rst.update(lfirst.$,lfirst._);
		}
		else if(first.hl===-1&&first.$>hfirst.$){
			rst.update(hfirst.$,hfirst._);
		}

		//complete last
		var last = filtered.last();
		var llast = ldata.findLastValid();
		var hlast = hdata.findLastValid();
		if(last.hl===1&&last.$<llast.$){
			rst.update(llast.$,llast._);
		}
		else if(last.hl===-1&&last.$<hlast.$){
			rst.update(hlast.$,hlast._);
		}

		return rst;
	}

	merge(exports,{
		findHighLow: findHighLow,
		findHighLow2: findHighLow2
	});

})();