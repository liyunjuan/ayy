# JavaScript 面试整理 - 资深前端工程师（完整版）

> 面向 9 年经验前端，深度覆盖：语言原理、异步编程、性能优化、架构设计、工程实践

---

## 目录

- [一、JavaScript 基础深度解析](#一javascript-基础深度解析)
- [二、ES6+ 现代特性](#二es6-现代特性)
- [三、异步编程完全指南](#三异步编程完全指南)
- [四、原型与继承](#四原型与继承)
- [五、作用域与闭包](#五作用域与闭包)
- [六、this 绑定机制](#六this-绑定机制)
- [七、函数式编程](#七函数式编程)
- [八、性能优化](#八性能优化)
- [九、设计模式](#九设计模式)
- [十、TypeScript 核心](#十typescript-核心)
- [十一、框架相关（React/Vue）](#十一框架相关reactvue)
- [十二、工程化实践](#十二工程化实践)
- [十三、浏览器 API](#十三浏览器-api)
- [十四、安全](#十四安全)
- [十五、经典手写题](#十五经典手写题)
- [十六、高频面试问答](#十六高频面试问答)

---

## 一、JavaScript 基础深度解析

### 1.1 数据类型

**基本类型（Primitive）**
```javascript
// 7 种基本类型
Number        // 数字
String        // 字符串
Boolean       // 布尔
Null          // 空
Undefined     // 未定义
Symbol        // 符号（ES6）
BigInt        // 大整数（ES2020）
```

**引用类型（Object）**
```javascript
Object
Array
Function
Date
RegExp
Map / WeakMap
Set / WeakSet
```

**类型判断**
```javascript
// typeof（基本类型 + function）
typeof 123           // 'number'
typeof 'abc'         // 'string'
typeof true          // 'boolean'
typeof undefined     // 'undefined'
typeof Symbol()      // 'symbol'
typeof 123n          // 'bigint'
typeof null          // 'object' ❌ 历史遗留 bug
typeof []            // 'object'
typeof {}            // 'object'
typeof function(){}  // 'function' ✅

// instanceof（检查原型链）
[] instanceof Array           // true
[] instanceof Object          // true
function(){} instanceof Function // true

// Object.prototype.toString（最准确）
Object.prototype.toString.call([])        // '[object Array]'
Object.prototype.toString.call({})        // '[object Object]'
Object.prototype.toString.call(null)      // '[object Null]'
Object.prototype.toString.call(undefined) // '[object Undefined]'
Object.prototype.toString.call(123)       // '[object Number]'

// 封装通用类型判断
function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

getType([])        // 'array'
getType({})        // 'object'
getType(null)      // 'null'
getType(new Date) // 'date'
```

---

### 1.2 类型转换

**显式转换**
```javascript
// 转字符串
String(123)           // '123'
(123).toString()      // '123'
123 + ''              // '123'

// 转数字
Number('123')         // 123
parseInt('123px')     // 123
parseFloat('12.3px')  // 12.3
+'123'                // 123
'123' - 0             // 123

// 转布尔
Boolean(0)            // false
Boolean('')           // false
Boolean(null)         // false
Boolean(undefined)    // false
Boolean(NaN)          // false
Boolean(false)        // false
Boolean({})           // true ✅
Boolean([])           // true ✅
!!0                   // false
```

**隐式转换（面试重点）**
```javascript
// 字符串拼接
1 + '2'              // '12' (数字转字符串)
'1' + 2              // '12'
1 + 2 + '3'          // '33' (从左到右)
'1' + 2 + 3          // '123'

// 算术运算（转数字）
'3' - 1              // 2
'3' * '2'            // 6
'6' / '2'            // 3
'6' % '4'            // 2

// 比较运算
'2' > '10'           // true ❌ (字符串比较)
2 > '10'             // false ✅ (转数字比较)
null == undefined    // true ✅
null === undefined   // false
0 == false           // true
0 === false          // false
[] == false          // true ❌
[] == 0              // true ❌
[] == ''             // true ❌

// ToPrimitive 转换规则
// 对象转原始值：先调用 valueOf()，再调用 toString()
const obj = {
  valueOf() {
    return 42;
  },
  toString() {
    return '100';
  }
};

obj + 1              // 43 (调用 valueOf)
String(obj)          // '100' (调用 toString)

// Symbol.toPrimitive（优先级最高）
const obj2 = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 10;
    if (hint === 'string') return 'hello';
    return true;
  }
};

+obj2                // 10
String(obj2)         // 'hello'
obj2 + ''            // 'true'
```

**面试陷阱题**
```javascript
// 题 1
[] + []              // '' (两个空数组转字符串相加)
[] + {}              // '[object Object]'
{} + []              // 0 (第一个 {} 被当作代码块，+[] 转数字)
({} + [])            // '[object Object]'

// 题 2
true + false         // 1 (true=1, false=0)
12 / "6"             // 2
"number" + 15 + 3    // 'number153'
15 + 3 + "number"    // '18number'
[1] > null           // true ([1]转数字1, null转0)
"foo" + + "bar"      // 'fooNaN' (+"bar"转NaN)

// 题 3
!!"false" == !!"true"        // true (非空字符串都是true)
['x'] == 'x'                 // true
[] + null + 1                // 'null1'
[1,2,3] == [1,2,3]          // false (引用类型比较地址)
{}=={}                       // false

// 题 4 - 经典
'5' + 3                      // '53'
'5' - 3                      // 2
'5' * 3                      // 15
[] == ![]                    // true ❌
// 解析：![] 是 false，[] == false，[] 转原始值是 ''，'' == false，0 == 0
```

---

### 1.3 深拷贝与浅拷贝

**浅拷贝**
```javascript
// 方法 1：Object.assign
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = Object.assign({}, obj1);
obj2.b.c = 3;
console.log(obj1.b.c); // 3 ❌ 嵌套对象仍是引用

// 方法 2：展开运算符
const obj3 = { ...obj1 };

// 方法 3：Array.slice
const arr1 = [1, 2, { a: 3 }];
const arr2 = arr1.slice();

// 方法 4：Array.concat
const arr3 = [].concat(arr1);
```

**深拷贝**
```javascript
// 方法 1：JSON（简单但有限制）
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = JSON.parse(JSON.stringify(obj1));

// 限制：
// - 无法处理 undefined, Function, Symbol
// - 无法处理循环引用
// - Date 变成字符串
// - RegExp 变成 {}
// - NaN、Infinity 变成 null

// 方法 2：递归实现（完整版）
function deepClone(obj, hash = new WeakMap()) {
  // null 或非对象直接返回
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Date
  if (obj instanceof Date) return new Date(obj);
  
  // RegExp
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // 循环引用
  if (hash.has(obj)) return hash.get(obj);
  
  // 创建新对象（保持原型链）
  const cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  
  // 拷贝 Symbol 属性
  const symKeys = Object.getOwnPropertySymbols(obj);
  if (symKeys.length) {
    symKeys.forEach(symKey => {
      cloneObj[symKey] = deepClone(obj[symKey], hash);
    });
  }
  
  // 拷贝普通属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return cloneObj;
}

// 方法 3：structuredClone（浏览器原生，最新）
const obj3 = structuredClone(obj1);
// 支持：循环引用、Date、RegExp、Map、Set、ArrayBuffer
// 不支持：Function、Symbol
```

---

### 1.4 == vs === vs Object.is

**区别**
```javascript
// ==（相等，会类型转换）
1 == '1'             // true
null == undefined    // true
0 == false           // true

// ===（严格相等，不转换类型）
1 === '1'            // false
null === undefined   // false
0 === false          // false

// Object.is（最严格）
Object.is(NaN, NaN)  // true ✅
NaN === NaN          // false ❌
Object.is(+0, -0)    // false ✅
+0 === -0            // true ❌

// 实现 Object.is
if (!Object.is) {
  Object.is = function(x, y) {
    // 处理 +0 和 -0
    if (x === 0 && y === 0) {
      return 1 / x === 1 / y;
    }
    // 处理 NaN
    if (x !== x) {
      return y !== y;
    }
    // 其他情况
    return x === y;
  };
}
```

---

### 1.5 变量提升（Hoisting）

**var 提升**
```javascript
console.log(a); // undefined（不报错）
var a = 1;

// 等价于
var a;
console.log(a);
a = 1;
```

**函数提升**
```javascript
foo(); // 'Hello' ✅ 函数声明提升

function foo() {
  console.log('Hello');
}

// 函数表达式不提升
bar(); // TypeError: bar is not a function ❌
var bar = function() {
  console.log('World');
};
```

**let/const 暂时性死区（TDZ）**
```javascript
console.log(a); // ReferenceError ❌
let a = 1;

// 即使外部有同名变量
let x = 'outer';
{
  console.log(x); // ReferenceError ❌（TDZ）
  let x = 'inner';
}
```

**class 不提升**
```javascript
const p = new Person(); // ReferenceError ❌
class Person {}
```

---

## 二、ES6+ 现代特性

### 2.1 let/const/var 对比

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 提升 | 提升（undefined） | 提升（TDZ） | 提升（TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局对象属性 | 是 | 否 | 否 |

```javascript
// 1. 作用域
{
  var a = 1;
  let b = 2;
  const c = 3;
}
console.log(a); // 1 ✅
console.log(b); // ReferenceError ❌
console.log(c); // ReferenceError ❌

// 2. 循环中的区别
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3, 3, 3
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 0, 1, 2 ✅
}

// 3. const 的陷阱
const obj = { a: 1 };
obj.a = 2;        // ✅ 允许（修改属性）
obj = {};         // ❌ 报错（重新赋值）

// 真正的常量
const obj2 = Object.freeze({ a: 1 });
obj2.a = 2;       // 静默失败（严格模式下报错）

// 深度冻结
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach(val => {
    if (typeof val === 'object' && val !== null) {
      deepFreeze(val);
    }
  });
  return obj;
}
```

---

### 2.2 解构赋值

**数组解构**
```javascript
// 基础用法
const [a, b, c] = [1, 2, 3];

// 跳过元素
const [a, , c] = [1, 2, 3];

// 剩余参数
const [first, ...rest] = [1, 2, 3, 4];
// first: 1, rest: [2, 3, 4]

// 默认值
const [a = 1, b = 2] = [10];
// a: 10, b: 2

// 交换变量
let x = 1, y = 2;
[x, y] = [y, x];

// 函数返回多个值
function getCoords() {
  return [10, 20];
}
const [x, y] = getCoords();
```

**对象解构**
```javascript
// 基础用法
const { name, age } = { name: 'Tom', age: 18 };

// 重命名
const { name: userName, age: userAge } = user;

// 默认值
const { name = 'Anonymous', age = 0 } = user;

// 嵌套解构
const { address: { city, street } } = user;

// 剩余参数
const { name, ...rest } = user;

// 函数参数解构
function greet({ name, age = 0 }) {
  console.log(`${name}, ${age}`);
}
greet({ name: 'Tom' }); // 'Tom, 0'

// 动态属性名
const key = 'name';
const { [key]: value } = { name: 'Tom' };
// value: 'Tom'
```

**实战技巧**
```javascript
// 1. 提取数组中的值
const [first, second] = 'Hello'.split('');
// first: 'H', second: 'e'

// 2. 正则匹配结果
const [, year, month, day] = /(\d{4})-(\d{2})-(\d{2})/.exec('2024-01-01') || [];

// 3. React Hooks
const [count, setCount] = useState(0);

// 4. 遍历 Map
for (const [key, value] of map) {
  console.log(key, value);
}

// 5. 交换数组元素
[arr[0], arr[1]] = [arr[1], arr[0]];
```

---

### 2.3 箭头函数

**语法**
```javascript
// 传统函数
function add(a, b) {
  return a + b;
}

// 箭头函数
const add = (a, b) => a + b;

// 单个参数可省略括号
const double = x => x * 2;

// 无参数
const greet = () => 'Hello';

// 返回对象需要括号
const makeObj = () => ({ name: 'Tom' });

// 多行语句需要 {}
const complex = (a, b) => {
  const sum = a + b;
  return sum * 2;
};
```

**与普通函数的区别**
```javascript
// 1. this 绑定（词法作用域）
function Timer() {
  this.seconds = 0;
  
  // ❌ 普通函数：this 指向 window
  setInterval(function() {
    this.seconds++;
  }, 1000);
  
  // ✅ 箭头函数：this 继承外层
  setInterval(() => {
    this.seconds++;
  }, 1000);
}

// 2. 不能作为构造函数
const Person = (name) => {
  this.name = name;
};
new Person('Tom'); // TypeError ❌

// 3. 没有 arguments
const fn = () => {
  console.log(arguments); // ReferenceError ❌
};

// 用 rest 参数代替
const fn2 = (...args) => {
  console.log(args); // ✅
};

// 4. 没有 prototype
const fn = () => {};
console.log(fn.prototype); // undefined

// 5. 不能用作 Generator
const gen = *() => {}; // SyntaxError ❌
```

**使用场景**
```javascript
// ✅ 适合：数组方法
[1, 2, 3].map(x => x * 2);

// ✅ 适合：回调函数
button.addEventListener('click', () => {
  this.handleClick();
});

// ❌ 不适合：对象方法
const obj = {
  name: 'Tom',
  sayHi: () => {
    console.log(this.name); // undefined（this 是外层作用域）
  }
};

// ✅ 改用普通函数或简写
const obj2 = {
  name: 'Tom',
  sayHi() {
    console.log(this.name); // 'Tom'
  }
};

// ❌ 不适合：需要动态 this
button.addEventListener('click', () => {
  this.classList.toggle('active'); // this 不是 button
});
```

---

### 2.4 模板字符串

**基础用法**
```javascript
const name = 'Tom';
const age = 18;

// 传统拼接
const str1 = 'My name is ' + name + ', age ' + age;

// 模板字符串
const str2 = `My name is ${name}, age ${age}`;

// 表达式
const str3 = `1 + 1 = ${1 + 1}`;

// 函数调用
const str4 = `Today is ${new Date().toLocaleDateString()}`;

// 嵌套
const str5 = `Result: ${isSuccess ? `Success: ${data}` : 'Failed'}`;

// 多行字符串
const html = `
  <div>
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`;
```

**标签模板（Tagged Template）**
```javascript
// 自定义处理函数
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<mark>${values[i]}</mark>` : '');
  }, '');
}

const name = 'Tom';
const age = 18;
const text = highlight`My name is ${name}, age ${age}`;
// 'My name is <mark>Tom</mark>, age <mark>18</mark>'

// 实战：styled-components
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
  color: white;
  padding: 10px;
`;

// 实战：SQL 查询（防注入）
const userId = 123;
const query = sql`SELECT * FROM users WHERE id = ${userId}`;
```

---

### 2.5 Promise 与 async/await

**（详见第三章异步编程）**

---

### 2.6 Symbol

**创建**
```javascript
const s1 = Symbol();
const s2 = Symbol('description');

s1 === s2; // false（每次都是唯一的）

// 全局 Symbol
const s3 = Symbol.for('key');
const s4 = Symbol.for('key');
s3 === s4; // true ✅

Symbol.keyFor(s3); // 'key'
```

**用途**
```javascript
// 1. 对象私有属性
const _name = Symbol('name');
const person = {
  [_name]: 'Tom',
  age: 18
};

Object.keys(person);              // ['age']（Symbol 不可枚举）
Object.getOwnPropertySymbols(person); // [Symbol(name)]

// 2. 防止属性名冲突
const CALCULATE_METHOD = Symbol('calculateMethod');
class MyMath {
  [CALCULATE_METHOD]() {
    // 私有方法
  }
}

// 3. 定义常量（唯一性）
const STATUS = {
  PENDING: Symbol('pending'),
  FULFILLED: Symbol('fulfilled'),
  REJECTED: Symbol('rejected')
};

// 4. 内置 Symbol（迭代器、类型转换等）
// Symbol.iterator, Symbol.toPrimitive, Symbol.toStringTag...
```

---

### 2.7 Set 与 Map

**Set（集合）**
```javascript
// 创建
const set = new Set([1, 2, 3, 3, 3]);
console.log(set); // Set(3) {1, 2, 3}（自动去重）

// 方法
set.add(4);
set.has(2);        // true
set.delete(2);
set.size;          // 3
set.clear();

// 遍历
for (const value of set) {
  console.log(value);
}

set.forEach(value => console.log(value));

// 转数组
[...set];
Array.from(set);

// 应用：数组去重
const arr = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(arr)]; // [1, 2, 3]

// 应用：交集、并集、差集
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

// 并集
const union = new Set([...a, ...b]); // {1, 2, 3, 4}

// 交集
const intersection = new Set([...a].filter(x => b.has(x))); // {2, 3}

// 差集
const difference = new Set([...a].filter(x => !b.has(x))); // {1}
```

**Map（映射）**
```javascript
// 创建
const map = new Map([
  ['name', 'Tom'],
  ['age', 18]
]);

// 方法
map.set('gender', 'male');
map.get('name');     // 'Tom'
map.has('age');      // true
map.delete('age');
map.size;            // 2
map.clear();

// 遍历
for (const [key, value] of map) {
  console.log(key, value);
}

map.forEach((value, key) => console.log(key, value));

// 转对象
Object.fromEntries(map);

// 对象转 Map
const obj = { name: 'Tom', age: 18 };
const map2 = new Map(Object.entries(obj));

// Map vs Object
// 1. 键可以是任意类型（Object 只能是字符串/Symbol）
const map3 = new Map();
map3.set({}, 'object key');
map3.set(function(){}, 'function key');

// 2. 有序（Object 的键顺序不完全可靠）
// 3. 性能更好（频繁增删）
// 4. 有 size 属性
```

**WeakSet 与 WeakMap**
```javascript
// WeakSet
// - 只能存对象
// - 弱引用（不会阻止垃圾回收）
// - 不可遍历
const ws = new WeakSet();
let obj = {};
ws.add(obj);
obj = null; // obj 会被垃圾回收

// 应用：标记对象
const disabledElements = new WeakSet();
disabledElements.add(element);
if (disabledElements.has(element)) {
  // 元素被禁用
}

// WeakMap
const wm = new WeakMap();
let key = {};
wm.set(key, 'value');
key = null; // 键值对会被垃圾回收

// 应用：存储 DOM 节点相关数据
const domData = new WeakMap();
domData.set(element, { count: 0 });
// 当 element 被移除时，数据自动清理
```

---

### 2.8 Proxy 与 Reflect

**Proxy（代理）**
```javascript
const target = { name: 'Tom', age: 18 };

const proxy = new Proxy(target, {
  // 读取属性
  get(target, key, receiver) {
    console.log(`Getting ${key}`);
    return Reflect.get(target, key, receiver);
  },
  
  // 设置属性
  set(target, key, value, receiver) {
    console.log(`Setting ${key} = ${value}`);
    if (key === 'age' && typeof value !== 'number') {
      throw new TypeError('Age must be a number');
    }
    return Reflect.set(target, key, value, receiver);
  },
  
  // 删除属性
  deleteProperty(target, key) {
    console.log(`Deleting ${key}`);
    return Reflect.deleteProperty(target, key);
  },
  
  // 判断属性是否存在
  has(target, key) {
    console.log(`Checking ${key}`);
    return Reflect.has(target, key);
  },
  
  // 拦截函数调用
  apply(target, thisArg, args) {
    console.log(`Calling with args: ${args}`);
    return Reflect.apply(target, thisArg, args);
  }
});

proxy.name;           // 'Getting name'
proxy.age = 20;       // 'Setting age = 20'
delete proxy.age;     // 'Deleting age'
'name' in proxy;      // 'Checking name'
```

**实战应用**

**1. 响应式数据（Vue 3）**
```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
}
```

**2. 数据验证**
```javascript
function validate(target, schema) {
  return new Proxy(target, {
    set(target, key, value) {
      const validator = schema[key];
      if (validator && !validator(value)) {
        throw new Error(`Invalid value for ${key}`);
      }
      return Reflect.set(target, key, value);
    }
  });
}

const user = validate({}, {
  age: val => typeof val === 'number' && val > 0,
  email: val => /^[\w-]+@[\w-]+\.\w+$/.test(val)
});

user.age = 18;        // ✅
user.age = -1;        // ❌ Error
```

**3. 负索引数组**
```javascript
function negativeArray(arr) {
  return new Proxy(arr, {
    get(target, key) {
      const index = Number(key);
      if (index < 0) {
        return target[target.length + index];
      }
      return Reflect.get(target, key);
    }
  });
}

const arr = negativeArray([1, 2, 3, 4, 5]);
arr[-1];  // 5
arr[-2];  // 4
```

**Reflect（反射）**
```javascript
// Reflect 提供了操作对象的默认行为

// 1. Reflect.get
const obj = { name: 'Tom' };
Reflect.get(obj, 'name'); // 'Tom'

// 2. Reflect.set
Reflect.set(obj, 'age', 18);

// 3. Reflect.has
Reflect.has(obj, 'name'); // true

// 4. Reflect.deleteProperty
Reflect.deleteProperty(obj, 'name');

// 5. Reflect.ownKeys（获取所有键，包括 Symbol）
Reflect.ownKeys(obj);

// 6. Reflect.apply
function greet(name) {
  return `Hello, ${name}`;
}
Reflect.apply(greet, null, ['Tom']); // 'Hello, Tom'

// 7. Reflect.construct
function Person(name) {
  this.name = name;
}
const p = Reflect.construct(Person, ['Tom']);

// 为什么用 Reflect？
// 1. 返回值统一（布尔值），而不是抛错
// 2. 操作对象更函数式
// 3. 与 Proxy 配合使用
```

---

### 2.9 Class

**基础语法**
```javascript
class Person {
  // 构造函数
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  // 实例方法
  sayHi() {
    console.log(`Hi, I'm ${this.name}`);
  }
  
  // 静态方法
  static create(name, age) {
    return new Person(name, age);
  }
  
  // getter
  get info() {
    return `${this.name}, ${this.age}`;
  }
  
  // setter
  set info(value) {
    [this.name, this.age] = value.split(', ');
  }
}

const p = new Person('Tom', 18);
p.sayHi();
console.log(p.info);
p.info = 'Jerry, 20';
```

**继承**
```javascript
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age); // 调用父类构造函数
    this.grade = grade;
  }
  
  // 重写方法
  sayHi() {
    super.sayHi(); // 调用父类方法
    console.log(`Grade: ${this.grade}`);
  }
  
  // 静态方法继承
  static create(name, age, grade) {
    return new Student(name, age, grade);
  }
}
```

**私有字段（ES2022）**
```javascript
class Counter {
  #count = 0; // 私有字段
  
  increment() {
    this.#count++;
  }
  
  getCount() {
    return this.#count;
  }
}

const c = new Counter();
c.increment();
console.log(c.getCount()); // 1
console.log(c.#count);     // SyntaxError ❌
```

**Class vs 构造函数**
```javascript
// Class 本质是构造函数的语法糖
class Person {}
typeof Person; // 'function'

// 但有区别：
// 1. Class 必须用 new 调用
Person(); // TypeError ❌

// 2. Class 内部方法不可枚举
class A {
  method() {}
}
Object.keys(new A()); // []

// 3. Class 有暂时性死区
const p = new Person(); // ReferenceError ❌
class Person {}

// 4. Class 有默认的严格模式
```

---

### 2.10 ES2020+ 新特性

**可选链（Optional Chaining）**
```javascript
// 传统写法
const city = user && user.address && user.address.city;

// 可选链
const city = user?.address?.city;

// 可选方法调用
user.getName?.();

// 可选数组索引
arr?.[0];

// 结合空值合并
const city = user?.address?.city ?? 'Unknown';
```

**空值合并（Nullish Coalescing）**
```javascript
// || 的问题
const count = 0;
const result = count || 10; // 10 ❌（0 是 falsy）

// ?? 只判断 null/undefined
const result2 = count ?? 10; // 0 ✅

// 应用
const timeout = options?.timeout ?? 5000;
```

**逻辑赋值**
```javascript
// 或赋值
a ||= b;  // a = a || b

// 且赋值
a &&= b;  // a = a && b

// 空值赋值
a ??= b;  // a = a ?? b

// 应用：初始化默认值
options.timeout ??= 5000;
```

**数字分隔符**
```javascript
const billion = 1_000_000_000;
const bytes = 0xFF_FF_FF_FF;
const creditCard = 1234_5678_9012_3456;
```

**Promise.allSettled**
```javascript
// Promise.all：一个失败全部失败
// Promise.allSettled：等待所有完成（无论成功失败）
const promises = [
  fetch('/api/1'),
  fetch('/api/2'),
  fetch('/api/3')
];

const results = await Promise.allSettled(promises);
// [
//   { status: 'fulfilled', value: ... },
//   { status: 'rejected', reason: ... },
//   { status: 'fulfilled', value: ... }
// ]
```

---

## 三、异步编程完全指南

### 3.1 Event Loop（事件循环）

**浏览器事件循环**
```
┌───────────────────────────┐
│        Call Stack         │
└───────────────────────────┘
             ↑
             │
┌────────────┴──────────────┐
│      Micro Task Queue     │ (Promise, MutationObserver)
└───────────────────────────┘
             ↑
             │
┌────────────┴──────────────┐
│      Macro Task Queue     │ (setTimeout, setInterval, I/O)
└───────────────────────────┘
```

**执行顺序**
```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出：1, 4, 3, 2
// 解释：
// 1. 同步代码先执行：1, 4
// 2. 微任务（Promise）：3
// 3. 宏任务（setTimeout）：2
```

**复杂示例**
```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

new Promise((resolve) => {
  console.log('4');
  resolve();
}).then(() => {
  console.log('5');
  setTimeout(() => {
    console.log('6');
  }, 0);
}).then(() => {
  console.log('7');
});

console.log('8');

// 输出：1, 4, 8, 5, 7, 2, 3, 6
```

**Node.js 事件循环**
```
   ┌───────────────────────────┐
┌─>│           timers          │ (setTimeout, setInterval)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ (I/O)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ (setImmediate)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

**process.nextTick vs setImmediate**
```javascript
// process.nextTick：微任务，优先级最高
process.nextTick(() => console.log('1'));

// setImmediate：宏任务，check 阶段
setImmediate(() => console.log('2'));

// Promise：微任务，次于 nextTick
Promise.resolve().then(() => console.log('3'));

// 输出：1, 3, 2
```

---

### 3.2 Promise

**状态**
```javascript
// 三种状态
pending   // 进行中
fulfilled // 已成功
rejected  // 已失败

// 状态只能改变一次
// pending → fulfilled
// pending → rejected
```

**基础用法**
```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) {
      resolve('Success');
    } else {
      reject(new Error('Failed'));
    }
  }, 1000);
});

// 使用 Promise
promise
  .then(result => {
    console.log(result);
    return result + '!';
  })
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('Done');
  });
```

**链式调用**
```javascript
// then 返回新 Promise
fetch('/api/user')
  .then(response => response.json())
  .then(user => fetch(`/api/posts?user=${user.id}`))
  .then(response => response.json())
  .then(posts => console.log(posts))
  .catch(error => console.error(error));

// 等价于 async/await
try {
  const response1 = await fetch('/api/user');
  const user = await response1.json();
  const response2 = await fetch(`/api/posts?user=${user.id}`);
  const posts = await response2.json();
  console.log(posts);
} catch (error) {
  console.error(error);
}
```

**静态方法**
```javascript
// Promise.resolve
Promise.resolve(42);
// 等价于
new Promise(resolve => resolve(42));

// Promise.reject
Promise.reject(new Error('Failed'));

// Promise.all（全部成功）
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);
Promise.all([p1, p2, p3]).then(values => {
  console.log(values); // [1, 2, 3]
});

// Promise.race（第一个完成）
Promise.race([p1, p2, p3]).then(value => {
  console.log(value); // 1
});

// Promise.allSettled（等待全部，无论成败）
Promise.allSettled([p1, p2, p3]).then(results => {
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'fulfilled', value: 2 },
  //   { status: 'fulfilled', value: 3 }
  // ]
});

// Promise.any（第一个成功）
Promise.any([p1, p2, p3]).then(value => {
  console.log(value); // 1
});
```

**手写 Promise（完整版见第十五章）**

---

### 3.3 async/await

**基础用法**
```javascript
// async 函数返回 Promise
async function fetchUser() {
  return { name: 'Tom' };
}
fetchUser().then(user => console.log(user));

// await 等待 Promise
async function getUser() {
  const response = await fetch('/api/user');
  const user = await response.json();
  return user;
}

// 错误处理
async function getData() {
  try {
    const data = await fetch('/api/data');
    return data.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

**并发控制**
```javascript
// ❌ 串行（慢）
async function sequential() {
  const user = await fetchUser();     // 等待 1s
  const posts = await fetchPosts();   // 等待 1s
  return { user, posts };             // 总共 2s
}

// ✅ 并行（快）
async function parallel() {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]);
  return { user, posts };             // 总共 1s
}

// 或
async function parallel2() {
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  const user = await userPromise;
  const posts = await postsPromise;
  return { user, posts };
}
```

**错误处理技巧**
```javascript
// 方案 1：try/catch 包裹每个 await
async function fn() {
  try {
    const data1 = await fetch('/api/1');
  } catch (e) {
    console.error(e);
  }
  
  try {
    const data2 = await fetch('/api/2');
  } catch (e) {
    console.error(e);
  }
}

// 方案 2：统一 catch
async function fn() {
  const data1 = await fetch('/api/1').catch(e => null);
  const data2 = await fetch('/api/2').catch(e => null);
}

// 方案 3：await-to-js
function to(promise) {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null]);
}

const [err, data] = await to(fetch('/api/data'));
if (err) {
  console.error(err);
}
```

**顶层 await（ES2022）**
```javascript
// 模块顶层可直接使用 await
const data = await fetch('/api/data');
export default data;

// 等待多个模块
await Promise.all([
  import('./module1.js'),
  import('./module2.js')
]);
```

---

### 3.4 Generator

**基础语法**
```javascript
function* gen() {
  yield 1;
  yield 2;
  return 3;
}

const g = gen();
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: 3, done: true }
g.next(); // { value: undefined, done: true }

// for...of 遍历（不包含 return 值）
for (const value of gen()) {
  console.log(value); // 1, 2
}
```

**yield***
```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield 'a';
  yield* gen1(); // 委托给另一个 Generator
  yield 'b';
}

[...gen2()]; // ['a', 1, 2, 'b']
```

**传值**
```javascript
function* gen() {
  const a = yield 1;
  console.log(a); // 10
  const b = yield 2;
  console.log(b); // 20
}

const g = gen();
g.next();      // { value: 1, done: false }
g.next(10);    // 输出 10, { value: 2, done: false }
g.next(20);    // 输出 20, { value: undefined, done: true }
```

**应用：自动执行异步（co 库原理）**
```javascript
function co(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();
    
    function next(data) {
      const { value, done } = g.next(data);
      
      if (done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(next, reject);
      }
    }
    
    next();
  });
}

