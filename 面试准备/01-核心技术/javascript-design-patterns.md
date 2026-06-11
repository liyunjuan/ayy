# JavaScript 设计模式 - 资深前端面试

> 23 种经典设计模式的 JavaScript 实现与应用场景

---

## 目录

- [一、创建型模式](#一创建型模式)
- [二、结构型模式](#二结构型模式)
- [三、行为型模式](#三行为型模式)
- [四、架构模式](#四架构模式)

---

## 一、创建型模式

### 1.1 单例模式（Singleton）

**定义**：保证一个类只有一个实例，并提供全局访问点

**实现方式**

**方式 1：闭包**
```javascript
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    return {
      name: 'singleton',
      getName() {
        return this.name;
      }
    };
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
console.log(s1 === s2); // true
```

**方式 2：ES6 Class**
```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
    this.name = 'singleton';
  }
  
  getName() {
    return this.name;
  }
}

const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2); // true
```

**方式 3：ES6 Module（最简单）**
```javascript
// singleton.js
class Singleton {
  constructor() {
    this.name = 'singleton';
  }
}

export default new Singleton();

// 使用
import singleton from './singleton.js';
```

**方式 4：Proxy**
```javascript
function createSingleton(className) {
  let instance;
  
  return new Proxy(className, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args);
      }
      return instance;
    }
  });
}

class Database {
  constructor() {
    this.connected = false;
  }
}

const SingletonDB = createSingleton(Database);
const db1 = new SingletonDB();
const db2 = new SingletonDB();
console.log(db1 === db2); // true
```

**应用场景**
- 全局状态管理（Redux Store、Vuex Store）
- 全局唯一的配置对象
- 数据库连接池
- 日志管理器
- 模态框管理器

**实战：全局模态框管理**
```javascript
class ModalManager {
  constructor() {
    if (ModalManager.instance) {
      return ModalManager.instance;
    }
    
    this.modals = [];
    this.currentModal = null;
    ModalManager.instance = this;
  }
  
  open(modal) {
    this.currentModal = modal;
    this.modals.push(modal);
    modal.show();
  }
  
  close() {
    if (this.currentModal) {
      this.currentModal.hide();
      this.modals.pop();
      this.currentModal = this.modals[this.modals.length - 1] || null;
    }
  }
  
  closeAll() {
    this.modals.forEach(modal => modal.hide());
    this.modals = [];
    this.currentModal = null;
  }
}

// 使用
const manager = new ModalManager();
manager.open(loginModal);
manager.open(confirmModal);
manager.close(); // 关闭 confirmModal
```

---

### 1.2 工厂模式（Factory）

**简单工厂**
```javascript
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }
}

class UserFactory {
  static createUser(name, role) {
    switch (role) {
      case 'admin':
        return new User(name, 'admin');
      case 'user':
        return new User(name, 'user');
      case 'guest':
        return new User(name, 'guest');
      default:
        throw new Error('Invalid role');
    }
  }
}

const admin = UserFactory.createUser('Tom', 'admin');
```

**工厂方法**
```javascript
// 抽象工厂
class ButtonFactory {
  createButton() {
    throw new Error('Must implement createButton');
  }
}

// 具体工厂
class IOSButtonFactory extends ButtonFactory {
  createButton() {
    return new IOSButton();
  }
}

class AndroidButtonFactory extends ButtonFactory {
  createButton() {
    return new AndroidButton();
  }
}

// 产品
class IOSButton {
  render() {
    return '<button class="ios">iOS Button</button>';
  }
}

class AndroidButton {
  render() {
    return '<button class="android">Android Button</button>';
  }
}

// 使用
function renderUI(factory) {
  const button = factory.createButton();
  document.body.innerHTML = button.render();
}

const os = getOS();
const factory = os === 'iOS' 
  ? new IOSButtonFactory() 
  : new AndroidButtonFactory();
renderUI(factory);
```

**抽象工厂**
```javascript
// 抽象工厂可以创建一系列相关产品
class UIFactory {
  createButton() {}
  createInput() {}
  createCheckbox() {}
}

class IOSUIFactory extends UIFactory {
  createButton() {
    return new IOSButton();
  }
  
  createInput() {
    return new IOSInput();
  }
  
  createCheckbox() {
    return new IOSCheckbox();
  }
}

class AndroidUIFactory extends UIFactory {
  createButton() {
    return new AndroidButton();
  }
  
  createInput() {
    return new AndroidInput();
  }
  
  createCheckbox() {
    return new AndroidCheckbox();
  }
}

// 使用
function createUI(factory) {
  return {
    button: factory.createButton(),
    input: factory.createInput(),
    checkbox: factory.createCheckbox()
  };
}
```

**应用场景**
- 组件库（根据主题创建不同风格的组件）
- 多平台适配（iOS、Android、Web）
- 日志系统（根据环境创建不同的 Logger）

---

### 1.3 建造者模式（Builder）

**定义**：分步骤创建复杂对象

```javascript
class Computer {
  constructor() {
    this.cpu = '';
    this.ram = '';
    this.storage = '';
    this.gpu = '';
  }
}

class ComputerBuilder {
  constructor() {
    this.computer = new Computer();
  }
  
  setCPU(cpu) {
    this.computer.cpu = cpu;
    return this; // 链式调用
  }
  
  setRAM(ram) {
    this.computer.ram = ram;
    return this;
  }
  
  setStorage(storage) {
    this.computer.storage = storage;
    return this;
  }
  
  setGPU(gpu) {
    this.computer.gpu = gpu;
    return this;
  }
  
  build() {
    return this.computer;
  }
}

// 使用
const computer = new ComputerBuilder()
  .setCPU('Intel i9')
  .setRAM('32GB')
  .setStorage('1TB SSD')
  .setGPU('RTX 4090')
  .build();
```

**实战：表单构建器**
```javascript
class FormBuilder {
  constructor() {
    this.fields = [];
  }
  
  addTextField(name, label, options = {}) {
    this.fields.push({
      type: 'text',
      name,
      label,
      ...options
    });
    return this;
  }
  
  addSelectField(name, label, options, config = {}) {
    this.fields.push({
      type: 'select',
      name,
      label,
      options,
      ...config
    });
    return this;
  }
  
  addCheckboxField(name, label, options = {}) {
    this.fields.push({
      type: 'checkbox',
      name,
      label,
      ...options
    });
    return this;
  }
  
  build() {
    return this.fields;
  }
}

// 使用
const formConfig = new FormBuilder()
  .addTextField('username', 'Username', { required: true })
  .addTextField('email', 'Email', { type: 'email', required: true })
  .addSelectField('country', 'Country', ['US', 'UK', 'CN'])
  .addCheckboxField('agree', 'I agree to terms')
  .build();
```

**应用场景**
- 复杂对象的创建（表单、配置、SQL 查询）
- jQuery 的链式调用
- Promise 链
- 构建工具配置（Webpack、Vite）

---

### 1.4 原型模式（Prototype）

**定义**：通过克隆现有对象创建新对象

```javascript
// 浅克隆
const prototype = {
  name: 'prototype',
  sayHi() {
    console.log(`Hi, I'm ${this.name}`);
  }
};

const clone = Object.create(prototype);
clone.name = 'clone';
clone.sayHi(); // "Hi, I'm clone"

// 深克隆
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  
  if (hash.has(obj)) return hash.get(obj);
  
  const cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return cloneObj;
}
```

**应用场景**
- 对象克隆
- 避免重复初始化
- 配置对象的复制

---

## 二、结构型模式

### 2.1 代理模式（Proxy）

**定义**：为对象提供代理，控制对对象的访问

**虚拟代理（延迟加载）**
```javascript
class Image {
  constructor(src) {
    this.src = src;
    console.log(`Loading image from ${src}`);
  }
  
  display() {
    console.log(`Displaying ${this.src}`);
  }
}

class ImageProxy {
  constructor(src) {
    this.src = src;
    this.image = null;
  }
  
  display() {
    if (!this.image) {
      this.image = new Image(this.src); // 延迟加载
    }
    this.image.display();
  }
}

// 使用
const image = new ImageProxy('photo.jpg');
// 此时图片未加载
image.display(); // 触发加载
```

**缓存代理**
```javascript
function multiply(...args) {
  return args.reduce((a, b) => a * b, 1);
}

function createCacheProxy(fn) {
  const cache = new Map();
  
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = args.join(',');
      
      if (cache.has(key)) {
        console.log('From cache');
        return cache.get(key);
      }
      
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
}

const cachedMultiply = createCacheProxy(multiply);
cachedMultiply(2, 3, 4); // 计算
cachedMultiply(2, 3, 4); // From cache
```

**保护代理（权限控制）**
```javascript
class BankAccount {
  constructor(balance) {
    this.balance = balance;
  }
  
  withdraw(amount) {
    this.balance -= amount;
    return this.balance;
  }
}

function createProtectionProxy(account, user) {
  return new Proxy(account, {
    get(target, prop) {
      if (prop === 'withdraw' && user.role !== 'admin') {
        throw new Error('Access denied');
      }
      return Reflect.get(target, prop);
    }
  });
}

const account = new BankAccount(1000);
const userAccount = createProtectionProxy(account, { role: 'user' });
userAccount.withdraw(100); // Error: Access denied
```

**应用场景**
- 图片懒加载
- 接口缓存
- 权限控制
- Vue 3 响应式系统
- ES6 Proxy

---

### 2.2 装饰器模式（Decorator）

**定义**：动态给对象添加额外功能

**函数装饰器**
```javascript
// 日志装饰器
function log(target, name, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    console.log(`Calling ${name} with`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
  
  return descriptor;
}

// 性能测试装饰器
function measure(target, name, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    const start = performance.now();
    const result = original.apply(this, args);
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  @measure
  add(a, b) {
    return a + b;
  }
}
```

**AOP（面向切面编程）**
```javascript
Function.prototype.before = function(beforeFn) {
  const self = this;
  return function(...args) {
    beforeFn.apply(this, args);
    return self.apply(this, args);
  };
};

Function.prototype.after = function(afterFn) {
  const self = this;
  return function(...args) {
    const result = self.apply(this, args);
    afterFn.apply(this, args);
    return result;
  };
};

// 使用
function request(url) {
  console.log(`Requesting ${url}`);
}

const enhancedRequest = request
  .before(() => console.log('Before request'))
  .after(() => console.log('After request'));

enhancedRequest('/api/data');
// Before request
// Requesting /api/data
// After request
```

**React 高阶组件（HOC）**
```javascript
// withLoading HOC
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <Component {...props} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);

<UserListWithLoading isLoading={loading} users={users} />
```

**应用场景**
- 日志记录
- 性能监控
- 权限验证
- 缓存
- React HOC
- TypeScript/ES7 装饰器

---

### 2.3 适配器模式（Adapter）

**定义**：将一个接口转换成另一个接口

```javascript
// 旧接口
class OldApi {
  request(url) {
    return fetch(url).then(res => res.json());
  }
}

// 新接口要求
class NewApi {
  get(url) {}
  post(url, data) {}
}

// 适配器
class ApiAdapter extends NewApi {
  constructor() {
    super();
    this.oldApi = new OldApi();
  }
  
  get(url) {
    return this.oldApi.request(url);
  }
  
  post(url, data) {
    return this.oldApi.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// 使用
const api = new ApiAdapter();
api.get('/api/users');
```

**实战：统一不同库的接口**
```javascript
// 适配 jQuery 和原生 DOM
class DOMAdapter {
  constructor(selector) {
    if (typeof $ !== 'undefined') {
      this.element = $(selector);
      this.isJQuery = true;
    } else {
      this.element = document.querySelector(selector);
      this.isJQuery = false;
    }
  }
  
  on(event, handler) {
    if (this.isJQuery) {
      this.element.on(event, handler);
    } else {
      this.element.addEventListener(event, handler);
    }
  }
  
  css(prop, value) {
    if (this.isJQuery) {
      this.element.css(prop, value);
    } else {
      this.element.style[prop] = value;
    }
  }
}

// 使用
const btn = new DOMAdapter('#btn');
btn.on('click', () => {});
btn.css('color', 'red');
```

**应用场景**
- 整合第三方库
- 统一接口
- 兼容旧代码
- axios 适配器（适配浏览器和 Node.js）

---

### 2.4 外观模式（Facade）

**定义**：为复杂子系统提供简单接口

```javascript
// 复杂子系统
class CPU {
  start() {
    console.log('CPU started');
  }
}

class Memory {
  load() {
    console.log('Memory loaded');
  }
}

class HardDrive {
  read() {
    console.log('Hard drive read');
  }
}

// 外观
class Computer {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }
  
  start() {
    this.cpu.start();
    this.memory.load();
    this.hardDrive.read();
    console.log('Computer started');
  }
}

// 使用
const computer = new Computer();
computer.start(); // 一键启动，隐藏复杂性
```

**实战：封装复杂的 API 调用**
```javascript
class ApiFacade {
  async getUserWithPosts(userId) {
    // 隐藏了多个 API 调用的复杂性
    const user = await fetch(`/api/users/${userId}`).then(r => r.json());
    const posts = await fetch(`/api/posts?userId=${userId}`).then(r => r.json());
    const comments = await fetch(`/api/comments?userId=${userId}`).then(r => r.json());
    
    return {
      ...user,
      posts,
      comments
    };
  }
}

// 使用
const api = new ApiFacade();
const data = await api.getUserWithPosts(123);
```

**应用场景**
- jQuery（简化 DOM 操作）
- 封装复杂的业务逻辑
- SDK 设计

---

### 2.5 组合模式（Composite）

**定义**：将对象组合成树形结构，统一对待单个对象和组合对象

```javascript
// 文件系统示例
class File {
  constructor(name) {
    this.name = name;
  }
  
  display(indent = 0) {
    console.log(' '.repeat(indent) + this.name);
  }
}

class Folder {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
  
  add(child) {
    this.children.push(child);
  }
  
  remove(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }
  
  display(indent = 0) {
    console.log(' '.repeat(indent) + this.name);
    this.children.forEach(child => child.display(indent + 2));
  }
}

// 使用
const root = new Folder('root');
const home = new Folder('home');
const user = new Folder('user');

const file1 = new File('file1.txt');
const file2 = new File('file2.txt');

user.add(file1);
user.add(file2);
home.add(user);
root.add(home);

root.display();
// root
//   home
//     user
//       file1.txt
//       file2.txt
```

**React 组件树**
```javascript
function Component({ children }) {
  return <div className="component">{children}</div>;
}

<Component>
  <Component>
    <Component />
  </Component>
  <Component />
</Component>
```

**应用场景**
- 文件系统
- DOM 树
- React 组件树
- 菜单树
- 组织架构树

---

## 三、行为型模式

### 3.1 观察者模式（Observer）

**定义**：定义对象间一对多的依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  
  addObserver(observer) {
    this.observers.push(observer);
  }
  
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  
  update(data) {
    console.log(`${this.name} received:`, data);
  }
}

// 使用
const subject = new Subject();
const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');

subject.addObserver(observer1);
subject.addObserver(observer2);

subject.notify('Hello'); // 两个观察者都收到通知
```

**EventEmitter 实现**
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
  }
  
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
  
  off(event, listener) {
    if (!this.events[event]) return;
    
    if (!listener) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

// 使用
const emitter = new EventEmitter();
emitter.on('data', data => console.log(data));
emitter.emit('data', 'Hello');
```

**应用场景**
- DOM 事件
- Vue 响应式系统
- Redux/Vuex
- Node.js EventEmitter
- WebSocket 消息推送

---

### 3.2 发布-订阅模式（Pub-Sub）

**定义**：与观察者模式类似，但有一个事件中心，发布者和订阅者不直接通信

```javascript
class PubSub {
  constructor() {
    this.events = {};
  }
  
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // 返回取消订阅函数
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }
  
  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

// 全局单例
const pubsub = new PubSub();

// 使用
const unsubscribe = pubsub.subscribe('user:login', user => {
  console.log('User logged in:', user);
});

pubsub.publish('user:login', { name: 'Tom' });
unsubscribe(); // 取消订阅
```

**应用场景**
- 跨组件通信
- 事件总线
- 消息队列
- 模块解耦

---

### 3.3 策略模式（Strategy）

**定义**：定义一系列算法，封装起来，使它们可以互换

```javascript
// 表单验证示例
const strategies = {
  required(value, errorMsg) {
    if (value === '') {
      return errorMsg;
    }
  },
  
  minLength(value, length, errorMsg) {
    if (value.length < length) {
      return errorMsg;
    }
  },
  
  isEmail(value, errorMsg) {
    if (!/^[\w-]+@[\w-]+\.\w+$/.test(value)) {
      return errorMsg;
    }
  }
};

class Validator {
  constructor() {
    this.rules = [];
  }
  
  add(value, rule, errorMsg) {
    const [strategyName, ...params] = rule.split(':');
    
    this.rules.push(() => {
      const strategy = strategies[strategyName];
      return strategy(value, ...params, errorMsg);
    });
  }
  
  validate() {
    for (const rule of this.rules) {
      const error = rule();
      if (error) {
        return error;
      }
    }
  }
}

// 使用
const validator = new Validator();
validator.add('', 'required', 'Username is required');
validator.add('abc', 'minLength:6', 'Username must be at least 6 characters');
validator.add('abc', 'isEmail', 'Invalid email');

const error = validator.validate();
console.log(error); // 'Username is required'
```

**实战：支付方式**
```javascript
class PaymentStrategy {
  pay(amount) {
    throw new Error('Must implement pay method');
  }
}

class CreditCardPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} using Credit Card`);
  }
}

class PayPalPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} using PayPal`);
  }
}

class AlipayPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} using Alipay`);
  }
}

class PaymentContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  pay(amount) {
    this.strategy.pay(amount);
  }
}

// 使用
const payment = new PaymentContext(new CreditCardPayment());
payment.pay(100);

payment.setStrategy(new PayPalPayment());
payment.pay(200);
```

**应用场景**
- 表单验证
- 支付方式选择
- 排序算法选择
- 图表类型切换

---

### 3.4 命令模式（Command）

**定义**：将请求封装成对象，从而使你可用不同的请求对客户进行参数化

```javascript
// 文本编辑器示例
class Command {
  execute() {}
  undo() {}
}

class InsertCommand extends Command {
  constructor(receiver, text) {
    super();
    this.receiver = receiver;
    this.text = text;
  }
  
  execute() {
    this.receiver.insert(this.text);
  }
  
  undo() {
    this.receiver.delete(this.text.length);
  }
}

class DeleteCommand extends Command {
  constructor(receiver, length) {
    super();
    this.receiver = receiver;
    this.length = length;
    this.deleted = '';
  }
  
  execute() {
    this.deleted = this.receiver.content.slice(-this.length);
    this.receiver.delete(this.length);
  }
  
  undo() {
    this.receiver.insert(this.deleted);
  }
}

class Editor {
  constructor() {
    this.content = '';
    this.history = [];
    this.current = -1;
  }
  
  insert(text) {
    this.content += text;
  }
  
  delete(length) {
    this.content = this.content.slice(0, -length);
  }
  
  executeCommand(command) {
    command.execute();
    this.history = this.history.slice(0, this.current + 1);
    this.history.push(command);
    this.current++;
  }
  
  undo() {
    if (this.current >= 0) {
      this.history[this.current].undo();
      this.current--;
    }
  }
  
  redo() {
    if (this.current < this.history.length - 1) {
      this.current++;
      this.history[this.current].execute();
    }
  }
}

// 使用
const editor = new Editor();
editor.executeCommand(new InsertCommand(editor, 'Hello'));
editor.executeCommand(new InsertCommand(editor, ' World'));
console.log(editor.content); // 'Hello World'

editor.undo();
console.log(editor.content); // 'Hello'

editor.redo();
console.log(editor.content); // 'Hello World'
```

