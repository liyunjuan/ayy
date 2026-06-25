# TypeScript 从零到精通

> 超详细注释版：每个概念都配有详细说明和实例

## 一、基础类型

### 1.1 基本类型

```typescript
// ===== 1. 布尔类型 =====
// boolean 只有两个值：true 或 false
let isDone: boolean = false
let isActive: boolean = true

// ===== 2. 数字类型 =====
// number 表示所有数字：整数、小数、十六进制等
let decimal: number = 6           // 十进制
let hex: number = 0xf00d          // 十六进制
let binary: number = 0b1010       // 二进制
let octal: number = 0o744         // 八进制
let big: bigint = 100n            // 大整数（ES2020+）

// ===== 3. 字符串类型 =====
// string 表示文本数据
let color: string = "blue"
let fullName: string = `Bob Smith`  // 模板字符串也是 string
let sentence: string = `Hello, my name is ${fullName}`

// ===== 4. 数组类型 =====
// 有两种方式定义数组

// 方式1：类型 + []
let list1: number[] = [1, 2, 3]       // 数字数组
let list2: string[] = ['a', 'b', 'c']  // 字符串数组

// 方式2：泛型数组 Array<类型>
let list3: Array<number> = [1, 2, 3]
let list4: Array<string> = ['a', 'b', 'c']

// ⚠️ 注意：数组中的元素类型必须一致
// let mixed: number[] = [1, 'a']  // ❌ 错误！不能混合类型

// ===== 5. 元组类型 =====
// 元组：固定长度和类型的数组
// 特点：知道每个位置的确切类型

// 定义一个元组：第一个是 string，第二个是 number
let tuple: [string, number] = ['hello', 10]

// ✅ 正确访问
console.log(tuple[0].substring(1))  // 'ello' - string 有 substring 方法
console.log(tuple[1].toFixed(2))    // '10.00' - number 有 toFixed 方法

// ❌ 错误访问
// tuple[0].toFixed(2)     // 错误！string 没有 toFixed 方法
// tuple[1].substring(1)   // 错误！number 没有 substring 方法

// ⚠️ 越界访问：超出定义长度的元素类型是联合类型
tuple[2] = 'world'  // ✅ 可以，类型是 string | number
// tuple[2] = true     // ❌ 错误！不是 string 或 number

// ===== 6. 枚举类型 =====
// 枚举：给一组数值定义友好的名字

// 数字枚举：默认从 0 开始递增
enum Color {
  Red,      // 0
  Green,    // 1
  Blue      // 2
}
let c: Color = Color.Green  // c = 1

// 手动设置起始值
enum Status {
  Pending = 1,    // 1
  Success,        // 2（自动递增）
  Failed          // 3
}

// 字符串枚举：需要手动赋值
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}
let dir: Direction = Direction.Up  // dir = "UP"

// 反向映射：数字枚举可以通过值获取键名
console.log(Color[1])  // "Green"
// 但字符串枚举不行
// console.log(Direction["UP"])  // undefined

// ===== 7. any 类型 =====
// any：任意类型，跳过类型检查
// ⚠️ 慎用！会失去 TS 的类型保护

let notSure: any = 4        // 现在是 number
notSure = "maybe a string"  // 改成 string，没问题
notSure = false             // 改成 boolean，也没问题
notSure.toFixed()           // TS 不会检查这个方法是否存在

// any 和 Object 的区别
let anyValue: any = 4
anyValue.toFixed()          // ✅ 允许调用任何方法

let objValue: Object = 4
// objValue.toFixed()       // ❌ 错误！Object 类型没有 toFixed

// ===== 8. unknown 类型 =====
// unknown：类型安全的 any
// 特点：必须进行类型检查后才能使用

let value: unknown = 4

// ❌ 不能直接使用
// value.toFixed()          // 错误！unknown 类型不能直接调用方法
// let num: number = value  // 错误！不能直接赋值给其他类型

// ✅ 必须先检查类型
if (typeof value === 'number') {
  value.toFixed()         // ✅ 现在可以了
}

// 使用类型断言
(value as number).toFixed()  // ✅ 强制断言为 number

// ===== 9. void 类型 =====
// void：表示没有返回值
// 常用于函数返回值

// 无返回值的函数
function warnUser(): void {
  console.log("This is a warning")
  // 没有 return 语句，或者 return; （不返回值）
}

// ⚠️ void 类型的变量只能赋值 undefined 或 null
let unusable: void = undefined
// unusable = 1  // ❌ 错误

// ===== 10. null 和 undefined =====
// 默认情况下，null 和 undefined 是所有类型的子类型

let u: undefined = undefined
let n: null = null

// 可以赋值给其他类型（strictNullChecks 关闭时）
// let num: number = null        // ✅ 允许
// let str: string = undefined   // ✅ 允许

// 开启 strictNullChecks 后，只能赋值给自己或 void
// let num: number = null        // ❌ 错误
// let str: string = undefined   // ❌ 错误

// ===== 11. never 类型 =====
// never：表示永远不会有返回值的类型
// 使用场景：
// 1. 抛出异常的函数
// 2. 永远不会返回的函数（死循环）

// 场景1：抛出异常
function error(message: string): never {
  throw new Error(message)
  // 这个函数永远不会正常返回
}

// 场景2：死循环
function infiniteLoop(): never {
  while (true) {
    // 永远循环
  }
}

// never 是所有类型的子类型，可以赋值给任何类型
// 但任何类型都不能赋值给 never（除了 never 本身）
let neverValue: never
// neverValue = 123  // ❌ 错误！number 不能赋值给 never

// ===== 12. object 类型 =====
// object：表示非原始类型
// 即：除了 number、string、boolean、symbol、null、undefined 之外的类型

// ✅ 可以赋值的类型
let obj1: object = { name: 'John' }  // 对象字面量
let obj2: object = [1, 2, 3]         // 数组
let obj3: object = new Date()        // Date 对象
let obj4: object = function() {}     // 函数

// ❌ 不能赋值的类型
// let obj5: object = 123           // 错误！number 是原始类型
// let obj6: object = "hello"       // 错误！string 是原始类型
// let obj7: object = true          // 错误！boolean 是原始类型
```

