# Node.js 资深面试指南

## 目录
1. [Node.js 基础](#1-nodejs-基础)
2. [事件循环](#2-事件循环)
3. [模块系统](#3-模块系统)
4. [文件系统](#4-文件系统)
5. [Stream 流](#5-stream-流)
6. [网络编程](#6-网络编程)
7. [Express/Koa](#7-expresskoa)
8. [数据库操作](#8-数据库操作)
9. [性能优化](#9-性能优化)
10. [经典面试题](#10-经典面试题)

---

## 1. Node.js 基础

### 1.1 什么是 Node.js

```
Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时

特点：
• 事件驱动
• 非阻塞 I/O
• 单线程（主线程）
• 轻量高效

适用场景：
✅ I/O 密集型应用（API 服务、实时应用）
✅ 前端工具链（Webpack、Vite）
✅ 微服务
❌ CPU 密集型应用（不推荐）

架构：
┌──────────────────────────┐
│    JavaScript Code       │
└──────────────────────────┘
           ↓
┌──────────────────────────┐
│      Node.js API         │
└──────────────────────────┘
           ↓
┌──────────────────────────┐
│    V8 Engine + libuv     │
└──────────────────────────┘
           ↓
┌──────────────────────────┐
│   Operating System       │
└──────────────────────────┘
```

### 1.2 全局对象

```javascript
// 1. global（全局对象）
global.myVar = 'hello';
console.log(global.myVar); // 'hello'

// 2. process（进程对象）
console.log(process.version); // Node.js 版本
console.log(process.platform); // 操作系统
console.log(process.cwd()); // 当前工作目录
console.log(process.env); // 环境变量

// 退出进程
process.exit(0); // 0 表示成功，非 0 表示失败

// 监听进程事件
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// 3. __dirname 和 __filename
console.log(__dirname); // 当前文件所在目录
console.log(__filename); // 当前文件完整路径

// 4. Buffer（缓冲区）
const buf = Buffer.from('hello');
console.log(buf); // <Buffer 68 65 6c 6c 6f>
console.log(buf.toString()); // 'hello'

// 5. setTimeout/setInterval/setImmediate
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));

// 输出顺序：nextTick → setTimeout/setImmediate
```

---

## 2. 事件循环

### 2.1 Node.js 事件循环模型

```
事件循环阶段：

   ┌───────────────────────────┐
┌─>│           timers          │ (setTimeout, setInterval)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ (系统操作回调)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ (内部使用)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ (I/O 回调)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ (setImmediate)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ (socket.on('close'))
   └───────────────────────────┘

每个阶段之间：执行 process.nextTick 和微任务
```

### 2.2 宏任务与微任务

```javascript
// 宏任务（Macrotask）
setTimeout(() => console.log('setTimeout'), 0);
setInterval(() => console.log('setInterval'), 1000);
setImmediate(() => console.log('setImmediate'));
// I/O 操作

// 微任务（Microtask）
Promise.resolve().then(() => console.log('Promise'));
process.nextTick(() => console.log('nextTick'));

// 优先级：
// process.nextTick > 微任务 > 宏任务

// 示例
console.log('1');

setTimeout(() => {
  console.log('2');
  process.nextTick(() => console.log('3'));
}, 0);

setImmediate(() => {
  console.log('4');
});

Promise.resolve().then(() => {
  console.log('5');
});

process.nextTick(() => {
  console.log('6');
});

console.log('7');

// 输出：1 7 6 5 2 3 4
// 或：  1 7 6 5 4 2 3（timers 和 check 顺序不确定）
```

### 2.3 setTimeout vs setImmediate

```javascript
// 在 I/O 回调中
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
});

// 输出：setImmediate → setTimeout
// 原因：I/O 回调后进入 check 阶段（setImmediate），然后才是 timers

// 在主模块中
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));

// 输出：不确定
// 原因：取决于进程性能
```

---

## 3. 模块系统

### 3.1 CommonJS

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// 导出方式1：module.exports
module.exports = {
  add,
  subtract
};

// 导出方式2：exports
exports.add = add;
exports.subtract = subtract;

// 注意：不能直接赋值 exports
exports = { add }; // ❌ 错误，exports 指向会改变

// main.js
const math = require('./math');
console.log(math.add(1, 2)); // 3

// 模块缓存
console.log(require.cache); // 查看缓存
delete require.cache[require.resolve('./math')]; // 清除缓存

// 循环依赖
// a.js
exports.done = false;
const b = require('./b');
console.log('在 a.js 中，b.done =', b.done);
exports.done = true;

// b.js
exports.done = false;
const a = require('./a');
console.log('在 b.js 中，a.done =', a.done);
exports.done = true;

// main.js
const a = require('./a');
const b = require('./b');
console.log('在 main.js 中，a.done =', a.done, ', b.done =', b.done);

// 输出：
// 在 b.js 中，a.done = false
// 在 a.js 中，b.done = true
// 在 main.js 中，a.done = true , b.done = true
```

### 3.2 ES Module

```javascript
// Node.js 支持 ES Module

// 方式1：.mjs 文件
// math.mjs
export function add(a, b) {
  return a + b;
}

export default function subtract(a, b) {
  return a - b;
}

// main.mjs
import subtract, { add } from './math.mjs';

// 方式2：package.json 配置
// package.json
{
  "type": "module"
}

// math.js
export function add(a, b) {
  return a + b;
}

// main.js
import { add } from './math.js';

// 互操作
// CommonJS 中导入 ES Module
import('./math.mjs').then(({ add }) => {
  console.log(add(1, 2));
});

// ES Module 中导入 CommonJS
import mathModule from './math.cjs';
// 或
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const math = require('./math');
```

---

## 4. 文件系统

### 4.1 同步与异步

```javascript
const fs = require('fs');

// 1. 异步读取（推荐）
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});

// 2. 同步读取（阻塞）
try {
  const data = fs.readFileSync('file.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error(err);
}

// 3. Promise API（Node.js 10+）
const fsPromises = require('fs').promises;

async function readFile() {
  try {
    const data = await fsPromises.readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

// 4. 写文件
fs.writeFile('output.txt', 'Hello World', (err) => {
  if (err) throw err;
  console.log('文件已保存');
});

// 5. 追加内容
fs.appendFile('log.txt', 'New log\n', (err) => {
  if (err) throw err;
});

// 6. 删除文件
fs.unlink('temp.txt', (err) => {
  if (err) throw err;
  console.log('文件已删除');
});

// 7. 重命名
fs.rename('old.txt', 'new.txt', (err) => {
  if (err) throw err;
});

// 8. 查看文件信息
fs.stat('file.txt', (err, stats) => {
  if (err) throw err;
  
  console.log(stats.isFile()); // 是否是文件
  console.log(stats.isDirectory()); // 是否是目录
  console.log(stats.size); // 文件大小（字节）
  console.log(stats.mtime); // 修改时间
});

// 9. 目录操作
// 创建目录
fs.mkdir('newDir', { recursive: true }, (err) => {
  if (err) throw err;
});

// 读取目录
fs.readdir('.', (err, files) => {
  if (err) throw err;
  console.log(files);
});

// 删除目录
fs.rmdir('oldDir', { recursive: true }, (err) => {
  if (err) throw err;
});
```

### 4.2 文件监听

```javascript
const fs = require('fs');

// 监听文件变化
fs.watch('file.txt', (eventType, filename) => {
  console.log(`事件类型: ${eventType}`);
  console.log(`文件名: ${filename}`);
});

// 监听目录变化
fs.watch('.', { recursive: true }, (eventType, filename) => {
  console.log(`${filename} 发生变化`);
});

// 更稳定的监听（使用 chokidar 库）
const chokidar = require('chokidar');

const watcher = chokidar.watch('**/*.js', {
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  persistent: true
});

watcher
  .on('add', path => console.log(`文件 ${path} 已添加`))
  .on('change', path => console.log(`文件 ${path} 已修改`))
  .on('unlink', path => console.log(`文件 ${path} 已删除`));
```

---

## 5. Stream 流

### 5.1 流的类型

```javascript
// 1. Readable（可读流）
const fs = require('fs');

const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024 // 64KB 缓冲区
});

readStream.on('data', (chunk) => {
  console.log(`接收到 ${chunk.length} 字节数据`);
});

readStream.on('end', () => {
  console.log('读取完成');
});

readStream.on('error', (err) => {
  console.error('读取错误:', err);
});

// 2. Writable（可写流）
const writeStream = fs.createWriteStream('output.txt');

writeStream.write('Hello\n');
writeStream.write('World\n');
writeStream.end(); // 结束写入

writeStream.on('finish', () => {
  console.log('写入完成');
});

// 3. Duplex（双工流）
const { Duplex } = require('stream');

const duplexStream = new Duplex({
  read(size) {
    this.push('data');
    this.push(null); // 结束
  },
  write(chunk, encoding, callback) {
    console.log(chunk.toString());
    callback();
  }
});

// 4. Transform（转换流）
const { Transform } = require('stream');

const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// 使用转换流
fs.createReadStream('input.txt')
  .pipe(upperCaseTransform)
  .pipe(fs.createWriteStream('output.txt'));
```

### 5.2 管道操作

```javascript
const fs = require('fs');
const zlib = require('zlib');

// 1. 基础管道
fs.createReadStream('input.txt')
  .pipe(fs.createWriteStream('output.txt'));

// 2. 链式管道（压缩文件）
fs.createReadStream('file.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('file.txt.gz'));

// 3. 解压缩
fs.createReadStream('file.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('file.txt'));

// 4. 管道错误处理
const pipeline = require('stream').pipeline;

pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('管道失败:', err);
    } else {
      console.log('管道成功');
    }
  }
);

// 5. 流的暂停与恢复
const readStream = fs.createReadStream('large-file.txt');

readStream.on('data', (chunk) => {
  console.log(`接收到 ${chunk.length} 字节`);
  
  // 暂停流
  readStream.pause();
  
  // 处理数据
  setTimeout(() => {
    console.log('处理完成，恢复流');
    readStream.resume();
  }, 1000);
});
```

### 5.3 自定义流

```javascript
const { Readable, Writable, Transform } = require('stream');

// 1. 自定义可读流
class MyReadable extends Readable {
  constructor(options) {
    super(options);
    this.currentIndex = 0;
    this.maxIndex = 10;
  }
  
  _read(size) {
    if (this.currentIndex < this.maxIndex) {
      this.push(`data ${this.currentIndex}\n`);
      this.currentIndex++;
    } else {
      this.push(null); // 结束
    }
  }
}

const myReadable = new MyReadable();
myReadable.pipe(process.stdout);

// 2. 自定义可写流
class MyWritable extends Writable {
  _write(chunk, encoding, callback) {
    console.log(`写入: ${chunk.toString()}`);
    callback();
  }
}

const myWritable = new MyWritable();
myReadable.pipe(myWritable);

// 3. 自定义转换流
class ReverseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const reversed = chunk.toString().split('').reverse().join('');
    this.push(reversed);
    callback();
  }
}

const reverse = new ReverseTransform();
process.stdin.pipe(reverse).pipe(process.stdout);
```

---

## 6. 网络编程

### 6.1 HTTP 服务器

```javascript
const http = require('http');

// 1. 创建服务器
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // 设置响应头
  res.setHeader('Content-Type', 'text/plain');
  
  // 路由
  if (req.url === '/') {
    res.statusCode = 200;
    res.end('Hello World');
  } else if (req.url === '/api') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'API response' }));
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// 监听端口
server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});

// 2. 处理 POST 请求
const server2 = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('接收到数据:', body);
      res.end('Data received');
    });
  } else {
    res.end('Send a POST request');
  }
});