**应用场景**
- 撤销/重做功能
- 宏命令（批量操作）
- 事务系统
- 请求队列

---

### 3.5 迭代器模式（Iterator）

**定义**：提供一种方法顺序访问聚合对象中的各个元素

```javascript
// 自定义迭代器
class Iterator {
  constructor(items) {
    this.items = items;
    this.index = 0;
  }
  
  hasNext() {
    return this.index < this.items.length;
  }
  
  next() {
    return this.items[this.index++];
  }
}

// 使用
const iterator = new Iterator([1, 2, 3]);
while (iterator.hasNext()) {
  console.log(iterator.next());
}

// ES6 迭代器协议
class MyIterable {
  constructor(data) {
    this.data = data;
  }
  
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;
    
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
}

// 使用
const iterable = new MyIterable([1, 2, 3]);
for (const value of iterable) {
  console.log(value);
}
```

**应用场景**
- 数组遍历
- Generator 函数
- for...of 循环
- 自定义数据结构遍历

---

### 3.6 中介者模式（Mediator）

**定义**：用一个中介对象封装一系列对象交互

```javascript
// 聊天室示例
class ChatRoom {
  constructor() {
    this.users = {};
  }
  
  register(user) {
    this.users[user.name] = user;
    user.chatRoom = this;
  }
  
  send(message, from, to) {
    if (to) {
      // 私聊
      to.receive(message, from);
    } else {
      // 群聊
      Object.values(this.users).forEach(user => {
        if (user !== from) {
          user.receive(message, from);
        }
      });
    }
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }
  
  send(message, to) {
    this.chatRoom.send(message, this, to);
  }
  
  receive(message, from) {
    console.log(`${from.name} to ${this.name}: ${message}`);
  }
}

// 使用
const chatRoom = new ChatRoom();

const tom = new User('Tom');
const jerry = new User('Jerry');
const spike = new User('Spike');

chatRoom.register(tom);
chatRoom.register(jerry);
chatRoom.register(spike);

tom.send('Hello everyone!'); // 群发
jerry.send('Hi Tom!', tom);   // 私聊
```

