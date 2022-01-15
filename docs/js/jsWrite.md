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

## 6、数组扁平化

```js
const arr = [1, [2, new Number(3), "4"], { a: 5, b: [6, 7] }, [8, [9, [10]]]];
const result = data2arr(arr);
console.log("result=====>", result);

function data2arr(arr) {
  return arr.reduce((prev, current) => {
    if (isArr(current)) {
      //数组
      const temp = [];
      arr2arr(current, temp);
      return prev.concat(temp);
    } else if (isObj(current)) {
      //对象
      const temp = [];
      arr2arr(Object.values(current), temp);
      return prev.concat(temp);
    } else {
      //数字
      prev.push(current);
      return prev;
    }
  }, []);
}

function arr2arr(arr, target) {
  arr.forEach((item) => {
    if (isArr(item)) {
      arr2arr(item, target);
    } else {
      target.push(Number(item));
    }
  });
}

function isArr(arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
}

function isObj(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
```

## 7、手写 promise

```js
class MyPromise {
  static PADDING = "padding";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.state = MyPromise.PADDING; //状态
    this.result = null; //最终值
    this.onFulfilledCbk = []; //成功回调
    this.onRejectedCbk = []; //失败回调

    try {
      //this始终指向当前promise实例
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value) {
    if (this.state !== MyPromise.PADDING) return;

    this.state = MyPromise.FULFILLED;
    this.result = value;

    //执行成功回调，可能有多个
    while (this.onFulfilledCbk.length > 0) {
      this.onFulfilledCbk.shift()(value);
    }
  }

  reject(reason) {
    if (this.state !== MyPromise.PADDING) return;

    this.state = MyPromise.REJECTED;
    this.result = reason;

    //执行失败回调，可能有多个
    while (this.onRejectedCbk.length > 0) {
      this.onRejectedCbk.shift()(reason);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = isFun(onFulfilled) ? onFulfilled : (val) => val;
    onRejected = isFun(onRejected)
      ? onRejected
      : (reason) => {
          throw reason;
        };

    //返回的promise
    const thenPromise = new MyPromise((resolve, reject) => {
      //处理函数
      const resultPromise = (cb) => {
        setTimeout(() => {
          try {
            //返回值
            const x = cb(this.result);

            if (x instanceof MyPromise) {
              //返回的是promise，继续链式
              x.then(resolve, reject);
            } else {
              //返回其他，直接resolve
              resolve(x);
            }
          } catch (e) {
            reject(e);
            // throw new Error(e);
          }
        });
      };

      if (this.state === MyPromise.FULFILLED) {
        resultPromise(onFulfilled);
      } else if (this.state === MyPromise.REJECTED) {
        resultPromise(onRejected);
      } else if (this.state === MyPromise.PADDING) {
        //（定时器情况）等待状态，放入数组存放，等状态改变后挨个执行
        this.onFulfilledCbk.push(resultPromise.bind(this, onFulfilled));
        this.onRejectedCbk.push(resultPromise.bind(this, onRejected));
      }
    });

    return thenPromise;
  }
}

function isFun(fun) {
  return Object.prototype.toString.call(fun) === "[object Function]";
}

//=======用例
const test1 = new MyPromise((resolve, reject) => {
  resolve(1);
});

console.log("test1===>", test1);

//--------
const test2 = new MyPromise((resolve, reject) => {
  reject(2);
});

console.log("test2===>", test2);

//--------
const test3 = new MyPromise((resolve, reject) => {
  throw "error";
});

console.log("test3===>", test3);

//--------
const test4 = new MyPromise((resolve) => {
  resolve("test4 result");
}).then((res) => {
  console.log("test4===>", res);
});

//--------
const test5 = new MyPromise((resolve) => {
  console.log("1同步执行...");
  setTimeout(() => {
    resolve("test5 result");
  }, 1000);
  console.log("2同步执行...");
}).then((res) => {
  console.log("test5 res===>", res);
});
//--------

const test6 = new MyPromise((resolve) => {
  resolve(6);
})
  .then((res) => {
    return res * 2;
  })
  .then((res) => console.log("test6===>", res));

//--------

const test7 = new MyPromise((resolve, reject) => {
  resolve(7);
})
  .then((res) => {
    return new MyPromise((resolve, reject) => {
      resolve(res * 10);
    });
  })
  .then(
    (res) => console.log("test7 成功===>", res),
    (err) => console.log("test7 失败===>", err)
  );

//--------
const test8 = new MyPromise((resolve) => {
  resolve(100);
})
  .then((res) => {
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        reject(8);
      }, 1000);
    });
  })
  .then(
    (res) => {
      console.log("test8 成功===>", res);
    },
    (err) => {
      console.log("test8 失败===>", err);
    }
  );
```

## 8、手写 ajax

```js
function request(url, method, body) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    //创建请求
    xhr.open(method, url, true);
    //状态监听函数
    xhr.onreadystatechange = function() {
      //状态4为请求已完成
      if (xhr.readyState !== 4) return;

      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(this.statusText);
      }
    };
    //报错
    xhr.onerror = function() {
      reject(this.statusText);
    };

    //设置请求头
    xhr.responseType = "json";
    xhr.setRequestHeader("Accept", "application/json");

    //发送
    if (method === "get") {
      xhr.send();
    } else if (method === "post") {
      xhr.send(body);
    }
  });
}
```