// 3. HTTP 客户端
const options = {
  hostname: 'api.example.com',
  port: 80,
  path: '/users',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('数据:', JSON.parse(data));
  });
});

req.on('error', (err) => {
  console.error('请求失败:', err);
});

req.end();
```

### 6.2 HTTPS 服务器

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('HTTPS Server');
});

server.listen(443, () => {
  console.log('HTTPS 服务器运行在 https://localhost');
});
```

### 6.3 WebSocket

```javascript
const WebSocket = require('ws');

// 服务器
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('客户端已连接');
  
  ws.on('message', (message) => {
    console.log('收到消息:', message);
    
    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => {
    console.log('客户端已断开');
  });
  
  ws.send('欢迎连接!');
});

// 客户端
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('已连接到服务器');
  ws.send('Hello Server');
});

ws.on('message', (data) => {
  console.log('收到消息:', data);
});
```

---

## 7. Express/Koa

### 7.1 Express

```javascript
const express = require('express');
const app = express();

// 1. 中间件
app.use(express.json()); // 解析 JSON
app.use(express.urlencoded({ extended: true })); // 解析表单

// 自定义中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 2. 路由
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.post('/users', (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

// 3. 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// 4. 静态文件
app.use(express.static('public'));

// 5. 路由模块化
const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  res.json({ users: [] });
});

userRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.use('/users', userRouter);

// 6. 启动服务器
app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

### 7.2 Koa

```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