// 使用
co(function* () {
  const user = yield fetch('/api/user');
  const posts = yield fetch('/api/posts');
  return { user, posts };
}).then(result => console.log(result));

// async/await 本质就是 Generator + co
```

---

### 3.5 并发控制

**限制并发数量**
```javascript
// 场景：上传 100 张图片，限制同时只能上传 3 个
async function uploadWithLimit(files, limit = 3) {
  const results = [];
  const executing = [];
  
  for (const file of files) {
    const p = upload(file).then(result => {
      executing.splice(executing.indexOf(p), 1);
      return result;
    });
    
    results.push(p);
    executing.push(p);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

// 通用版本
class PromisePool {
  constructor(limit) {
    this.limit = limit;
    this.count = 0;
    this.queue = [];
  }
  
  async add(fn) {
    if (this.count >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.count++;
    const result = await fn();
    this.count--;
    
    if (this.queue.length) {
      this.queue.shift()();
    }
    
    return result;
  }
}

// 使用
const pool = new PromisePool(3);
const tasks = files.map(file => pool.add(() => upload(file)));
await Promise.all(tasks);
```

**串行执行**
```javascript
// 方案 1：async/await
async function serial(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

// 方案 2：reduce
function serial2(tasks) {
  return tasks.reduce(
    (promise, task) => promise.then(results =>
      task().then(result => [...results, result])
    ),
    Promise.resolve([])
  );
}

// 使用
await serial([
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3')
]);
```

---

## 四、原型与继承

### 4.1 原型链

**概念**
```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const p = new Person('Tom');

// 原型链：
// p → Person.prototype → Object.prototype → null

p.__proto__ === Person.prototype;              // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null;            // true

// 实例、构造函数、原型的关系
p.constructor === Person;                    // true
Person.prototype.constructor === Person;     // true
p.__proto__.constructor === Person;          // true
```

**属性查找**
```javascript
const p = new Person('Tom');

// 查找顺序：
// 1. p 自身属性
// 2. Person.prototype
// 3. Object.prototype
// 4. 找不到返回 undefined

p.name;          // 'Tom'（自身属性）
p.sayHi();       // 调用 Person.prototype.sayHi
p.toString();    // 调用 Object.prototype.toString
p.notExist;      // undefined
```

**hasOwnProperty vs in**
```javascript
const p = new Person('Tom');

p.hasOwnProperty('name');    // true（自身属性）
p.hasOwnProperty('sayHi');   // false（原型属性）

'name' in p;                 // true
'sayHi' in p;                // true（包含原型）

// 判断是否是原型属性
function hasPrototypeProperty(obj, name) {
  return name in obj && !obj.hasOwnProperty(name);
}
```

---

### 4.2 继承的 6 种方式

**1. 原型链继承**
```javascript
function Parent() {
  this.name = 'parent';
  this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child() {}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

// 缺点：
// 1. 引用类型属性被所有实例共享
const c1 = new Child();
const c2 = new Child();
c1.colors.push('green');
console.log(c2.colors); // ['red', 'blue', 'green'] ❌

// 2. 无法向父类构造函数传参
```

**2. 构造函数继承**
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(name) {
  Parent.call(this, name); // 调用父类构造函数
}

// 优点：
// 1. 避免引用类型共享
const c1 = new Child('Tom');
const c2 = new Child('Jerry');
c1.colors.push('green');
console.log(c2.colors); // ['red', 'blue'] ✅

// 2. 可以传参

// 缺点：
// 1. 无法继承原型方法
c1.getName(); // TypeError ❌

// 2. 每次创建实例都要执行一次父类构造函数
```

**3. 组合继承（最常用）**
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name);  // 第二次调用父类构造函数
  this.age = age;
}

Child.prototype = new Parent();  // 第一次调用父类构造函数
Child.prototype.constructor = Child;

// 优点：结合了原型链和构造函数的优点
const c1 = new Child('Tom', 18);
c1.getName(); // 'Tom' ✅
c1.colors.push('green');

const c2 = new Child('Jerry', 20);
console.log(c2.colors); // ['red', 'blue'] ✅

// 缺点：调用了两次父类构造函数
```

**4. 原型式继承**
```javascript
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

// ES5: Object.create
const parent = {
  name: 'parent',
  colors: ['red', 'blue']
};

const child1 = Object.create(parent);
const child2 = Object.create(parent);

// 缺点：引用类型共享
child1.colors.push('green');
console.log(child2.colors); // ['red', 'blue', 'green'] ❌
```

**5. 寄生式继承**
```javascript
function createAnother(original) {
  const clone = Object.create(original);
  clone.sayHi = function() {
    console.log('Hi');
  };
  return clone;
}

// 缺点：每次创建对象都要创建方法，无法复用
```

**6. 寄生组合式继承（最优）**
```javascript
function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

inheritPrototype(Child, Parent);

Child.prototype.getAge = function() {
  return this.age;
};

// 优点：
// 1. 只调用一次父类构造函数 ✅
// 2. 避免了在 Child.prototype 上创建不必要的属性
// 3. 原型链保持不变

// 这是最理想的继承方式
```

---

### 4.3 ES6 Class 继承

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
  
  getName() {
    return this.name;
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name); // 必须调用 super
    this.age = age;
  }
  
  getAge() {
    return this.age;
  }
}

// 本质是寄生组合式继承的语法糖
```

---

### 4.4 instanceof 原理

```javascript
// instanceof 检查原型链
function myInstanceof(left, right) {
  let proto = Object.getPrototypeOf(left);
  const prototype = right.prototype;
  
  while (true) {
    if (!proto) return false;
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
}

// 测试
console.log(myInstanceof([], Array));    // true
console.log(myInstanceof([], Object));   // true
console.log(myInstanceof({}, Array));    // false
```

---

### 4.5 new 运算符原理

```javascript
function myNew(constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype);
  
  // 2. 执行构造函数，this 指向新对象
  const result = constructor.apply(obj, args);
  
  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name) {
  this.name = name;
}

const p = myNew(Person, 'Tom');
console.log(p.name); // 'Tom'
console.log(p instanceof Person); // true
```

---

## 五、作用域与闭包

### 5.1 作用域

**全局作用域**
```javascript
var globalVar = 'global';

function foo() {
  console.log(globalVar); // 'global'
}
```

**函数作用域**
```javascript
function foo() {
  var localVar = 'local';
  console.log(localVar); // 'local'
}

console.log(localVar); // ReferenceError ❌
```

**块级作用域（ES6）**
```javascript
{
  let blockVar = 'block';
  const blockConst = 'const';
}

console.log(blockVar); // ReferenceError ❌

// var 没有块级作用域
{
  var noBlock = 'var';
}
console.log(noBlock); // 'var' ✅
```

**词法作用域（静态作用域）**
```javascript
// JavaScript 使用词法作用域（函数定义时确定）
var x = 10;

function foo() {
  console.log(x);
}

function bar() {
  var x = 20;
  foo(); // 10（foo 定义在全局，查找全局的 x）
}

bar();
```

---

### 5.2 闭包

**定义**：函数可以访问其词法作用域外的变量

**形成条件**：
1. 函数嵌套
2. 内部函数引用外部函数变量
3. 内部函数被返回或传递到外部

**基础示例**
```javascript
function createCounter() {
  let count = 0;
  
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
counter.getCount();  // 1

// count 是私有变量，外部无法直接访问
```

**经典问题：循环中的闭包**
```javascript
// ❌ 问题代码
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 3, 3, 3
  }, 100);
}

// 解决方案 1：IIFE
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j); // 0, 1, 2 ✅
    }, 100);
  })(i);
}

// 解决方案 2：let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2 ✅
  }, 100);
}

// 解决方案 3：bind
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 100);
}
```

**闭包应用**

**1. 模块化**
```javascript
const module = (function() {
  let privateVar = 'private';
  
  function privateMethod() {
    console.log(privateVar);
  }
  
  return {
    publicMethod() {
      privateMethod();
    }
  };
})();

module.publicMethod(); // 'private'
console.log(module.privateVar); // undefined
```

**2. 柯里化**
```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
curriedAdd(1)(2)(3);      // 6
curriedAdd(1, 2)(3);      // 6
curriedAdd(1)(2, 3);      // 6
```

**3. 防抖/节流**
```javascript
// 防抖
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(fn, delay) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
```

**4. 单例模式**
```javascript
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    return { name: 'singleton' };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const s1 = Singleton.getInstance();
const s2 = Singleton.getInstance();
s1 === s2; // true
```

**闭包陷阱**

**1. 内存泄漏**
```javascript
function createClosure() {
  const largeArray = new Array(1000000);
  
  return function() {
    // largeArray 无法被回收
    console.log(largeArray.length);
  };
}

// 解决：及时释放
function createClosure() {
  const largeArray = new Array(1000000);
  const length = largeArray.length;
  
  return function() {
    console.log(length);
  };
}
```

**2. 性能问题**
```javascript
// ❌ 每次调用都创建新函数
function attachHandlers() {
  const element = document.getElementById('btn');
  element.addEventListener('click', function() {
    console.log('clicked');
  });
}

// ✅ 复用函数
function attachHandlers() {
  const element = document.getElementById('btn');
  
  function handleClick() {
    console.log('clicked');
  }
  
  element.addEventListener('click', handleClick);
}
```

---

## 六、this 绑定机制

### 6.1 this 的四种绑定规则

**1. 默认绑定（独立函数调用）**
```javascript
function foo() {
  console.log(this); // window（非严格模式）/ undefined（严格模式）
}

foo();

// 严格模式
'use strict';
function bar() {
  console.log(this); // undefined
}
bar();
```

**2. 隐式绑定（对象方法调用）**
```javascript
const obj = {
  name: 'Tom',
  sayHi() {
    console.log(this.name);
  }
};

obj.sayHi(); // 'Tom'（this 指向 obj）

// 陷阱：隐式丢失
const fn = obj.sayHi;
fn(); // undefined（this 变成全局对象）

// 回调函数中
setTimeout(obj.sayHi, 100); // undefined（this 丢失）

// 解决：箭头函数或 bind
setTimeout(() => obj.sayHi(), 100); // 'Tom' ✅
setTimeout(obj.sayHi.bind(obj), 100); // 'Tom' ✅
```

**3. 显式绑定（call/apply/bind）**
```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: 'Tom' };

// call：参数列表
greet.call(person, 'Hello', '!'); // "Hello, I'm Tom!"

// apply：参数数组
greet.apply(person, ['Hi', '.']); // "Hi, I'm Tom."

// bind：返回新函数
const boundGreet = greet.bind(person, 'Hey');
boundGreet('~'); // "Hey, I'm Tom~"
```

**4. new 绑定（构造函数调用）**
```javascript
function Person(name) {
  this.name = name;
}

const p = new Person('Tom');
console.log(p.name); // 'Tom'（this 指向新对象）
```

**优先级**：new > 显式 > 隐式 > 默认

```javascript
function foo() {
  console.log(this.name);
}

const obj1 = { name: 'obj1', foo };
const obj2 = { name: 'obj2' };

obj1.foo();              // 'obj1'（隐式绑定）
obj1.foo.call(obj2);     // 'obj2'（显式 > 隐式）

const boundFoo = foo.bind(obj1);
boundFoo.call(obj2);     // 'obj1'（bind 无法被 call 覆盖）

const p = new boundFoo(); // undefined（new > bind）
```

---

### 6.2 箭头函数的 this

**特点**：没有自己的 this，继承外层作用域的 this

```javascript
const obj = {
  name: 'Tom',
  
  // 普通函数
  normalFunc() {
    setTimeout(function() {
      console.log(this.name); // undefined（this 丢失）
    }, 100);
  },
  
  // 箭头函数
  arrowFunc() {
    setTimeout(() => {
      console.log(this.name); // 'Tom'（继承外层 this）
    }, 100);
  }
};

// 箭头函数的 this 无法被改变
const arrowFn = () => console.log(this);
const obj2 = { name: 'obj2' };

arrowFn.call(obj2);  // window（无法改变）
arrowFn.bind(obj2)(); // window（无法改变）
```

---

### 6.3 手写 call/apply/bind

**call**
```javascript
Function.prototype.myCall = function(context, ...args) {
  // context 为 null/undefined 时，指向全局对象
  context = context || globalThis;
  
  // 创建唯一 key，避免覆盖原有属性
  const key = Symbol('key');
  
  // 将函数设为对象的方法
  context[key] = this;
  
  // 调用方法
  const result = context[key](...args);
  
  // 删除临时属性
  delete context[key];
  
  return result;
};

// 测试
function greet(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

greet.myCall({ name: 'Tom' }, 'Hello'); // "Hello, I'm Tom"
```

**apply**
```javascript
Function.prototype.myApply = function(context, args) {
  context = context || globalThis;
  const key = Symbol('key');
  context[key] = this;
  
  const result = context[key](...(args || []));
  delete context[key];
  
  return result;
};
```

**bind**
```javascript
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  
  return function Fn(...newArgs) {
    // 如果被 new 调用，this 指向新对象
    if (this instanceof Fn) {
      return new fn(...args, ...newArgs);
    }
    
    return fn.apply(context, args.concat(newArgs));
  };
};

// 测试
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const boundGreet = greet.myBind({ name: 'Tom' }, 'Hello');
boundGreet('!'); // "Hello, I'm Tom!"
```

---

## 七、函数式编程

### 7.1 纯函数

**定义**：
1. 相同输入总是得到相同输出
2. 没有副作用（不修改外部状态）

```javascript
// ✅ 纯函数
function add(a, b) {
  return a + b;
}

// ❌ 非纯函数
let count = 0;
function increment() {
  count++; // 修改外部状态
}

// ❌ 非纯函数
function random() {
  return Math.random(); // 相同输入不同输出
}
```

---

### 7.2 柯里化（Currying）

**定义**：将多参数函数转换为单参数函数序列

```javascript
// 普通函数
function add(a, b, c) {
  return a + b + c;
}

// 柯里化
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

curriedAdd(1)(2)(3); // 6

// 通用柯里化（见前文）
```

**应用**
```javascript
// 1. 参数复用
function multiply(a) {
  return function(b) {
    return a * b;
  };
}

const double = multiply(2);
double(5); // 10
double(10); // 20

// 2. 延迟计算
const curriedSum = curry((a, b, c) => a + b + c);
const addOne = curriedSum(1);
const addOneAndTwo = addOne(2);
addOneAndTwo(3); // 6

// 3. 动态生成函数
const hasPermission = curry((permission, user) => {
  return user.permissions.includes(permission);
});

const canEdit = hasPermission('edit');
canEdit(user1); // true/false
canEdit(user2); // true/false
```

---

### 7.3 组合（Composition）

**定义**：将多个函数组合成一个函数

```javascript
// compose：从右到左
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

// pipe：从左到右
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

// 使用
const double = x => x * 2;
const addOne = x => x + 1;
const square = x => x * x;

const fn1 = compose(square, addOne, double);
fn1(3); // ((3 * 2) + 1)² = 49

const fn2 = pipe(double, addOne, square);
fn2(3); // ((3 * 2) + 1)² = 49
```

**实战示例**
```javascript
// 数据处理管道
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const formatName = pipe(trim, toLowerCase, capitalize);
formatName('  john DOE  '); // 'John doe'

// Redux middleware
const logger = store => next => action => {
  console.log('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};
```

---

### 7.4 高阶函数

**定义**：接收函数作为参数，或返回函数

```javascript
// 1. 接收函数
[1, 2, 3].map(x => x * 2);

// 2. 返回函数
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

// 常见高阶函数
map, filter, reduce, forEach
some, every, find, findIndex
sort, flatMap
```

**实战示例**
```javascript
// 1. 数组扁平化
const flatten = arr => arr.reduce((acc, val) =>
  Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
  []
);

// 2. 记忆化（Memoization）
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 斐波那契数列
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(100); // 很快
```

---

### 7.5 函子（Functor）

**定义**：实现了 map 方法的对象

```javascript
class Box {
  constructor(value) {
    this.value = value;
  }
  
  map(fn) {
    return new Box(fn(this.value));
  }
  
  inspect() {
    return `Box(${this.value})`;
  }
}

const box = new Box(2);
box
  .map(x => x + 1)
  .map(x => x * 2)
  .inspect(); // 'Box(6)'

// Maybe 函子（处理 null/undefined）
class Maybe {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Maybe(value);
  }
  
  isNothing() {
    return this.value === null || this.value === undefined;
  }
  
  map(fn) {
    return this.isNothing() ? this : Maybe.of(fn(this.value));
  }
}

// 使用
Maybe.of({ name: 'Tom' })
  .map(user => user.address)
  .map(address => address.city)
  .map(city => city.toUpperCase());
// 即使 address 或 city 不存在也不会报错
```

---

## 八、性能优化

### 8.1 防抖（Debounce）

**概念**：在事件触发 n 秒后执行回调，如果 n 秒内再次触发，则重新计时

```javascript
// 基础版本
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 完整版本
function debounce(fn, delay, options = {}) {
  let timer = null;
  let lastArgs = null;
  
  const { leading = false, trailing = true, maxWait } = options;
  
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  
  function invoke(time) {
    const args = lastArgs;
    lastArgs = null;
    lastInvokeTime = time;
    return fn.apply(this, args);
  }
  
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }
  
  return function(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastCallTime = time;
    
    if (isInvoking) {
      if (leading && lastInvokeTime === 0) {
        lastInvokeTime = time;
        return fn.apply(this, args);
      }
      
      if (maxWait !== undefined) {
        return invoke(time);
      }
    }
    
    clearTimeout(timer);
    
    if (trailing) {
      timer = setTimeout(() => {
        invoke(Date.now());
      }, delay);
    }
  };
}

// 使用
const handleInput = debounce(function(e) {
  console.log(e.target.value);
}, 500);

input.addEventListener('input', handleInput);
```

---

### 8.2 节流（Throttle）

**概念**：在 n 秒内最多执行一次回调

```javascript
// 基础版本（时间戳）
function throttle(fn, delay) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 定时器版本
function throttle2(fn, delay) {
  let timer = null;
  
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

// 完整版本（结合两种方式）
function throttle(fn, delay, options = {}) {
  let timer = null;
  let lastTime = 0;
  
  const { leading = true, trailing = true } = options;
  
  return function(...args) {
    const now = Date.now();
    
    // 首次调用且 leading = false
    if (!lastTime && !leading) {
      lastTime = now;
    }
    
    const remaining = delay - (now - lastTime);
    
    // 到达触发时间
    if (remaining <= 0 || remaining > delay) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      lastTime = now;
      fn.apply(this, args);
    }
    // 未到触发时间，设置定时器（trailing）
    else if (!timer && trailing) {
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0;
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// 使用
const handleScroll = throttle(function() {
  console.log(window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);
```

**防抖 vs 节流对比**

| 场景 | 防抖 | 节流 |
|------|------|------|
| 搜索框输入 | ✅ | ❌ |
| 窗口 resize | ✅ | ✅ |
| 页面滚动 | ❌ | ✅ |
| 按钮点击 | ✅ | ✅ |
| 拖拽 | ❌ | ✅ |

---

### 8.3 虚拟滚动

**概念**：只渲染可视区域的元素

```javascript
class VirtualScroll {
  constructor(options) {
    this.container = options.container;
    this.itemHeight = options.itemHeight;
    this.data = options.data;
    this.render = options.render;
    
    this.visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight);
    this.startIndex = 0;
    
    this.init();
  }
  
  init() {
    // 创建虚拟占位容器
    this.phantom = document.createElement('div');
    this.phantom.style.height = `${this.data.length * this.itemHeight}px`;
    this.container.appendChild(this.phantom);
    
    // 创建内容容器
    this.content = document.createElement('div');
    this.content.style.position = 'absolute';
    this.content.style.top = 0;
    this.content.style.left = 0;
    this.content.style.right = 0;
    this.container.appendChild(this.content);
    
    // 监听滚动
    this.container.addEventListener('scroll', () => {
      this.updateVisibleData();
    });
    
    this.updateVisibleData();
  }
  
  updateVisibleData() {
    // 计算可视区域起始索引
    this.startIndex = Math.floor(this.container.scrollTop / this.itemHeight);
    
    // 计算可视区域数据
    const endIndex = this.startIndex + this.visibleCount;
    const visibleData = this.data.slice(this.startIndex, endIndex);
    
    // 更新偏移量
    this.content.style.transform = `translateY(${this.startIndex * this.itemHeight}px)`;
    
    // 渲染
    this.content.innerHTML = visibleData.map(this.render).join('');
  }
}

// 使用
new VirtualScroll({
  container: document.getElementById('list'),
  itemHeight: 50,
  data: Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })),
  render: item => `<div class="item">${item.name}</div>`
});
```

---

### 8.4 懒加载

**图片懒加载**
```javascript
// 方案 1：Intersection Observer（推荐）
const images = document.querySelectorAll('img[data-src]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    }
  });
});

images.forEach(img => observer.observe(img));

// 方案 2：getBoundingClientRect
function lazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  });
}

window.addEventListener('scroll', throttle(lazyLoad, 200));
```

---

### 8.5 内存优化

**1. 避免内存泄漏**
```javascript
// ❌ 泄漏：未清理的定时器
function leak() {
  setInterval(() => {
    // do something
  }, 1000);
}

// ✅ 正确：清理定时器
function correct() {
  const timer = setInterval(() => {
    // do something
  }, 1000);
  
  // 组件卸载时清理
  return () => clearInterval(timer);
}

// ❌ 泄漏：未清理的事件监听
function leak2() {
  const handler = () => {};
  element.addEventListener('click', handler);
}

// ✅ 正确：清理事件监听
function correct2() {
  const handler = () => {};
  element.addEventListener('click', handler);
  
  return () => element.removeEventListener('click', handler);
}

// ❌ 泄漏：闭包引用大对象
function leak3() {
  const largeData = new Array(1000000);
  
  return function() {
    console.log(largeData[0]);
  };
}

// ✅ 正确：只保留必要数据
function correct3() {
  const largeData = new Array(1000000);
  const firstItem = largeData[0];
  
  return function() {
    console.log(firstItem);
  };
}
```

**2. WeakMap/WeakSet 防止泄漏**
```javascript
// 存储 DOM 节点相关数据
const cache = new WeakMap();

function cacheData(element, data) {
  cache.set(element, data);
}

// element 被移除时，cache 中的数据自动释放
```

---

## 九、设计模式

> 详细内容请查看 [javascript-design-patterns.md](./javascript-design-patterns.md)

**快速索引**：
- 创建型：单例、工厂、建造者、原型
- 结构型：代理、装饰器、适配器、外观、组合
- 行为型：观察者、发布订阅、策略、命令、迭代器、中介者、状态、责任链
- 架构型：MVC、MVVM、Flux/Redux

---

## 十、TypeScript 核心

### 10.1 基础类型

```typescript
// 基本类型
let num: number = 123;
let str: string = 'hello';
let bool: boolean = true;
let nul: null = null;
let und: undefined = undefined;
let sym: symbol = Symbol('key');
let big: bigint = 100n;

// 数组
let arr1: number[] = [1, 2, 3];
let arr2: Array<number> = [1, 2, 3];

// 元组
let tuple: [string, number] = ['hello', 123];

// 枚举
enum Color {
  Red,
  Green,
  Blue
}
let color: Color = Color.Red;

// any（任意类型，不做类型检查）
let any: any = 'hello';
any = 123;

// unknown（类型安全的 any）
let unknown: unknown = 'hello';
// unknown.toUpperCase(); // ❌ 错误
if (typeof unknown === 'string') {
  unknown.toUpperCase(); // ✅ 正确
}

// void（无返回值）
function log(): void {
  console.log('log');
}

// never（永不返回）
function error(): never {
  throw new Error('error');
}

// object
let obj: object = { a: 1 };
```

---

### 10.2 高级类型

**联合类型**
```typescript
let value: string | number;
value = 'hello';
value = 123;

// 类型守卫
function isString(value: string | number): value is string {
  return typeof value === 'string';
}

if (isString(value)) {
  value.toUpperCase(); // value 是 string
}
```

**交叉类型**
```typescript
interface Person {
  name: string;
}

interface Worker {
  work(): void;
}

type Employee = Person & Worker;

const employee: Employee = {
  name: 'Tom',
  work() {
    console.log('working');
  }
};
```

**类型别名**
```typescript
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;

function getName(n: NameOrResolver): Name {
  if (typeof n === 'string') {
    return n;
  } else {
    return n();
  }
}
```

**接口**
```typescript
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
  readonly id: number; // 只读属性
  [propName: string]: any; // 索引签名
}

// 函数类型接口
interface SearchFunc {
  (source: string, subString: string): boolean;
}

const search: SearchFunc = (source, subString) => {
  return source.includes(subString);
};

// 类类型接口
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();
  setTime(d: Date) {
    this.currentTime = d;
  }
}
```

---

### 10.3 泛型

**基础泛型**
```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

identity<number>(123);
identity('hello'); // 类型推断

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

const myIdentity: GenericIdentityFn<number> = identity;

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

const myNumber = new GenericNumber<number>();
myNumber.zeroValue = 0;
myNumber.add = (x, y) => x + y;
```

**泛型约束**
```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity({ length: 10, value: 3 }); // ✅
// loggingIdentity(3); // ❌ 错误，number 没有 length

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const obj = { a: 1, b: 2, c: 3 };
getProperty(obj, 'a'); // ✅
// getProperty(obj, 'd'); // ❌ 错误
```

---

### 10.4 工具类型

**内置工具类型**
```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// Partial<T>（所有属性可选）
type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }

// Required<T>（所有属性必选）
type RequiredUser = Required<PartialUser>;

// Readonly<T>（所有属性只读）
type ReadonlyUser = Readonly<User>;

// Pick<T, K>（挑选属性）
type UserPreview = Pick<User, 'name' | 'age'>;
// { name: string; age: number; }

// Omit<T, K>（排除属性）
type UserWithoutEmail = Omit<User, 'email'>;
// { name: string; age: number; }

// Record<K, T>（创建对象类型）
type UserRoles = Record<'admin' | 'user' | 'guest', User>;
// { admin: User; user: User; guest: User; }

// Exclude<T, U>（排除类型）
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'

// Extract<T, U>（提取类型）
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;
// 'a'

// NonNullable<T>（排除 null 和 undefined）
type T3 = NonNullable<string | number | undefined | null>;
// string | number

// ReturnType<T>（获取函数返回值类型）
function fn() {
  return { x: 10, y: 20 };
}
type T4 = ReturnType<typeof fn>;
// { x: number; y: number; }

// Parameters<T>（获取函数参数类型）
function fn2(a: string, b: number) {}
type T5 = Parameters<typeof fn2>;
// [string, number]
```

**自定义工具类型**
```typescript
// DeepPartial（深度可选）
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// DeepReadonly（深度只读）
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Mutable（移除 readonly）
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// PickByType（按类型挑选属性）
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

interface User {
  name: string;
  age: number;
  isActive: boolean;
}

type StringProps = PickByType<User, string>;
// { name: string; }
```

---

### 10.5 类型推断与类型守卫

**类型推断**
```typescript
// 自动推断
let x = 3; // x: number
let arr = [1, 2, 3]; // arr: number[]

// 最佳通用类型
let arr2 = [1, 'hello', true]; // arr2: (string | number | boolean)[]

// 上下文类型
window.onmousedown = function(mouseEvent) {
  console.log(mouseEvent.button); // mouseEvent: MouseEvent
};
```

**类型守卫**
```typescript
// typeof
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value;
  }
  if (typeof padding === 'string') {
    return padding + value;
  }
}

// instanceof
class Bird {
  fly() {}
}
class Fish {
  swim() {}
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// in
interface A {
  a: number;
}
interface B {
  b: string;
}

function foo(x: A | B) {
  if ('a' in x) {
    console.log(x.a);
  } else {
    console.log(x.b);
  }
}

// 自定义类型守卫
function isString(x: any): x is string {
  return typeof x === 'string';
}
```

---

### 10.6 装饰器

**类装饰器**
```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}
```

**方法装饰器**
```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number) {
    return a + b;
  }
}
```

---

## 十一、框架相关（React/Vue）

### 11.1 React Hooks

**useState**
```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // 函数式更新
  const increment = () => setCount(c => c + 1);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

**useEffect**
```typescript
import { useEffect } from 'react';

function Timer() {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    
    // 清理函数
    return () => clearInterval(timer);
  }, []); // 空依赖数组，只执行一次
  
  return <div>{time}s</div>;
}

// 依赖项变化时执行
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

**useContext**
```typescript
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Button</button>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}
```

**useReducer**
```typescript
import { useReducer } from 'react';

type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
```

**useMemo 与 useCallback**
```typescript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }) {
  // 缓存计算结果
  const expensiveValue = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);
  
  // 缓存函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <div>{expensiveValue}</div>;
}
```

**useRef**
```typescript
import { useRef, useEffect } from 'react';

function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  return <input ref={inputRef} />;
}

// 保存任意可变值
function Counter() {
  const countRef = useRef(0);
  const [, forceUpdate] = useState({});
  
  const increment = () => {
    countRef.current++;
    forceUpdate({}); // 强制更新
  };
  
  return <div>{countRef.current}</div>;
}
```

**自定义 Hook**
```typescript
import { useState, useEffect } from 'react';

// useLocalStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('name', '');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}

// useDebounce
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
```

---

### 11.2 React 性能优化

**React.memo**
```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // 只在 data 变化时重新渲染
  return <div>{data}</div>;
});

// 自定义比较函数
const Component = memo(
  ({ data }) => <div>{data.value}</div>,
  (prevProps, nextProps) => {
    return prevProps.data.value === nextProps.data.value;
  }
);
```

**lazy 与 Suspense**
```typescript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

**虚拟列表**
```typescript
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={500}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index]}</div>
      )}
    </FixedSizeList>
  );
}
```

---

### 11.3 Vue 3 Composition API

**setup**
```typescript
import { ref, reactive, computed, watch, onMounted } from 'vue';

