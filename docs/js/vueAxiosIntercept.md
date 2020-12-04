#### 前言

适用后端对每一个http请求校验，返回未登录状态码的场景

思路是用axios的cancelToken，在第一次收到未登录错误码时取消所有其他请求，以下为具体实现

### 1、axios请求拦截

封装axios，在拦截器中统一处理
```js
import axios from 'axios'
import Message from 'element-ui/packages/message'
import router from "../router";

axios._axiosPromiseArr = []

axios.interceptors.request.use(config => {

    //把cancel放在全局变量数组
  config.cancelToken = new axios.CancelToken(cancel => {
    axios._axiosPromiseArr.push({cancel})
  })

  return config
})
```

### 2、请求回调中做判断处理

```js
//封装函数中返回promise，config为调用封装函数时候的axios配置
return axios(config).then(function (response) {
  //未登录状态
  if(response.status == 200 && !!response.data.code && response.data.code == 203){

    //关闭所有请求
    axios._axiosPromiseArr.forEach( (item,index) => {
      item.cancel()
      delete axios._axiosPromiseArr[index];
    })
    Message.error({message: '当前状态未登录，请先登录系统'});
    router.push({name:'Login'})
  }

  return response.data
}).catch(err => {
  //报错信息统一处理
  //已关闭的请求不提示
  if(err.__CANCEL__){
    return
  }
  Message.error({message: '请求失败'})
})
```

以上实现了未登录态统一处理，同时未登录的提示信息不会重复出现