**应用场景**
- 聊天室
- 状态管理（Redux、MobX）
- 表单验证
- 航空管制系统

---

### 3.7 状态模式（State）

**定义**：允许对象在内部状态改变时改变它的行为

```javascript
// 订单状态机
class OrderState {
  constructor(order) {
    this.order = order;
  }
  
  cancel() {
    throw new Error('Cannot cancel in this state');
  }
  
  pay() {
    throw new Error('Cannot pay in this state');
  }
  
  ship() {
    throw new Error('Cannot ship in this state');
  }
  
  complete() {
    throw new Error('Cannot complete in this state');
  }
}

class PendingState extends OrderState {
  pay() {
    console.log('Order paid');
    this.order.setState(new PaidState(this.order));
  }
  
  cancel() {
    console.log('Order cancelled');
    this.order.setState(new CancelledState(this.order));
  }
}

class PaidState extends OrderState {
  ship() {
    console.log('Order shipped');
    this.order.setState(new ShippedState(this.order));
  }
}

class ShippedState extends OrderState {
  complete() {
    console.log('Order completed');
    this.order.setState(new CompletedState(this.order));
  }
}

class CancelledState extends OrderState {}
class CompletedState extends OrderState {}

class Order {
  constructor() {
    this.state = new PendingState(this);
  }
  
  setState(state) {
    this.state = state;
  }
  
  cancel() {
    this.state.cancel();
  }
  
  pay() {
    this.state.pay();
  }
  
  ship() {
    this.state.ship();
  }
  
  complete() {
    this.state.complete();
  }
}

// 使用
const order = new Order();
order.pay();      // Order paid
order.ship();     // Order shipped
order.complete(); // Order completed
```

