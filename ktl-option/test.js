var Black76Model = require("./ktl-option-pricing-black-76").Black76Model;

var model = new Black76Model();

var s = 2763;
var k = 2800;
var r = 0.02765;
var day = new Date(2018,1-1,17);
var mday = new Date(2018,4-1,10);
var d = -1;

var iv = model.iv(87.5,s,k,r,day,mday,d);
var pp = model.price(s,k,r,iv,day,mday,d);
var delta = model.delta(s,k,r,iv,day,mday,d);
var gamma = model.gamma(s,k,r,iv,day,mday,d);

console.error("iv="+iv+", pp="+pp+", delta="+delta+", gamma="+gamma);

var K_DATE = require("../k/k-date");
var DateFormat = K_DATE.DateFormat;

var KTL_DATE = require("../ktl/ktl-date");
var date2offset = KTL_DATE.date2offset;
var offset2date = KTL_DATE.offset2date;

var df = new DateFormat("yyyy-MM-dd");

console.error("offset="+date2offset(df.parse("2000-01-01")));
console.error("date="+df.format(offset2date(16384)));
