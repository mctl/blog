## react项目单元测试

关于单元测试，基本上都是以 [jest](https://jestjs.io/zh-Hans/docs/getting-started) 为基础，react项目额外再加上 [Enzyme](https://enzymejs.github.io/enzyme/)，目前Enzyme还未支持react17，可以参考社区解决方案 `@wojtekmaj/enzyme-adapter-react-17`

安装过程和基础用法就不赘述了，可以参考官方的 [中文文档](https://jestjs.io/zh-Hans/docs/getting-started)，和 [这篇文章](https://juejin.cn/post/6844904196244766728#heading-0)，入门应该是够了

以下内容是本人觉得可能有坑的地方：

### 1、mock第三方包

官网和大部分博客都是用axios举例，你会看到这样的使用方式：

```js
// index.test.js
import axios from 'axios';

jest.mock('axios');

it('should get res', () => {
  const users = [{name: 'Bob'}];
  const resp = {data: users};
  // mock返回值
  axios.get.mockResolvedValue(resp);

  axios.get('/users.json').then(resp => {
    console.log('===>', resp.data)
  });
})

```

其中有一句：`jest.mock('axios');`，老实说，我不知道axios到底指谁，我认为更合适的例子是这样的：

```js
import request from 'umi-request';

// 注意此处不是request
jest.mock('umi-request');

request.mockResolvedValue({
  code: '1',
  data: {
    name: 'bob'
  },
});
```

### 2、mock用户事件

以模拟剪贴板事件为例，复制文本内容相对简单，如果是复制图片，直接用jest就比较难处理了

只是文本内容可以类似这样写：
```js
const mEvent = { clipboardData: { getData: jest.fn().mockReturnValueOnce('12') } };
wrapper.find('input').simulate('paste', mEvent);

expect(mEvent.clipboardData.getData).toBeCalledWith('text');
expect(logSpy).toBeCalledWith('12');
```

如果复制文件用这种写法，基本是不可行的，这里推荐使用`user-event`，会简单一些，例如模拟剪贴板复制文件：

```shell
npm install --save-dev @testing-library/user-event @testing-library/dom
```

```ts
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

it('paste image', async () => {
  //...

  const mockFile = new File(['foo'], 'foo.png', {
      type: 'image/png',
    });

  const eventInit: any = {
    clipboardData: {
      items: [
        {
          getAsFile: jest.fn(() => mockFile),
          kind: 'kind',
          type: 'image/png',
          getAsString: jest.fn,
          webkitGetAsEntry: jest.fn,
        },
      ],
    },
  };

  await act(async () => {
    userEvent.paste(wrapper.find('textarea').getDOMNode(), '', eventInit);
    wrapper.update();
  });

  //...
})
```
除了paste，user-event也支持不少其他用户事件，比如点击事件、键盘事件、下拉选择等，可以 [点击查看文档](https://testing-library.com/docs/ecosystem-user-event#pasteelement-text-eventinit-options)



未完待续...