# JavaScript 经典手写题 - 资深前端面试

> 50+ 高频手写题，涵盖原理实现、工具函数、算法应用

---

## 目录

- [一、原理实现](#一原理实现)
- [二、工具函数](#二工具函数)
- [三、异步处理](#三异步处理)
- [四、数据处理](#四数据处理)
- [五、DOM 与事件](#五dom-与事件)
- [六、算法应用](#六算法应用)

---

## 一、原理实现

### 1.1 实现 new 操作符

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
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const p = myNew(Person, 'Tom', 18);
console.log(p.name); // 'Tom'
p.sayHi(); // "Hi, I'm Tom"
console.log(p instanceof Person); // true
```

---

### 1.2 实现 instanceof

```javascript
function myInstanceof(left, right) {
  // 基本类型返回 false
  if (typeof left !== 'object' || left === null) {
    return false;
  }
  
  // 获取对象的原型
  let proto = Object.getPrototypeOf(left);
  const prototype = right.prototype;
  
  // 沿着原型链查找
  while (true) {
    if (proto === null) return false;
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
}

// 测试
console.log(myInstanceof([], Array));    // true
console.log(myInstanceof([], Object));   // true
console.log(myInstanceof({}, Array));    // false
console.log(myInstanceof(null, Object)); // false
```

---

### 1.3 实现 call

```javascript
Function.prototype.myCall = function(context, ...args) {
  // context 为 null/undefined 时，指向全局对象
  context = context || globalThis;
  
  // 创建唯一 key，避免覆盖原有属性
  const key = Symbol('fn');
  
  // 将函数设为对象的方法
  context[key] = this;
  
  // 调用方法
  const result = context[key](...args);
  
  // 删除临时属性
  delete context[key];
  
  return result;
};

// 测试
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

greet.myCall({ name: 'Tom' }, 'Hello', '!'); // "Hello, I'm Tom!"
```

---

### 1.4 实现 apply

```javascript
Function.prototype.myApply = function(context, args) {
  context = context || globalThis;
  const key = Symbol('fn');
  context[key] = this;
  
  const result = context[key](...(args || []));
  delete context[key];
  
  return result;
};

// 测试
function sum(a, b, c) {
  return a + b + c;
}

console.log(sum.myApply(null, [1, 2, 3])); // 6
```

---

### 1.5 实现 bind

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

// 测试 new
function Person(name) {
  this.name = name;
}

const BoundPerson = Person.myBind({});
const p = new BoundPerson('Jerry');
console.log(p.name); // 'Jerry'
```

---

### 1.6 实现 Object.create

```javascript
function myCreate(proto, propertiesObject) {
  // proto 必须是对象或 null
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null');
  }
  
  // 创建空函数
  function F() {}
  
  // 设置原型
  F.prototype = proto;
  
  // 创建实例
  const obj = new F();
  
  // 处理第二个参数（属性描述符）
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }
  
  return obj;
}

// 测试
const proto = { name: 'prototype' };
const obj = myCreate(proto);
console.log(obj.name); // 'prototype'
console.log(Object.getPrototypeOf(obj) === proto); // true
```

---

### 1.7 实现深拷贝

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // null 或非对象直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 函数
  if (typeof obj === 'function') {
    return obj; // 函数不需要深拷贝
  }
  
  // 循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
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

// 测试
const obj = {
  num: 1,
  str: 'hello',
  bool: true,
  null: null,
  undefined: undefined,
  symbol: Symbol('symbol'),
  date: new Date(),
  reg: /test/g,
  fn: function() {},
  arr: [1, 2, { a: 3 }],
  obj: { a: 1, b: { c: 2 } }
};

obj.circular = obj; // 循环引用

const cloned = deepClone(obj);
console.log(cloned);
console.log(cloned.circular === cloned); // true
```

---

### 1.8 实现 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
    
    return promise2;
  }
  
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    );
  }
  
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise(resolve => resolve(value));
  }
  
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }
  
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;
      
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            count++;
            if (count === promises.length) {
              resolve(results);
            }
          },
          reason => reject(reason)
        );
      });
    });
  }
  
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'));
  }
  
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
  } else {
    resolve(x);
  }
}

// 测试
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('Success'), 1000);
});

p.then(value => {
  console.log(value); // 'Success'
  return value + '!';
}).then(value => {
  console.log(value); // 'Success!'
});
```

---

### 1.9 实现 Promise.allSettled

```javascript
Promise.myAllSettled = function(promises) {
  return Promise.all(
    promises.map(promise =>
      Promise.resolve(promise)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
};

// 测试
const promises = [
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
];

Promise.myAllSettled(promises).then(results => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

---

### 1.10 实现 Promise.any

```javascript
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let count = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => resolve(value),
        reason => {
          errors[index] = reason;
          count++;
          if (count === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
};
```

---

### 1.11 实现防抖（Debounce）

```javascript
function debounce(fn, delay, options = {}) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  
  const { leading = false, trailing = true, maxWait } = options;
  
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  
  function invoke(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastArgs = lastThis = null;
    lastInvokeTime = time;
    
    return fn.apply(thisArg, args);
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
  
  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timer === null && leading) {
        return invoke(lastCallTime);
      }
      
      if (maxWait !== undefined) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          timer = null;
          if (trailing) {
            invoke(Date.now());
          }
        }, delay);
        return invoke(lastCallTime);
      }
    }
    
    if (timer === null && trailing) {
      timer = setTimeout(() => {
        timer = null;
        invoke(Date.now());
      }, delay);
    }
  }
  
  debounced.cancel = function() {
    clearTimeout(timer);
    timer = null;
    lastArgs = lastThis = null;
    lastCallTime = lastInvokeTime = 0;
  };
  
  return debounced;
}

// 测试
const log = debounce(function(text) {
  console.log(text, this.name);
}, 1000, { leading: true, trailing: true });

log.call({ name: 'Tom' }, 'Hello');
```

---

### 1.12 实现节流（Throttle）

```javascript
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

// 测试
const log = throttle(function(text) {
  console.log(text, Date.now());
}, 1000);

setInterval(() => log('Hello'), 100);
```

---

### 1.13 实现柯里化（Curry）

```javascript
function curry(fn) {
  return function curried(...args) {
    // 参数够了，执行函数
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // 参数不够，返回新函数
    else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

// 测试
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));      // 6
console.log(curriedAdd(1, 2)(3));      // 6
console.log(curriedAdd(1)(2, 3));      // 6
console.log(curriedAdd(1, 2, 3));      // 6
```

---

### 1.14 实现 compose/pipe

```javascript
// compose（从右到左）
function compose(...fns) {
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];
  
  return fns.reduce((a, b) => (...args) => a(b(...args)));
}

// pipe（从左到右）
function pipe(...fns) {
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];
  
  return fns.reduce((a, b) => (...args) => b(a(...args)));
}

