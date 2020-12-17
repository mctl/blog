### 前言

前两天面试，被问到跨域解决办法，其中CORS没能说的很清楚，所以再次复习一下

## 1、跨域场景

首先需要明确的是，只要协议、域名、端口三者任意一个不同，就会跨域

需要注意以下几点：
- 两个不同的域名，指向同一个服务器，会跨域
- 域名和IP，指向同一个服务器，会跨域
- 主域名相同，二级域名不同，也会跨域

## 2、CORS

上面简单总结了跨域的场景，而跨域请求的方案有很多种，各有利弊，本篇只谈跨域资源共享，也即CORS

CORS是W3C的标准，它允许浏览器向跨源服务器发出http请求。

CORS需要浏览器和服务器同时支持。目前所有有浏览器都支持该功能，ie浏览器不能低于ie10...（ie，永远都神）

因此对开发者而言，浏览器是不需要什么操作的，实现CORS关键是服务器，服务器实现了CORS接口，就可以跨域通信了。

### 2.1 简单请求

浏览器将CORS请求分为两类：简单请求（simple request）和非简单请求（not-so-simple request）

同时满足以下两个条件的，属于简单请求，否则为非简单请求。

1. 请求方法是以下三种之一：
    - head
    - get
    - post
2. HTTP的头信息不超出以下几种字段：
    - Accept
    - Accept-Language
    - Content-Language
    - Last-Event-ID
    - Content-Type：仅限三个值application/x-www-form-urlencoded、multipart/form-data、text/plain

可见表单提交属于简单请求，而只要是json请求则属于非简单请求

对于简单请求，浏览器直接发送CORS请求，也就是在请求头中增加Origin字段

Origin字段说明了本次请求来自哪个源（协议+域名+端口），服务器根据这个值决定是否同意本次请求

如果Origin指定的域名在许可范围内，服务器会返回的响应，会多出几个字段

```
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
Content-Type: text/html; charset=utf-8
```

这其中有三个和CORS相关的字段：
- Access-Control-Allow-Origin

该字段是必须的。它的值要么是请求时Origin字段的值，要么是一个*，表示接受任意域名的请求。

- Access-Control-Allow-Credentials

该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可。

- Access-Control-Expose-Headers

该字段可选。CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma。如果想拿到其他字段，就必须在Access-Control-Expose-Headers里面指定。上面的例子指定，getResponseHeader('FooBar')可以返回FooBar字段的值。

### 2.2 非简单请求

非简单请求是那种对服务器有特殊要求的请求，比如请求方法是PUT或DELETE，或者Content-Type字段的类型是application/json。

非简单请求会在正式通信之前，增加一次‘预检’http请求

预检请求用的方法是options，表示此请求是用来询问的，请求头中关键字段Origin，表示此请求来自哪个源

```
OPTIONS /cors HTTP/1.1
Origin: http://api.bob.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

除了Origin字段，"预检"请求的头信息包括两个特殊字段。

- Access-Control-Request-Method

该字段是必须的，用来列出浏览器的CORS请求会用到哪些HTTP方法，上例是PUT。

- Access-Control-Request-Headers

该字段是一个逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段，上例是X-Custom-Header。

#### 预检请求的回应

服务器收到"预检"请求以后，检查了Origin、Access-Control-Request-Method和Access-Control-Request-Headers字段以后，确认允许跨源请求，就可以做出回应。

HTTP回应中，除了关键的是Access-Control-Allow-Origin字段，其他CORS相关字段如下：

- Access-Control-Allow-Methods

该字段必需，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。

- Access-Control-Allow-Headers

如果浏览器请求包括Access-Control-Request-Headers字段，则Access-Control-Allow-Headers字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段。

- Access-Control-Allow-Credentials

该字段与简单请求时的含义相同。

- Access-Control-Max-Age

该字段可选，用来指定本次预检请求的有效期，单位为秒。上面结果中，有效期是20天（1728000秒），即允许缓存该条回应1728000秒（即20天），在此期间，不用发出另一条预检请求。

#### 浏览器正常请求和回应

一旦服务器通过了"预检"请求，以后每次浏览器正常的CORS请求，就都跟简单请求一样，会有一个Origin头信息字段。服务器的回应，也都会有一个Access-Control-Allow-Origin头信息字段。


#### 总结

综上所述，对于简单请求，浏览器会自动处理，服务端需要配置允许跨域请求的源，或者允许所有源

以Java为例，可以在controller中加一个注解
```java
//允许所有域访问，3600秒后需要重新发预检请求
@CrossOrigin(origins = "*", maxAge = 3600)
```
对于非简单请求，服务器除了需要配置允许跨域，还需要允许接收并且处理options请求，如果是springboot，应该默认支持，如果不支持可以自行增加配置