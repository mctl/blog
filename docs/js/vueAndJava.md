## 前言

本人的主要技术栈为vue + Java，在实际工作中主要使用过3种搭配的玩法，下面一一介绍

## 1、vue与jsp

我接触过最老的项目还停留在JSP时代，但是该项目每年都会有新的需求增加，到了如今，写新需求的人已经无法忍受jsp与jquery的做法，无奈探索出了结合vue的玩法，大致分为三步：

### 1.1 改造spring

spring是Java的大统一框架，大部分Java web项目都是用的spring，但老项目未必支持html文件，所以第一步是增加spring的视图解析，同时支持JSP与HTML，以下配置可供参考：
```xml
 <!-- ==========原本的只支持JSP的视图解析器========== -->
<!--<bean id="viewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">-->
    <!--<property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>-->
    <!--<property name="prefix" value="/WEB-INF/view/"/>-->
    <!--<property name="suffix" value=".jsp"/>-->
    <!--<property name="order" value="1"/>-->
<!--</bean>-->

<!-- ==========新的同时支持HTML和JSP的视图解析器========== -->
<!-- html视图解析器，在htmlType目录下的文件按照html解析，其他按照jsp解析 -->
<bean id="freemarkerConfig" class="org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer">
    <property name="templateLoaderPath" value="/htmlType/" />
    <property name="freemarkerSettings">
        <props>
            <!--<prop key="template_update_delay">1</prop>-->
            <prop key="default_encoding">UTF-8</prop>
            <!--<prop key="number_format">0.##</prop>-->
            <!--<prop key="datetime_format">yyyy-MM-dd HH:mm:ss</prop>-->
        </props>
    </property>
</bean>
<bean id="htmlviewResolver" class="org.springframework.web.servlet.view.freemarker.FreeMarkerViewResolver">
    <property name="suffix" value=".html"/>
    <property name="order" value="0" />
    <property name="contentType" value="text/html;charset=UTF-8" />
</bean>

<!-- jsp视图解析器 -->
<bean id="jspViewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="viewClass" value="org.springframework.web.servlet.view.InternalResourceView"/>
    <property name="prefix" value="/WEB-INF/view/"/>
    <property name="suffix" value=".jsp"/>
    <property name="contentType" value="text/html;charset=UTF-8"/>
    <property name="order" value="1"/>
</bean>
```

### 1.2 在html文件中引入vue

此处终于用上了vue从诞生之初就有的特点：渐进式

就和普通js文件的引入一样，vue.js引入后多了一个全局变量Vue，new一个实例即可在其中使用和全部生命周期钩子，用法与其余项目没什么不同

```js
<script src="../../js/vue.js" type="text/javascript"></script>
```

但缺点是不方便做模块管理以及组件封装，我目前的做法是在每一个页面单独引入，在功能不很复杂的情况下体验还可以

### 1.3 引入vue相关生态及第三方插件

使用vue就代表需要使用相关的生态以及丰富的第三方插件

先是ui框架：以element为例，从官方文档能够找到cdn地址，可以很方便的在html中使用

vuex：vuex也提供了cdn地址，引入后会多一个store全局变量，在new vue实例的时候将store作为参数传入，vuex即可正常使用，用单独的js封装亦可

路由跳转，非前后端分离项目，页面跳转是由spring mvc处理，完全用不到vue-router。如果非要用，官网一样提供cdn，目测肯定是hash模式，history就别想了（vue-router本人未测试）

第三方库：第三方库通常会有打包后的dist目录，从该目录下拷贝的文件可以直接在html中引入，通常会声明一个全局变量，操作该变量即可

本人测试过的有websocke、生成二维码插件...（websock有做单独的封装，并且结合vuex使用，在下面的示例中并未体现）

以上大部分生态的使用与前后端分离都大同小异，毕竟最终都是要跑在浏览器上的代码，无外乎js、css、html

示例如下：

```html
<link rel="stylesheet" href="../../js/element/element-2.13.2.css">

<script src="../../js/vue.js" type="text/javascript"></script>
<script src="../../js/vuex.js" type="text/javascript"></script>
<script src="../../js/element/element-2.13.2.js" type="text/javascript"></script>
<script src="../../js/axios/axios-v0.21.0.js"></script>
<script src="../../js/qs.js"></script>
<script src="../../js/dynamicMonitor/qrcode.vue.js"></script>

<script>
var app = new Vue({
        el: '#app',
        //vuex使用
        store,
        //二维码插件使用
        components:{ QrcodeVue },
        data: {
           //...
        },
        watch:{
            '$store.state.isConnected': function (newVal, oldVal){
                //...
            }
        },
        mounted: function() {
            //axios使用
            axios({
                url: '/api/list',
                method: 'POST',
                //qs使用
                data:Qs.stringify({
                    pageNum : 1,
                    pageSize : 100})
            }).then(data => {
                
            }).catch(err => {
               //element使用
               this.$message.error('获取列表失败');
            })
        },
        methods: {
            getList: function () {
                //store使用，store封装略
                store.commit({
                    type: 'sendMessage',
                    message: {
                        cmd: 'test',
                    }
                });
            },
        }
    })
</script>
```


## 2、vue与前后端分离开发

分离开发的时候有两种玩法

第一种是分离开发，开发完成后先前端打包，**打包目录指定为后端配置的静态资源目录**，然后打后端包，最终只有一个Java项目的包，启动服务后对外只有一个端口

此种模式通常是vue-router的hash模式，url中会带有#，优点是部署方便，缺点是url不大好看...

第二种也是分离开发，但开发完成后前后端分离部署，分别起服务，后端不消多说，前端通常**放入Nginx或Apache等服务器**

此种模式通常下vue-router的两种路由模式皆可，但一般都会采用history