// 测试
const double = x => x * 2;
const addOne = x => x + 1;
const square = x => x * x;

const fn1 = compose(square, addOne, double);
console.log(fn1(3)); // ((3 * 2) + 1)² = 49

const fn2 = pipe(double, addOne, square);
console.log(fn2(3)); // ((3 * 2) + 1)² = 49
```

---

## 二、工具函数

### 2.1 数组去重

```javascript
// 方法 1：Set
function unique1(arr) {
  return [...new Set(arr)];
}

// 方法 2：filter + indexOf
function unique2(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// 方法 3：reduce
function unique3(arr) {
  return arr.reduce((acc, item) => {
    return acc.includes(item) ? acc : [...acc, item];
  }, []);
}

// 方法 4：对象去重（支持对象）
function unique4(arr, key) {
  const map = new Map();
  return arr.filter(item => {
    const k = key ? item[key] : item;
    if (!map.has(k)) {
      map.set(k, true);
      return true;
    }
    return false;
  });
}

// 测试
console.log(unique1([1, 2, 2, 3, 3, 3])); // [1, 2, 3]
console.log(unique4([
  { id: 1, name: 'Tom' },
  { id: 2, name: 'Jerry' },
  { id: 1, name: 'Tom2' }
], 'id')); // [{ id: 1, name: 'Tom' }, { id: 2, name: 'Jerry' }]
```

---

### 2.2 数组扁平化

```javascript
// 方法 1：递归
function flatten1(arr) {
  return arr.reduce((acc, val) =>
    Array.isArray(val) ? acc.concat(flatten1(val)) : acc.concat(val),
    []
  );
}

// 方法 2：flat
function flatten2(arr, depth = Infinity) {
  return arr.flat(depth);
}

// 方法 3：toString + split（只适用于数字）
function flatten3(arr) {
  return arr.toString().split(',').map(Number);
}

// 方法 4：while + some
function flatten4(arr) {
  while (arr.some(Array.isArray)) {
    arr = [].concat(...arr);
  }
  return arr;
}

// 测试
const arr = [1, [2, [3, [4, 5]]]];
console.log(flatten1(arr)); // [1, 2, 3, 4, 5]
```

---

### 2.3 实现 JSON.stringify

```javascript
function myStringify(obj) {
  // null
  if (obj === null) {
    return 'null';
  }
  
  // undefined, function, symbol
  if (obj === undefined || typeof obj === 'function' || typeof obj === 'symbol') {
    return undefined;
  }
  
  // boolean, number, string
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return `"${obj}"`;
    }
    return String(obj);
  }
  
  // Date
  if (obj instanceof Date) {
    return `"${obj.toISOString()}"`;
  }
  
  // Array
  if (Array.isArray(obj)) {
    const arr = obj.map(item => {
      const value = myStringify(item);
      return value === undefined ? 'null' : value;
    });
    return `[${arr.join(',')}]`;
  }
  
  // Object
  const pairs = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = myStringify(obj[key]);
      if (value !== undefined) {
        pairs.push(`"${key}":${value}`);
      }
    }
  }
  return `{${pairs.join(',')}}`;
}

