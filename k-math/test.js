

console.error(0x7fffffffffffffff);

console.error((-1234).toString(16));
console.error((1234).toString(16));
console.error(-0x400-0xd2);

var s = new Date().getTime()+Math.round((Math.random()*2.0-1.0)*0x7fffffffffffffff);
console.error((s).toString(16));
console.error(parseInt(-1).toString(16));
console.error(parseInt(-1>>>0).toString(16));

console.error(Math.log(1.7976931348623157e+308));
console.error(Math.log(Number.MAX_VALUE));

console.error((2.220446049250313e-16).toString(16));
console.error((1.4901161193847656E-8).toString(16));
console.error((1.1920928955078125E-7).toString(16));

console.error(isNaN(NaN));