### 1.2 类型推断

```typescript
// ===== 类型推断：TS 自动推导类型 =====

// 1. 声明时赋值 → TS 自动推断类型
let num = 123       // 推断为 number
let str = "hello"   // 推断为 string
let bool = true     // 推断为 boolean

// 等价于
let num: number = 123
let str: string = "hello"
let bool: boolean = true

// 2. 声明时不赋值 → 推断为 any
let something       // 推断为 any
something = 123     // 可以是 number
something = "text"  // 也可以是 string

// 3. 函数返回值推断
function add(a: number, b: number) {
  return a + b      // 推断返回值为 number
}

// 4. 数组推断
let arr = [1, 2, 3]           // 推断为 number[]
let mixed = [1, "hello"]      // 推断为 (number | string)[]
let empty = []                // 推断为 any[]

// 5. 对象推断
let person = {
  name: "John",     // name 推断为 string
  age: 30           // age 推断为 number
}
// person 的类型为 { name: string; age: number }

// ⚠️ 推断后就固定了，不能赋值其他类型
num = "hello"   // ❌ 错误！num 已推断为 number
```

### 1.3 类型断言

```typescript
// ===== 类型断言：告诉 TS "相信我，我知道这是什么类型" =====

// 场景：你比 TS 更了解某个值的类型

// 方式1：尖括号语法（不推荐在 JSX 中使用）
let someValue: any = "this is a string"
let strLength1: number = (<string>someValue).length

// 方式2：as 语法（推荐，JSX 中只能用这种）
let someValue2: any = "this is a string"
let strLength2: number = (someValue2 as string).length

// 实际例子1：DOM 操作
// document.getElementById 返回 HTMLElement | null
const myCanvas = document.getElementById("main_canvas")
// myCanvas 的类型是 HTMLElement | null

// 使用类型断言指定更具体的类型
const myCanvas2 = document.getElementById("main_canvas") as HTMLCanvasElement
// 现在可以使用 canvas 特有的方法
myCanvas2.getContext('2d')  // ✅ 正确

// 实际例子2：API 响应
interface User {
  name: string
  age: number
}

// 假设从 API 获取的数据
const response: any = { name: "John", age: 30 }

// 断言为 User 类型
const user = response as User
console.log(user.name)  // ✅ 可以访问 name 属性

// ⚠️ 双重断言（不推荐）
// 当类型完全不兼容时，可以先断言为 any/unknown，再断言为目标类型
const str: string = "hello"
// const num = str as number        // ❌ 错误！string 和 number 不兼容
const num = (str as any) as number  // ✅ 强制转换（危险！）

// ===== 非空断言 =====
// 用 ! 告诉 TS 这个值一定不是 null 或 undefined

function processValue(value: string | null) {
  // value 可能是 null
  // console.log(value.length)  // ❌ 错误！可能是 null
  
  // 使用非空断言
  console.log(value!.length)    // ✅ 告诉 TS：value 一定不是 null
}

// 实际例子：DOM 元素
const button = document.querySelector('.btn')!
// 加了 ! 表示：我确定这个元素一定存在
button.addEventListener('click', () => {})
```

