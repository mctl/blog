## 前端脚手架

关于搭建脚手架的基本知识，网上已经有不少，这里不在赘述，推荐先看[这篇文章](https://juejin.cn/post/6966119324478079007#heading-0)，相当详细和完整

大致就是这些库的使用：

1. commander 自定义指令
2. chalk 美化输出样式
3. inquirer 问答交互
4. ora loading效果
5. figlet 绘制logo
6. download-git-repo 远程下载模版
7. ejs 渲染模版语言


以下是我基于上述文章搭建遇到的问题：

### 1. 如何从gitLab私有仓库获取模版

网上大部分是从公开仓库下载模版，基本上调用 [download-git-repo](https://www.npmjs.com/package/download-git-repo) 包已经足够，虽然其本身支持gitLab，但如果不熟悉gitLab，只看文档的话，很难...

实际上有另外一个库可供参考：[gitlab-download](https://www.npmjs.com/package/gitlab-download) ,但是下载没有那么方便

以下是我根据 `gitlab-download` 的实现，找到的gitLab私有仓库获取方式，依然是 `download-git-repo`

```js
const download = require('download-git-repo')

// direct: 直连模式
// private_token：token，需要在gitLab生成，user setting -》 Access Tokens
// sha：分支
const url = 'direct:https://gitlab.xxxxxx.com/api/v4/projects/groupName%2FprojectName/repository/archive.zip?private_token=xxxxxxx&sha=template'

download(url, 'test', function (err) {
  console.log(err ? 'Error' : 'Success')
})
```

### 2. 模版中如何处理变量

主要使用[ejs](https://www.npmjs.com/package/ejs)库，模版下载成功之后，遍历所有模版文件，调用ejs处理

```js
const result = await ejs.renderFile(filePath, data);
fs.writeFileSync(filePath, result);
```

整体而言，创建前端脚手架的门槛已经非常低了，基本上就是类库的堆积，加上一点逻辑即可

以上所说代码都在[这个仓库](https://github.com/mctl/mctl-cli)，也可以执行以下命令体验

```js
// 安装
npm install mctl-cli -g
// or
yarn global add mctl-cli

// -f 强制覆盖
mctl cpt testComponent -f
```