## React组件开发规范

### 1、约定

- 用hooks
- 增加必要的注释，方便维护，比如独立的功能模块、逻辑比较复杂的地方
- 不嵌套过多三目运算，建议不超过三层
- 建议一个函数代码不超过50行，超出考虑抽象
- 国际化用起来（使用ConfigProvider）
- 命名风格：
  - 文件夹：小写，用连字符分割（pro-form）
  - 文件名：小驼峰（proForm）
  - 组件名：大驼峰（ProForm）
  - 方法名：小驼峰

### 2、typescript

1. 所有函数入参指定类型
2. state中类型复杂的需要使用类型
3. ref使用类型
4. 尽量写清楚函数返回类型
5. 尽量解决所有标红的报错
6. 尽量不用any
7. 基本类型用小写，比如object，而不是Object

常用类型：
```ts
import React, { ReactNode, ReactText, CSSProperties } from 'react'

// 不清楚属性的对象类型，以下两者皆可
Record<string, any>
// 效果类似于
{
  [key: string]: any;
}
// string | number，可简写为
ReactText
// 自定义节点
ReactNode
// css属性类型
CSSProperties
```

### 3、优化

1. 组件一般需要具有className、style属性
2. 在有依赖的地方写清依赖，比如useEffect
3. useState初始化值，表明类型
4. 多个state可用useImmer
5. 需要卸载的在useEffect中返回卸载函数
6. useCallback
7. useMemo
8. React.memo
9. unstable_batchedUpdates，合并state更新
10. 列表项使用key（不推荐使用每项的索引）
11. 使用不可变数据结构

### 4、样式

1. 样式用-分割，例（zet-test)
2. 避免全局样式污染
3. 避免大段的行内样式
4. 避免class嵌套太深
5. 使用变量，class前缀、颜色、字体、边距等
6. 尽量减少使用浮动等破坏性很强的属性

### 5、文档&测试

- 测试：测试案例的时候关注性能
- 文档：封装antd的，增加antd链接
- 文档：需要包含以下内容：
  - 简介，介绍组件的基本功能，二次封装的组件有必要指出
  - 使用，尽可能说明并演示出每种特性，以此种方式在一定程度上代替测试，同时增加以下几种使用场景：
    - 在弹框中使用组件
    - 在form表单中使用组件（部分支持表单的组件）
  - Props
    - 普通组件列出组件支持的props
    - 二次封装的组件列出新增、覆盖的props，并说明那些是覆盖原组件的属性
    - 属性需声明：参数、说明、类型、默认值
    - 方法需声明：名称、描述、类型
  - Ref，列出可通过ref被外部使用的方法
    - 方法需声明：名称、描述、类型