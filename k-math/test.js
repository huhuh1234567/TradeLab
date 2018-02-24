

console.error(0x7fffffffffffffff);

console.error((-1234).toString(16));
console.error((1234).toString(16));
console.error(-0x400-0xd2);

var s = 0x00ffffffff;//-new Date().getTime();
var s0 = (s%0x100000000);
var s1 = ((s/0x100000000)>>0);
console.log(s);
console.log(s<0);
console.log((s0>>>0).toString(16));
console.log((s1>>>0).toString(16));

console.error(Math.log(1.7976931348623157e+308));
console.error(Math.log(Number.MAX_VALUE));

console.error((2.220446049250313e-16).toString(16));
console.error((1.4901161193847656E-8).toString(16));
console.error((1.1920928955078125E-7).toString(16));

console.error(isNaN(NaN));

console.error((12.5).toString(2));

var NormalDistribution = require("./k-math-distribution-normal").NormalDistribution;
var dist = new NormalDistribution();
var dist2 = new NormalDistribution();
// for(var i=0; i<=2000; i++){
// 	var x = (i-1000)*0.005;
// 	console.error(x+","+dist.cumulativeProbability(x));
// }
for(var i=0; i<1000; i++){
	var x = dist.sample();
	var y = dist2.sample();
	console.error(x+","+y);
}