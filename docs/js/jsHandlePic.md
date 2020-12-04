#### 前言

场景：前端请求登录验证码，后端返回验证码图片二进制流。

本篇文章通过设置http请求头<code>responseType: 'blob'</code>，用ArrayBuffer接收二进制流，将二进制数据转为base64，直接显示验证码图片

转换语句很简单：

```js
//result为接收到的二进制流

let imgBase64 = 'data:image/png;base64,' + window.btoa(String.fromCharCode(...new Uint8Array(result)));
```

下面详细介绍都是什么意思：


#### 1、二进制数组（ArrayBuffer）接收

当我们以<code>responseType: 'blob'</code>方式请求数据时，接收到的response就是一个<code>ArrayBuffer</code>，也就是我们代码里的result对象；

<code>ArrayBuffer</code>对象用来表示通用的、固定长度的原始二进制数据缓冲区。它是一个字节数组，打印出来长这样：
图1.1

你不能直接操作<code>ArrayBuffer</code>的内容，而是要通过类型数组对象或<code>DataView</code>对象来操作，它们会将缓冲区中的数据表示为特定的格式，并通过这些格式来读写缓冲区的内容。

#### 2、转换类型数组对象（TypedArray）

上面说到<code>ArrayBuffer</code>需要通过类型数组对象来操作，也就是<code>TypedArray</code>

类型化数组<code>TypedArray</code>描述了一个底层的二进制缓冲区的一个类数组视图。但并没有<code>TypedArray</code>全局属性，也没有名为<code>TypedArray</code>的构造函数。

实际上，<code>TypedArray</code> 指的是以下的其中之一： 

- Int8Array(); 
- Uint8Array(); 
- Uint8ClampedArray();
- Int16Array(); 
- Uint16Array();
- Int32Array(); 
- Uint32Array(); 
- Float32Array(); 
- Float64Array();

以<code>Uint8Array</code>为例，它可以接受buffer参数，此时一个新的类型化数组视图将会被创建，可用于呈现传入的<code>ArrayBuffer</code>对象。

<code>new Uint8Array(result);</code>语句就创建了一个类型化数组视图，它长这样：
图1.2

每个<code>TypedArray</code>都不同，<code>Int8Array</code>表示8位有符号整数数组，<code>Int16Array</code>表示16位有符号整数数组，<code>Uint8Array</code>则表示8位无符号整数数组。

至于为什么我们要用<code>Uint8Array</code>，原因后面有写。

#### 3、String.fromCharCode转为字符串

<code>String.fromCharCode</code>是String的静态方法，该方法返回由指定UTF-16代码单元序列创建的字符串。

语句<code>String.fromCharCode(...new Uint8Array(result));</code>就是将我们传入的类型化数组视图转为字符串，按照UTF-16的方式，转完之后长这样：
图1.3

都是我们看不懂的乱码...这很正常...

#### 4、window.btoa编码为base64

<code>window.btoa</code>从 String 对象中创建一个 base-64 编码的 ASCII 字符串，其中字符串中的每个字符都被视为一个二进制数据字节。

<code>btoa()</code>的作用是编码为base64，<code>atob()</code>的作用是对base64字符串进行解码。

因此<code>window.btoa</code>会将上面转换的普通字符串转为base64，最后在串前面加上<code>data:image/png;base64,</code>就大功告成了，页面显示正常

图1.4

所以最终的转换语句为：

```js
//result为接收到的二进制流

let imgBase64 = 'data:image/png;base64,' + window.btoa(String.fromCharCode(...new Uint8Array(result)));
```

**注意**：<code>window.btoa</code>将每个字符视为二级制数据的字节，而不管实际组成字符的字节数是多少，所以字符的码位不能超出0x00 ~ 0xFF范围，也就是十进制0 ~ 255，这也是我们在上面用<code>Uint8Array</code>的原因

#### 5、总结

1. 得到<code>ArrayBuffer</code>对象 
2. 转化为类型数组对象
3. 转为普通字符串
4. 转为base64编码的字符串

> 注：相关对象和方法都可以在MDN找到
