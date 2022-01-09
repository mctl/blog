## 1、new 的实现

```js
function myNew() {
  let newObj = null,
    result = null;
  let constructor = Array.prototype.shift.call(arguments);

  //参数判断
  if (typeof constructor !== "function") {
    console.error("类型错误：第一个参数不是函数");
    return;
  }

  //1、新对象原型指向构造函数的prototype
  newObj = Object.create(constructor.prototype);

  //2、this指向新对象
  result = constructor.apply(newObj, arguments);

  //判断返回对象，一般情况下，构造函数不返回值，但是用户可以主动返回对象，来覆盖正常的对象创建步骤
  const flag =
    result && (typeof result === "object" || typeof result === "function");

  return flag ? result : newObj;
}

function Foo(name) {
  this.name = name;
  // return { name: '123'}
}

const a = myNew(Foo, "allen");
console.log(a.name);
```

## 2、apple 实现

```js
Function.prototype.myApply = function(context) {
  //判断调用对象
  if (typeof this !== "function") {
    console.error("类型错误：调用对象不是函数");
    return;
  }

  let result = null;

  context = context || window;

  //将函数设为对象的方法
  context.fn = this;

  //调用
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }

  delete context.fn;

  return result;
};

function test(a, b) {
  console.log("this===>", this, a, b);
}

test.myApply({ name: "mctl" });
test.myApply({ name: "mctl" }, ["mctl", 22]);
```

## 3、call 实现

和 apple 仅参数形式不同，相关部分改为以下即可

```js
const args = [...arguments].slice(1);

//调用
result = context.fn(...args);
```

## 4、bind 实现

```js
Function.prototype.myBind = function(context) {
  //判断调用对象
  if (typeof this !== "function") {
    console.error("类型错误：调用对象不是函数");
    return;
  }

  const fn = this;
  const args = [...arguments].slice(1);

  //闭包保存this
  return function Fn() {
    //内部apply实现，返回函数需再次调用
    return fn.apply(
      //判断新函数作为构造函数的情况，需要返回this，否则为传入的上下文
      this instanceof Fn ? this : context,
      //合并两次传入的参数
      args.concat(...arguments)
    );
  };
};

function test(a, b) {
  console.log("this===>", this, a, b);
}

test.myBind({ name: "mctl" })();
test.myBind({ name: "mctl" })("mctl", 22);
test.myBind({ name: "mctl" }, "mctl")(22);
```

## 5、柯里化

```js
function curry(fn, ...args) {
  const fnLen = fn.length;
  const argsLen = args.length;

  if (fnLen > argsLen) {
    return function(...a) {
      return curry(fn, ...args, ...a);
    };
  } else {
    return fn(...args);
  }
}

function sumFn(a, b, c) {
  console.log(a + b + c);
}

const sum = curry(sumFn);
sum(1)(2)()(3);
sum(1, 2)(3);
```