export default {
  setup() {
    // ref
    const count = ref(0);
    const increment = () => count.value++;
    
    // reactive
    const state = reactive({
      name: 'Tom',
      age: 18
    });
    
    // computed
    const doubled = computed(() => count.value * 2);
    
    // watch
    watch(count, (newVal, oldVal) => {
      console.log(`Count changed from ${oldVal} to ${newVal}`);
    });
    
    // 生命周期
    onMounted(() => {
      console.log('mounted');
    });
    
    return {
      count,
      increment,
      state,
      doubled
    };
  }
};
```

**组合式函数（Composable）**
```typescript
import { ref, onMounted, onUnmounted } from 'vue';

// useMousePosition
export function useMousePosition() {
  const x = ref(0);
  const y = ref(0);
  
  function update(event: MouseEvent) {
    x.value = event.pageX;
    y.value = event.pageY;
  }
  
  onMounted(() => {
    window.addEventListener('mousemove', update);
  });
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', update);
  });
  
  return { x, y };
}

// 使用
export default {
  setup() {
    const { x, y } = useMousePosition();
    return { x, y };
  }
};
```

---

### 11.4 状态管理

**Redux Toolkit**
```typescript
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => {
      state.value += 1;
    },
    decrement: state => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Store
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

// 使用
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}
```

**Zustand（轻量状态管理）**
```typescript
import create from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 }))
}));