**应用场景**
- 状态机
- 游戏角色状态
- TCP 连接状态
- 订单流程

---

### 3.8 责任链模式（Chain of Responsibility）

**定义**：为请求创建一个处理者对象链

```javascript
// 请求审批流程
class Handler {
  constructor() {
    this.successor = null;
  }
  
  setSuccessor(handler) {
    this.successor = handler;
    return handler; // 支持链式调用
  }
  
  handle(request) {
    if (this.successor) {
      return this.successor.handle(request);
    }
    return false;
  }
}

class TeamLeader extends Handler {
  handle(request) {
    if (request.amount <= 1000) {
      console.log('Team Leader approved');
      return true;
    }
    return super.handle(request);
  }
}

class Manager extends Handler {
  handle(request) {
    if (request.amount <= 5000) {
      console.log('Manager approved');
      return true;
    }
    return super.handle(request);
  }
}

class Director extends Handler {
  handle(request) {
    if (request.amount <= 10000) {
      console.log('Director approved');
      return true;
    }
    console.log('Request denied');
    return false;
  }
}

// 使用
const teamLeader = new TeamLeader();
const manager = new Manager();
const director = new Director();

teamLeader.setSuccessor(manager).setSuccessor(director);

teamLeader.handle({ amount: 500 });   // Team Leader approved
teamLeader.handle({ amount: 3000 });  // Manager approved
teamLeader.handle({ amount: 8000 });  // Director approved
teamLeader.handle({ amount: 15000 }); // Request denied
```