// 测试
console.log(myStringify({ a: 1, b: 'hello', c: [1, 2, 3], d: { e: 4 } }));
// '{"a":1,"b":"hello","c":[1,2,3],"d":{"e":4}}'
```

---

### 2.4 实现 JSON.parse

```javascript
function myParse(str) {
  return (new Function('return ' + str))();
}

// 或使用 eval（不推荐，有安全风险）
function myParse2(str) {
  return eval('(' + str + ')');
}

// 测试
console.log(myParse('{"a":1,"b":"hello"}'));
// { a: 1, b: 'hello' }
```

---

### 2.5 实现模板字符串解析

```javascript
function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : '';
  });
}

// 测试
const template = 'Hello, {{name}}! You are {{age}} years old.';
const data = { name: 'Tom', age: 18 };
console.log(render(template, data));
// 'Hello, Tom! You are 18 years old.'
```

---

### 2.6 实现 LRU 缓存

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    
    // 移到最后（最近使用）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    // 已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 添加到最后
    this.cache.set(key, value);
    
    // 超出容量，删除最老的（第一个）
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// 测试
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1)); // 1
cache.put(3, 3); // 淘汰 key 2
console.log(cache.get(2)); // -1
```

---

## 三、异步处理

### 3.1 实现 sleep

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
async function test() {
  console.log('Start');
  await sleep(2000);
  console.log('End');
}
```

---

### 3.2 实现并发控制

```javascript
class PromisePool {
  constructor(limit) {
    this.limit = limit;
    this.count = 0;
    this.queue = [];
  }
  
  async add(fn) {
    // 当前并发数达到上限，等待
    if (this.count >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.count++;
    
    try {
      return await fn();
    } finally {
      this.count--;
      
      // 唤醒等待的任务
      if (this.queue.length) {
        this.queue.shift()();
      }
    }
  }
}

// 测试
const pool = new PromisePool(2);

const tasks = Array.from({ length: 10 }, (_, i) => {
  return pool.add(async () => {
    console.log(`Task ${i} start`);
    await sleep(1000);
    console.log(`Task ${i} end`);
    return i;
  });
});

Promise.all(tasks).then(results => {
  console.log('All done:', results);
});
```

---

### 3.3 实现请求重试

```javascript
async function retry(fn, times = 3, delay = 1000) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === times - 1) {
        throw error;
      }
      await sleep(delay);
    }
  }
}

