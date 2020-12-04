#### 前言

都2020年了，使用sockjs唯一的理由似乎就是兼容性

它的特点是可以在支持websocket的现代浏览器使用websocket，不支持ws的诸如ie等浏览器使用轮询方式，兼容性是真的强

### 1、引入

```js
//sockjs客户端包
yarn add sockjs-client

//一种协议，可用可不用
yarn add stompjs
```
stompjs主要是可以将ws消息按模块划分，同时有多个通信，适用复杂场景

同时也需要后端支持

springboot自带的websocket就支持sockjs，稍加配置即可。

### 2、封装

网上有一些封装的办法，但是感觉并不太好用，由于我是从vue-native-websocket为了兼容性切换过来的，索性用store稍加封装，全局共用一个ws

#### 2.1 socket.js
建一个js文件，做为所有消息进出口


```js
import SockJS from  'sockjs-client';
import store from './store'

let socket = null;

export default {

	connection(wsUrl){

		socket = new SockJS(wsUrl);

		socket.onopen= function () {
			store.commit('SOCKET_ONOPEN')
		};

		socket.onclose = function () {
			store.commit('SOCKET_ONCLOSE')
		};
		//监听异常
		socket.onerror = function (e) {
			store.commit('SOCKET_ONERROR',e)
		};
		//监听服务器发送的消息
		socket.onmessage = function (message) {
			message = JSON.parse(message.data)
			store.commit('SOCKET_ONMESSAGE',message)
		};


	},
	sendObj(message){
		socket.send(JSON.stringify(message))
	},
	close(){
		socket.close()
	},

};
```
这个js只是对json做了简单处理，提供了三个全局方法（连接、关闭、发消息），其他监听事件都转发到了store

组件通过监听store来处理消息

#### 2.2 main.js

为了方便使用，直接将websocket挂载到vue实例上


```js
import websocket from "./sockjs";

Vue.prototype.$websocket = websocket;
```

#### 2.3 store封装

在store目录下新建websocket.js，专门用来ws的处理，然后在store/index.js中按模块导入即可

store/websocket.js

```js
import Vue from 'vue'

const websocket = {
	state: {
		isConnected: false,
		message: '',
		// reconnectError: false,
	},
	mutations:{
		sendMessage: function(state, payload) {
			if(state.isConnected)
				Vue.prototype.$websocket.sendObj(payload.message);
			else
				console.log('=====websocket未连接')
		},
		SOCKET_ONOPEN (state, event)  {
			console.log('======websocket已连接============')
			state.isConnected = true
		},
		SOCKET_ONCLOSE (state, event)  {
			console.log('======websocket已关闭============')
			state.isConnected = false
		},
		SOCKET_ONERROR (state, event)  {
			console.error('======websocket报错=============',state, event)
		},
		// default handler called for all methods
		SOCKET_ONMESSAGE (state, message)  {
			console.log('websocket接收消息：',message)
			state.message = message
		}
	},
	actions: {
	}
};

export default websocket
```

store/index.js


```js
import Vue from 'vue'
import Vuex from 'vuex'
import websocket from "./websokcet";
//...

Vue.use(Vuex)

export default new Vuex.Store({
	modules: {
		//...其他模块
		ws: websocket
	}
})
```

因为没有需求，所以没弄断开重连，要加也不难

### 3、组件中使用

#### 3.1 连接

在任意需要开启ws的地方连接即可

```js
//开启ws连接
this.$websocket.connection(wsUrl)
```
#### 3.2 监听ws状态

用vue的watch监听store中state即可
```js
watch:{
	'$store.state.ws.isConnected':function(newVal,oldVal) {
	    //...
	}
```

#### 3.3 接收消息

也是用watch

```js
'$store.state.ws.message':function(qrData,oldVal) {
    //...
}
```

#### 3.4 发送消息

发送到store即可，数据内容放在message


```js
this.$store.commit({
	type: 'sendMessage',
	message: {
	    //t001是指令，WsCmdTypes类似后端的枚举类
		cmd: this.WsCmdTypes.T001,
		data: {
			id: 001,
			name: zhagnsan
		}
	}
});
```

#### 3.5 断开

在需要断开的地方断开，由于全局用一ws，建议在组件销毁方法中断开ws

```js
//关闭ws连接
if(this.$store.state.ws.isConnected){
	this.$websocket.close();

}
```
### 4、总结

暂未发现其他的问题，写的比较匆忙，封装上也许还可以优化一下，主要还是看需求吧


