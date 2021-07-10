## 0、基本类型

```
void, any, never（永远不会有返回值，报错或者死循环之类）, 元组， 枚举， 高级类型
```

## 1、范型

不预先确定的数据类型，具体的类型在使用的时候才能确定。

```ts
function log<T>(value: T): T {
    console.log(value)
    return value;
}
```

### 1.1 范型约束

```ts
interface Length {
    length: number
}

function log<T extends Length>(value: T): T {
    console.log(value, value.length)
    return value;
}
```


## 2、交叉类型和联合类型

交叉类型，&，取并集

联合类型，|

## 3、索引类型
```ts
// keyof T
interface Obj {
    a: number,
    b: string
}
let key: keyof Obj

// T[K]
// T extends U

let obj = {
    a: 1,
    b: 2,
    c: 3
}

function getValue<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
    return keys.map(key => obj[key])
}

console.log(getValue(obj, ['a','b'])
// 类型检测不通过
console.log(getValue(obj, ['e','f'])

```

## 4、映射类型

```ts
interface Obj {
    a: string;
    b: number;
    c: boolean;
}

//全部只读
type ReadonlyObj = Readonly<Obj>

//全部可选
type PartialObj = Partial<Obj>

//抽取部分为新的类型
type PickObj = Pick<Obj, 'a' | 'b'>

//属性的类型来自于已知类型
type RecordObj = Record<'x' | 'y', Obj> 
```

## 5、条件类型

```ts
// T extends U ? X : Y

type TypeName<T> = 
T extends string ? 'string' :
T extends number ? 'number' :
T extends boolean ? 'boolean' :
T extends undefined ? 'undefined' :
T extends Function ? 'function' : 'object'

type T1 = TypeName<string>
type T2 = TypeName<string[]>

// (A | B) extends U ? X : Y

type T3 = TypeName<string | string[]>

// 过滤掉第二个参数的类型
// 官方实现：Exclude<T, U>
// 这个好相反的: Extract<T, U>
type Diff<T, U> = T extends U ? never : T

type T4 = Diff<'a' | 'b' | 'c', 'a' | 'e'>

// 官方实现: NonNullable<T>
type NotNull<T> = Diff<T, undefined | null>

type T5 = NotNull<string | number | undefined | null>

// ReturnType<T>
// 参数为函数，类型为函数返回的类型
type T7 = ReturnType<() => string>
```

