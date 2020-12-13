## 1、缓存位置

### 1.1、Service Worker

Service workers 本质上充当 Web 应用程序、浏览器与网络（可用时）之间的代理服务器。这个 API 旨在创建有效的离线体验。

它采用JavaScript控制关联的页面或者网站，拦截并修改访问和资源请求，细粒度地缓存资源。

service worker并不常见，基本上为离线体验服务，更多内容可以访问MDN：https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API

### 1.2、Memory Cache

内存中的缓存，读取速度更快，但生命周期短，关闭页面后内存释放就不存在了

### 1.3、Disk Cache

硬盘中的缓存，读取速度慢，但是在过期之前是可以长期存放的，容量也更大

### 1.4、Push Cache

HTTP2的内容，前面三种都没有命中的时候才会被使用，只在session中存在，会话结束被释放

目前大多数浏览器使用的是HTTP1.1，所以push cache也很少见，主要缓存位置还是memort cache和disk cache，而决定存放在内存还是硬盘应该是浏览器来决定的，访问频繁且文件较小的可能在内存，反之硬盘

## 2、缓存策略

缓存策略通常有两种：强缓存、协商缓存。设置策略通过http head。

### 2.1、强缓存

控制强缓存的两个header字段是：expires 和 cache-control。

##### expires

http1.0的规范，它的值为一个绝对时间的GMT格式的时间字符串。如Mon，10 Jun 2020 15:13:17 GMT，如果发送请求在expires时间之前，则缓存有效，过期后会重新请求

##### cache-control

HTTP/1.1的规范，优先级高于 Expires。

cache-control在请求头或者响应头设置，可以有多个值：

```
//示例1
Cache-Control: no-store, no-cache, must-revalidate
```
```
//示例2
cache-control: max-age=600
```
```
//示例3
cache-control: public, max-age=31536000
```

其值几个常见的意思如下表：


指令 | 作用
---|---
public | 响应可以被客户端和代理服务器缓存
private | 响应只可以被客户端缓存
max-age=600 | 缓存在600秒后过期，需求重新请求
s-maxage=600 | 覆盖max-age，作用一样，只在代理服务器生效
no-store | 不缓存任何响应
no-cache | 资源被缓存，但立即失效，下次请求需验证资源是否过期
max-stale=600 | 600秒内，即使过期也使用该缓存
min-fresh=600 | 希望在600秒内获取最新的响应

### 2.2、协商缓存

当校验后发现不能使用强缓存的情况下，就会请求验证资源是否有更新，此时会触发协商缓存

如果资源没有改变，服务器会返回304，使用原缓存文件，并且更新浏览器有效期。

如果资源改变，服务器返回200，并重新请求资源，得到资源后将结果和缓存标识翻入浏览器缓存

控制协商缓存的head有：<code>Last-Modified/If-Modified-Since</code> 和 <code>ETag/If-None-Match</code>。

##### Last-Modified/If-Modified-Since

在 http 1.0 版本中，第一次请求资源时，服务器返回Last-Modified，把资源最后修改时间作为值填入。第二次请求时，浏览器将If-Modified-Since设置为Last-Modified的值，询问是否有更新，有更新的话会发送新的资源，否则304.

此种方式存在弊端：

- 如果本地打开了缓存文件，即使没有修改也会造成Last-Modified的改变
- Last-Modified以秒记，存在1s的间隙，即使改变了资源也会认为没有更新

##### ETag/If-None-Match

在http 1.1中，服务器通过设置ETag来判断资源是否更新，ETag可以看做是文件的hash值。浏览器后续请求会将If-None-Match设置为ETag的值，如果服务器判断有变动则发送文件过来，没有的话返回304

- ETag优先级高于Last-Modified
- ETag更准确，但是性能较差，耗费资源更多
- 
## 3、设置缓存策略

#### 强制缓存

对于如vue-cli打包后的文件，默认包含hash值，如果文件名没变。我们是可以永久缓存的，比如：
```http
//设置缓存有效期为一年
Cache-Control: max-age=31536000
```

#### 强制不缓存

对于频繁变动的资源，缓存是没有意义的，反而可能因为缓存导致各种问题，所以可以设置不缓存，比如：
```http
Cache-Control: no-store
```

#### nginx配置参考

```
location / {
    try_files $uri $uri/ /index.html;
    root /yourdir/;
    index index.html index.htm;

    if ($request_filename ~* .*\.(js|css|woff|png|jpg|jpeg)$)
    {
         //js、css、图片缓存100天
        add_header Cache-Control "max-age = 8640000"; 
    }

    if ($request_filename ~* .*\.(?:htm|html)$)
    {
        add_header Cache-Control "no-store";  //html不缓存
    }
  }
}
```