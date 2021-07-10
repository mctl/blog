## 背景

项目背景为微前端场景，包括一个主应用（`umi+qiankun`），多个子应用（`umi`），业务组件库（`dumi`），基础组件库（`dumi`）等多个项目

其中：

1. 主应用负责控制语言切换
2. 每个项目都有自己的语言包 `locale`，`locale`实际为对象
2. 基础组件库包含 `LocalProvider` 组件处理国际化，使用 `context` 特性，将语言包（`locale`）及语言环境（`intlLang`)透传到子组件

## 国际化方案

### 1、主应用国际化

语言切换按钮在主应用的top区域，点击切换后发生以下事件：

1. 更新localStorage中的语言环境（intlLang）
2. 刷新页面
3. 从localStorage中取出intlLang

主应用的国际化封装了 `react-intl-universal`,根据intlLang切换语言环境及获取国际化文本

### 2、子应用国际化

主应用通过sdk将intl工具类传给子应用，子应用在初始化过程中调用 `intl.intlLoad()` 将子应用的语言包（`locale`）合并入主应用

子应用和主应用都通过 `intl.get()`获取国际化文本


```js
import intl from 'react-intl-universal';

function get(key, value) {
  return intl.get(key, value);
}

const intlLoad = (locales) => {
  intl.load(locales);
};

const getIntlLang = () => {
  return localStorage.getItem('intlLang');
};

//...
```

### 3、基础组件库国际化

**关键词：`LocaleProvider` 、`LocaleReceiver` 、`LocalReceiverHoc`**

组件库使用react的 `Context` 实现了国际化组件 `LocaleProvider`

`LocaleProvider`需要传入 `intlLang` ，将`intlLang` 注入子组件的props，即可在 `LocaleProvider.LocaleReceiver`中拿到语言包 `locale`，`LocaleReceiver` 包裹的部分须为一个返回组件的函数，形式如下：

```tsx
<LocaleProvider intlLang={currLang}>
 //...
</LocaleProvider>


<LocaleProvider.LocaleReceiver componentName="DemoCom">
    {(locale: any) => {
      return <div>{locale.demoText}</div>;
    }}
</LocaleProvider.LocaleReceiver>
```

参数 `componentName`为组件名，目的是拿到此组件的语言包对象，如果缺少 `componentName`，则返回 `global`以及`intlLang`.

`LocaleReceiver`的使用较为繁琐，为简化使用，提供了高阶组件`LocalReceiverHoc`，功能不变

```tsx
LocalReceiverHoc: ( WrappedComponent: any, componentName?: string ) => any 

//用LocalReceiverHoc包裹的组件即可将`intlLang`注入props

const Header = (props) => {
    
    //locale就是语言包中key为MarkdownHeader对应的值，也包括global以及intlLang
    const { locale } = props;
    
    console.log(locale.edit)
}

LocalReceiverHoc(Header, 'MarkdownHeader')
```

语言包对象大致如下：

```js
export default {
  intlLang: "zh-CN",
  global: {
    placeholder: "请选择"
  },
  MarkdownHeader: {
    edit: '编辑'
  },
  other:{}
}
```

组件库的 `LocaleProvider` 解决了自身的国际化问题，同时对外导出


### 4、业务组件库国际化

`zet-utils` 提供了 `intl` 的工具类，包括 `getIntlLang, setIntlLang, getLocal`

业务组件国际化分三步：

1. 在用到组件的地方（比如：子应用）全局调用 `setIntlLang`

```js
import { setIntlLang } from 'zet-utils'

// 设置组件的语言
setIntlLang && setIntlLang(intl.getIntlLang());
```

2. 在业务组件中封装 `useIntl` ,通过 `zet-utils` 来获取语言环境

因为语言包在组件内部，所以没法省略封装

```js
import { enUS, zhCN } from '../locales/index'
import { getIntlLang, getLocal } from 'zet-utils'

const useIntl = (key: string, variables?: { [key: string]: any}) => {

  const locale: any = getIntlLang() === 'en-US' ? enUS : zhCN;
  
  return getLocal(locale, key, variables)
}

export default useIntl
```

3. 组件中使用

也支持变量使用，用法同主应用

```js
useIntl('MarkdownHeader.edit') //编辑
```

