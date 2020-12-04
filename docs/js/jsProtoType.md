#### 1、对象从哪里来的

众所周知JS中万物皆对象，我们使用JS做任何事情都需要对象，那么你有没有想过对象是从哪里来的？

假如你写过Java等后端语言就知道对象是从类实例化来的，类就是模版。

但JS并没有类的概念，即便是es6的class也只是一种语法糖，本质并没有改变，还是基于原型的。

因此我们可以知道同样是面向对象的，但Java和JavaScript的方式并不一样，类的概念让对象很容易理解，这种描述方式更接近自然，而原型看起来似乎很复杂，但其实有迹可循。

还是从来源说起，对象当然不会凭空出现，它需要一个东西把它构造出来，也就是构造器，或者说构造函数，这个函数的作用就是生产出对象。

如果是Java，构造函数就写在类里，当你定义好了一个类，可以很自然的new一个对象出来。

Js中虽然没有类，但它依然需要构造函数，构造函数与普通函数没有实质的区别，但为了将它们区分，通常的写法是构造函数首字母大写

然而没有任何强制性约束性，这就是js...

#### 2、构造函数

前文说过，构造函数和普通函数唯一的区别就是首字母大写，所以这就是一个构造函数：

```js
//构造函数
function Person (){
    
}
//对象
let person = new Person();
```

此时它们的关系是这样的：图2.1

#### 3、原型：protoType与__proto__

protoType和__proto__都与原型相关，具体来说：

protoType是显式原型，所有函数都拥有protType对象；

__proto__是隐式原型，所有对象都有__proto__属性；

从称谓可以看出来它们有很强的关联性，而实际上一个对象的隐式原型指向该对象构造函数的显式原型。

还是person与Person，根据上面这句话，我们可以有这样的结论：

```js
person.__proto__ === Person.prototype; //true
```

于是它们的关系就变成了这样：图3.1

事情还没完，__protor__是个指针，指向了对象的原型，但原型是个什么东西呢？

当我们打印出Person.protoType会发现，此对象包含一个constructor构造函数，以及隐式原型__proto__

图3.2

神奇的是我们发现protoType.constructor又指向了Person函数：


```js
Person.prototype.constructor === Person; //true
```

于是它们的关系也变成了：

图3.3

#### 4、原型链

上图看似构成了一个闭环，但实际上构造函数和原型的__proto__依然是两个出口

我们继续往下看：

##### 针对构造函数Person有：

```js
Person.__proto__ === Function.prototype; //true
```

Person是我们手写的函数，但函数也是对象，对象就有原型，从上面可以看到Person的原型是Function.prototype，而Function是JS的内置函数，是所有函数的祖宗，任何函数通过原型肯定可以找到Function的头上

但是，函数祖宗不也是函数吗，函数也是对象，所以：

```js
Function.prototype.__proto__ === Object.prototype; //true
```
函数原型的原型是对象，没毛病，符合一切都是对象的设定

##### 针对Person.protoType有：

```js
Person.prototype.__proto__ === Object.prototype; //true
```

两边的出口同时走到了Object.prototype，Object就是所有对象的祖宗。

那么问题来了，对象是函数生产出来的，而函数的原型是对象，到底先有的谁？

我们再往下走一步，会发现：

```js
console.log(Object.prototype.__proto__)
//null
```
事情终于走到了尽头，链到尽头null为峰，不是鸡也不是蛋，天地除开只有null...

于是它们到关系变成了这样：图4.1