**中间件模式（Express/Koa）**
```javascript
class Middleware {
  constructor() {
    this.middlewares = [];
  }
  
  use(fn) {
    this.middlewares.push(fn);
  }
  
  async execute(context) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        await this.middlewares[index++](context, next);
      }
    };
    
    await next();
  }
}

// 使用
const app = new Middleware();

app.use(async (ctx, next) => {
  console.log('Middleware 1 start');
  await next();
  console.log('Middleware 1 end');
});

app.use(async (ctx, next) => {
  console.log('Middleware 2 start');
  await next();
  console.log('Middleware 2 end');
});

app.execute({});
// Middleware 1 start
// Middleware 2 start
// Middleware 2 end
// Middleware 1 end
```

**应用场景**
- 审批流程
- Express/Koa 中间件
- 异常处理
- 日志记录

---

## 四、架构模式

### 4.1 MVC（Model-View-Controller）

```javascript
// Model
class TodoModel {
  constructor() {
    this.todos = [];
    this.listeners = [];
  }
  
  addTodo(text) {
    this.todos.push({ id: Date.now(), text, completed: false });
    this.notify();
  }
  
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.notify();
    }
  }
  
  removeTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.notify();
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
  }
  
  notify() {
    this.listeners.forEach(listener => listener(this.todos));
  }
}

// View
class TodoView {
  constructor() {
    this.input = document.getElementById('todo-input');
    this.list = document.getElementById('todo-list');
    this.addBtn = document.getElementById('add-btn');
  }
  
  render(todos) {
    this.list.innerHTML = todos.map(todo => `
      <li data-id="${todo.id}">
        <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
        <button class="toggle">Toggle</button>
        <button class="delete">Delete</button>
      </li>
    `).join('');
  }
  
  bindAddTodo(handler) {
    this.addBtn.addEventListener('click', () => {
      handler(this.input.value);
      this.input.value = '';
    });
  }
  
  bindToggleTodo(handler) {
    this.list.addEventListener('click', e => {
      if (e.target.classList.contains('toggle')) {
        const id = Number(e.target.closest('li').dataset.id);
        handler(id);
      }
    });
  }
  
  bindRemoveTodo(handler) {
    this.list.addEventListener('click', e => {
      if (e.target.classList.contains('delete')) {
        const id = Number(e.target.closest('li').dataset.id);
        handler(id);
      }
    });
  }
}

// Controller
class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    
    this.model.subscribe(todos => this.view.render(todos));
    
    this.view.bindAddTodo(text => this.model.addTodo(text));
    this.view.bindToggleTodo(id => this.model.toggleTodo(id));
    this.view.bindRemoveTodo(id => this.model.removeTodo(id));
  }
}

// 使用
const model = new TodoModel();
const view = new TodoView();
const controller = new TodoController(model, view);
```

