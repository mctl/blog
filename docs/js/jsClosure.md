首先放一个最简单的闭包例子：
```js
//定义一个函数，这个函数return一个函数
function getNum(){
  var a = 10;
  return function(){
    console.log(a);
  }
}

var a = 20;

getNum()(); //10
```
在上面的例子中，任何人都可以通过getNum这个函数来访问a变量，但外部无法改变a的值。

这看起来似乎就是私有属性，但其实闭包和private是两码事，为什么呢？

首先我们从名字说起，闭包的“闭”其实不是封闭了内部状态，而是是封闭了外部状态。

说人话就是：闭包的实现靠的是外部作用域失效，在外部作用域失效的情况下，其内部还保留有属性。

所以闭包是靠作用域来实现的，实际上是作用域的一种应用。

在块作用域出现之前，js只有全局作用域和函数作用域。

这种情况下，私有是困难的，除了在命名上自欺欺人的加些下划线之类的特殊符号，闭包就显得靠谱多了

当然时至今日，有块作用域，有let、const，闭包的作用也没那么大了，有更简单的实现就用更简单的，套娃好玩是好玩，但确实不易理解...

下面给出两个例子，应付面试估计够了...
#### 1、判断用户是否首次登录
```js
function isFirstLogin(){
    var list=[];
    return function(id){
        if(list.indexOf(id) >= 0){
            return false;
        }else{
            list.push(id);
            return true;
        }
    }
}

var firstLogin = isFirstLogin();

firstLogin(001) //true
firstLogin(001) //false
firstLogin(002) //true
firstLogin(002) //false
```
#### 2、用闭包正确实现for循环
```js
for (var i = 1; i <= 5; i++) {
  (function (j) {
    setTimeout (function timer() {
      console.log(j)
    }, j * 1000)
  })(i)
}
```
当然，都2020年了，直接let就行，此例只是为了说明闭包...
