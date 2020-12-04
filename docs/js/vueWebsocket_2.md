### vue-native-websocket（1）基本用法

### 前言
基本技术栈是springboot + vue

网上常见的websocket包有
- <b>socketJs</b>：胜在兼容性强，ws是h5的特性，部分老浏览器可能不支持ws。
<br><br>socketJs可以在支持ws的浏览器中使用ws，不支持ws的浏览器中自动采用轮询机制。
<br><br>如果要采用socketJs，那么前后端都得用
- <b>vue-socket.io</b>:Socket.IO 并不是WebSocket实现。所以WebSocket客户端无法成功连接到Socket.IO服务器，而Socket.IO客户端也将无法连接到WebSocket服务器。
<br/><br/>
所以要使用 socket.io，就得客户端和服务端都使用，一般是搭配node用的

- <b>vue-native-websocket</b>：我目前使用的，周下载量明显超过了上面那个，更新时间也很近。国内用的人似乎挺少，但是看npm里也就那些东西，索性拿来用了

### 使用

#### 1、安装依赖


```js
yarn add vue-native-websocket
 
# or
 
npm install vue-native-websocket --save

```

#### 2、main.js


```js
// 导入
import VueNativeSock from 'vue-native-websocket'

//配置
Vue.use(VueNativeSock, 'ws://localhost:8083/websocket', {
  connectManually: true, // (Boolean) 手动连接 （false）
  reconnection: true, // (Boolean) 是否重连 (false)
  reconnectionAttempts: 5, // (Number) 重连次数 (Infinity),
  reconnectionDelay: 3000, // (Number) 重连间隔 (1000)
});
```
以上是我暂时用到的配置，默认自动连接，更多内容可以看这里：

```js
https://www.npmjs.com/package/vue-native-websocket

https://github.com/nathantsoi/vue-native-websocket
```

#### 3、组件中使用


```js
//test.vue

...
methods: {
    handleClick(row) {
        //打开连接
        this.$connect();
        //监听消息
        this.$options.sockets.onmessage = (data) => {
            console.log(data)
        }
    
    }
}

destroyed() {
    //取消监听消息
    delete this.$options.sockets.onmessage;
    //关闭ws连接
    this.$disconnect();
},

...
```

### 结束

本篇包括基本的用法，不涉及vuex，如果在后续使用到会继续写。
