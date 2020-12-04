### 前言
vuex是个好用的状态管理工具，但它本质上也相当于一个全局变量，当浏览器刷新的时候也会清空

但对用户来说我只是刷新了一下页面，数据就全丢了，这是不合理的，所以我们就得想办法在浏览器刷新的时候把缓存的数据保住

### 1、监听浏览器事件

方法一就是在组件中手动监听浏览器刷新事件，在刷新之前把数据进行持久化存储，一般是放在sessionStorage或者localStorage中，当刷新页面重新加载的时候再拿出来

通常用beforeunload事件，在页面卸载之前执行，刷新、关闭都会触发

事实上我们可以手动实现这个功能，思路有两种，一种是在每次mutations的时候写入storage，如果操作频繁，可以加防抖

另一种是监听beforeunload，在页面卸载之前一次性存储到位。

感兴趣的可以自己写着玩，其实用插件也是类似的操作

### 2、用插件

插件做的事其实和方法一一样，但是方便很多...

以下为使用方法：
#### 安装

```js
yarn add vuex-persistedstate
```

#### 导入及配置
store/index.js

```js
import Vue from 'vue'
import Vuex from 'vuex'
import tab from "./tab";
import comm from "./comm";
import paramDict from "./param_dict"
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    tab: tab,
    comm: comm,
    paramDict: paramDict,
  },
  plugins: [createPersistedState({
    //1、在缓存中使用的key，不指定默认为vuex
    key: 'sdiap',
    //2、使用哪种缓存，默认为localStorage
    storage: window.sessionStorage,
    //3、选择性的缓存某些state，默认缓存所有state
    //注意：如果使用了模块，需要额外加上模块名，写法如下
    reducer(val){
      return {
        comm:{
          menu: val.comm.menu,
        },
        tab:{
          tabValues: val.tab.tabValues
        }
      }
    },
  })],
})

//最简配置，全部默认
new Vuex.Store({
  // ...
  plugins: [createPersistedState()]
})
```
#### 官方github

```js
https://github.com/robinvdvleuten/vuex-persistedstate
```





