## vue的代理配置
vue.config.js

```js
module.exports = {
    //...
    devServer: {
        port: 8088,
        proxy: {
          '/api': { //遇到api开头的路径，代理到下面的地址，注：浏览器network中的请求地址不会变，无法依此检验是否生效
            target: 'http://localhost:8081/',
            // ws: true,        //是否代理 websockets
            secure: false,  // 是否https接口
            pathRewrite:{ '^/api':'' }
          },
        }
    }
    //...
}
```
以上配置仅在开发环境下有效，生产环境需对nginx进行相应的配置

## nginx的配置

```shell
server {
    listen      8080;
    server_name localhost;
    
    location / {
        root   /usr/share/nginx/html/front;
        try_files $uri $uri/ /index.php?$args;
        index index.php index.html index.htm;
    }
    
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
    
    #对应vue中的主要配置，其他默认即可
    location /api/ {
        proxy_next_upstream http_500 http_502 http_503 http_504 error timeout invalid_header;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        #机器ip
        proxy_pass http://127.0.0.1:8081;  
        #去掉url中的api
        rewrite ^.+api/?(.*)$ /$1 break; 
        expires 0;
    }
}
```


```js
ng配置文件目录：/etc/nginx/config

```