function Counter() {
  const { count, increment } = useStore();
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

---

## 十二、工程化实践

### 12.1 模块化

**CommonJS（Node.js）**
```javascript
// 导出
module.exports = { add, subtract };
exports.multiply = multiply;

// 导入
const math = require('./math');
const { add } = require('./math');
```

**ES Module**
```javascript
// 导出
export const add = (a, b) => a + b;
export default function subtract(a, b) { return a - b; }

// 导入
import subtract, { add } from './math.js';
import * as math from './math.js';
```

**动态导入**
```javascript
// 代码分割
const LazyComponent = () => import('./LazyComponent');

// 条件加载
if (condition) {
  import('./module').then(module => {
    module.init();
  });
}
```

---

### 12.2 构建工具

**Webpack 核心概念**
```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
```

**Vite 配置**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```

---

### 12.3 代码质量

**ESLint**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
```

**Prettier**
```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Husky + lint-staged**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

### 12.4 单元测试

**Jest**
```javascript
// sum.test.js
import { sum } from './sum';

describe('sum', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
  
  test('handles negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3);
  });
});

// 异步测试
test('fetches user data', async () => {
  const data = await fetchUser(1);
  expect(data.name).toBe('Tom');
});

// Mock
jest.mock('./api');
test('calls API', () => {
  const mockFn = jest.fn();
  mockFn(1, 2);
  expect(mockFn).toHaveBeenCalledWith(1, 2);
});
```

**React Testing Library**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments counter', () => {
  render(<Counter />);
  
  const button = screen.getByText('+');
  fireEvent.click(button);
  
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

---

## 十三、浏览器 API

### 13.1 DOM 操作

**查询元素**
```javascript
// 单个元素
document.getElementById('id');
document.querySelector('.class');