// 1. 中间件
app.use(bodyParser());

// 自定义中间件
app.use(async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`);
  await next();
});

// 2. 路由
router.get('/', async (ctx) => {
  ctx.body = 'Hello World';
});

router.get('/users/:id', async (ctx) => {
  ctx.body = { id: ctx.params.id };
});

router.post('/users', async (ctx) => {
  const user = ctx.request.body;
  ctx.status = 201;
  ctx.body = user;
});

app.use(router.routes());
app.use(router.allowedMethods());

// 3. 错误处理
app.on('error', (err, ctx) => {
  console.error('服务器错误', err, ctx);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
  }
});

// 4. 启动服务器
app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});

// Express vs Koa
// Express: 回调风格，中间件线性
// Koa: async/await，洋葱模型
```

---

## 8. 数据库操作

### 8.1 MySQL

```javascript
const mysql = require('mysql2/promise');

// 1. 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2. 查询
async function getUsers() {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
}

// 3. 参数化查询（防止 SQL 注入）
async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

// 4. 插入
async function createUser(user) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [user.name, user.email]
  );
  return result.insertId;
}

// 5. 更新
async function updateUser(id, user) {
  const [result] = await pool.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [user.name, user.email, id]
  );
  return result.affectedRows;
}

// 6. 删除
async function deleteUser(id) {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows;
}

// 7. 事务
async function transferMoney(fromId, toId, amount) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    await connection.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromId]
    );
    
    await connection.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toId]
    );
    
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
```

### 8.2 MongoDB

```javascript
const { MongoClient } = require('mongodb');

// 1. 连接数据库
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function main() {
  await client.connect();
  const db = client.db('test');
  const collection = db.collection('users');
  
  // 2. 插入
  const user = { name: 'John', age: 30 };
  const result = await collection.insertOne(user);
  console.log('插入ID:', result.insertedId);
  
  // 3. 查询
  const users = await collection.find({}).toArray();
  console.log(users);
  
  // 4. 查询单个
  const john = await collection.findOne({ name: 'John' });
  console.log(john);
  
  // 5. 更新
  await collection.updateOne(
    { name: 'John' },
    { $set: { age: 31 } }
  );
  
  // 6. 删除
  await collection.deleteOne({ name: 'John' });
  
  // 7. 聚合
  const result = await collection.aggregate([
    { $match: { age: { $gte: 18 } } },
    { $group: { _id: '$city', count: { $sum: 1 } } }
  ]).toArray();
  
  await client.close();
}

main().catch(console.error);
```

---

## 9. 性能优化

### 9.1 集群（Cluster）

```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);
  
  // 衍生工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
    cluster.fork(); // 重启
  });
} else {
  // 工作进程
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello World\n');
  }).listen(8000);
  
  console.log(`工作进程 ${process.pid} 已启动`);
}
```

### 9.2 缓存

```javascript
// 1. 内存缓存
class Cache {
  constructor() {
    this.cache = new Map();
  }
  
  set(key, value, ttl = 0) {
    const expiry = ttl > 0 ? Date.now() + ttl : 0;
    this.cache.set(key, { value, expiry });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiry > 0 && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  delete(key) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

const cache = new Cache();
cache.set('user:1', { name: 'John' }, 60000); // 60秒

// 2. Redis 缓存
const redis = require('redis');
const client = redis.createClient();

await client.connect();

await client.set('key', 'value', { EX: 60 }); // 60秒过期
const value = await client.get('key');
```

### 9.3 性能监控

```javascript
// 1. 监控事件循环延迟
const start = Date.now();
setInterval(() => {
  const delay = Date.now() - start - 1000;
  console.log(`事件循环延迟: ${delay}ms`);
}, 1000);

// 2. 监控内存使用
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`内存使用:
    RSS: ${Math.round(usage.rss / 1024 / 1024)} MB
    Heap: ${Math.round(usage.heapUsed / 1024 / 1024)} MB
  `);
}, 5000);

// 3. 监控 CPU 使用
const startUsage = process.cpuUsage();

setTimeout(() => {
  const usage = process.cpuUsage(startUsage);
  console.log(`CPU 使用:
    User: ${usage.user / 1000} ms
    System: ${usage.system / 1000} ms
  `);
}, 1000);
```

---

## 10. 经典面试题

### Q1: Node.js 适合什么场景？

```
适合：
✅ I/O 密集型应用（API 服务、聊天应用）
✅ 实时应用（WebSocket、推送）
✅ 微服务
✅ 前端工具链

不适合：
❌ CPU 密集型应用（图像处理、视频编码）
❌ 大量计算（可以用 Worker Threads 或外包给其他服务）
```

### Q2: Node.js 是单线程吗？

```
主线程是单线程的，但：
• libuv 使用线程池处理 I/O 操作
• 可以使用 Worker Threads 创建多线程
• Cluster 模块可以创建多进程
```

### Q3: 事件循环的各个阶段？

见 2.1 节

### Q4: 如何处理大文件？

```javascript
// 使用流（Stream）
const fs = require('fs');

const readStream = fs.createReadStream('large-file.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);

// 不要用这种方式：
const data = fs.readFileSync('large-file.txt'); // ❌ 占用大量内存
```

### Q5: 如何避免回调地狱？

```javascript
// 1. Promise
getData()
  .then(data => processData(data))
  .then(result => saveData(result))
  .catch(err => console.error(err));

// 2. async/await（推荐）
async function main() {
  try {
    const data = await getData();
    const result = await processData(data);
    await saveData(result);
  } catch (err) {
    console.error(err);
  }
}

// 3. Promise.all（并发）
const [users, posts] = await Promise.all([
  getUsers(),
  getPosts()
]);
```

### Q6: 如何实现进程间通信？

```javascript
// 1. IPC (Inter-Process Communication)
// parent.js
const { fork } = require('child_process');
const child = fork('child.js');

child.send({ hello: 'world' });

child.on('message', (msg) => {
  console.log('父进程收到:', msg);
});

// child.js
process.on('message', (msg) => {
  console.log('子进程收到:', msg);
  process.send({ hi: 'parent' });
});

// 2. Redis
// 3. 消息队列（RabbitMQ、Kafka）
```

### Q7: 如何处理未捕获的异常？

```javascript
// 1. 同步错误
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

// 2. Promise 错误
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

// 3. 最佳实践：在最外层捕获
async function main() {
  try {
    await app.start();
  } catch (err) {
    console.error('应用启动失败:', err);
    process.exit(1);
  }
}

main();
```

### Q8: require 和 import 的区别？

见 3.1 和 3.2 节

### Q9: 如何优化 Node.js 性能？

```
1. 使用 Cluster 多进程
2. 缓存（Redis、内存缓存）
3. 数据库连接池
4. 避免阻塞操作（使用异步API）
5. 使用流处理大文件
6. 启用 Gzip 压缩
7. CDN 加速静态资源
8. 性能监控（APM）
```

### Q10: Express 和 Koa 的区别？

见 7.1 和 7.2 节

---

## 面试技巧

### 答题思路
1. **概念题**：定义 → 原理 → 使用场景 → 示例
2. **对比题**：列举差异 → 分析原因 → 选择建议
3. **实战题**：问题分析 → 解决方案 → 代码实现

### 常见陷阱
1. 混淆浏览器和 Node.js 的事件循环
2. 不了解流的使用场景
3. 忽略错误处理
4. 不知道如何扩展 Node.js 应用

### 加分项
1. 了解 Node.js 底层（libuv、V8）
2. 有线上项目经验
3. 熟悉性能优化
4. 了解微服务架构
5. 会使用 Docker

---

**记住**：Node.js 不只是写 API，还包括工具链、实时应用、微服务等！