## 二、接口（Interface）

### 2.1 接口基础

```typescript
// ===== 接口：定义对象的结构（形状） =====

// 定义一个接口
interface Person {
  name: string      // 必需属性：name 必须是 string
  age: number       // 必需属性：age 必须是 number
}

// 使用接口
const john: Person = {
  name: "John",
  age: 30
}

// ❌ 错误用法
// const tom: Person = { name: "Tom" }           // 缺少 age
// const mary: Person = { name: "Mary", age: "25" }  // age 类型错误
// const bob: Person = { name: "Bob", age: 30, gender: "male" }  // 多余属性

// ===== 可选属性：用 ? 标记 =====
interface Car {
  brand: string       // 必需
  model: string       // 必需
  year?: number       // 可选：可以有也可以没有
  color?: string      // 可选
}

// ✅ 都是合法的
const car1: Car = { brand: "Tesla", model: "Model 3" }
const car2: Car = { brand: "Tesla", model: "Model 3", year: 2023 }
const car3: Car = { brand: "Tesla", model: "Model 3", year: 2023, color: "red" }

// ===== 只读属性：用 readonly 标记 =====
interface Point {
  readonly x: number    // 只读：初始化后不能修改
  readonly y: number
}

const p1: Point = { x: 10, y: 20 }
// p1.x = 5  // ❌ 错误！readonly 属性不能修改

// 只读数组
let arr: ReadonlyArray<number> = [1, 2, 3]
// arr[0] = 4        // ❌ 错误！不能修改
// arr.push(4)       // ❌ 错误！不能添加
// arr.length = 0    // ❌ 错误！不能修改长度

// 但可以重新赋值
arr = [4, 5, 6]      // ✅ 可以

// ===== 任意属性：允许额外的属性 =====
interface Config {
  name: string
  value: number
  [propName: string]: any  // 允许任意其他属性，值类型为 any
}

// ✅ 可以添加任意额外属性
const config: Config = {
  name: "config1",
  value: 100,
  extra1: "hello",     // 额外属性
  extra2: true         // 额外属性
}

// ⚠️ 注意：任意属性的类型必须包含其他属性的类型
interface Config2 {
  name: string
  count: number
  [propName: string]: string  // ❌ 错误！count 是 number，不符合 string
}

// 正确写法
interface Config3 {
  name: string
  count: number
  [propName: string]: string | number  // ✅ 包含 string 和 number
}
```

### 2.2 函数类型接口

```typescript
// ===== 接口可以描述函数类型 =====

// 定义函数接口：(参数列表) => 返回值类型
interface SearchFunc {
  (source: string, subString: string): boolean
}

// 实现这个接口
const mySearch: SearchFunc = function(source: string, subString: string): boolean {
  return source.indexOf(subString) !== -1
}

// 或者简写（参数名可以不同）
const mySearch2: SearchFunc = function(src, sub) {
  // TS 会自动推断 src 和 sub 的类型
  return src.indexOf(sub) !== -1
}

// 使用
mySearch("hello world", "world")  // true

// ===== 实际例子：比较函数 =====
interface CompareFn {
  (a: number, b: number): number
}

const sortAsc: CompareFn = (a, b) => a - b      // 升序
const sortDesc: CompareFn = (a, b) => b - a     // 降序

[3, 1, 2].sort(sortAsc)   // [1, 2, 3]
[3, 1, 2].sort(sortDesc)  // [3, 2, 1]
```

### 2.3 接口继承

