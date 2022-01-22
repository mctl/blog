## 1、new 的实现

```js
function myNew(constructor, ...args) {
  //参数判断
  if (typeof constructor !== "function") {
    console.error("类型错误：第一个参数不是函数");
    return;
  }

  //1、新对象原型指向构造函数的prototype
  const newObj = Object.create(constructor.prototype);

  //2、调用构造函数，this指向新对象
  const result = constructor.apply(newObj, args);

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
Function.prototype.myApply = function(obj, args = []) {
  const ctx = obj || window;

  //防止属性重复
  const fn = Symbol();
  //this为调用的函数
  ctx[fn] = this;

  const res = args.length > 0 ? ctx[fn](...args) : ctx[fn]();

  delete ctx[fn];

  return res;
};

function test(a, b) {
  console.log(a, b);
  return this;
}

console.log(test.myApply({ name: "allen" }, [1, 2]));
```

## 3、call 实现

和 apple 仅参数形式不同

```js
Function.prototype.myCall = function(obj, ...args) {
  const ctx = obj || window;

  //防止属性重复
  const fn = Symbol();
  //this为调用的函数
  ctx[fn] = this;

  const res = args.length > 0 ? ctx[fn](...args) : ctx[fn]();

  delete ctx[fn];

  return res;
};

function test(a, b) {
  console.log(a, b);
  return this;
}

console.log(test.myCall({ name: "allen" }, 1, 2));
```

## 4、bind 实现

```js
Function.prototype.myBind = function(ctx, ...args) {
  const fn = this;

  //返回函数
  return function newFn(...newArgs) {
    //构造函数的情况
    if (this instanceof newFn) {
      return new fn(...args, ...newArgs);
    }
    //正常调用
    return fn.apply(ctx, [...args, ...newArgs]);
  };
};

function test(a, b) {
  console.log(a, b);
  return this;
}

test.myBind({ name: "allen" })(1, 2);
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

## 9、根据树节点，返回路径

树的深度优先遍历

```js
const list = [
  {
    id: "ab",
    children: [
      {
        id: "ee",
        children: [],
      },
      {
        id: "cd",
        children: [
          {
            id: "ef",
            children: [],
          },
          {
            id: "aa",
            children: [],
          },
        ],
      },
    ],
  },
];

function findPath(list, target) {
  let path = null;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    if (item.id === target) {
      return [item.id];
    } else {
      if (item?.children?.length > 0) {
        //递归调用
        path = findPath(item.children, target);
        if (path) {
          path.unshift(item.id);
          return path;
        }
      }
    }
  }

  return path;
}

console.log(findPath(list, "aa").join("->"));
console.log(findPath(list, "cd").join("->"));
//不存在，返回undefined
console.log(findPath(list, "ddd")?.join("->"));
```
