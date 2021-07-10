## 一、AST 的公共属性

- type


- start、end、loc：开始结束下标，loc对象有line和column记录开始结束行号

- leadingComments、innerComments、trailingComments：表示开始的注释、中间的注释、结尾的注释，因为每个 AST 节点中都可能存在注释，而且可能在开始、中间、结束这三种位置，通过这三个属性来记录和 Comment 的关联。


- extra：额外信息

## 二、常见的AST节点

AST可视化网站：https://astexplorer.net/

### 1、Literal 字面量

字面量，StringLiteral、TemplateLiteral、NumbericLiteral等

### 2、Identifier 标识符

标识符，变量名、属性名、参数名等各种声明和引用的名字

```js
const name = 'mctl'

function say(name) {
    console.log(name)
}

//其中有name，say，name，console，log，name
```

### 3、Statement 语句

语句，可以独立执行的单位，比如 break、continue、debugger、return 或者 if 语句、while 语句、for 语句，还有声明语句，表达式语句等

```js
break;
continue;
return;
debugger;
throw Error();
{}
try {} catch(e) {} finally{}
for (let key in obj) {}
for (let i = 0;i < 10;i ++) {}
while (true) {}
do {} while (true)
switch (v){case 1: break;default:;}
label: console.log();
with (a){}
```

对应的有BreakStatement、ContinueStatement、TryStatement、WhileStatement等

### 4、Declaration 声明语句

声明语句是一种特殊的语句，它执行的逻辑是在作用域内声明一个变量、函数、class、import、export 等。

```js
const a = 1; //VariableDeclaration
function b(){} //FunctionDeclaration
class C {} //ClassDeclaration

import d from 'e'; //ImportDeclaration

export default e = 1; //ExportDefaultDeclaration
export {e}; //ExportNameDeclaration
export * from 'e'; //ExportAllDeclaration
```

### 5、Expression 表达式

expression 是表达式，特点是执行完以后有返回值，这是和语句 (statement) 的区别。

```js
[1,2,3] //ArrayExpression
a = 1 //AssignmentExpression 赋值表达式
1 + 2; //BinaryExpression 二元表达式
-1; //unaryExpression 一元表达式
function(){}; 
() => {}; //ArrowFunctionExpression 箭头函数表达式
class{};
a; //Idntifier 标识符
this;
super;
a::b; //BindExpression 绑定表达式
```

有的节点可能会是多种类型，identifier、super 有返回值，符合表达式的特点，所以也是 expression。

### 6、Class 类

class 的语法比较特殊，有专门的 AST 节点来表示。

整个 class 的内容是 ClassBody，属性是 ClassProperty，方法是ClassMethod（通过 kind 属性来区分是 constructor 还是 method）。

### 7、Modules

es module 是语法级别的模块规范，所以也有专门的 AST 节点。

### Program & Directive

### File & Comment