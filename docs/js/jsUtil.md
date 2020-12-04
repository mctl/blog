### ipv4/ipv6校验

```js
let ipv4 = /^((\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.){4}$/;

let ipv6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;

if(!ipv4.test(ipAddr + '.') && !ipv6.test(ipAddr)){
	alert('ip格式不正确')
	return false;
}
```

#### 1. 判断两个number是否相等
```js
0.1 + 0.2 === 0.3;    // false

//Number.EPSILON是一个数值很小的常量：
Number.EPSILON == 2.220446049250313e-16;    // true

function epsEqu(x, y) {
    return Math.abs(x - y) < Number.EPSILON;
}
console.log(epsEqu(0.1+0.2, 0.3));   // true
```
#### 2. 计算参数平方和的平方根
Math.hypot()返回参数平方和的平方根。适合计算两点之间的距离，ie不支持
```js
Math.hypot([value1[, value2[, ...]]]);

Math.hypot(3, 4);        // 5
Math.hypot(3, 4, 5);     // 7.0710678118654755
Math.hypot();            // 0
Math.hypot(NaN);         // NaN
Math.hypot(3, 4, 'foo'); // NaN, +'foo' => NaN
Math.hypot(3, 4, '5');   // 7.0710678118654755, +'5' => 5
Math.hypot(-3);          // 3, the same as Math.abs(-3)

let distance = Math.hypot(y2-y1, x2-x1);

//ie兼容
if (!Math.hypot) Math.hypot = function() {
  var y = 0, i = arguments.length;
  while (i--) y += arguments[i] * arguments[i];
  return Math.sqrt(y);
};
```

#### 3. 保留数字的整数部分
单词trunc是截断截取的意思，Math.trunc()方法会将数字的小数部分去掉，只保留整数部分。

不像 Math 的其他三个方法： 
- 向下取整：<code>Math.floor()</code>
- 向上取整：<code>Math.ceil()</code>
- 四舍五入取整：<code>Math.round() </code>

Math.trunc()的执行逻辑很简单，仅仅是删除掉数字的小数部分和小数点，不管参数是正数还是负数。
```js
Math.trunc(13.37)    // 13
Math.trunc(42.84)    // 42
Math.trunc(0.123)    //  0
Math.trunc(-0.123)   // -0
Math.trunc("-1.123") // -1
Math.trunc(NaN)      // NaN
Math.trunc("foo")    // NaN
Math.trunc()         // NaN

//ie
if (!Math.trunc) {
  Math.trunc = function(v) {
    v = +v;
    return (v - v % 1) || (!isFinite(v) || v === 0 ? v : v < 0 ? -0 : 0);
  };
}
```
