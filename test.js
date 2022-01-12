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
