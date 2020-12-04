看过一些关于this指向的文章，有简单的基本一看就懂，有复杂的差点从盘古开天辟地说起，看的实在头大

所以本篇直接讲几个结论和例子，力图简洁明了，倘若看完意犹未尽想深入的，建议看看别的文章...

### 一、this是什么

- this是很多语言中都有的关键字，在JavaScript中同样存在，但表现有所不同。

- this的值是当前执行代码的环境对象，在严格模式下指向对象，非严格模式下可以是任意值

这句定义是MDN搬过来的，要是咋一看无法理解就先放过，直接看后面的内容。

### 二、this指向问题

下面我将根据函数的不同调用模式分别来看this指向

同时按照优先级先后排序

#### 1、new调用
例子：
```js
const Obj = function (name) {
    this.name = name;
    console.log(this);
};

const obj1 = new Obj( 'mctl'); //Obj {name: "mctl"}

console.log(obj1.name) // mctl

const obj2 = new Obj('musicatravelove'); //Obj {name: "musicatravelove"}

console.log(obj2.name); // musicatravelove
```
用new对象的方式优先级是最高的，new的其中一个步骤就是把this绑定到函数调用的对象上

再来一遍，new的方式会将this绑定到新创建的对象上。

#### 2、call、apply、bind调用
这三个函数大同小异，主要就是用来指定this的，传入的第一个参数就是绑定的this值

例子：
```js
const obj11 = { name : 'mctl' };
const obj22 = { name : 'musicatravelove' };

function func(){
    console.log(this.name);
}

func.call(obj11); // 输出：mctl，此时this指向obj11
func.call(obj22); // 输出：musicatravelove，此时this指向obj22
```

这种方式也很容易理解，call、apply、bind绑定了谁，谁就是this。

优先级仅次于new。

#### 3、对象上的函数调用，也即obj.func()
例子：
```js
let action = function() {
    console.log(this.name);
}

let obj = {
    name: 'father',
    action: action,
    son: {
        name: 'son',
        action: action,
    }
}
obj.action(); //输出：father，此时this指向了obj
obj.son.action(); //输出：son，此时this指向了son
```

这种方式也是简单明了，谁调用了函数，谁就是this。

再来一遍，谁（对象）调用了函数，this就指向谁。

#### 4、普通函数调用，也即func()
例子：
```js
function func() {
    console.log(this)
}

func(); //Window {parent: Window, opener: null, top: Window, length: 0, frames: Window, …}
```
别管这个函数出现在对象内，还是方法里，反正直接调用的时候，this指向window

更确切的说，非严格模式指向window，严格模式指向undefined。

#### （例外）5、箭头函数
首先箭头函数没有this，不能用new来调用，也不可以改变this绑定。

箭头函数中的this是顺着作用域链一直往上找，找不到就是window...

```js
var name = 'window';
console.log(window.name); //window
var obj = {
    name: 'mctl',
    action: function() {
        var func = () => {
            console.log(this.name)
        }
        func();
    },
    action2: () => {
        console.log(this.name)
    }
}
obj.action(); //window
obj.action2(); //mctl
```

#### （其他）6、DOM事件函数

当函数被用作事件处理函数时，它的this指向触发事件的DOM元素

这个就不举例了，应该都知道



