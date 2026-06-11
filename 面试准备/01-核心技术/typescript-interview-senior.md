# TypeScript 资深面试指南

## 目录
1. [类型基础与进阶](#1-类型基础与进阶)
2. [泛型系统](#2-泛型系统)
3. [高级类型](#3-高级类型)
4. [类型体操](#4-类型体操)
5. [类型编程技巧](#5-类型编程技巧)
6. [装饰器](#6-装饰器)
7. [工程化实践](#7-工程化实践)
8. [性能优化](#8-性能优化)
9. [源码解析](#9-源码解析)
10. [经典面试题](#10-经典面试题)

---

## 1. 类型基础与进阶

### 1.1 基础类型系统

```typescript
// 原始类型
let isDone: boolean = false;
let count: number = 6;
let name: string = "TypeScript";
let u: undefined = undefined;
let n: null = null;
let sym: symbol = Symbol("key");
let big: bigint = 100n;

// 特殊类型
let notSure: unknown;  // 类型安全的 any
let anything: any;     // 任意类型
let nothing: void;     // 无返回值
let never: never;      // 永不存在的值

// unknown vs any
function processValue(value: unknown) {
  // value.toFixed(); // Error: unknown 类型需要类型检查
  if (typeof value === 'number') {
    value.toFixed(); // OK
  }
}
```

### 1.2 类型断言与类型守卫

```typescript
// 类型断言
let someValue: unknown = "this is a string";
let strLength1: number = (someValue as string).length;
let strLength2: number = (<string>someValue).length;

// 非空断言
function processName(name: string | null) {
  // console.log(name.toUpperCase()); // Error
  console.log(name!.toUpperCase()); // OK，但不安全
}

// 类型守卫 - typeof
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
}

// 类型守卫 - instanceof
class Bird {
  fly() { console.log('flying'); }
}
class Fish {
  swim() { console.log('swimming'); }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// 类型守卫 - in
type A = { a: string };
type B = { b: number };

function process(obj: A | B) {
  if ('a' in obj) {
    console.log(obj.a);
  } else {
    console.log(obj.b);
  }
}

// 自定义类型守卫
interface Cat {
  meow(): void;
}
interface Dog {
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function speak(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow();
  } else {
    animal.bark();
  }
}
```

### 1.3 字面量类型与联合/交叉类型

```typescript
// 字面量类型
type Direction = "North" | "South" | "East" | "West";
type OneToFive = 1 | 2 | 3 | 4 | 5;
type BooleanLiteral = true | false;

// 联合类型
type StringOrNumber = string | number;
type Status = "success" | "error" | "pending";

// 交叉类型
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}
type ColorfulCircle = Colorful & Circle;

const cc: ColorfulCircle = {
  color: "red",
  radius: 10
};

// 实战：API 响应类型
type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };

function handleResponse<T>(response: ApiResponse<T>) {
  switch (response.status) {
    case 'success':
      console.log(response.data); // 类型正确
      break;
    case 'error':
      console.log(response.error);
      break;
    case 'loading':
      console.log('Loading...');
      break;
  }
}
```

---

## 2. 泛型系统

### 2.1 泛型基础

```typescript
// 基础泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("myString");
let output2 = identity("myString"); // 类型推断

// 泛型约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // OK
logLength([1, 2, 3]); // OK
// logLength(3); // Error

// 在泛型约束中使用类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3 };
getProperty(x, "a"); // OK
// getProperty(x, "m"); // Error
```

### 2.2 泛型接口与类

```typescript
// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = (x, y) => x + y;

// 实战：响应式数据容器
class Observable<T> {
  private _value: T;
  private _listeners: Array<(value: T) => void> = [];

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      this._listeners.forEach(listener => listener(newValue));
    }
  }

  subscribe(listener: (value: T) => void): () => void {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    };
  }
}

const count = new Observable(0);
const unsubscribe = count.subscribe(value => {
  console.log(`Count changed to ${value}`);
});
count.value = 1; // 触发监听
```

### 2.3 泛型工具类型

```typescript
// Partial - 所有属性可选
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// 等价于
type PartialUser2 = {
  id?: number;
  name?: string;
  email?: string;
}

// Required - 所有属性必选
type RequiredUser = Required<PartialUser>;

// Readonly - 所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick - 选择部分属性
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit - 排除部分属性
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string }

// Record - 构造对象类型
type PageInfo = Record<'home' | 'about' | 'contact', { title: string }>;
// {
//   home: { title: string };
//   about: { title: string };
//   contact: { title: string };
// }

// Exclude - 从联合类型中排除
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"

// Extract - 从联合类型中提取
type T1 = Extract<"a" | "b" | "c", "a" | "f">; // "a"

// NonNullable - 排除 null 和 undefined
type T2 = NonNullable<string | number | undefined>; // string | number

// ReturnType - 获取函数返回类型
function createUser() {
  return { id: 1, name: 'John' };
}
type User2 = ReturnType<typeof createUser>;

// Parameters - 获取函数参数类型
function createPost(title: string, content: string) {}
type PostParams = Parameters<typeof createPost>; // [string, string]
```

---

## 3. 高级类型

### 3.1 映射类型

```typescript
// 基础映射
type Readonly2<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial2<T> = {
  [P in keyof T]?: T[P];
};

// 映射修饰符
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]; // 移除 readonly
};

type Required2<T> = {
  [P in keyof T]-?: T[P]; // 移除可选
};

// 条件映射
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// 键名重映射（TS 4.1+）
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// 实战：深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface Config {
  server: {
    host: string;
    port: number;
  };
  database: {
    url: string;
  };
}

type ReadonlyConfig = DeepReadonly<Config>;
```

### 3.2 条件类型

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

type StrOrNumArray = ToArray<string | number>;
// string[] | number[]

// 推断类型 infer
type ReturnType2<T> = T extends (...args: any[]) => infer R ? R : never;

type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type Result = UnpackPromise<Promise<string>>; // string

// 实战：函数参数解包
type FirstArg<T> = T extends (first: infer F, ...args: any[]) => any
  ? F
  : never;

function test(a: string, b: number) {}
type First = FirstArg<typeof test>; // string

// 实战：数组元素类型提取
type ArrayElement<T> = T extends (infer E)[] ? E : T;

type Str = ArrayElement<string[]>; // string
type Num = ArrayElement<number>; // number

// 嵌套条件类型
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";
```

### 3.3 索引访问类型

```typescript
// 基础索引访问
interface Person {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
}

type PersonName = Person['name']; // string
type PersonAddress = Person['address']; // { street: string; city: string }
type AddressCity = Person['address']['city']; // string

// 联合类型索引
type PersonNameOrAge = Person['name' | 'age']; // string | number

// 数组索引
const colors = ['red', 'green', 'blue'] as const;
type Color = typeof colors[number]; // "red" | "green" | "blue"

// 实战：获取所有值类型
type ValueOf<T> = T[keyof T];

type PersonValue = ValueOf<Person>;
// string | number | { street: string; city: string }

// 实战：深度索引访问
type DeepIndex<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? DeepIndex<T[Key], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

type City = DeepIndex<Person, 'address.city'>; // string
```

---

## 4. 类型体操

### 4.1 元组操作

```typescript
// 元组转联合
type TupleToUnion<T extends any[]> = T[number];

type T1 = TupleToUnion<[string, number]>; // string | number

// 元组首元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

type F1 = First<[1, 2, 3]>; // 1

// 元组尾元素
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type L1 = Last<[1, 2, 3]>; // 3

// 移除首元素
type Shift<T extends any[]> = T extends [any, ...infer Rest] ? Rest : [];

type S1 = Shift<[1, 2, 3]>; // [2, 3]

// 移除尾元素
type Pop<T extends any[]> = T extends [...infer Rest, any] ? Rest : [];

type P1 = Pop<[1, 2, 3]>; // [1, 2]

// 元组反转
type Reverse<T extends any[]> = T extends [infer F, ...infer Rest]
  ? [...Reverse<Rest>, F]
  : [];

type R1 = Reverse<[1, 2, 3]>; // [3, 2, 1]

// 元组连接
type Concat<T extends any[], U extends any[]> = [...T, ...U];

type C1 = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]
```

### 4.2 字符串操作

```typescript
// 字符串首字母大写
type Capitalize2<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : S;

type Cap = Capitalize2<'hello'>; // "Hello"

// 驼峰转短横线
type KebabCase<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${KebabCase<Rest>}`
    : `-${Lowercase<First>}${KebabCase<Rest>}`
  : S;

type K1 = KebabCase<'helloWorld'>; // "hello-world"

// 字符串分割
type Split<S extends string, D extends string> =
  S extends `${infer Before}${D}${infer After}`
    ? [Before, ...Split<After, D>]
    : [S];

type S2 = Split<'a-b-c', '-'>; // ["a", "b", "c"]

// 字符串长度（递归计数）
type StringLength<
  S extends string,
  Acc extends any[] = []
> = S extends `${infer _}${infer Rest}`
  ? StringLength<Rest, [...Acc, any]>
  : Acc['length'];

type Len = StringLength<'hello'>; // 5

// 实战：路径参数提取
type ExtractParams<Path extends string> =
  Path extends `${infer _}/:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : Path extends `${infer _}/:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<'/user/:id/post/:postId'>;
// "id" | "postId"
```

### 4.3 对象操作

```typescript
// 深度 Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度 Required
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 对象属性值类型化
type Mutable2<T> = {
  -readonly [P in keyof T]: T[P];
};

// 排除特定类型的键
type ExcludeKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P;
}[keyof T];

interface Example {
  name: string;
  age: number;
  isActive: boolean;
  callback: () => void;
}

type NonFunctionKeys = ExcludeKeys<Example, Function>;
// "name" | "age" | "isActive"

// 只保留特定类型的键
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

type StringProps = PickByType<Example, string>;
// { name: string }

// 实战：扁平化对象类型
type Flatten<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? Flatten<T[K]>
        : T[K]
    }[keyof T]
  : T;
```

### 4.4 数字运算

```typescript
// 构建指定长度的数组（用于计数）
type BuildArray<
  Length extends number,
  Acc extends any[] = []
> = Acc['length'] extends Length
  ? Acc
  : BuildArray<Length, [...Acc, any]>;

// 加法
type Add<A extends number, B extends number> = [
  ...BuildArray<A>,
  ...BuildArray<B>
]['length'];

type Sum = Add<3, 5>; // 8

// 减法
type Subtract<A extends number, B extends number> =
  BuildArray<A> extends [...BuildArray<B>, ...infer Rest]
    ? Rest['length']
    : never;

type Diff = Subtract<5, 3>; // 2

// 比较大小
type GreaterThan<
  A extends number,
  B extends number,
  Acc extends any[] = []
> = Acc['length'] extends A
  ? false
  : Acc['length'] extends B
    ? true
    : GreaterThan<A, B, [...Acc, any]>;

type GT = GreaterThan<5, 3>; // true
```

---

## 5. 类型编程技巧

### 5.1 类型递归

```typescript
// 递归深度限制（避免无限递归）
type DeepReadonly2<T, Depth extends number = 5> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly2<T[P], Subtract<Depth, 1>>
        : T[P];
    };

// 递归类型收窄
type JSON =
  | string
  | number
  | boolean
  | null
  | JSON[]
  | { [key: string]: JSON };

// 尾递归优化模式
type Reverse2<
  T extends any[],
  Acc extends any[] = []
> = T extends [infer F, ...infer Rest]
  ? Reverse2<Rest, [F, ...Acc]>
  : Acc;
```

### 5.2 类型缓存

```typescript
// 使用辅助类型避免重复计算
type Cached<T> = T extends any ? T : never;

type ProcessedType<T> = Cached<{
  [P in keyof T]: T[P] extends object
    ? ProcessedType<T[P]>
    : T[P];
}>;
```

### 5.3 类型分发技巧

```typescript
// 利用分布式条件类型
type ToPromise<T> = T extends any ? Promise<T> : never;

type P1 = ToPromise<string | number>;
// Promise<string> | Promise<number>

// 避免分发
type ToPromise2<T> = [T] extends [any] ? Promise<T> : never;

type P2 = ToPromise2<string | number>;
// Promise<string | number>
```

### 5.4 实战案例：类型安全的事件系统

```typescript
interface EventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:update': { id: string; data: any };
}

class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: {
    [K in keyof Events]?: Array<(payload: Events[K]) => void>;
  } = {};

  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(payload));
    }
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}

// 使用
const emitter = new TypedEventEmitter<EventMap>();

emitter.on('user:login', (payload) => {
  console.log(payload.userId); // 类型安全
  console.log(payload.timestamp);
});

emitter.emit('user:login', { userId: '123', timestamp: Date.now() });
// emitter.emit('user:login', { userId: '123' }); // Error: 缺少 timestamp
```

---

## 6. 装饰器

### 6.1 类装饰器

```typescript
// 基础类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}

// 装饰器工厂
function reportableClassDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    reportingURL = "http://www...";
  };
}

@reportableClassDecorator
class BugReport2 {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}

// 实战：注入依赖
function Injectable(target: any) {
  // 标记为可注入
  Reflect.defineMetadata('injectable', true, target);
}

@Injectable
class UserService {
  getUser(id: string) {
    return { id, name: 'John' };
  }
}
```

### 6.2 方法装饰器

```typescript
// 方法装饰器
function log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

// 实战：缓存装饰器
function memoize(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const cache = new Map();

  descriptor.value = function(...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };

  return descriptor;
}

class Fibonacci {
  @memoize
  calculate(n: number): number {
    if (n <= 1) return n;
    return this.calculate(n - 1) + this.calculate(n - 2);
  }
}

// 实战：防抖装饰器
function debounce(delay: number) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let timeoutId: NodeJS.Timeout;

    descriptor.value = function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}

class SearchBox {
  @debounce(300)
  onInput(value: string) {
    console.log('Searching for:', value);
  }
}
```

### 6.3 属性装饰器

```typescript
// 属性装饰器
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false
  });
}

class Person {
  @readonly
  name: string = "John";
}

// 实战：验证装饰器
function validate(
  validator: (value: any) => boolean,
  errorMessage: string
) {
  return function(target: any, propertyKey: string) {
    let value: any;

    const getter = function() {
      return value;
    };

    const setter = function(newVal: any) {
      if (!validator(newVal)) {
        throw new Error(`${propertyKey}: ${errorMessage}`);
      }
      value = newVal;
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class User {
  @validate((v) => v.length >= 3, 'Name must be at least 3 characters')
  name: string;

  @validate((v) => v >= 18, 'Age must be at least 18')
  age: number;
}
```

### 6.4 参数装饰器

```typescript
// 参数装饰器
function required(target: any, propertyKey: string, parameterIndex: number) {
  const existingRequiredParameters: number[] =
    Reflect.getOwnMetadata('required', target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata('required', existingRequiredParameters, target, propertyKey);
}

function validate2(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const requiredParameters: number[] =
      Reflect.getOwnMetadata('required', target, propertyKey) || [];
    
    for (const parameterIndex of requiredParameters) {
      if (args[parameterIndex] === undefined || args[parameterIndex] === null) {
        throw new Error(`Parameter at index ${parameterIndex} is required`);
      }
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

class Greeter {
  @validate2
  greet(@required name: string, age?: number) {
    console.log(`Hello ${name}, age: ${age}`);
  }
}
```

---

## 7. 工程化实践

### 7.1 tsconfig.json 配置详解

```json
{
  "compilerOptions": {
    // 编译选项
    "target": "ES2020",              // 目标 JS 版本
    "module": "ESNext",              // 模块系统
    "lib": ["ES2020", "DOM"],        // 包含的库文件
    "moduleResolution": "node",      // 模块解析策略
    
    // 严格模式
    "strict": true,                  // 启用所有严格检查
    "noImplicitAny": true,           // 禁止隐式 any
    "strictNullChecks": true,        // 严格空值检查
    "strictFunctionTypes": true,     // 严格函数类型检查
    "strictBindCallApply": true,     // 严格 bind/call/apply 检查
    "strictPropertyInitialization": true,  // 严格属性初始化
    "noImplicitThis": true,          // 禁止隐式 this
    "alwaysStrict": true,            // 总是使用严格模式
    
    // 额外检查
    "noUnusedLocals": true,          // 检查未使用的局部变量
    "noUnusedParameters": true,      // 检查未使用的参数
    "noImplicitReturns": true,       // 检查隐式返回
    "noFallthroughCasesInSwitch": true,  // 检查 switch 穿透
    
    // 模块解析
    "baseUrl": "./src",              // 基础路径
    "paths": {                       // 路径映射
      "@/*": ["*"],
      "@components/*": ["components/*"]
    },
    
    // 输出
    "outDir": "./dist",              // 输出目录
    "declaration": true,             // 生成 .d.ts 文件
    "declarationMap": true,          // 生成 .d.ts.map
    "sourceMap": true,               // 生成 .map 文件
    "removeComments": true,          // 移除注释
    
    // 实验性功能
    "experimentalDecorators": true,  // 启用装饰器
    "emitDecoratorMetadata": true,   // 装饰器元数据
    
    // 其他
    "esModuleInterop": true,         // ESM 互操作
    "skipLibCheck": true,            // 跳过库文件检查
    "forceConsistentCasingInFileNames": true  // 强制文件名大小写一致
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### 7.2 声明文件编写

```typescript
// global.d.ts - 全局声明
declare global {
  interface Window {
    myApp: {
      version: string;
      init: () => void;
    };
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
    }
  }
}

export {};

// types.d.ts - 模块声明
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'my-library' {
  export function hello(name: string): void;
  export class User {
    constructor(name: string);
    getName(): string;
  }
}

// 扩展第三方库类型
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
```

### 7.3 类型组织与复用

```typescript
// types/common.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Awaitable<T> = T | PromiseLike<T>;

// types/api.ts
import { Nullable } from './common';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: Nullable<T>;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// 使用桶文件组织导出
// types/index.ts
export * from './common';
export * from './api';
export * from './models';
```

### 7.4 与构建工具集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components')
    }
  },
  build: {
    target: 'es2015',
    // 生成类型文件
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd']
    }
  }
});

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,  // 仅转译，不检查类型（快速构建）
            experimentalWatchApi: true
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
```

---

## 8. 性能优化

### 8.1 类型检查性能优化

```typescript
// 避免：过度嵌套的条件类型
type Bad<T> = T extends A
  ? T extends B
    ? T extends C
      ? T extends D
        ? E
        : F
      : G
    : H
  : I;

// 推荐：提前收窄范围
type Good<T> = T extends A & B & C & D ? E : OtherCases<T>;

// 避免：复杂的递归类型
type DeepReadonlyBad<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonlyBad<T[P]>
    : T[P];
};

// 推荐：限制递归深度
type DeepReadonlyGood<T, Depth extends number = 5> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? DeepReadonlyGood<T[P], Subtract<Depth, 1>>
        : T[P];
    };

// 使用类型断言避免重复计算
const value = complexCalculation() as CalculatedType;

// 使用常量断言
const config = {
  mode: 'production',
  port: 3000
} as const; // 精确类型，不是宽泛的 string/number
```

### 8.2 编译性能优化

```json
{
  "compilerOptions": {
    // 增量编译
    "incremental": true,
    "tsBuildInfoFile": "./buildcache/",
    
    // 跳过库文件检查
    "skipLibCheck": true,
    
    // 仅转译模式（配合 ts-loader）
    "transpileOnly": true
  },
  
  // 使用 Project References
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

### 8.3 运行时性能优化

```typescript
// 使用 const enum 避免运行时开销
const enum Direction {
  Up,
  Down,
  Left,
  Right
}

// 编译后直接内联为数字，无运行时代码
const move = Direction.Up; // 编译为: const move = 0;

// 避免使用 enum（有运行时开销）
enum DirectionEnum {
  Up,
  Down
}
// 编译后生成额外的对象代码

// 使用字面量类型替代
type Direction2 = 'up' | 'down' | 'left' | 'right';

// 使用类型谓词避免运行时类型检查
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// TypeScript 编译器可以优化掉类型检查代码
if (isString(value)) {
  // value 是 string，无需额外检查
  console.log(value.toUpperCase());
}
```

---

## 9. 源码解析

### 9.1 内置工具类型实现

```typescript
// Partial 实现
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// Required 实现
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

// Readonly 实现
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Pick 实现
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit 实现
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// Exclude 实现
type MyExclude<T, U> = T extends U ? never : T;

// Extract 实现
type MyExtract<T, U> = T extends U ? T : never;

// NonNullable 实现
type MyNonNullable<T> = T extends null | undefined ? never : T;

// ReturnType 实现
type MyReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

// Parameters 实现
type MyParameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

// ConstructorParameters 实现
type MyConstructorParameters<
  T extends abstract new (...args: any) => any
> = T extends abstract new (...args: infer P) => any ? P : never;

// InstanceType 实现
type MyInstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;

// Awaited 实现
type MyAwaited<T> = T extends null | undefined
  ? T
  : T extends object & { then(onfulfilled: infer F): any }
    ? F extends (value: infer V, ...args: any) => any
      ? MyAwaited<V>
      : never
    : T;
```

### 9.2 高级工具类型实现

```typescript
// DeepPartial 实现
type DeepPartial<T> = T extends Function
  ? T
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

// DeepRequired 实现
type DeepRequired<T> = T extends Function
  ? T
  : T extends object
    ? { [P in keyof T]-?: DeepRequired<T[P]> }
    : T;

// PromiseType 实现
type PromiseType<T> = T extends Promise<infer U> ? U : T;

// Mutable 实现
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// PickByType 实现
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

// OmitByType 实现
type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

// Intersection 实现
type Intersection<T extends any[]> = T extends [infer F, ...infer R]
  ? F & Intersection<R>
  : unknown;

// Union 实现
type Union<T extends any[]> = T[number];
```

---

## 10. 经典面试题

### 10.1 基础题

**Q1: TypeScript 和 JavaScript 的区别？**

```
1. 类型系统：TS 是静态类型，JS 是动态类型
2. 编译时检查：TS 在编译时捕获错误，JS 在运行时
3. 工具支持：TS 提供更好的 IDE 支持（自动补全、重构）
4. 面向对象：TS 有接口、枚举、泛型等特性
5. 编译过程：TS 需要编译成 JS 才能运行
```

**Q2: type 和 interface 的区别？**

```typescript
// interface 只能描述对象，可以被扩展
interface User {
  name: string;
}
interface User {
  age: number; // 合并
}

// type 可以描述任何类型，不能重复声明
type ID = string | number;
type User2 = {
  name: string;
};
// type User2 = { age: number }; // Error

// interface 支持 extends，type 使用 &
interface Admin extends User {
  role: string;
}
type Admin2 = User2 & { role: string };

// type 可以使用工具类型
type ReadonlyUser = Readonly<User>;

// 推荐：对外 API 使用 interface（可扩展），内部类型使用 type
```

**Q3: any、unknown、never 的区别？**

```typescript
// any：任意类型，跳过类型检查
let a: any = 'hello';
a.toFixed(); // 不报错，但运行时可能出错

// unknown：类型安全的 any，使用前必须类型检查
let b: unknown = 'hello';
// b.toFixed(); // Error
if (typeof b === 'string') {
  b.toUpperCase(); // OK
}

// never：永不存在的值
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// never 是所有类型的子类型
type A = never extends string ? true : false; // true
```

### 10.2 进阶题

**Q4: 实现 DeepReadonly**

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Function
    ? T[P]
    : T[P] extends object
      ? DeepReadonly<T[P]>
      : T[P];
};

// 测试
interface Test {
  a: string;
  b: {
    c: number;
    d: {
      e: boolean;
    };
  };
}

type Result = DeepReadonly<Test>;
// 所有层级都是 readonly
```

**Q5: 实现类型安全的 Get 函数**

```typescript
type Get<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? Get<T[Key], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

// 测试
interface Data {
  user: {
    profile: {
      name: string;
      age: number;
    };
  };
}

type Name = Get<Data, 'user.profile.name'>; // string
type Age = Get<Data, 'user.profile.age'>; // number
```

**Q6: 实现 TupleToUnion**

```typescript
type TupleToUnion<T extends any[]> = T[number];

// 测试
type T1 = TupleToUnion<[string, number, boolean]>;
// string | number | boolean
```

**Q7: 实现 Flatten**

```typescript
type Flatten<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends any[]
    ? [...Flatten<F>, ...Flatten<R>]
    : [F, ...Flatten<R>]
  : [];

// 测试
type F1 = Flatten<[1, [2, 3], [[4]]]>; // [1, 2, 3, 4]
```

### 10.3 实战题

**Q8: 设计一个类型安全的状态管理器**

```typescript
type State = {
  count: number;
  user: { name: string; age: number };
};

type Actions = {
  increment: (amount: number) => void;
  updateUser: (user: Partial<State['user']>) => void;
};

class Store<S extends Record<string, any>, A extends Record<string, Function>> {
  private state: S;
  private listeners: Array<(state: S) => void> = [];

  constructor(initialState: S, actions: A) {
    this.state = initialState;
    
    // 绑定 actions 到 this
    Object.keys(actions).forEach(key => {
      (this as any)[key] = (...args: any[]) => {
        const result = (actions as any)[key].apply(this, args);
        this.notify();
        return result;
      };
    });
  }

  getState(): Readonly<S> {
    return this.state;
  }

  setState(partial: Partial<S>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: (state: S) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// 使用
const store = new Store<State, Actions>(
  { count: 0, user: { name: '', age: 0 } },
  {
    increment(amount: number) {
      this.setState({ count: this.getState().count + amount });
    },
    updateUser(user: Partial<State['user']>) {
      this.setState({
        user: { ...this.getState().user, ...user }
      });
    }
  }
);
```

**Q9: 实现类型安全的路由系统**

```typescript
type Route = {
  path: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
};

type ExtractParams<Path extends string> =
  Path extends `${infer _}/:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : Path extends `${infer _}/:${infer Param}`
      ? { [K in Param]: string }
      : {};

type RouteDef = {
  '/': {};
  '/user/:id': { id: string };
  '/post/:postId/comment/:commentId': { postId: string; commentId: string };
};

class Router<Routes extends Record<string, any>> {
  navigate<Path extends keyof Routes>(
    path: Path,
    ...args: Routes[Path] extends Record<string, never>
      ? []
      : [params: Routes[Path]]
  ): void {
    const params = args[0];
    let finalPath = path as string;
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        finalPath = finalPath.replace(`:${key}`, value as string);
      });
    }
    
    console.log('Navigating to:', finalPath);
  }
}

// 使用
const router = new Router<RouteDef>();

router.navigate('/'); // OK
router.navigate('/user/:id', { id: '123' }); // OK
// router.navigate('/user/:id'); // Error: 缺少 params
// router.navigate('/user/:id', { id: 123 }); // Error: id 必须是 string
```

**Q10: 设计一个类型安全的表单验证器**

```typescript
type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type FormSchema<T> = {
  [K in keyof T]: ValidationRule<T[K]>[];
};

type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

class FormValidator<T extends Record<string, any>> {
  constructor(private schema: FormSchema<T>) {}

  validate(data: T): ValidationErrors<T> {
    const errors: ValidationErrors<T> = {};

    for (const field in this.schema) {
      const rules = this.schema[field];
      const value = data[field];
      const fieldErrors: string[] = [];

      for (const rule of rules) {
        if (!rule.validate(value)) {
          fieldErrors.push(rule.message);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return errors;
  }
}

// 使用
interface UserForm {
  username: string;
  email: string;
  age: number;
}

const userSchema: FormSchema<UserForm> = {
  username: [
    {
      validate: (v) => v.length >= 3,
      message: 'Username must be at least 3 characters'
    }
  ],
  email: [
    {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  ],
  age: [
    {
      validate: (v) => v >= 18,
      message: 'Must be at least 18 years old'
    }
  ]
};

const validator = new FormValidator(userSchema);

const errors = validator.validate({
  username: 'ab',
  email: 'invalid',
  age: 16
});

console.log(errors);
// {
//   username: ['Username must be at least 3 characters'],
//   email: ['Invalid email format'],
//   age: ['Must be at least 18 years old']
// }
```

---

## 面试技巧

### 答题思路
1. **基础概念题**：定义 → 特点 → 使用场景 → 对比 → 最佳实践
2. **实现题**：理解需求 → 分析边界 → 编写代码 → 测试用例 → 优化
3. **实战题**：业务理解 → 类型设计 → 实现逻辑 → 类型安全 → 扩展性

### 常见陷阱
1. any 滥用：尽量使用 unknown 或泛型
2. 类型断言过度：优先使用类型守卫
3. 忽略 null/undefined：启用 strictNullChecks
4. 复杂类型性能：限制递归深度，使用缓存
5. 类型定义不精确：使用字面量类型和联合类型

### 加分项
1. 了解 TypeScript 编译原理
2. 熟悉源码实现
3. 有大型项目 TypeScript 迁移经验
4. 能设计类型安全的 API
5. 了解最新特性（Template Literal Types、Variadic Tuple Types 等）