```typescript
// ===== 接口可以继承：extends =====

// 基础接口
interface Shape {
  color: string
}

// 继承 Shape 接口
interface Square extends Shape {
  sideLength: number
}

// Square 拥有 color 和 sideLength 两个属性
const square: Square = {
  color: "red",
  sideLength: 10
}

// ===== 多重继承：继承多个接口 =====
interface Colorful {
  color: string
}

interface Movable {
  speed: number
}

// 同时继承两个接口
interface ColorfulMovable extends Colorful, Movable {
  direction: string
}

const obj: ColorfulMovable = {
  color: "red",
  speed: 100,
  direction: "up"
}

// ===== 实际例子：React 组件 Props =====
// 基础 Props
interface BaseProps {
  className?: string
  style?: React.CSSProperties
}

// 扩展 Props
interface ButtonProps extends BaseProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

// Button 组件既有基础属性，又有自己的属性
const Button: React.FC<ButtonProps> = (props) => {
  return (
    <button 
      className={props.className}
      style={props.style}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )
}
```

## 三、类型别名（Type）

### 3.1 基本用法

```typescript
// ===== type：给类型起别名 =====

// 1. 基本类型别名
type Name = string
type Age = number

let myName: Name = "John"
let myAge: Age = 30

// 2. 对象类型别名
type Person = {
  name: string
  age: number
}

const john: Person = { name: "John", age: 30 }

// 3. 联合类型别名
type StringOrNumber = string | number

let value: StringOrNumber = "hello"  // ✅ 可以是 string
value = 123                          // ✅ 也可以是 number
// value = true                      // ❌ 不能是其他类型

// 4. 元组类型别名
type Point = [number, number]
const point: Point = [10, 20]

// 5. 函数类型别名
type AddFunc = (a: number, b: number) => number

const add: AddFunc = (a, b) => a + b
```

### 3.2 联合类型和交叉类型

```typescript
// ===== 联合类型：可以是多种类型之一（或） =====
// 使用 | 符号

type Status = "pending" | "success" | "error"

let status: Status = "pending"   // ✅ 可以
status = "success"               // ✅ 可以
// status = "loading"            // ❌ 错误！不在联合类型中

// 实际例子：函数参数
function printId(id: number | string) {
  // id 可以是 number 或 string
  
  // 需要判断类型后才能使用特定方法
  if (typeof id === "string") {
    console.log(id.toUpperCase())  // string 方法
  } else {
    console.log(id.toFixed(2))     // number 方法
  }
}

printId(123)        // ✅
printId("abc")      // ✅
// printId(true)    // ❌ 错误

// ===== 交叉类型：合并多个类型（且） =====
// 使用 & 符号

type Person = {
  name: string
  age: number
}

type Employee = {
  employeeId: string
  department: string
}

// 交叉类型：同时拥有两个类型的所有属性
type Staff = Person & Employee

const staff: Staff = {
  name: "John",           // 来自 Person
  age: 30,                // 来自 Person
  employeeId: "E001",     // 来自 Employee
  department: "IT"        // 来自 Employee
}

// 实际例子：混入（Mixin）
type Colorful = {
  color: string
}

type Circle = {
  radius: number
}

// ColorfulCircle 拥有 color 和 radius
type ColorfulCircle = Colorful & Circle

const cc: ColorfulCircle = {
  color: "red",
  radius: 10
}
```

### 3.3 Type vs Interface

```typescript
// ===== Type 和 Interface 的区别 =====

// 1. 都可以描述对象
interface PersonInterface {
  name: string
  age: number
}

type PersonType = {
  name: string
  age: number
}

// 2. 都可以继承
interface StudentInterface extends PersonInterface {
  studentId: string
}

type StudentType = PersonType & {
  studentId: string
}

// 3. Interface 可以重复声明（声明合并）
interface User {
  name: string
}

interface User {
  age: number
}

// User 现在有 name 和 age 两个属性
const user: User = {
  name: "John",
  age: 30
}

// Type 不能重复声明
type Animal = {
  name: string
}

// type Animal = {      // ❌ 错误！重复声明
//   age: number
// }

// 4. Type 可以定义联合类型、元组等，Interface 不行
type ID = string | number              // ✅ 联合类型
type Point = [number, number]          // ✅ 元组
// interface ID = string | number      // ❌ 不支持

// ===== 使用建议 =====
// 1. 定义对象类型：优先使用 Interface
// 2. 定义联合类型、元组：使用 Type
// 3. 需要声明合并：使用 Interface
// 4. React Props：两者都可以，看团队规范
```

