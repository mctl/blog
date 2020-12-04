#### 1、前言
上篇写了一下基本使用，但在实际中结合vuex可能是更频繁但使用场景，而组件本身也支持，基本上抄文档就可以了

#### 2、main.js
在上篇但基础上只需要增加vuex配置就可以了

```js
import store from './store'
import VueNativeSock from 'vue-native-websocket'

Vue.use(VueNativeSock, 'ws://localhost:8083/websocket', {
  //开启store
  store: store,
  connectManually: true, // (Boolean) 手动连接 （false）
  reconnection: true, // (Boolean) 是否重连 (false)
  reconnectionAttempts: 3, // (Number) 重连次数 (Infinity),
  reconnectionDelay: 3000, // (Number) 重连间隔 (1000)
  format: 'json'
});
```

#### 3、store
然后在store中增加websocket相关的state，mutations等，github文档中也都有
<br><br>
我是把websocket单独作为一个vuex的模块来做的，把以下单独放到一个js文件中，然后在store的index中导入就行
<br><br>
网上有很多人拆分store的时候是state一个js，mutations又一个js这样，看不懂，除了很麻烦不知道有啥好处。
<br><br>
除非是代码真的非常多，否则个人感觉按照业务划分更合理，

##### store/websocket.js

```js
import Vue from 'vue'

const websocket = {
	state: {
		isConnected: false,
		message: '',
		reconnectError: false,
	},
	mutations:{
		sendMessage: function(context, payload) {
			Vue.prototype.$socket.sendObj(payload.message)
		},
		SOCKET_ONOPEN (state, event)  {
			console.log('======websocket已连接============')
			Vue.prototype.$socket = event.currentTarget
			state.isConnected = true
		},
		SOCKET_ONCLOSE (state, event)  {
			console.log('======websocket已关闭============')
			state.isConnected = false
		},
		SOCKET_ONERROR (state, event)  {
			// console.error('======websocket报错=============',state, event)
		},
		// default handler called for all methods
		SOCKET_ONMESSAGE (state, message)  {
			console.log('websocket接收消息：',message)
			state.message = message
		},
		// mutations for reconnect methods
		SOCKET_RECONNECT(state, count) {
			console.log('websocket重连，次数：',count)
		},
		SOCKET_RECONNECT_ERROR(state) {
			console.log('======websocket重连失败===========')
			state.reconnectError = true;
		},
	},
	actions: {
	}
};

export default websocket
```

##### store/index.js


```js
import websocket from "./websokcet";

export default new Vuex.Store({
	modules: {
	    //其他业务模块...
		ws: websocket
	}
})
```

#### 4、组件中使用

我依然是手动连接：

```js
if(this.$store.state.ws.isConnected){
    //已经开启连接，直接发消息
	this.$store.commit({
		type: 'sendMessage',
		message: {}
	});
}else{
	//开启ws连接
	this.$connect();

}
```
然后watch接收到的消息（总感觉watch不是很优雅，但又没想到其他办法...）

```js
watch:{
    '$store.state.ws.message':function(newVal,oldVal) {
        //...
    }
}
```

记得组件销毁的时候关闭连接：

```js
destroyed() {
	// console.log('deviceList--->destroyed');
	//关闭ws连接
	this.$disconnect();
},
```

#### 5、总结
说实话，都是很简单的应用，没什么好总结的，看文档就可以了，以下是几个实际使用过程中的注意事项
1. http用ws://localhosts:8080/ws，https记得用wss
2. 注意json格式的使用，上面的代码是开了json配置的






