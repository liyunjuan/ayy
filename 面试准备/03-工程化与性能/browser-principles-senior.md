# 浏览器原理资深面试指南

## 目录
1. [浏览器架构](#1-浏览器架构)
2. [渲染机制](#2-渲染机制)
3. [JavaScript 执行](#3-javascript-执行)
4. [事件循环](#4-事件循环)
5. [网络协议](#5-网络协议)
6. [缓存机制](#6-缓存机制)
7. [安全机制](#7-安全机制)
8. [性能优化](#8-性能优化)
9. [V8 引擎](#9-v8-引擎)
10. [经典面试题](#10-经典面试题)

---

## 1. 浏览器架构

### 1.1 多进程架构

```
Chrome 多进程架构（Site Isolation）：

┌─────────────────────────────────────────────────────┐
│                   Browser Process                    │
│  (主进程：UI、网络、存储、插件管理)                    │
└─────────────────────────────────────────────────────┘
           │              │              │
    ┌──────┴──────┐ ┌────┴────┐  ┌──────┴──────┐
    │  Renderer   │ │Renderer │  │     GPU     │
    │  Process 1  │ │Process 2│  │   Process   │
    │   (Tab 1)   │ │ (Tab 2) │  │  (3D渲染)   │
    └─────────────┘ └─────────┘  └─────────────┘
           │
    ┌──────┴──────┐
    │   Plugin    │
    │   Process   │
    │  (Flash等)  │
    └─────────────┘
```

**进程类型**：

1. **Browser Process（浏览器主进程）**
   - UI 线程：绘制浏览器界面
   - 网络线程：处理网络请求
   - 存储线程：管理 Cookie、LocalStorage
   - 文件线程：处理文件访问

2. **Renderer Process（渲染进程）**
   - 主线程：JS 执行、DOM 构建、样式计算、布局、绘制
   - Compositor Thread（合成线程）：合成图层
   - Raster Thread（光栅化线程）：光栅化图层

3. **GPU Process（GPU 进程）**
   - 处理 GPU 任务
   - 3D CSS、Canvas、WebGL

4. **Plugin Process（插件进程）**
   - 运行浏览器插件

**多进程优势**：
- 稳定性：一个标签页崩溃不影响其他
- 安全性：进程隔离，沙箱机制
- 性能：利用多核 CPU

### 1.2 渲染进程内部线程

```
Renderer Process 内部：

┌─────────────────────────────────────────┐
│          Main Thread (主线程)            │
│  • JS 执行                              │
│  • DOM 解析                             │
│  • CSS 解析                             │
│  • 样式计算                             │
│  • 布局(Layout/Reflow)                  │
│  • 绘制(Paint)                          │
└─────────────────────────────────────────┘
           │
┌─────────────────────────────────────────┐
│       Compositor Thread (合成线程)       │
│  • 图层合成                             │
│  • 滚动处理                             │
│  • transform/opacity 动画               │
└─────────────────────────────────────────┘
           │
┌─────────────────────────────────────────┐
│       Raster Thread (光栅化线程池)       │
│  • 图层光栅化                           │
│  • 生成位图                             │
└─────────────────────────────────────────┘
           │
┌─────────────────────────────────────────┐
│            GPU Process                   │
│  • 显卡绘制                             │
└─────────────────────────────────────────┘
```

---

## 2. 渲染机制

### 2.1 渲染流程

```
完整渲染管道（Rendering Pipeline）：

HTML ─→ DOM Tree ┐
                  ├─→ Render Tree ─→ Layout ─→ Paint ─→ Composite
CSS ──→ CSSOM ───┘

详细步骤：
1. Parse HTML → DOM Tree
2. Parse CSS → CSSOM Tree
3. Combine → Render Tree
4. Layout (Reflow) → 计算位置尺寸
5. Paint → 绘制指令
6. Composite → 合成图层
7. Display → 显示在屏幕
```

### 2.2 DOM 树构建

```html
<!-- HTML 输入 -->
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <div id="app">
      <p>Hello</p>
    </div>
  </body>
</html>
```

```
DOM Tree 结构：

Document
  └─ html
      ├─ head
      │   └─ title
      │       └─ "Test"
      └─ body
          └─ div#app
              └─ p
                  └─ "Hello"
```

**构建过程**：
1. **字节流 → 字符流**：读取 HTML 文件
2. **字符流 → Token**：词法分析
3. **Token → Node**：构建节点
4. **Node → DOM Tree**：构建树结构

### 2.3 CSSOM 树构建

```css
/* CSS 输入 */
body {
  font-size: 16px;
}

div {
  color: blue;
}

#app {
  width: 100px;
}
```

```
CSSOM Tree 结构：

body { font-size: 16px }
  └─ div { color: blue }
      └─ #app { width: 100px }
```

### 2.4 Render Tree 构建

```
Render Tree（只包含可见元素）：

html
  └─ body { font-size: 16px }
      └─ div#app { color: blue; width: 100px }
          └─ p { color: blue; font-size: 16px }
              └─ "Hello"

注意：
• display: none 的元素不在 Render Tree 中
• visibility: hidden 的元素在 Render Tree 中
• head、script、meta 等不可见元素不在 Render Tree 中
```

### 2.5 Layout（布局/回流）

```javascript
// Layout 计算每个节点的几何信息

// 输入：Render Tree
// 输出：Layout Tree（带位置尺寸信息）

{
  tag: 'div',
  x: 0,
  y: 0,
  width: 100,
  height: 50,
  children: [
    {
      tag: 'p',
      x: 0,
      y: 0,
      width: 100,
      height: 20
    }
  ]
}
```

**触发回流的操作**：

```javascript
// 1. 修改几何属性
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
element.style.padding = '10px';
element.style.border = '1px solid';
element.style.display = 'block';
element.style.position = 'absolute';
element.style.top = '10px';
element.style.left = '10px';

// 2. 获取布局信息（强制同步布局）
element.offsetWidth;
element.offsetHeight;
element.clientWidth;
element.clientHeight;
element.scrollWidth;
element.scrollHeight;
element.getBoundingClientRect();
window.getComputedStyle();

// 3. DOM 操作
element.appendChild(child);
element.removeChild(child);
element.innerHTML = '<div>new</div>';

// 4. 窗口调整
window.resize();
window.scroll();

// 5. 字体加载
document.fonts.ready.then(() => {
  // 字体加载完成，触发回流
});
```

### 2.6 Paint（绘制）

```
Paint 阶段生成绘制指令列表（Display List）：

Display List：
1. drawRect(x: 0, y: 0, width: 100, height: 50, color: blue)
2. drawText(x: 10, y: 20, text: "Hello", font: 16px)
3. drawImage(x: 50, y: 10, image: logo.png)
```

**触发重绘的操作**：

```javascript
// 只触发重绘，不触发回流
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.visibility = 'hidden';
element.style.outline = '1px solid';
element.style.boxShadow = '0 0 10px';
element.style.borderRadius = '5px';
```

### 2.7 Composite（合成）

```
图层合成过程：

1. 分层（Layerize）
   └─ 创建 Composite Layers

2. 光栅化（Rasterize）
   └─ 将图层转为位图（Tiles）

3. 合成（Composite）
   └─ GPU 合成所有图层

4. 显示（Display）
   └─ 输出到屏幕
```

**创建独立图层的条件**：

```css
/* 1. 3D transform */
transform: translateZ(0);
transform: translate3d(0, 0, 0);

/* 2. will-change */
will-change: transform;
will-change: opacity;

/* 3. video、canvas、iframe */

/* 4. 有 transform/opacity 动画的元素 */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* 5. position: fixed */

/* 6. 滤镜 */
filter: blur(10px);

/* 7. 覆盖在合成层上的元素 */
```

**合成的优势**：

```javascript
// 只触发合成，不触发回流和重绘
element.style.transform = 'translateX(100px)';
element.style.opacity = '0.5';

// 为什么快？
// 1. 在 Compositor Thread 执行，不占用主线程
// 2. GPU 加速
// 3. 不需要重新布局和绘制
```

### 2.8 渲染优化实战

```javascript
// 1. 批量修改样式
// 差：触发多次回流
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 好：只触发一次回流
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';

// 更好：使用 class
element.className = 'new-style';

// 2. 离线 DOM 操作
// 差：触发多次回流
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div); // 每次都触发回流
}

// 好：使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment); // 只触发一次回流

// 3. 避免强制同步布局
// 差：强制同步布局（FSL）
for (let i = 0; i < 1000; i++) {
  const width = element.offsetWidth; // 读取布局
  element.style.width = width + 10 + 'px'; // 修改布局
  // 每次循环都触发回流
}

// 好：读写分离
const width = element.offsetWidth; // 先读取
for (let i = 0; i < 1000; i++) {
  element.style.width = width + 10 + 'px'; // 后修改
}

// 4. 使用 requestAnimationFrame
// 差：可能在帧中间执行
setTimeout(() => {
  element.style.transform = 'translateX(100px)';
}, 16);

// 好：在下一帧开始时执行
requestAnimationFrame(() => {
  element.style.transform = 'translateX(100px)';
});

// 5. 复杂动画使用 transform/opacity
// 差：触发回流
@keyframes move {
  from { left: 0; }
  to { left: 100px; }
}

// 好：只触发合成
@keyframes move {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

// 6. 使用 will-change 提示浏览器
.element {
  will-change: transform;
}

// 注意：不要滥用
.element:hover {
  will-change: transform; // 好：悬停时才启用
}

.every-element {
  will-change: transform; // 差：所有元素都启用
}

// 7. 使用 content-visibility 延迟渲染
.lazy-content {
  content-visibility: auto; // 视口外不渲染
}

// 8. 使用 contain 限制布局范围
.card {
  contain: layout; // 内部变化不影响外部
}
```

---

## 3. JavaScript 执行

### 3.1 执行上下文

```javascript
// 执行上下文（Execution Context）包含：
// 1. Variable Environment（变量环境）
// 2. Lexical Environment（词法环境）
// 3. this binding

// 执行上下文栈（Call Stack）
function foo() {
  console.log('foo');
  bar();
}

function bar() {
  console.log('bar');
}

foo();

// Call Stack 变化：
// 1. Global EC 入栈
// 2. foo() EC 入栈
// 3. bar() EC 入栈
// 4. bar() 执行完，EC 出栈
// 5. foo() 执行完，EC 出栈
```

### 3.2 作用域链

```javascript
// 词法作用域（Lexical Scope）
const a = 1;

function outer() {
  const b = 2;
  
  function inner() {
    const c = 3;
    console.log(a, b, c); // 1 2 3
  }
  
  inner();
}

outer();

// 作用域链：
// inner scope: { c: 3 }
//   → outer scope: { b: 2, inner: function }
//     → global scope: { a: 1, outer: function }
```

### 3.3 闭包

```javascript
// 闭包（Closure）：函数 + 词法环境

function createCounter() {
  let count = 0; // 自由变量
  
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2

// 闭包的本质：
// increment 函数引用了外部的 count 变量
// 即使 createCounter 执行完毕，count 仍然保留在内存中

// V8 实现：
// 闭包变量存储在 Context 对象中
// Context 对象存储在堆内存
```

**闭包应用**：

```javascript
// 1. 模块模式
const module = (function() {
  const privateVar = 'private';
  
  return {
    publicMethod() {
      return privateVar;
    }
  };
})();

// 2. 柯里化
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

const sum = (a, b, c) => a + b + c;
const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3)); // 6

// 3. 防抖节流
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 4. 单例模式
const singleton = (function() {
  let instance;
  
  return function() {
    if (!instance) {
      instance = { data: 'singleton' };
    }
    return instance;
  };
})();
```

### 3.4 this 绑定

```javascript
// 1. 默认绑定：全局对象（严格模式下是 undefined）
function foo() {
  console.log(this); // window (非严格模式)
}
foo();

// 2. 隐式绑定：调用对象
const obj = {
  name: 'obj',
  foo() {
    console.log(this.name);
  }
};
obj.foo(); // 'obj'

// 隐式丢失
const bar = obj.foo;
bar(); // undefined（this 指向 window）

// 3. 显式绑定：call/apply/bind
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: 'John' };
greet.call(person, 'Hello'); // "Hello, John"
greet.apply(person, ['Hi']); // "Hi, John"

const boundGreet = greet.bind(person, 'Hey');
boundGreet(); // "Hey, John"

// 4. new 绑定：新对象
function Person(name) {
  this.name = name;
}
const p = new Person('John');
console.log(p.name); // 'John'

// 5. 箭头函数：词法 this
const obj2 = {
  name: 'obj2',
  foo: () => {
    console.log(this.name); // undefined（this 继承外层）
  },
  bar() {
    const arrow = () => {
      console.log(this.name); // 'obj2'（继承 bar 的 this）
    };
    arrow();
  }
};
```

### 3.5 原型链

```javascript
// 原型链（Prototype Chain）

function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const john = new Person('John');

// 原型链：
// john
//   → john.__proto__ === Person.prototype
//     → Person.prototype.__proto__ === Object.prototype
//       → Object.prototype.__proto__ === null

// 属性查找：
john.sayHello(); // 在 Person.prototype 找到
john.toString(); // 在 Object.prototype 找到
john.nonExistent; // undefined（查到链顶端）

// new 操作符做了什么：
function myNew(Constructor, ...args) {
  // 1. 创建新对象
  const obj = {};
  
  // 2. 设置原型
  Object.setPrototypeOf(obj, Constructor.prototype);
  
  // 3. 执行构造函数
  const result = Constructor.apply(obj, args);
  
  // 4. 返回对象
  return result instanceof Object ? result : obj;
}
```

---

## 4. 事件循环

### 4.1 事件循环模型

```
┌───────────────────────────┐
│      Call Stack (调用栈)   │
│                           │
└───────────────────────────┘
            ↑
            │ 取出执行
            │
┌───────────────────────────┐
│   Microtask Queue (微任务) │
│   • Promise.then          │
│   • MutationObserver      │
│   • queueMicrotask        │
└───────────────────────────┘
            ↑
            │ 优先执行
            │
┌───────────────────────────┐
│   Macrotask Queue (宏任务) │
│   • setTimeout            │
│   • setInterval           │
│   • setImmediate (Node)   │
│   • I/O                   │
│   • UI Rendering          │
└───────────────────────────┘
```

**执行顺序**：

```
1. 执行同步代码（Call Stack）
2. 执行所有微任务（Microtask Queue）
3. 执行一个宏任务（Macrotask Queue）
4. 执行所有微任务
5. 渲染（UI Rendering）
6. 重复步骤 3-5
```

### 4.2 宏任务与微任务

```javascript
console.log('1'); // 同步

setTimeout(() => {
  console.log('2'); // 宏任务 1
  Promise.resolve().then(() => {
    console.log('3'); // 微任务 2
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4'); // 微任务 1
  setTimeout(() => {
    console.log('5'); // 宏任务 2
  }, 0);
});

console.log('6'); // 同步

// 输出顺序：1 6 4 2 3 5

// 执行过程：
// 1. 同步代码：1 6
// 2. 微任务队列：4（执行后添加宏任务 2）
// 3. 宏任务队列：2（执行后添加微任务 2）
// 4. 微任务队列：3
// 5. 宏任务队列：5
```

### 4.3 复杂示例

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout

// 解析：
// 1. 同步：script start, async1 start, async2, promise1, script end
// 2. 微任务：async1 end（await 后的代码）, promise2
// 3. 宏任务：setTimeout
```

### 4.4 requestAnimationFrame

```javascript
// rAF 在渲染前执行，不在微任务队列

console.log('1');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

requestAnimationFrame(() => {
  console.log('rAF');
});

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('2');

// 输出（可能）：1 2 promise rAF setTimeout

// 执行顺序：
// 1. 同步：1 2
// 2. 微任务：promise
// 3. 渲染前：rAF
// 4. 宏任务：setTimeout
```

### 4.5 requestIdleCallback

```javascript
// rIC 在浏览器空闲时执行

requestIdleCallback((deadline) => {
  console.log('Idle callback');
  console.log('剩余时间:', deadline.timeRemaining());
  
  // 可以检查是否有足够时间执行任务
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    performTask(tasks.shift());
  }
  
  // 如果还有任务，继续调度
  if (tasks.length > 0) {
    requestIdleCallback(callback);
  }
}, { timeout: 1000 }); // 1 秒后强制执行

// React Fiber 调度就是基于这个原理
```

### 4.6 实战：任务调度器

```javascript
class TaskScheduler {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
  }

  // 添加任务
  addTask(task, priority = 0) {
    this.tasks.push({ task, priority });
    this.tasks.sort((a, b) => b.priority - a.priority); // 优先级排序
    
    if (!this.isRunning) {
      this.schedule();
    }
  }

  // 调度任务
  schedule() {
    this.isRunning = true;
    
    requestIdleCallback((deadline) => {
      // 在空闲时执行任务
      while (deadline.timeRemaining() > 0 && this.tasks.length > 0) {
        const { task } = this.tasks.shift();
        task();
      }
      
      // 还有任务继续调度
      if (this.tasks.length > 0) {
        this.schedule();
      } else {
        this.isRunning = false;
      }
    });
  }
}

// 使用
const scheduler = new TaskScheduler();

scheduler.addTask(() => console.log('Low priority'), 1);
scheduler.addTask(() => console.log('High priority'), 10);
scheduler.addTask(() => console.log('Medium priority'), 5);

// 输出：High priority → Medium priority → Low priority
```

---

## 5. 网络协议

### 5.1 HTTP/1.1

**特点**：
- 持久连接（Keep-Alive）
- 管道化（Pipelining）
- 分块传输（Chunked Transfer）
- 缓存控制

**问题**：
- 队头阻塞（HOL Blocking）
- 无法多路复用
- 头部冗余

```javascript
// HTTP 请求示例
GET /api/users HTTP/1.1
Host: example.com
Connection: keep-alive
User-Agent: Mozilla/5.0
Accept: application/json
Cache-Control: max-age=3600

// HTTP 响应
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 123
Cache-Control: max-age=3600
ETag: "abc123"

{"users": [...]}
```

### 5.2 HTTP/2

**改进**：
- 二进制分帧（Binary Framing）
- 多路复用（Multiplexing）
- 头部压缩（HPACK）
- 服务器推送（Server Push）
- 流优先级（Stream Priority）

```
HTTP/2 帧结构：

+-----------------------------------------------+
|                 Length (24)                   |
+---------------+---------------+---------------+
|   Type (8)    |   Flags (8)   |
+-+-------------+---------------+-------------------------------+
|R|                 Stream Identifier (31)                      |
+=+=============================================================+
|                   Frame Payload (0...)                      ...
+---------------------------------------------------------------+

帧类型：
• DATA：传输数据
• HEADERS：传输头部
• PRIORITY：设置优先级
• RST_STREAM：终止流
• SETTINGS：连接配置
• PUSH_PROMISE：服务器推送
• PING：心跳检测
• GOAWAY：关闭连接
• WINDOW_UPDATE：流量控制
• CONTINUATION：延续帧
```

**多路复用**：

```
单个 TCP 连接，多个流（Stream）并行传输：

TCP Connection
  ├─ Stream 1: /index.html
  ├─ Stream 2: /style.css
  ├─ Stream 3: /script.js
  └─ Stream 4: /image.png

每个流独立，互不阻塞
```

### 5.3 HTTPS

```
HTTPS = HTTP + TLS/SSL

TLS 握手过程（TLS 1.2）：

Client                                Server
  │                                     │
  ├──── ClientHello ───────────────────→│
  │     (支持的加密套件、随机数)         │
  │                                     │
  │←──── ServerHello ───────────────────┤
  │     (选择的加密套件、随机数、证书)   │
  │                                     │
  ├──── ClientKeyExchange ─────────────→│
  │     (预主密钥，用服务器公钥加密)     │
  │                                     │
  ├──── ChangeCipherSpec ──────────────→│
  ├──── Finished ──────────────────────→│
  │                                     │
  │←──── ChangeCipherSpec ──────────────┤
  │←──── Finished ──────────────────────┤
  │                                     │
  │ Encrypted Application Data          │
  │◄────────────────────────────────────►│

TLS 1.3 简化握手（1-RTT）：

Client                                Server
  │                                     │
  ├──── ClientHello ───────────────────→│
  │     (支持的加密套件、密钥共享)       │
  │                                     │
  │←──── ServerHello ───────────────────┤
  │     (选择的套件、证书、密钥、Finished)│
  │                                     │
  ├──── Finished ──────────────────────→│
  │                                     │
  │ Encrypted Application Data          │
  │◄────────────────────────────────────►│
```

### 5.4 HTTP 状态码

```javascript
// 1xx 信息响应
100 Continue           // 继续请求
101 Switching Protocols // 切换协议

// 2xx 成功
200 OK                 // 成功
201 Created            // 已创建
204 No Content         // 无内容
206 Partial Content    // 部分内容（断点续传）

// 3xx 重定向
301 Moved Permanently  // 永久重定向
302 Found              // 临时重定向
304 Not Modified       // 未修改（缓存）
307 Temporary Redirect // 临时重定向（保持请求方法）
308 Permanent Redirect // 永久重定向（保持请求方法）

// 4xx 客户端错误
400 Bad Request        // 错误请求
401 Unauthorized       // 未授权
403 Forbidden          // 禁止访问
404 Not Found          // 未找到
405 Method Not Allowed // 方法不允许
429 Too Many Requests  // 请求过多

// 5xx 服务器错误
500 Internal Server Error // 服务器错误
502 Bad Gateway          // 网关错误
503 Service Unavailable  // 服务不可用
504 Gateway Timeout      // 网关超时
```

### 5.5 跨域

**同源策略（Same-Origin Policy）**：

```javascript
// 同源：协议 + 域名 + 端口 都相同

// 例如：https://example.com:443

// 同源
https://example.com/page1
https://example.com/page2

// 跨域
http://example.com      // 协议不同
https://api.example.com // 域名不同
https://example.com:80  // 端口不同
```

**跨域解决方案**：

```javascript
// 1. CORS（Cross-Origin Resource Sharing）

// 服务器响应头
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400

// 简单请求：GET、HEAD、POST（Content-Type 限制）
fetch('https://api.example.com/users');

// 预检请求（Preflight）：PUT、DELETE、自定义头
// 1. 先发送 OPTIONS 请求
OPTIONS /users HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Authorization

// 2. 服务器返回允许
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: DELETE
Access-Control-Allow-Headers: Authorization

// 3. 发送真实请求
DELETE /users/123 HTTP/1.1

// 2. JSONP（仅支持 GET）
function handleResponse(data) {
  console.log(data);
}

const script = document.createElement('script');
script.src = 'https://api.example.com/users?callback=handleResponse';
document.body.appendChild(script);

// 服务器返回：
handleResponse({ users: [...] });

// 3. Proxy（开发环境）
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};

// 4. nginx 反向代理（生产环境）
location /api {
  proxy_pass https://api.example.com;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}

// 5. postMessage（跨窗口通信）
// 父窗口
const iframe = document.getElementById('iframe');
iframe.contentWindow.postMessage('Hello', 'https://other.com');

// 子窗口
window.addEventListener('message', (event) => {
  if (event.origin === 'https://example.com') {
    console.log(event.data); // 'Hello'
  }
});
```

---

## 6. 缓存机制

### 6.1 强缓存

```javascript
// Expires（HTTP/1.0）
Expires: Wed, 21 Oct 2025 07:28:00 GMT
// 缺点：服务器时间和客户端时间可能不一致

// Cache-Control（HTTP/1.1，优先级更高）
Cache-Control: max-age=3600        // 3600 秒后过期
Cache-Control: no-cache            // 每次都验证
Cache-Control: no-store            // 不缓存
Cache-Control: private             // 只能被浏览器缓存
Cache-Control: public              // 可被中间代理缓存
Cache-Control: must-revalidate     // 过期后必须验证
Cache-Control: immutable           // 永不过期（适合指纹文件）

// 组合使用
Cache-Control: public, max-age=31536000, immutable
// 适合：bundle.abc123.js（带哈希的静态资源）
```

### 6.2 协商缓存

```javascript
// 1. Last-Modified / If-Modified-Since

// 第一次请求
GET /file.js HTTP/1.1

// 响应
HTTP/1.1 200 OK
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
Cache-Control: no-cache

// 第二次请求
GET /file.js HTTP/1.1
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT

// 响应（未修改）
HTTP/1.1 304 Not Modified

// 2. ETag / If-None-Match（优先级更高）

// 第一次请求
GET /file.js HTTP/1.1

// 响应
HTTP/1.1 200 OK
ETag: "abc123"
Cache-Control: no-cache

// 第二次请求
GET /file.js HTTP/1.1
If-None-Match: "abc123"

// 响应（未修改）
HTTP/1.1 304 Not Modified

// ETag 生成算法
// 1. 文件内容 hash（准确）
// 2. 文件修改时间 + 大小（快速）
```

### 6.3 缓存策略

```javascript
// 1. HTML 文件：no-cache
// index.html
Cache-Control: no-cache

// 2. 带哈希的静态资源：强缓存 + immutable
// bundle.abc123.js
Cache-Control: public, max-age=31536000, immutable

// 3. API 响应：协商缓存
// /api/users
Cache-Control: no-cache
ETag: "xyz789"

// 4. 用户数据：no-store
// /api/user/profile
Cache-Control: no-store, private

// 5. 图片/字体：强缓存 + 短期
// logo.png
Cache-Control: public, max-age=604800 // 7 天
```

### 6.4 Service Worker 缓存

```javascript
// sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中
        if (response) {
          return response;
        }
        
        // 请求网络
        return fetch(event.request).then((response) => {
          // 缓存新资源
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        });
      })
  );
});

// 更新缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 6.5 浏览器存储

```javascript
// 1. Cookie（4KB）
document.cookie = 'name=John; max-age=3600; path=/; secure; samesite=strict';

// 2. localStorage（5-10MB）
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// 3. sessionStorage（5-10MB）
sessionStorage.setItem('key', 'value');

// 4. IndexedDB（无限制，异步）
const request = indexedDB.open('MyDatabase', 1);

request.onsuccess = (event) => {
  const db = event.target.result;
  
  // 读取
  const transaction = db.transaction(['users'], 'readonly');
  const store = transaction.objectStore('users');
  const getRequest = store.get(1);
  
  getRequest.onsuccess = () => {
    console.log(getRequest.result);
  };
};

// 5. Cache API（Service Worker）
caches.open('v1').then((cache) => {
  cache.add('/index.html');
  cache.match('/index.html').then((response) => {
    console.log(response);
  });
});
```

---

## 7. 安全机制

### 7.1 XSS（跨站脚本攻击）

**类型**：

```javascript
// 1. 存储型 XSS
// 攻击者提交恶意脚本到数据库
const comment = '<script>alert(document.cookie)</script>';
// 后端存储
// 其他用户访问时执行

// 2. 反射型 XSS
// 恶意脚本在 URL 中
https://example.com/search?q=<script>alert(1)</script>
// 服务器直接返回，执行脚本

// 3. DOM 型 XSS
// 前端直接操作 DOM
const search = location.search.slice(1);
document.getElementById('result').innerHTML = search;
// 输入：<img src=x onerror=alert(1)>
```

**防御**：

```javascript
// 1. 转义 HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 2. 使用 textContent 而不是 innerHTML
element.textContent = userInput; // 安全
// element.innerHTML = userInput; // 危险

// 3. CSP（Content Security Policy）
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'

// 4. HttpOnly Cookie
Set-Cookie: sessionId=abc123; HttpOnly; Secure

// 5. 使用框架的自动转义
// React
<div>{userInput}</div> // 自动转义

// Vue
<div>{{ userInput }}</div> // 自动转义
<div v-html="userInput"></div> // 危险

// 6. 输入验证
function validateInput(input) {
  const pattern = /^[a-zA-Z0-9 ]+$/;
  return pattern.test(input);
}
```

### 7.2 CSRF（跨站请求伪造）

**攻击示例**：

```html
<!-- 攻击者网站 -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">
<!-- 用户登录了 bank.com，Cookie 会自动发送 -->
```

**防御**：

```javascript
// 1. CSRF Token
// 服务器生成 token
const csrfToken = generateToken();
res.cookie('csrfToken', csrfToken);

// 前端携带 token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.cookie.csrfToken
  },
  body: JSON.stringify({ to: 'user', amount: 100 })
});

// 服务器验证
if (req.headers['x-csrf-token'] !== req.cookies.csrfToken) {
  return res.status(403).send('Invalid CSRF token');
}

// 2. SameSite Cookie
Set-Cookie: sessionId=abc123; SameSite=Strict
// Strict: 完全禁止跨站发送
// Lax: 导航跳转允许，其他禁止
// None: 允许跨站（需要 Secure）

// 3. 验证 Referer/Origin
if (!req.headers.origin.startsWith('https://example.com')) {
  return res.status(403).send('Invalid origin');
}

// 4. 双重 Cookie 验证
// Cookie 中存一份 token
Set-Cookie: csrfToken=abc123
// 请求头中也要带一份
X-CSRF-Token: abc123
// 攻击者无法读取受害者的 Cookie
```

### 7.3 点击劫持

**攻击示例**：

```html
<!-- 攻击者网站 -->
<iframe src="https://bank.com/transfer" style="opacity: 0; position: absolute;"></iframe>
<button style="position: absolute;">点击领取奖励</button>
<!-- 用户以为点击按钮，实际点击 iframe -->
```

**防御**：

```javascript
// 1. X-Frame-Options
X-Frame-Options: DENY          // 禁止嵌入
X-Frame-Options: SAMEORIGIN    // 同源允许

// 2. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'self'

// 3. 前端检测
if (top !== self) {
  top.location = self.location; // 跳出 iframe
}
```

### 7.4 中间人攻击（MITM）

**防御**：

```javascript
// 1. HTTPS
// 强制 HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

// 2. 证书验证
// 浏览器自动验证证书链

// 3. HSTS Preload
// 提交到 HSTS preload list
// https://hstspreload.org/

// 4. 证书固定（Certificate Pinning）
// 移动端 APP 内置证书公钥
const expectedPublicKey = '...';
if (actualPublicKey !== expectedPublicKey) {
  throw new Error('Certificate mismatch');
}
```

---

## 8. 性能优化

### 8.1 加载性能

```javascript
// 1. 资源优化
// 代码分割
import(/* webpackChunkName: "lodash" */ 'lodash').then((_) => {
  console.log(_.join(['Hello', 'World'], ' '));
});

// 懒加载
const LazyComponent = React.lazy(() => import('./Component'));

// 预加载
<link rel="preload" href="critical.js" as="script">
<link rel="prefetch" href="next-page.js" as="script">
<link rel="dns-prefetch" href="//api.example.com">
<link rel="preconnect" href="//api.example.com">

// 2. 图片优化
// 响应式图片
<img srcset="small.jpg 480w, large.jpg 1024w"
     sizes="(max-width: 600px) 480px, 1024px"
     src="large.jpg">

// WebP
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg">
</picture>

// 懒加载
<img loading="lazy" src="image.jpg">

// 3. 字体优化
// font-display
@font-face {
  font-family: 'Custom';
  src: url('font.woff2');
  font-display: swap; // 立即显示后备字体
}

// 预加载
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

// 4. 关键渲染路径优化
// 内联关键 CSS
<style>
  /* 首屏样式 */
</style>

// 异步加载非关键 CSS
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">

// defer/async
<script src="script.js" defer></script>
<script src="analytics.js" async></script>

// 5. HTTP/2
// 多路复用，不需要合并文件
// 服务器推送
Link: </style.css>; rel=preload; as=style

// 6. Service Worker
// 离线缓存、预缓存
```

### 8.2 运行时性能

```javascript
// 1. 长任务分割
function processLargeArray(array) {
  let index = 0;
  
  function chunk() {
    const end = Math.min(index + 100, array.length);
    for (; index < end; index++) {
      process(array[index]);
    }
    
    if (index < array.length) {
      requestIdleCallback(chunk);
    }
  }
  
  chunk();
}

// 2. 虚拟滚动
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    
    this.render();
    container.addEventListener('scroll', () => this.render());
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleCount;
    
    const visibleItems = this.items.slice(startIndex, endIndex);
    
    this.container.innerHTML = `
      <div style="height: ${this.items.length * this.itemHeight}px">
        <div style="transform: translateY(${startIndex * this.itemHeight}px)">
          ${visibleItems.map(item => `<div>${item}</div>`).join('')}
        </div>
      </div>
    `;
  }
}

// 3. 防抖节流
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

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

// 4. Web Worker
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ data: [1, 2, 3, ...] });
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

// 5. requestAnimationFrame
function animate() {
  // 动画逻辑
  element.style.transform = `translateX(${x}px)`;
  
  if (animating) {
    requestAnimationFrame(animate);
  }
}

// 6. CSS 优化
// 使用 transform/opacity（不触发回流重绘）
.animate {
  transform: translateX(100px);
  opacity: 0.5;
  will-change: transform, opacity;
}

// 避免复杂选择器
/* 差 */
body div.container > ul li:nth-child(2) a {}

/* 好 */
.nav-link {}

// 7. 事件委托
// 差：每个元素都绑定
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

// 好：父元素委托
parent.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e);
  }
});
```

### 8.3 性能监控

```javascript
// 1. Performance API
// 页面加载时间
const timing = performance.timing;
const loadTime = timing.loadEventEnd - timing.navigationStart;
const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
const firstPaint = timing.responseEnd - timing.fetchStart;

// 2. PerformanceObserver
// LCP (Largest Contentful Paint)
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({ entryTypes: ['largest-contentful-paint'] });

// FID (First Input Delay)
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('FID:', entry.processingStart - entry.startTime);
  }
}).observe({ entryTypes: ['first-input'] });

// CLS (Cumulative Layout Shift)
let cls = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      cls += entry.value;
    }
  }
  console.log('CLS:', cls);
}).observe({ entryTypes: ['layout-shift'] });

// 3. 自定义性能指标
performance.mark('start-task');
// 执行任务
performance.mark('end-task');
performance.measure('task-duration', 'start-task', 'end-task');

const measure = performance.getEntriesByName('task-duration')[0];
console.log('Task duration:', measure.duration);

// 4. 上报性能数据
function reportPerformance() {
  const data = {
    lcp: getLCP(),
    fid: getFID(),
    cls: getCLS(),
    ttfb: performance.timing.responseStart - performance.timing.requestStart,
    domReady: timing.domContentLoadedEventEnd - timing.navigationStart
  };
  
  navigator.sendBeacon('/api/performance', JSON.stringify(data));
}

window.addEventListener('load', reportPerformance);
```

---

## 9. V8 引擎

### 9.1 V8 架构

```
V8 执行流程：

JavaScript Source Code
        ↓
    Parser (解析器)
        ↓
    AST (抽象语法树)
        ↓
    Ignition (解释器)
        ↓
    Bytecode (字节码)
        ↓ (热点代码)
    TurboFan (优化编译器)
        ↓
    Optimized Machine Code (优化后的机器码)
```

### 9.2 内存管理

```
V8 堆内存结构：

┌─────────────────────────────────────┐
│         New Space (新生代)           │
│  ┌───────────┬───────────┐          │
│  │   From    │    To     │          │
│  │  (活跃)   │ (空闲)    │          │
│  └───────────┴───────────┘          │
│         (Scavenge GC)                │
└─────────────────────────────────────┘
            ↓ 晋升
┌─────────────────────────────────────┐
│         Old Space (老生代)           │
│  • Old Pointer Space (指针对象)      │
│  • Old Data Space (数据对象)         │
│         (Mark-Sweep + Mark-Compact)  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         Large Object Space           │
│         (大对象，直接分配)            │
└─────────────────────────────────────┘
```

**垃圾回收**：

```javascript
// 1. Scavenge (新生代)
// 复制算法，From → To，交换角色

// 2. Mark-Sweep (老生代)
// 标记-清除

// 3. Mark-Compact (老生代)
// 标记-整理，解决内存碎片

// 4. Incremental Marking (增量标记)
// 分步执行，减少停顿

// 5. Concurrent Marking (并发标记)
// 后台线程标记，主线程继续执行

// 触发 GC 的时机
// • New Space 满了
// • Old Space 满了
// • 手动触发（仅 Node.js）
if (global.gc) {
  global.gc();
}
```

### 9.3 内存泄漏

```javascript
// 1. 意外的全局变量
function leak() {
  name = 'leak'; // 没有 var/let/const，变成全局变量
}

// 2. 闭包
function createLeak() {
  const largeData = new Array(1000000);
  return function() {
    console.log(largeData[0]); // 闭包引用，largeData 无法释放
  };
}

// 3. 定时器
const timer = setInterval(() => {
  const data = fetchData();
  // data 一直累积
}, 1000);
// 忘记 clearInterval(timer)

// 4. DOM 引用
const elements = [];
document.querySelectorAll('.item').forEach(el => {
  elements.push(el); // 即使 DOM 删除，elements 仍然引用
});

// 5. 事件监听
element.addEventListener('click', handler);
// 忘记 removeEventListener

// 检测内存泄漏
// 1. Chrome DevTools Memory Profiler
// 2. Heap Snapshot
// 3. Allocation Timeline

// 预防
// 1. 及时清理引用
elements.length = 0;

// 2. WeakMap/WeakSet
const weakMap = new WeakMap();
weakMap.set(obj, value); // obj 被回收时，value 也会被回收

// 3. 移除监听器
element.removeEventListener('click', handler);

// 4. 清理定时器
clearInterval(timer);
```

### 9.4 优化技巧

```javascript
// 1. 隐藏类（Hidden Class）
// 相同结构的对象共享隐藏类

// 好：顺序一致
function Point(x, y) {
  this.x = x;
  this.y = y;
}

// 差：顺序不一致
function Point(x, y) {
  this.y = y; // 顺序不同
  this.x = x;
}

// 2. 内联缓存（Inline Cache）
// 相同类型的对象访问会被优化

function getName(obj) {
  return obj.name; // 如果 obj 类型一致，会被内联
}

// 3. 避免数组类型变化
const arr = [1, 2, 3];     // PACKED_SMI_ELEMENTS (小整数)
arr.push(4.5);              // PACKED_DOUBLE_ELEMENTS (双精度浮点数)
arr.push('hello');          // PACKED_ELEMENTS (任意类型)
// 类型变化降低性能

// 4. 使用对象池
class ObjectPool {
  constructor(factory, size) {
    this.factory = factory;
    this.pool = Array.from({ length: size }, factory);
    this.inUse = new Set();
  }
  
  acquire() {
    const obj = this.pool.find(o => !this.inUse.has(o));
    if (obj) {
      this.inUse.add(obj);
      return obj;
    }
    const newObj = this.factory();
    this.pool.push(newObj);
    this.inUse.add(newObj);
    return newObj;
  }
  
  release(obj) {
    this.inUse.delete(obj);
  }
}

// 5. 使用 TypedArray
const buffer = new ArrayBuffer(1000 * 4);
const int32Array = new Int32Array(buffer);
// 比普通数组快，内存连续

// 6. 避免 delete
const obj = { a: 1, b: 2 };
delete obj.a; // 改变隐藏类，性能下降
// 改用
obj.a = undefined; // 保持隐藏类
```

---

## 10. 经典面试题

### Q1: 从输入 URL 到页面渲染，发生了什么？

```
1. DNS 解析
   • 浏览器缓存 → 系统缓存 → 路由器缓存 → ISP DNS → 根域名服务器

2. TCP 连接（三次握手）
   Client → SYN → Server
   Client ← SYN+ACK ← Server
   Client → ACK → Server

3. 发送 HTTP 请求
   • 构造请求报文
   • 发送到服务器

4. 服务器处理请求
   • 解析请求
   • 查询数据库
   • 生成响应

5. 返回 HTTP 响应
   • 状态码、头部、正文

6. 浏览器解析渲染
   • 解析 HTML → DOM 树
   • 解析 CSS → CSSOM 树
   • 合并 → Render 树
   • Layout → Paint → Composite
   • 执行 JavaScript

7. TCP 连接关闭（四次挥手）
   Client → FIN → Server
   Client ← ACK ← Server
   Client ← FIN ← Server
   Client → ACK → Server
```

### Q2: 重排（Reflow）和重绘（Repaint）的区别？

```
重排（Reflow / Layout）：
• 触发条件：几何属性变化（width、height、margin、position 等）
• 影响范围：可能影响整个文档树
• 性能开销：大

重绘（Repaint）：
• 触发条件：视觉属性变化（color、background、visibility 等）
• 影响范围：仅当前元素
• 性能开销：小

优化：
• 批量修改样式
• 使用 class 而不是逐个修改
• 离线 DOM 操作（DocumentFragment）
• 使用 transform/opacity（不触发重排重绘）
• 避免强制同步布局
```

### Q3: 如何减少首屏加载时间？

```javascript
1. 资源优化
   • 代码分割：import()
   • 懒加载：loading="lazy"
   • Tree Shaking：移除无用代码
   • 压缩：Gzip、Brotli

2. 关键渲染路径优化
   • 内联关键 CSS
   • 异步加载非关键 CSS/JS
   • defer/async
   • 预加载：preload、prefetch

3. 图片优化
   • 响应式图片：srcset
   • 现代格式：WebP、AVIF
   • 懒加载
   • CDN

4. 缓存策略
   • 强缓存：带哈希的静态资源
   • Service Worker：离线缓存

5. HTTP/2
   • 多路复用
   • 服务器推送

6. SSR/SSG
   • 服务端渲染
   • 静态生成

7. CDN
   • 就近访问
   • 减少延迟

8. 性能监控
   • LCP < 2.5s
   • FID < 100ms
   • CLS < 0.1
```

### Q4: 事件循环机制？

```
见 4.1-4.3 节
```

### Q5: V8 如何优化 JavaScript 执行？

```
见 9.1-9.4 节
```

---

## 面试技巧

### 答题思路
1. **原理题**：概念 → 原理 → 流程 → 示例
2. **优化题**：现状 → 问题 → 方案 → 效果
3. **对比题**：定义 → 区别 → 使用场景 → 最佳实践

### 常见陷阱
1. 回流一定触发重绘，重绘不一定触发回流
2. transform/opacity 只触发合成，不触发回流重绘
3. 微任务优先级高于宏任务
4. HTTP/2 不需要合并文件
5. Service Worker 运行在单独线程

### 加分项
1. 了解浏览器多进程架构
2. 熟悉 V8 优化原理
3. 有性能优化实战经验
4. 能使用 Chrome DevTools 分析性能
5. 了解最新的 Web API（如 Paint API、Layout API）