## 四、泛型（Generic）

### 4.1 泛型基础

```typescript
// ===== 泛型：类型的参数化 =====
// 目的：让函数/类等支持多种类型，同时保持类型安全

// ❌ 没有泛型的问题
function identity1(arg: any): any {
  return arg
}

const result = identity1(123)
// result 类型是 any，丢失了类型信息
// result.toFixed()  // TS 不知道 result 是 number

// ✅ 使用泛型
// <T> 是类型参数，代表任意类型
function identity<T>(arg: T): T {
  // T 是占位符，调用时会被具体类型替换
  return arg
}

// 调用方式1：显式指定类型
const result1 = identity<number>(123)
// result1 的类型是 number，保留了类型信息
result1.toFixed()  // ✅ TS 知道这是 number

// 调用方式2：类型推断（推荐）
const result2 = identity(123)
// TS 自动推断 T 为 number
result2.toFixed()  // ✅ 同样安全

const result3 = identity("hello")
// TS 推断 T 为 string
result3.toUpperCase()  // ✅ 可以使用 string 方法

// ===== 泛型数组 =====
function getFirst<T>(arr: T[]): T {
  // arr 是 T 类型的数组
  // 返回值也是 T 类型
  return arr[0]
}

const num = getFirst([1, 2, 3])        // num: number
const str = getFirst(['a', 'b', 'c'])  // str: string

// 也可以写成
function getFirst2<T>(arr: Array<T>): T {
  return arr[0]
}

// ===== 多个类型参数 =====
function pair<T, U>(first: T, second: U): [T, U] {
  // 两个类型参数：T 和 U
  return [first, second]
}

const p1 = pair(1, "hello")        // [number, string]
const p2 = pair("hello", true)     // [string, boolean]
```

### 4.2 泛型约束

```typescript
// ===== 泛型约束：限制泛型的类型范围 =====

// 场景：我们想访问 T 的某些属性，但不是所有类型都有这些属性

// ❌ 问题：T 可以是任何类型，不一定有 length 属性
function getLength<T>(arg: T): number {
  // return arg.length  // ❌ 错误！T 可能没有 length
}

// ✅ 解决：使用 extends 约束 T 必须有 length 属性
interface HasLength {
  length: number
}

function getLength2<T extends HasLength>(arg: T): number {
  // T extends HasLength 表示：T 必须有 length 属性
  return arg.length  // ✅ 现在安全了
}

// 可以传入任何有 length 属性的类型
getLength2("hello")        // string 有 length
getLength2([1, 2, 3])      // 数组有 length
getLength2({ length: 10 }) // 对象有 length
// getLength2(123)         // ❌ 错误！number 没有 length

// ===== 实际例子：约束对象的键 =====
// keyof：获取对象所有键的联合类型
interface Person {
  name: string
  age: number
}

// keyof Person = "name" | "age"

// 函数：获取对象的某个属性值
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  // T: 对象类型
  // K: T 的键，必须是 T 的属性名之一
  // T[K]: T 对象中 K 键对应的值类型
  return obj[key]
}

const person: Person = { name: "John", age: 30 }

const name = getProperty(person, "name")  // name: string
const age = getProperty(person, "age")    // age: number
// getProperty(person, "gender")          // ❌ 错误！gender 不是 Person 的属性
```

### 4.3 泛型接口和类