// 多个元素
document.getElementsByClassName('class');
document.getElementsByTagName('div');
document.querySelectorAll('.class');
```

**创建与插入**
```javascript
// 创建元素
const div = document.createElement('div');
div.textContent = 'Hello';
div.className = 'box';

// 插入
parent.appendChild(div);
parent.insertBefore(div, reference);
parent.insertAdjacentHTML('beforeend', '<div>HTML</div>');
```

**修改与删除**
```javascript
// 修改
element.textContent = 'New text';
element.innerHTML = '<span>HTML</span>';
element.setAttribute('data-id', '123');
element.style.color = 'red';
element.classList.add('active');
element.classList.remove('inactive');
element.classList.toggle('show');

// 删除
element.remove();
parent.removeChild(element);
```

---

### 13.2 事件处理

**事件监听**
```javascript
// 添加事件
element.addEventListener('click', handler);
element.addEventListener('click', handler, { once: true });
element.addEventListener('click', handler, { capture: true });

// 移除事件
element.removeEventListener('click', handler);

// 事件对象
function handler(event) {
  event.preventDefault(); // 阻止默认行为
  event.stopPropagation(); // 阻止冒泡
  event.stopImmediatePropagation(); // 阻止其他监听器
  
  console.log(event.target); // 触发元素
  console.log(event.currentTarget); // 绑定元素
}
```

**事件委托**
```javascript
document.getElementById('list').addEventListener('click', (event) => {
  if (event.target.matches('li')) {
    console.log('Clicked:', event.target.textContent);
  }
});
```

---

### 13.3 Web Storage

**localStorage**
```javascript
// 存储
localStorage.setItem('key', 'value');
localStorage.setItem('user', JSON.stringify({ name: 'Tom' }));

