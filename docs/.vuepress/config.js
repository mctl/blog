module.exports = {
    title: 'Mctl Blog',
    description: '高少宏的个人博客',
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        sidebarDepth: 2,
        nav: [
            { text: 'Home', link: '/' },
            { text: 'mctl ui', link: 'https://www.npmjs.com/package/mctl-ui'},
            { text: 'GitHub', link: 'https://github.com/mctl' },
            { text: 'External', link: 'https://google.com' },
        ],
        sidebar: [
            '/',
            {
                title: 'JS',
                collapsable: false,
                children: [
                    ['/js/jsClosure', '闭包'],
                    ['/js/jsDebounce', '防抖与节流'],
                    ['/js/jsExtends', '继承'],
                    ['/js/jsProtoType', '原型与原型链'],
                    ['/js/jsThis', 'this指向'],
                    ['/js/vueAndJava', 'vue与Java结合的3种玩法'],
                    ['/js/vueProxyNginx', 'vue开发环境对应配置nginx代理'],
                    ['/js/jsEsHttp', 'http方式使用ES'],
                    ['/js/jsHandlePic', '图片二进制转换为base64'],
                    ['/js/vueAxiosIntercept', 'vue+axios拦截处理登录态'],
                    ['/js/vueElement', 'element动态合并列'],
                    ['/js/vueWebsocket_1', 'vue使用sockjs'],
                    ['/js/vueWebsocket_2', 'vue-native-websocket使用'],
                    ['/js/vueWebsocket_3', 'vue-native-websocket整合vuex'],
                    ['/js/vuexRefush', '解决浏览器刷新vuex数据丢失问题'],
                    ['/js/jsUtil', '工具集'],
                ]
            },
            {
                title: 'Java',
                collapsable: false,
                children: [
                    ['/java/javaDownload', 'Java实现文件下载'],
                    ['/java/javaEsHigh', 'Java-es-rest-high调用接口'],
                    ['/java/javaEsTransport', 'Java-transport调用接口'],
                    ['/java/javaSpring', 'springMVC配置html与jsp'],
                    ['/java/javaWord', 'Java生产word文档'],
                ]
            },
            {
                title: '运维',
                collapsable: false,
                children: [
                    ['/devops/zabbix_1', 'zabbix使用1:安装部署'],
                    ['/devops/zabbix_2', 'zabbix使用2:通过snmp监控'],
                    ['/devops/zabbix_3', 'zabbix使用3:页面配置'],
                    ['/devops/syslogReceive', 'syslog接收日志配置'],
                ]
            },
            {
                title: '生活',
                collapsable: false,
                children: [
                    ['/life/faceWash', '关于洗面奶成分的研究']
                ]
            },
          
        ]
      }
  }