```typescript
// ===== 泛型接口 =====
interface Container<T> {
  value: T
  getValue: () => T
  setValue: (value: T) => void
}

// 使用时指定类型
const numberContainer: Container<number> = {
  value: 123,
  getValue: () => numberContainer.value,
  setValue: (val) => { numberContainer.value = val }
}

const stringContainer: Container<string> = {
  value: "hello",
  getValue: () => stringContainer.value,
  setValue: (val) => { stringContainer.value = val }
}

// ===== 泛型类 =====
class Queue<T> {
  // 泛型队列：先进先出
  private data: T[] = []
  
  // 入队
  push(item: T): void {
    this.data.push(item)
  }
  
  // 出队
  pop(): T | undefined {
    return this.data.shift()
  }
  
  // 获取队列大小
  size(): number {
    return this.data.length
  }
}

// 数字队列
const numberQueue = new Queue<number>()
numberQueue.push(1)
numberQueue.push(2)
console.log(numberQueue.pop())  // 1

// 字符串队列
const stringQueue = new Queue<string>()
stringQueue.push("a")
stringQueue.push("b")
console.log(stringQueue.pop())  // "a"

// ===== 实际例子：Promise =====
// Promise 是内置的泛型类
const promise1: Promise<number> = new Promise((resolve) => {
  resolve(123)  // 必须 resolve 一个 number
})

promise1.then(value => {
  // value 的类型是 number
  console.log(value.toFixed())
})

const promise2: Promise<string> = new Promise((resolve) => {
  resolve("hello")
})

promise2.then(value => {
  // value 的类型是 string
  console.log(value.toUpperCase())
})

// ===== 实际例子：React 组件 =====
// React.FC 是泛型类型，T 是 props 的类型
interface ButtonProps {
  text: string
  onClick: () => void
}

const Button: React.FC<ButtonProps> = (props) => {
  // props 的类型自动是 ButtonProps
  return <button onClick={props.onClick}>{props.text}</button>
}
```

## 五、高级类型

### 5.1 工具类型

```typescript
// ===== TypeScript 内置的工具类型 =====

// 1. Partial<T>：将 T 的所有属性变为可选
interface User {
  name: string
  age: number
  email: string
}

// Partial<User> 相当于：
// {
//   name?: string
//   age?: number
//   email?: string
// }

function updateUser(user: User, updates: Partial<User>): User {
  // updates 可以只包含部分属性
  return { ...user, ...updates }
}

const user: User = { name: "John", age: 30, email: "john@example.com" }
updateUser(user, { age: 31 })            // ✅ 只更新 age
updateUser(user, { name: "Jane" })       // ✅ 只更新 name
updateUser(user, { age: 31, email: "jane@example.com" })  // ✅ 更新多个

// 2. Required<T>：将 T 的所有属性变为必需（与 Partial 相反）
interface Config {
  host?: string
  port?: number
  timeout?: number
}

// Required<Config> 相当于：
// {
//   host: string
//   port: number
//   timeout: number
// }

const config: Required<Config> = {
  host: "localhost",
  port: 8080,
  timeout: 3000
  // 三个属性都必须提供
}

// 3. Readonly<T>：将 T 的所有属性变为只读
interface Point {
  x: number
  y: number
}

const point: Readonly<Point> = { x: 10, y: 20 }
// point.x = 5  // ❌ 错误！只读属性不能修改

// 4. Pick<T, K>：从 T 中挑选部分属性 K
interface Todo {
  title: string
  description: string
  completed: boolean
  createdAt: Date
}

// 只挑选 title 和 completed
type TodoPreview = Pick<Todo, "title" | "completed">

// TodoPreview 相当于：
// {
//   title: string
//   completed: boolean
// }

const preview: TodoPreview = {
  title: "Learn TS",
  completed: false
  // 不需要 description 和 createdAt
}

// 5. Omit<T, K>：从 T 中排除部分属性 K（与 Pick 相反）
// 排除 description 和 createdAt
type TodoInfo = Omit<Todo, "description" | "createdAt">

// TodoInfo 相当于：
// {
//   title: string
//   completed: boolean
// }

const info: TodoInfo = {
  title: "Learn TS",
  completed: false
}

// 6. Record<K, T>：创建一个对象类型，键为 K，值为 T
// 场景：创建映射表

// 创建一个对象，键是 string，值是 number
type StringToNumber = Record<string, number>

const scores: StringToNumber = {
  math: 90,
  english: 85,
  chinese: 88
}

// 更具体的例子
type PageName = "home" | "about" | "contact"
type PageInfo = {
  title: string
  path: string
}

// 创建页面映射
const pages: Record<PageName, PageInfo> = {
  home: { title: "Home", path: "/" },
  about: { title: "About", path: "/about" },
  contact: { title: "Contact", path: "/contact" }
}

// 7. Exclude<T, U>：从 T 中排除可以赋值给 U 的类型
type T1 = "a" | "b" | "c"
type T2 = "a" | "c"

type Result = Exclude<T1, T2>  // "b"
// 从 T1 中排除 T2 中有的类型

// 实际例子
type AllEvents = "click" | "scroll" | "mousemove"
type SpecialEvents = "click"

type NormalEvents = Exclude<AllEvents, SpecialEvents>
// NormalEvents = "scroll" | "mousemove"

// 8. Extract<T, U>：从 T 中提取可以赋值给 U 的类型（与 Exclude 相反）
type T3 = "a" | "b" | "c"
type T4 = "a" | "c" | "f"

type Result2 = Extract<T3, T4>  // "a" | "c"
// 提取 T3 和 T4 共有的类型

// 9. NonNullable<T>：从 T 中排除 null 和 undefined
type T5 = string | number | null | undefined

type Result3 = NonNullable<T5>  // string | number
```

