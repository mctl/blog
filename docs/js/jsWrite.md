## 1、new的实现

```js
function myNew() {
  let newObj = null, result = null;
  let constructor = Array.prototype.shift.call(arguments);

  //参数判断
  if (typeof constructor !== 'function') {
    console.log('类型错误：第一个参数不是函数');
    return;
  }

  //1、新对象原型指向构造函数的prototype
  newObj = Object.create(constructor.prototype);

  //2、this指向新对象
  result = constructor.apply(newObj, arguments);

  //判断返回对象，一般情况下，构造函数不返回值，但是用户可以主动返回对象，来覆盖正常的对象创建步骤
  const flag = result && (typeof result === 'object' || typeof result === 'function');

  return flag ? result : newObj;
}

function Foo(name) {
  this.name = name;
  // return { name: '123'}
}

const a = myNew(Foo, 'allen');
console.log(a.name)
```