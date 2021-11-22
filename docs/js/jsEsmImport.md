# 组件库按需加载

按需加载的意思就是，当项目构建的时候，只把使用到的组件build进去。

比如说你在项目里用了`antd`组件库，但并不是全部组件都用到了，理想情况是只把用到的组件打包进去，但实际是怎么做的呢？

如果你的写法是这样：

```js
import { Button, Modal } from 'antd';
```

那么在不做其他处理的情况下，整个`antd`组件库都会build进去，项目自然庞大不少。那么如何按需加载？

## 手动导入

目前的组件库基本都支持ES modules 的 tree shaking，大概意思是esm会在build之后生成es目录，该目录下的文件结构与开发环境相同，只是将代码重新编译了（不信看看你node_modules下的antd目录），大概目录结构如下：

```js
antd
--es
----alert
------index.js //编译后的代码
------index.d.ts //类型提示文件（签名文件）
------style //样式文件夹
----button
------index.js
------button.js
------index.d.ts
------button.d.ts
------style
----index.js
----index.d.ts
----...
--lib //与es结构相同
----....
```

如果是以上结构，就可以通过手动导入实现按需加载：

```js
import Button from 'antd/es/button';
import 'antd/es/button/style';
```

长眼的人都能发现，这种方式且不说好用不好用，起码看着就很累，谁tm在项目里这么写...

## 自动按需导入

既然手动导入很累，那么就干脆把脏活累活自动化好了，[babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import) 插件就是专门做这个事的，安装插件之后，在build时候增加以下配置即可：
```js
['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
```

而使用的时候就可以这样导入：

```js
import { Button, Modal } from 'antd';
```

到这里，antd的按需加载就完成了。

## 私有组件库按需导入

antd的导入配置很简单，是因为在开发的时候就遵循了规范，但如果是自己写的组件库就未必了。

最好的办法当然是写符合规范的代码：

1. 导出组件名与所在文件名相同，可用驼峰、连字符等，比如：组件TestTest，文件名test-test
2. 默认导出一个组件（export default xxx)
3. 多个组件的情况也只对外导出一个，可以参考zet-component中的组件，比如：Input组件包括input、textarea等，对外使用为Input，Input.Textarea, Input.Search

这样按照antd的按需加载写法即可，否则import插件无法找到文件，正常导入，那就gg了...

如果说需要特殊处理，也可以自己增加import插件配置，比如组件库导出组件加了统一前缀`test`, 而文件名省略了，大概配置如下：

```js
[
  'import',
  {
    libraryName: 'test-component',
    customName: (name) => {
      const newName = name.replace('test-', '');
      return `test-component/es/components/${newName}`
    }
  },
  'test-component'
],
```

更多插件相关内容，就自行查看文档吧

ps：未必都是es目录，也可能是lib目录。esm方式默认生成es目录，cjs方式默认生成lib目录