### 5.2 条件类型

```typescript
// ===== 条件类型：根据条件选择类型 =====
// 语法：T extends U ? X : Y
// 如果 T 可以赋值给 U，则类型为 X，否则为 Y

// 基础例子
type IsString<T> = T extends string ? true : false

type A = IsString<string>   // true
type B = IsString<number>   // false
type C = IsString<"hello">  // true（字面量类型也是 string）

// 实际例子1：根据类型返回不同结果
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never
// 如果 T 是函数类型，返回其返回值类型，否则返回 never

type Func = (x: number) => string
type R1 = GetReturnType<Func>  // string

type NotFunc = number
type R2 = GetReturnType<NotFunc>  // never

// 实际例子2：提取数组元素类型
type ArrayElement<T> = T extends (infer E)[] ? E : T

type Arr = number[]
type Elem = ArrayElement<Arr>  // number

type NotArr = string
type Elem2 = ArrayElement<NotArr>  // string

// 内置的 ReturnType 工具类型
function add(a: number, b: number): number {
  return a + b
}

type AddReturn = ReturnType<typeof add>  // number
```

### 5.3 映射类型

```typescript
// ===== 映射类型：基于旧类型创建新类型 =====

// 基础例子：将所有属性变为可选
type MyPartial<T> = {
  [P in keyof T]?: T[P]
  // 遍历 T 的所有属性 P
  // ?: 表示可选
  // T[P] 是属性 P 的类型
}

interface User {
  name: string
  age: number
}

type PartialUser = MyPartial<User>
// 相当于：
// {
//   name?: string
//   age?: number
// }

// 自定义映射类型：添加 Nullable
type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

type NullableUser = Nullable<User>
// 相当于：
// {
//   name: string | null
//   age: number | null
// }

// 自定义映射类型：添加 Getters
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

type UserGetters = Getters<User>
// 相当于：
// {
//   getName: () => string
//   getAge: () => number
// }
```

## 六、实战案例

### 6.1 React 组件类型

```typescript
// ===== React 函数组件类型定义 =====

import React, { useState, useEffect } from 'react'

// 方式1：使用 React.FC
interface ButtonProps {
  text: string          // 按钮文本
  onClick: () => void   // 点击回调
  disabled?: boolean    // 是否禁用（可选）
  type?: 'primary' | 'default'  // 按钮类型（可选）
}

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled, type = 'default' }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`btn btn-${type}`}
    >
      {text}
    </button>
  )
}

// 方式2：直接定义函数（推荐）
function Button2(props: ButtonProps) {
  const { text, onClick, disabled, type = 'default' } = props
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`btn btn-${type}`}
    >
      {text}
    </button>
  )
}

// ===== Hooks 类型 =====
function UserProfile() {
  // useState：TS 可以自动推断类型
  const [name, setName] = useState('John')  // name: string
  const [age, setAge] = useState(30)        // age: number
  
  // 需要指定类型的情况
  const [user, setUser] = useState<User | null>(null)
  // user 的类型是 User | null
  
  // useEffect：参数类型自动推断
  useEffect(() => {
    // 获取用户信息
    fetchUser().then(data => {
      setUser(data)
    })
  }, [])  // 依赖数组
  
  return (
    <div>
      {user && (
        <>
          <p>Name: {user.name}</p>
          <p>Age: {user.age}</p>
        </>
      )}
    </div>
  )
}

// ===== 事件类型 =====
function Form() {
  // 输入事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.value 的类型是 string
    console.log(e.target.value)
  }
  
  // 点击事件
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // e.currentTarget 的类型是 HTMLButtonElement
    console.log(e.currentTarget)
  }
  
  // 表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // 处理提交
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  )
}

// ===== 子组件类型 =====
interface ParentProps {
  children: React.ReactNode  // 接受任何可渲染的内容
}

function Parent({ children }: ParentProps) {
  return <div className="parent">{children}</div>
}

// 更具体的子组件类型
interface ListProps {
  children: React.ReactElement<ItemProps>[]  // 只接受 Item 组件数组
}

function List({ children }: ListProps) {
  return <ul>{children}</ul>
}

interface ItemProps {
  text: string
}

function Item({ text }: ItemProps) {
  return <li>{text}</li>
}

// 使用
<List>
  <Item text="Item 1" />
  <Item text="Item 2" />
</List>
```