// 读取
const value = localStorage.getItem('key');
const user = JSON.parse(localStorage.getItem('user'));

// 删除
localStorage.removeItem('key');
localStorage.clear();

// 监听变化（跨标签页）
window.addEventListener('storage', (event) => {
  console.log(event.key, event.oldValue, event.newValue);
});
```

**sessionStorage**
```javascript
// API 与 localStorage 相同，但关闭标签页后清除
sessionStorage.setItem('key', 'value');
```

---

### 13.4 Fetch API

**基础用法**
```javascript
// GET
fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log(data));

// POST
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Tom' })
})
  .then(response => response.json())
  .then(data => console.log(data));

// async/await
async function fetchUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

**进阶用法**
```javascript
// 中止请求
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal });
controller.abort();

// 超时处理
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// 重试
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

---

### 13.5 Intersection Observer

**图片懒加载**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

**无限滚动**
```javascript
const sentinel = document.getElementById('sentinel');

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMore();
  }
});

observer.observe(sentinel);
```

---

### 13.6 其他常用 API

**Geolocation**
```javascript
navigator.geolocation.getCurrentPosition(
  position => {
    console.log(position.coords.latitude, position.coords.longitude);
  },
  error => {
    console.error(error);
  }
);
```

**Notification**
```javascript
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Hello', {
      body: 'This is a notification',
      icon: '/icon.png'
    });
  }
});
```

**Clipboard**
```javascript
// 复制
navigator.clipboard.writeText('Hello').then(() => {
  console.log('Copied');
});