---

### 4.2 MVVM（Model-View-ViewModel）

**Vue.js 实现原理简化版**
```javascript
class MVVM {
  constructor(options) {
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods = options.methods;
    
    // 数据劫持
    this.observe(this.$data);
    
    // 编译模板
    this.compile(this.$el);
  }
  
  observe(data) {
    Object.keys(data).forEach(key => {
      let value = data[key];
      const dep = new Dep();
      
      Object.defineProperty(data, key, {
        get() {
          if (Dep.target) {
            dep.addSub(Dep.target);
          }
          return value;
        },
        set(newValue) {
          if (value !== newValue) {
            value = newValue;
            dep.notify();
          }
        }
      });
    });
  }
  
  compile(el) {
    const nodes = el.childNodes;
    
    nodes.forEach(node => {
      if (node.nodeType === 3) {
        // 文本节点
        const text = node.textContent;
        const reg = /\{\{(.*?)\}\}/g;
        
        if (reg.test(text)) {
          const key = RegExp.$1.trim();
          node.textContent = text.replace(reg, this.$data[key]);
          
          new Watcher(this.$data, key, value => {
            node.textContent = text.replace(reg, value);
          });
        }
      }
      
      if (node.nodeType === 1) {
        // 元素节点
        const attrs = node.attributes;
        
        Array.from(attrs).forEach(attr => {
          if (attr.name === 'v-model') {
            const key = attr.value;
            node.value = this.$data[key];
            
            node.addEventListener('input', e => {
              this.$data[key] = e.target.value;
            });
            
            new Watcher(this.$data, key, value => {
              node.value = value;
            });
          }
        });
      }
    });
  }
}

class Dep {
  constructor() {
    this.subs = [];
  }
  
  addSub(watcher) {
    this.subs.push(watcher);
  }
  
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

class Watcher {
  constructor(data, key, cb) {
    this.data = data;
    this.key = key;
    this.cb = cb;
    
    Dep.target = this;
    this.data[this.key]; // 触发 getter，添加依赖
    Dep.target = null;
  }
  
  update() {
    this.cb(this.data[this.key]);
  }
}

// 使用
new MVVM({
  el: '#app',
  data: {
    message: 'Hello MVVM'
  }
});
```