### 6.2 API 请求类型

```typescript
// ===== API 请求的类型定义 =====

// 定义响应数据结构
interface ApiResponse<T> {
  code: number      // 状态码
  message: string   // 提示信息
  data: T          // 实际数据（泛型）
}

// 定义用户数据
interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

// 定义文章数据
interface Post {
  id: number
  title: string
  content: string
  author: User
  createdAt: string
}

// 定义分页数据
interface Pagination<T> {
  list: T[]         // 列表数据
  total: number     // 总数
  page: number      // 当前页
  pageSize: number  // 每页数量
}

// API 请求函数
async function getUser(id: number): Promise<ApiResponse<User>> {
  // 返回类型是 Promise<ApiResponse<User>>
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

async function getPosts(page: number): Promise<ApiResponse<Pagination<Post>>> {
  // 返回类型是 Promise<ApiResponse<Pagination<Post>>>
  const response = await fetch(`/api/posts?page=${page}`)
  return response.json()
}

// 使用
async function loadUserData() {
  const result = await getUser(1)
  
  if (result.code === 200) {
    const user = result.data  // user 的类型是 User
    console.log(user.name)
    console.log(user.email)
  }
}

async function loadPosts() {
  const result = await getPosts(1)
  
  if (result.code === 200) {
    const { list, total } = result.data  // 类型自动推断
    
    list.forEach(post => {
      // post 的类型是 Post
      console.log(post.title)
      console.log(post.author.name)
    })
  }
}
```

## 七、总结

### 7.1 学习路线

```
1. 基础类型 → 理解基本概念
2. 接口和类型别名 → 定义对象结构
3. 泛型 → 编写灵活的代码
4. 高级类型 → 处理复杂场景
5. 实战应用 → React/Vue 项目
```

### 7.2 核心要点

```typescript
// 1. 类型注解：明确指定类型
let name: string = "John"

// 2. 类型推断：TS 自动推导
let age = 30  // 推断为 number

// 3. 接口：定义对象结构
interface User {
  name: string
  age: number
}

// 4. 泛型：类型参数化
function identity<T>(arg: T): T {
  return arg
}

// 5. 联合类型：多选一
type ID = string | number

// 6. 工具类型：内置工具
type PartialUser = Partial<User>
```

### 7.3 最佳实践

```typescript
// 1. 优先使用类型推断
const name = "John"  // ✅ 自动推断
// const name: string = "John"  // ❌ 多余的类型注解

// 2. 接口命名使用 PascalCase
interface UserProfile { }  // ✅
// interface user_profile { }  // ❌

// 3. 类型别名使用 PascalCase
type UserID = string  // ✅
// type user_id = string  // ❌

// 4. 能用 interface 就用 interface
interface User { }  // ✅ 优先
type User = { }     // ✅ 也可以

// 5. 少用 any，多用 unknown
let value: unknown = getData()  // ✅ 更安全
// let value: any = getData()     // ❌ 失去类型检查

// 6. 开启严格模式
// tsconfig.json
{
  "compilerOptions": {
    "strict": true  // ✅ 推荐
  }
}
```

### 7.4 常见问题

```typescript
// Q1: 什么时候用 interface，什么时候用 type？
// A: 对象类型优先用 interface，联合/元组用 type

// Q2: 泛型什么时候用？
// A: 当函数/类支持多种类型，但要保持类型安全时

// Q3: any 和 unknown 的区别？
// A: any 跳过检查，unknown 必须检查后才能用

// Q4: | 和 & 的区别？
// A: | 是联合（或），& 是交叉（且）

// Q5: readonly 和 const 的区别？
// A: readonly 用于属性，const 用于变量
```