// 读取
navigator.clipboard.readText().then(text => {
  console.log(text);
});
```

---

## 十四、安全

### 14.1 XSS（跨站脚本攻击）

**原理**
```html
<!-- 用户输入 -->
<input value="<script>alert('XSS')</script>" />

<!-- 直接插入 DOM -->
<div>{userInput}</div> <!-- 危险！-->
```

**防御措施**
```javascript
// 1. 转义 HTML
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 2. 使用 textContent 而非 innerHTML
element.textContent = userInput; // 安全

// 3. CSP（Content Security Policy）
// HTTP Header
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.com

// 4. 使用框架的转义机制
// React 自动转义
<div>{userInput}</div> // 安全

// Vue 自动转义
<div>{{ userInput }}</div> // 安全

// 5. DOMPurify 清理 HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);
```

---

### 14.2 CSRF（跨站请求伪造）

**原理**
```html
<!-- 恶意网站 -->
<img src="https://bank.com/transfer?to=attacker&amount=1000" />
<!-- 利用用户已登录的 cookie -->
```

**防御措施**
```javascript
// 1. CSRF Token
// 服务端生成 token，前端每次请求携带
<input type="hidden" name="csrf_token" value="random_token" />

fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});

// 2. SameSite Cookie
Set-Cookie: session=abc123; SameSite=Strict