// 测试
let count = 0;
retry(async () => {
  count++;
  console.log(`Attempt ${count}`);
  if (count < 3) {
    throw new Error('Failed');
  }
  return 'Success';
}, 3, 1000).then(result => {
  console.log(result); // 'Success'
});
```

---

### 3.4 实现串行执行

```javascript
// 方法 1：async/await
async function serial(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

// 方法 2：reduce
function serial2(tasks) {
  return tasks.reduce(
    (promise, task) => promise.then(results =>
      task().then(result => [...results, result])
    ),
    Promise.resolve([])
  );
}

// 测试
const tasks = [
  () => sleep(1000).then(() => 1),
  () => sleep(500).then(() => 2),
  () => sleep(800).then(() => 3)
];

serial(tasks).then(results => {
  console.log(results); // [1, 2, 3]（按顺序）
});
```

---

### 3.5 实现 promisify

```javascript
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  };
}

// 测试（Node.js）
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);

readFileAsync('file.txt', 'utf8').then(data => {
  console.log(data);
});
```

---

## 四、数据处理

### 4.1 实现数组分组

```javascript
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
}

// 测试
const users = [
  { name: 'Tom', age: 18 },
  { name: 'Jerry', age: 20 },
  { name: 'Spike', age: 18 }
];

console.log(groupBy(users, 'age'));
// {
//   18: [{ name: 'Tom', age: 18 }, { name: 'Spike', age: 18 }],
//   20: [{ name: 'Jerry', age: 20 }]
// }
```

---

### 4.2 实现对象路径取值

```javascript
function get(obj, path, defaultValue) {
  const keys = Array.isArray(path) ? path : path.split('.');
  
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      return defaultValue;
    }
  }
  
  return result;
}

// 测试
const obj = {
  a: {
    b: {
      c: 123
    }
  }
};

console.log(get(obj, 'a.b.c')); // 123
console.log(get(obj, 'a.b.d', 'default')); // 'default'
```

---

### 4.3 实现对象路径设值

```javascript
function set(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop();
  
  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
  return obj;
}

// 测试
const obj = {};
set(obj, 'a.b.c', 123);
console.log(obj); // { a: { b: { c: 123 } } }
```

---

### 4.4 实现树形结构转换

```javascript
// 数组 → 树
function arrayToTree(arr, parentId = null) {
  return arr
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: arrayToTree(arr, item.id)
    }));
}

// 树 → 数组
function treeToArray(tree, result = []) {
  tree.forEach(node => {
    result.push(node);
    if (node.children) {
      treeToArray(node.children, result);
    }
  });
  return result;
}

// 测试
const arr = [
  { id: 1, name: 'Node 1', parentId: null },
  { id: 2, name: 'Node 2', parentId: 1 },
  { id: 3, name: 'Node 3', parentId: 1 },
  { id: 4, name: 'Node 4', parentId: 2 }
];

const tree = arrayToTree(arr);
console.log(tree);
// [
//   {
//     id: 1,
//     name: 'Node 1',
//     parentId: null,
//     children: [
//       {
//         id: 2,
//         name: 'Node 2',
//         parentId: 1,
//         children: [{ id: 4, name: 'Node 4', parentId: 2, children: [] }]
//       },
//       { id: 3, name: 'Node 3', parentId: 1, children: [] }
//     ]
//   }
// ]
```

---

### 4.5 实现对象比较

```javascript
function isEqual(obj1, obj2) {
  // 基本类型或 null
  if (obj1 === obj2) {
    return true;
  }
  
  // 类型不同
  if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null) {
    return false;
  }
  
  // 非对象类型
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }
  
  // 数组
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqual(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }
  
  // 对象
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

// 测试
console.log(isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })); // true
console.log(isEqual([1, 2, 3], [1, 2, 3])); // true
```

---

## 五、DOM 与事件

### 5.1 实现事件委托

```javascript
function delegate(element, eventType, selector, handler) {
  element.addEventListener(eventType, function(event) {
    let target = event.target;
    
    while (target && target !== element) {
      if (target.matches(selector)) {
        handler.call(target, event);
        break;
      }
      target = target.parentElement;
    }
  });
}