---

### 4.3 Flux/Redux

```javascript
// Store
class Store {
  constructor(reducer, initialState = {}) {
    this.state = initialState;
    this.reducer = reducer;
    this.listeners = [];
  }
  
  getState() {
    return this.state;
  }
  
  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener());
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

// 使用
const store = new Store(counterReducer);

store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch({ type: 'INCREMENT' }); // { count: 1 }
store.dispatch({ type: 'INCREMENT' }); // { count: 2 }
store.dispatch({ type: 'DECREMENT' }); // { count: 1 }
```

---

## 总结

### 设计模式选择指南

| 场景 | 推荐模式 |
|------|----------|
| 全局唯一对象 | 单例模式 |
| 创建复杂对象 | 工厂模式、建造者模式 |
| 对象克隆 | 原型模式 |
| 对象访问控制 | 代理模式 |
| 动态添加功能 | 装饰器模式 |
| 接口转换 | 适配器模式 |
| 简化接口 | 外观模式 |
| 树形结构 | 组合模式 |
| 对象间通信 | 观察者模式、发布订阅 |
| 算法切换 | 策略模式 |
| 撤销/重做 | 命令模式 |
| 顺序访问 | 迭代器模式 |
| 对象解耦 | 中介者模式 |
| 状态管理 | 状态模式 |
| 请求处理链 | 责任链模式 |

### 面试高频问题

1. **观察者模式 vs 发布订阅模式的区别？**
   - 观察者模式：主题和观察者直接通信
   - 发布订阅：通过事件中心通信，解耦更彻底

2. **装饰器模式 vs 代理模式的区别？**
   - 装饰器：增强功能
   - 代理：控制访问

3. **工厂模式的优缺点？**
   - 优点：解耦、易扩展
   - 缺点：增加复杂度

4. **说说 React/Vue 中用到的设计模式**
   - 单例：Store
   - 工厂：createElement
   - 观察者：响应式系统
   - 代理：Proxy 响应式
   - 组合：组件树
   - 高阶组件：装饰器模式

---

**设计模式是前端架构的基础，理解并应用好设计模式能写出更优雅、可维护的代码！** 🎯