// 3. 验证 Referer 和 Origin
// 服务端检查请求来源
```

---

### 14.3 SQL 注入

**原理**
```javascript
// ❌ 不安全的拼接
const query = `SELECT * FROM users WHERE username = '${username}'`;
// 输入：admin' OR '1'='1
// 结果：SELECT * FROM users WHERE username = 'admin' OR '1'='1'
```

**防御措施**
```javascript
// ✅ 参数化查询（Prepared Statement）
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username]);

// ✅ ORM
User.findOne({ where: { username } });
```

---

### 14.4 点击劫持

**原理**
```html
<!-- 攻击者页面 -->
<iframe src="https://victim.com" style="opacity: 0; position: absolute;"></iframe>
<button>点击领取奖品</button>
<!-- 用户以为点击领奖，实际点击了 iframe 中的按钮 -->
```

**防御措施**
```javascript
// 1. X-Frame-Options
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN

// 2. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'self'

// 3. JavaScript 防御
if (top !== self) {
  top.location = self.location;
}
```

---

### 14.5 其他安全措施

**HTTPS**
```javascript
// 强制 HTTPS
if (location.protocol !== 'https:') {
  location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}
```

**输入验证**
```javascript
// 前端验证
function validateEmail(email) {
  return /^[\w-]+@[\w-]+\.\w+$/.test(email);
}

// 服务端验证（更重要）
// 永远不要只依赖前端验证
```

**安全存储**
```javascript
// ❌ 不要在 localStorage 存储敏感信息
localStorage.setItem('password', password); // 危险！

// ✅ 使用 HttpOnly Cookie
Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict
```

---

## 十五、经典手写题

> 详细内容请查看 [javascript-handwriting.md](./javascript-handwriting.md)

**快速索引**：
- **原理实现**：new、instanceof、call/apply/bind、Promise、深拷贝
- **工具函数**：数组去重、扁平化、LRU 缓存
- **异步处理**：并发控制、串行执行、重试
- **数据处理**：分组、路径取值、树形转换
- **DOM 事件**：事件委托、EventEmitter、懒加载

---

## 十六、高频面试问答

### 16.1 JavaScript 基础

**Q1：说说 JavaScript 的数据类型**

A：7 种基本类型（Number、String、Boolean、Null、Undefined、Symbol、BigInt）+ 引用类型（Object）。

基本类型存储在栈中，引用类型存储在堆中。可以用 `typeof`、`instanceof`、`Object.prototype.toString.call()` 判断类型。

---

**Q2：== 和 === 的区别**

A：
- `==`：相等运算符，会进行类型转换
- `===`：严格相等，不转换类型

```javascript
1 == '1'   // true（字符串转数字）
1 === '1'  // false

null == undefined  // true
null === undefined // false
```

建议：总是使用 `===`，避免隐式转换。

---

**Q3：什么是闭包？有什么应用？**

A：闭包是指函数可以访问其词法作用域外的变量。

**应用**：
1. 模块化（私有变量）
2. 柯里化
3. 防抖节流
4. 单例模式

**注意**：闭包会导致变量无法被回收，可能造成内存泄漏。

---

**Q4：原型链是什么？**

A：每个对象都有 `__proto__` 指向其构造函数的 `prototype`，形成原型链，直到 `Object.prototype.__proto__ === null`。

属性查找：先查找自身属性，找不到沿着原型链向上查找。

```javascript
obj.__proto__ === Constructor.prototype
Constructor.prototype.__proto__ === Object.prototype
Object.prototype.__proto__ === null
```

---

**Q5：说说 this 的绑定规则**

A：4 种绑定规则（优先级从低到高）：
1. 默认绑定：独立函数调用，this 指向全局对象（严格模式下是 undefined）
2. 隐式绑定：对象方法调用，this 指向该对象
3. 显式绑定：call/apply/bind，this 指向指定对象
4. new 绑定：构造函数调用，this 指向新对象

箭头函数没有自己的 this，继承外层作用域的 this。

---

### 16.2 异步编程

**Q6：Event Loop 是什么？**

A：JavaScript 是单线程的，通过 Event Loop 实现异步。

执行顺序：
1. 执行同步代码
2. 执行微任务（Promise、MutationObserver）
3. 执行宏任务（setTimeout、setInterval、I/O）
4. 重复 2-3

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 输出：1, 4, 3, 2
```

---

**Q7：Promise 有哪些状态？**

A：3 种状态：
- pending：进行中
- fulfilled：已成功
- rejected：已失败

状态只能改变一次：pending → fulfilled 或 pending → rejected。

---

**Q8：async/await 是什么？**

A：async/await 是 Promise 的语法糖，让异步代码看起来像同步代码。

- `async` 函数返回 Promise
- `await` 等待 Promise 完成

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

---

### 16.3 性能优化

**Q9：如何优化首屏加载速度？**

A：
1. **减少请求数量**：合并资源、雪碧图、懒加载
2. **减小资源体积**：压缩、Tree Shaking、代码分割
3. **利用缓存**：强缓存、协商缓存、CDN
4. **优化渲染**：SSR、预渲染、骨架屏
5. **关键资源优先**：preload、prefetch
6. **图片优化**：WebP、懒加载、响应式图片

---

**Q10：防抖和节流的区别？**

A：
- **防抖**：n 秒后执行，如果 n 秒内再次触发，则重新计时
  - 场景：搜索框输入、窗口 resize
  
- **节流**：n 秒内最多执行一次
  - 场景：滚动事件、拖拽

```javascript
// 防抖：最后一次触发后 n 秒执行
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：每 n 秒执行一次
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
```

---

### 16.4 框架相关

**Q11：React Hooks 解决了什么问题？**

A：
1. **复用状态逻辑**：自定义 Hook 代替 HOC 和 Render Props
2. **简化复杂组件**：相关逻辑可以放在一起，而不是分散在生命周期
3. **类组件的问题**：this 绑定、生命周期冗余

---

**Q12：虚拟 DOM 的优势是什么？**

A：
1. **减少 DOM 操作**：批量更新，减少重排重绘
2. **跨平台**：可以渲染到不同平台（Web、Native、SSR）
3. **函数式 UI**：UI = f(state)，声明式编程

不一定比原生 DOM 快，但提供了更好的开发体验和维护性。

---

### 16.5 工程化

**Q13：Webpack 和 Vite 的区别？**

A：
- **Webpack**：基于打包，启动时需要全量打包
- **Vite**：基于原生 ESM，开发时按需编译，启动快

Vite 适合现代浏览器开发，Webpack 生态更成熟，兼容性更好。

---

**Q14：Tree Shaking 是什么？**

A：移除未使用的代码，减小打包体积。

**条件**：
1. 使用 ES Module（静态分析）
2. production 模式
3. sideEffects 配置

```json
// package.json
{
  "sideEffects": false
}
```

---

### 16.6 浏览器与网络

**Q15：浏览器缓存策略？**

A：
1. **强缓存**：Cache-Control、Expires，不发请求
2. **协商缓存**：ETag、Last-Modified，发请求验证

```
Cache-Control: max-age=31536000  // 1年强缓存
ETag: "abc123"                   // 协商缓存
```

---

**Q16：跨域问题如何解决？**

A：
1. **CORS**：服务端设置 `Access-Control-Allow-Origin`
2. **代理**：开发环境用 webpack devServer proxy
3. **JSONP**：利用 script 标签不受同源策略限制（只支持 GET）
4. **postMessage**：iframe 跨域通信

---

### 16.7 安全

**Q17：什么是 XSS 攻击？如何防御？**

A：跨站脚本攻击，注入恶意脚本。

**防御**：
1. 转义 HTML
2. CSP（Content Security Policy）
3. HttpOnly Cookie
4. 使用框架的自动转义

---

**Q18：什么是 CSRF 攻击？如何防御？**

A：跨站请求伪造，利用用户已登录的身份发起请求。

**防御**：
1. CSRF Token
2. SameSite Cookie
3. 验证 Referer/Origin

---

## 面试技巧总结

### 回答问题的 STAR 法则

**S (Situation)** - 场景
- 描述问题背景

**T (Task)** - 任务
- 说明要解决的问题

**A (Action)** - 行动
- 详细讲解解决方案
- 突出技术选型和权衡

**R (Result)** - 结果
- 量化效果
- 总结经验

### 加分项

1. **深入原理**：不只说"用了 XX"，而要说"为什么用 XX"
2. **权衡思考**：说明不同方案的优缺点
3. **量化结果**：性能提升了多少
4. **主动提问**：面试结束前问技术栈和团队

---

## 总结

这份 JavaScript 面试指南涵盖了：

1. **基础知识**：数据类型、类型转换、闭包、原型链、this
2. **ES6+**：解构、箭头函数、Promise、Class、模块化
3. **异步编程**：Event Loop、Promise、async/await、Generator
4. **性能优化**：防抖节流、虚拟滚动、懒加载
5. **设计模式**：23 种设计模式的实现与应用
6. **TypeScript**：类型系统、泛型、工具类型
7. **框架**：React Hooks、Vue Composition API、状态管理
8. **工程化**：模块化、构建工具、代码质量、测试
9. **浏览器 API**：DOM、事件、Storage、Fetch
10. **安全**：XSS、CSRF、SQL 注入防御
11. **手写题**：50+ 经典手写题
12. **面试问答**：高频面试题与答题技巧

---

**建议**：
- 理解原理，不要死记硬背
- 结合项目经验讲解
- 准备代码演示
- 定期复习巩固

**祝面试成功！** 🎉🚀