// 使用
delegate(document.getElementById('list'), 'click', 'li', function(event) {
  console.log('Clicked:', this.textContent);
});
```

---

### 5.2 实现 EventEmitter

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }
  
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
    return this;
  }
  
  off(event, listener) {
    if (!this.events[event]) return this;
    
    if (!listener) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => listener(...args));
    return true;
  }
}

// 测试
const emitter = new EventEmitter();
emitter.on('data', data => console.log(data));
emitter.emit('data', 'Hello'); // 'Hello'
```

---

### 5.3 实现图片懒加载

```javascript
function lazyLoad(images) {
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
}

// 使用
const images = document.querySelectorAll('img[data-src]');
lazyLoad(images);
```

---

## 六、算法应用

### 6.1 实现大数相加

```javascript
function addStrings(num1, num2) {
  let i = num1.length - 1;
  let j = num2.length - 1;
  let carry = 0;
  const result = [];
  
  while (i >= 0 || j >= 0 || carry) {
    const digit1 = i >= 0 ? Number(num1[i]) : 0;
    const digit2 = j >= 0 ? Number(num2[j]) : 0;
    
    const sum = digit1 + digit2 + carry;
    result.unshift(sum % 10);
    carry = Math.floor(sum / 10);
    
    i--;
    j--;
  }
  
  return result.join('');
}

// 测试
console.log(addStrings('123', '456')); // '579'
console.log(addStrings('999', '1')); // '1000'
```

---

### 6.2 实现版本号比较

```javascript
function compareVersion(version1, version2) {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);
  
  const maxLen = Math.max(v1.length, v2.length);
  
  for (let i = 0; i < maxLen; i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
}

// 测试
console.log(compareVersion('1.2.3', '1.2.4')); // -1
console.log(compareVersion('1.2.3', '1.2.3')); // 0
console.log(compareVersion('1.2.3', '1.2')); // 1
```

---

### 6.3 实现千分位格式化

```javascript
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 或
function formatNumber2(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

// 测试
console.log(formatNumber(1234567)); // '1,234,567'
console.log(formatNumber2(1234567.89)); // '1,234,567.89'
```

---

### 6.4 实现 URL 参数解析

```javascript
function parseQuery(url) {
  const query = url.split('?')[1];
  if (!query) return {};
  
  return query.split('&').reduce((acc, pair) => {
    const [key, value] = pair.split('=');
    acc[decodeURIComponent(key)] = decodeURIComponent(value);
    return acc;
  }, {});
}

// 测试
console.log(parseQuery('https://example.com?name=Tom&age=18'));
// { name: 'Tom', age: '18' }
```

---

### 6.5 实现驼峰与下划线转换

```javascript
// 驼峰 → 下划线
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// 下划线 → 驼峰
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// 测试
console.log(camelToSnake('helloWorld')); // 'hello_world'
console.log(snakeToCamel('hello_world')); // 'helloWorld'
```

---

### 6.6 实现斐波那契数列

```javascript
// 递归（慢）
function fib1(n) {
  if (n <= 1) return n;
  return fib1(n - 1) + fib1(n - 2);
}

// 动态规划（快）
function fib2(n) {
  if (n <= 1) return n;
  
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

// 记忆化
const fib3 = (function() {
  const cache = new Map();
  
  return function fib(n) {
    if (n <= 1) return n;
    
    if (cache.has(n)) {
      return cache.get(n);
    }
    
    const result = fib(n - 1) + fib(n - 2);
    cache.set(n, result);
    return result;
  };
})();

// 测试
console.log(fib2(10)); // 55
console.log(fib3(100)); // 354224848179262000000
```

---

## 总结

这份手写题合集涵盖了：

1. **原理实现**：new、instanceof、call/apply/bind、Promise 等
2. **工具函数**：数组去重、扁平化、LRU 缓存等
3. **异步处理**：并发控制、串行执行、重试等
4. **数据处理**：分组、路径取值、树形转换等
5. **DOM 事件**：事件委托、EventEmitter、懒加载等
6. **算法应用**：大数相加、版本号比较、驼峰转换等

建议：
- 每道题都手写一遍
- 理解原理，不要死记硬背
- 准备好变种问题的思路
- 结合实际项目经验讲解

**祝面试顺利！** 🚀
