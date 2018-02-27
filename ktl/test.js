
var KTL_DATE = require("./ktl-date");

var date = new Date();

var str = KTL_DATE.format(date);

console.error(str);
console.error(KTL_DATE.format(KTL_DATE.parse(str)));

var offset = KTL_DATE.date2offset(date);

console.error(offset+" "+KTL_DATE.formatDate(KTL_DATE.offset2date(offset)));
