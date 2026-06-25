# HTTP 与 HTTPS 深度解析

> 网络协议核心知识 - 从原理到实战，覆盖加密、证书、性能优化、安全防护

**最后更新**: 2026-06-23  
**适用人群**: 5年+ 前端/后端工程师

---

## 📋 目录

- [1. HTTP vs HTTPS 核心对比](#1-http-vs-https-核心对比)
- [2. HTTP 基础](#2-http-基础)
- [3. HTTPS 原理](#3-https-原理)
- [4. SSL/TLS 握手过程](#4-ssltls-握手过程)
- [5. 数字证书机制](#5-数字证书机制)
- [6. 常见攻击与防御](#6-常见攻击与防御)
- [7. 性能优化](#7-性能优化)
- [8. 前端实践](#8-前端实践)
- [9. 面试高频问答](#9-面试高频问答)
- [10. 实战案例](#10-实战案例)

---

## 1. HTTP vs HTTPS 核心对比

| 特性 | HTTP | HTTPS |
|------|------|-------|
| **全称** | HyperText Transfer Protocol | HTTP Secure |
| **端口** | 80 | 443 |
| **安全性** | 明文传输，不安全 | 加密传输，安全 |
| **加密** | 无 | SSL/TLS 加密 |
| **证书** | 不需要 | 需要 CA 证书 |
| **速度** | 快 | 稍慢（加密开销） |
| **SEO** | 无加分 | Google 优先排名 |
| **成本** | 免费 | 证书费用（Let's Encrypt 免费）|
| **数据完整性** | 无法保证 | 数字签名保证 |
| **身份验证** | 无 | 证书验证服务器身份 |

---

## 2. HTTP 基础

### 2.1 工作原理

```
客户端（浏览器）           服务器
    │                        │
    │  ① TCP 三次握手        │
    │─────────────────────>  │
    │  SYN                   │
    │  <─────────────────────│
    │  SYN + ACK             │
    │─────────────────────>  │
    │  ACK                   │
    │                        │
    │  ② HTTP 请求           │
    │─────────────────────>  │
    │  GET /index.html       │
    │                        │
    │  ③ HTTP 响应           │
    │  <─────────────────────│
    │  200 OK + HTML         │
    │                        │
    │  ④ TCP 四次挥手        │
    │─────────────────────>  │
    │  FIN                   │
    │  <─────────────────────│
    │  ACK                   │
    │  <─────────────────────│
    │  FIN                   │
    │─────────────────────>  │
    │  ACK                   │
```

---

### 2.2 HTTP 请求结构

```http
GET /api/users/123 HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: application/json
Accept-Encoding: gzip, deflate
Connection: keep-alive
Cookie: session=abc123

[请求体，GET 请求通常无请求体]
```

**请求组成**：
```
请求行：方法 + 路径 + 协议版本
请求头：键值对
空行
请求体（可选）
```

---

### 2.3 HTTP 响应结构

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 58
Cache-Control: no-cache
Set-Cookie: session=xyz789; HttpOnly; Secure
Access-Control-Allow-Origin: *

{"id": 123, "name": "Alice", "email": "alice@example.com"}
```

**响应组成**：
```
状态行：协议版本 + 状态码 + 状态描述
响应头：键值对
空行
响应体
```

---

### 2.4 HTTP 方法

| 方法 | 作用 | 幂等性 | 安全性 |
|------|------|--------|--------|
| **GET** | 获取资源 | ✓ | ✓ |
| **POST** | 创建资源 | ✗ | ✗ |
| **PUT** | 更新资源（全量） | ✓ | ✗ |
| **PATCH** | 更新资源（部分） | ✗ | ✗ |
| **DELETE** | 删除资源 | ✓ | ✗ |
| **HEAD** | 获取响应头 | ✓ | ✓ |
| **OPTIONS** | 获取支持的方法 | ✓ | ✓ |

**幂等性**：多次执行与一次执行结果相同  
**安全性**：不会修改服务器资源

---

### 2.5 HTTP 状态码

#### 1xx 信息响应
- **100 Continue**：继续发送请求体

#### 2xx 成功
- **200 OK**：请求成功
- **201 Created**：资源创建成功
- **204 No Content**：成功但无返回内容

#### 3xx 重定向
- **301 Moved Permanently**：永久重定向
- **302 Found**：临时重定向
- **304 Not Modified**：资源未修改（缓存）

#### 4xx 客户端错误
- **400 Bad Request**：请求语法错误
- **401 Unauthorized**：未授权
- **403 Forbidden**：禁止访问
- **404 Not Found**：资源不存在
- **429 Too Many Requests**：请求过多

#### 5xx 服务器错误
- **500 Internal Server Error**：服务器内部错误
- **502 Bad Gateway**：网关错误
- **503 Service Unavailable**：服务不可用
- **504 Gateway Timeout**：网关超时

---

### 2.6 HTTP 的安全问题

```javascript
// HTTP 明文传输，容易被窃听
// 中间人可以看到所有内容

// 用户登录请求（HTTP）
POST http://example.com/login
Content-Type: application/json

{
  "username": "alice",
  "password": "123456"  // ⚠️ 明文传输！
}

// 攻击者通过抓包工具（Wireshark）可以直接看到密码
```

**HTTP 三大安全问题**：
1. **窃听风险**：明文传输，第三方可截获
2. **篡改风险**：内容可被中间人修改
3. **冒充风险**：无法验证服务器身份

---

## 3. HTTPS 原理

### 3.1 HTTPS = HTTP + SSL/TLS

```
应用层：HTTP（应用数据）
           ↓
加密层：SSL/TLS（加密 HTTP 数据）
           ↓
传输层：TCP（可靠传输）
           ↓
网络层：IP（路由寻址）
```

**SSL/TLS 版本历史**：
- SSL 1.0（未发布）
- SSL 2.0（1995，已废弃）
- SSL 3.0（1996，已废弃）
- TLS 1.0（1999）
- TLS 1.1（2006）
- TLS 1.2（2008，广泛使用）
- **TLS 1.3**（2018，推荐）

---

### 3.2 加密方式

#### 对称加密（Symmetric Encryption）

```
客户端                    服务器
  │                         │
  │  用密钥 K 加密数据       │
  │─────────────────────>   │
  │  密文：X@#$%^&*         │
  │                         │
  │  用相同密钥 K 解密       │
  │  明文：Hello World      │
```

**特点**：
- ✅ 速度快（AES 加密速度 > 1GB/s）
- ❌ 密钥分发问题：如何安全传输密钥？

**常见算法**：
- **AES**（Advanced Encryption Standard）：最常用
- **DES**（Data Encryption Standard）：已过时
- **3DES**：DES 的加强版

---

#### 非对称加密（Asymmetric Encryption）

```
服务器有一对密钥：
- 公钥（Public Key）：公开，任何人可用
- 私钥（Private Key）：保密，只有服务器有

加密：公钥加密 → 私钥解密
签名：私钥签名 → 公钥验证
```

**工作流程**：
```
客户端                          服务器
  │                              │
  │  ① 获取服务器公钥            │
  │  <──────────────────────────│
  │                              │
  │  ② 用公钥加密数据            │
  │  ─────────────────────────> │
  │  密文：X@#$%^&*              │
  │                              │
  │  ③ 服务器用私钥解密          │
  │  明文：Hello World           │
```

**特点**：
- ✅ 密钥分发安全
- ❌ 速度慢（比对称加密慢 1000 倍）

**常见算法**：
- **RSA**：最常用，密钥长度 2048/4096 位
- **ECC**（椭圆曲线加密）：更短的密钥，更高的安全性
- **DSA**：数字签名算法

---

#### HTTPS 混合加密方案

```
┌─────────────────────────────────────┐
│  1. 非对称加密传输对称密钥          │
│     - 解决密钥分发问题               │
│     - 只在握手阶段使用               │
├─────────────────────────────────────┤
│  2. 对称加密传输实际数据            │
│     - 解决性能问题                   │
│     - 用于所有应用数据               │
└─────────────────────────────────────┘
```

**具体流程**：
```
① 客户端生成随机对称密钥 K
② 用服务器公钥加密 K
③ 发送给服务器
④ 服务器用私钥解密得到 K
⑤ 双方使用 K 进行对称加密通信
```

---

## 4. SSL/TLS 握手过程（重点）

### 4.1 TLS 1.2 完整握手流程

```
客户端                                  服务器
  │                                      │
  │  ① Client Hello                     │
  │  ─────────────────────────────────>  │
  │  - 支持的 TLS 版本（TLS 1.2）        │
  │  - 支持的加密套件列表                │
  │  - 客户端随机数 Client Random        │
  │  - 支持的压缩算法                    │
  │                                      │
  │  ② Server Hello                     │
  │  <─────────────────────────────────  │
  │  - 选择的 TLS 版本                   │
  │  - 选择的加密套件                    │
  │  - 服务器随机数 Server Random        │
  │                                      │
  │  ③ Certificate（证书）              │
  │  <─────────────────────────────────  │
  │  - 服务器证书（包含公钥）            │
  │  - 证书链                            │
  │                                      │
  │  ④ Server Key Exchange              │
  │  <─────────────────────────────────  │
  │  - DH 参数（可选，用于密钥交换）     │
  │                                      │
  │  ⑤ Server Hello Done                │
  │  <─────────────────────────────────  │
  │                                      │
  │  ⑥ 客户端验证证书                   │
  │  - 检查证书有效性                    │
  │  - 验证证书链                        │
  │  - 验证域名                          │
  │                                      │
  │  ⑦ Client Key Exchange              │
  │  ─────────────────────────────────>  │
  │  - 用服务器公钥加密的 Pre-Master Key │
  │                                      │
  │  ⑧ 双方生成会话密钥                 │
  │  Master Secret = PRF(                │
  │    Pre-Master Secret,                │
  │    "master secret",                  │
  │    Client Random + Server Random     │
  │  )                                   │
  │                                      │
  │  从 Master Secret 派生出：           │
  │  - 客户端加密密钥                    │
  │  - 服务器加密密钥                    │
  │  - 客户端 MAC 密钥                   │
  │  - 服务器 MAC 密钥                   │
  │                                      │
  │  ⑨ Change Cipher Spec               │
  │  ─────────────────────────────────>  │
  │  - 通知：后续消息使用加密            │
  │                                      │
  │  ⑩ Finished（加密）                 │
  │  ─────────────────────────────────>  │
  │  - 握手消息的 MAC（验证完整性）      │
  │                                      │
  │  ⑪ Change Cipher Spec               │
  │  <─────────────────────────────────  │
  │                                      │
  │  ⑫ Finished（加密）                 │
  │  <─────────────────────────────────  │
  │                                      │
  │  ⑬ 应用数据加密传输                  │
  │  <─────────────────────────────────> │
```

**关键时间**：
- TLS 1.2 握手：**2-RTT**（往返时间）
- TLS 1.3 握手：**1-RTT**（优化）
- TLS 1.3 + 0-RTT：**0-RTT**（会话恢复）

---

### 4.2 关键步骤详解

#### ① Client Hello

```json
{
  "version": "TLS 1.2",
  "random": "4a5e6c3f...", // 28 字节随机数
  "sessionId": "",
  "cipherSuites": [
    "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    "TLS_RSA_WITH_AES_128_CBC_SHA256"
  ],
  "compressionMethods": ["null"],
  "extensions": [
    "server_name (SNI)",
    "supported_groups (ECC curves)",
    "signature_algorithms"
  ]
}
```

**加密套件格式**：
```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
 │    │     │       │    │   │   │
 │    │     │       │    │   │   └─ 摘要算法（SHA-256）
 │    │     │       │    │   └───── 工作模式（GCM）
 │    │     │       │    └───────── 加密算法（AES-128）
 │    │     │       └────────────── 分隔符
 │    │     └────────────────────── 身份验证（RSA）
 │    └──────────────────────────── 密钥交换（ECDHE）
 └───────────────────────────────── 协议（TLS）
```

---

#### ② Server Hello

```json
{
  "version": "TLS 1.2",
  "random": "8b9d2e1a...", // 28 字节随机数
  "sessionId": "f3a7c8...",
  "cipherSuite": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
  "compressionMethod": "null"
}
```

---

#### ③ Certificate（证书）

```
服务器发送证书链：
┌──────────────────────────┐
│  example.com 证书        │ ← 网站证书
│  - 域名: example.com     │
│  - 公钥: RSA 2048-bit    │
│  - 有效期: 2026-01-01 ~  │
│           2027-01-01     │
│  - 签名: Intermediate CA │
├──────────────────────────┤
│  Intermediate CA 证书    │ ← 中间证书
│  - 签名: Root CA         │
├──────────────────────────┤
│  Root CA 证书            │ ← 根证书（浏览器内置）
└──────────────────────────┘
```

---

#### ⑦ Client Key Exchange & 密钥生成

```javascript
// 1. 客户端生成 Pre-Master Secret（48 字节）
const preMasterSecret = crypto.randomBytes(48);

// 2. 用服务器公钥加密
const encryptedPMS = rsaEncrypt(preMasterSecret, serverPublicKey);

// 3. 发送给服务器
sendToServer(encryptedPMS);

// 4. 双方各自计算 Master Secret
function generateMasterSecret(preMasterSecret, clientRandom, serverRandom) {
  return PRF(
    preMasterSecret,
    "master secret",
    clientRandom + serverRandom,
    48 // 输出长度
  );
}

// 5. 从 Master Secret 派生会话密钥
function deriveKeys(masterSecret, clientRandom, serverRandom) {
  const keyBlock = PRF(
    masterSecret,
    "key expansion",
    serverRandom + clientRandom,
    104 // 总长度
  );
  
  return {
    clientWriteMACKey: keyBlock.slice(0, 20),
    serverWriteMACKey: keyBlock.slice(20, 40),
    clientWriteKey: keyBlock.slice(40, 56),    // AES-128
    serverWriteKey: keyBlock.slice(56, 72),
    clientWriteIV: keyBlock.slice(72, 88),
    serverWriteIV: keyBlock.slice(88, 104)
  };
}
```

---

### 4.3 TLS 1.3 优化

#### 1-RTT 握手

```
客户端                     服务器
  │                         │
  │  Client Hello           │
  │  + Key Share            │ ← 提前发送公钥
  │  ─────────────────────> │
  │                         │
  │  Server Hello           │
  │  + Key Share            │
  │  + Certificate          │ ← 合并消息
  │  + Finished             │
  │  <───────────────────── │
  │                         │
  │  Finished               │
  │  ─────────────────────> │
  │                         │
  │  Application Data       │ ← 握手完成立即发送
  │  <─────────────────────>│
```

**优势**：
- 握手时间从 2-RTT 减少到 1-RTT
- 延迟降低 50%

---

#### 0-RTT（会话恢复）

```
首次连接：1-RTT 握手
         生成 PSK（Pre-Shared Key）

后续连接：
客户端                     服务器
  │                         │
  │  Client Hello           │
  │  + PSK                  │
  │  + Early Data           │ ← 直接发送应用数据
  │  ─────────────────────> │
  │                         │
  │  Server Hello           │
  │  + Finished             │
  │  <───────────────────── │
  │                         │
  │  Application Data       │
  │  <─────────────────────>│
```

**风险**：
- 0-RTT 数据可能被重放攻击
- 只适用于幂等请求（GET）

---

## 5. 数字证书机制

### 5.1 证书结构

```
数字证书（X.509 标准）：
├── 版本号（V3）
├── 序列号（唯一标识）
├── 签名算法（SHA-256 + RSA）
├── 颁发者（Issuer）
│   ├── CN: Let's Encrypt Authority X3
│   ├── O: Let's Encrypt
│   └── C: US
├── 有效期
│   ├── Not Before: 2026-01-01 00:00:00 UTC
│   └── Not After:  2026-04-01 23:59:59 UTC
├── 主体（Subject）
│   ├── CN: example.com
│   └── SAN: *.example.com, www.example.com
├── 公钥信息
│   ├── 算法: RSA
│   ├── 长度: 2048 bits
│   └── 指数: 65537
├── 扩展字段
│   ├── Key Usage: Digital Signature, Key Encipherment
│   ├── Extended Key Usage: TLS Web Server Authentication
│   └── CRL Distribution Points
└── CA 的数字签名
    ├── 签名算法: sha256WithRSAEncryption
    └── 签名值: 3d:f8:a2:c1:...
```

---

### 5.2 数字签名原理

#### 签名生成（CA 签发证书）

```javascript
// 1. CA 对证书内容计算哈希
const certContent = {
  version: 3,
  subject: "example.com",
  publicKey: "...",
  validFrom: "2026-01-01",
  validTo: "2027-01-01"
};

const hash = sha256(JSON.stringify(certContent));
// hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

// 2. CA 用私钥对哈希加密，生成数字签名
const signature = rsaEncrypt(hash, CA_PRIVATE_KEY);

// 3. 证书 = 证书内容 + 数字签名
const certificate = {
  ...certContent,
  signature: signature
};
```

---

#### 签名验证（浏览器验证证书）

```javascript
// 1. 提取证书内容和签名
const certContent = extractContent(certificate);
const signature = certificate.signature;

// 2. 用 CA 公钥解密签名，得到哈希值
const decryptedHash = rsaDecrypt(signature, CA_PUBLIC_KEY);

// 3. 对证书内容计算哈希
const computedHash = sha256(JSON.stringify(certContent));

// 4. 比较两个哈希值
if (decryptedHash === computedHash) {
  console.log('证书有效：内容未被篡改');
} else {
  console.log('证书无效：内容已被篡改');
}
```

**为什么有效？**
- 只有 CA 的私钥能生成有效签名
- 任何人都可以用 CA 公钥验证签名
- 篡改证书内容会导致哈希不匹配

---

### 5.3 证书验证流程

```javascript
function verifyCertificate(cert) {
  // 1. 检查证书是否过期
  const now = new Date();
  if (now < cert.notBefore || now > cert.notAfter) {
    throw new Error('证书已过期');
  }
  
  // 2. 检查域名是否匹配
  const hostname = 'example.com';
  if (cert.subject.CN !== hostname && 
      !cert.subjectAltName.includes(hostname)) {
    throw new Error('域名不匹配');
  }
  
  // 3. 验证证书链
  const rootCA = getTrustedRootCA(); // 浏览器内置
  const isChainValid = verifyCertificateChain(cert, rootCA);
  if (!isChainValid) {
    throw new Error('证书链验证失败');
  }
  
  // 4. 验证 CA 签名
  const issuerPublicKey = getIssuerPublicKey(cert.issuer);
  const isSignatureValid = verifySignature(
    cert.content,
    cert.signature,
    issuerPublicKey
  );
  if (!isSignatureValid) {
    throw new Error('证书签名无效');
  }
  
  // 5. 检查证书是否被吊销（OCSP/CRL）
  const isRevoked = checkRevocation(cert);
  if (isRevoked) {
    throw new Error('证书已被吊销');
  }
  
  return true;
}
```

---

### 5.4 证书链

```
┌─────────────────────────────────┐
│  网站证书                       │
│  Subject: example.com           │
│  Issuer: Let's Encrypt R3       │ ← 由中间 CA 签名
│  Public Key: RSA 2048           │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  中间 CA 证书                   │
│  Subject: Let's Encrypt R3      │
│  Issuer: ISRG Root X1           │ ← 由根 CA 签名
│  Public Key: RSA 2048           │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  根 CA 证书                     │
│  Subject: ISRG Root X1          │
│  Issuer: ISRG Root X1           │ ← 自签名
│  Public Key: RSA 4096           │
│  （浏览器/操作系统内置）         │
└─────────────────────────────────┘
```

**为什么需要证书链？**
1. **安全**：根证书私钥极少使用，降低泄露风险
2. **灵活**：可以吊销中间 CA，无需更新所有客户端
3. **扩展性**：中间 CA 可以颁发大量证书

---

### 5.5 证书吊销

#### CRL（Certificate Revocation List）

```
客户端定期下载证书吊销列表：
┌────────────────────────────┐
│  CRL（由 CA 发布）         │
│  - 序列号: 0x123456        │ ← 已吊销
│  - 序列号: 0x789abc        │ ← 已吊销
│  - 序列号: 0xdef012        │ ← 已吊销
│  - 更新时间: 2026-06-20    │
└────────────────────────────┘

缺点：
- CRL 文件可能很大
- 更新不及时
```

---

#### OCSP（Online Certificate Status Protocol）

```
客户端                      OCSP 服务器
  │                            │
  │  请求：证书是否有效？       │
  │  ─────────────────────────>│
  │  序列号: 0x123456          │
  │                            │
  │  响应：Good/Revoked/Unknown│
  │  <─────────────────────────│
  
优点：实时查询
缺点：额外网络请求，增加延迟
```

---

#### OCSP Stapling（推荐）

```
服务器定期向 OCSP 查询，缓存结果
┌──────────────────────────┐
│  服务器                  │
│  - 每小时查询一次 OCSP   │
│  - 缓存 OCSP 响应        │
└──────────────────────────┘
            ↓
客户端连接时，服务器附带 OCSP 响应
┌──────────────────────────┐
│  TLS 握手                │
│  + Certificate           │
│  + OCSP Response         │ ← 无需客户端额外请求
└──────────────────────────┘

优点：
- 客户端无需额外请求
- 保护用户隐私（CA 不知道用户访问了哪些网站）
```

---

## 6. 常见攻击与防御

### 6.1 中间人攻击（MITM）

#### HTTP 的中间人攻击

```
客户端  ←→  攻击者  ←→  服务器
           (截获所有流量)

攻击者可以：
1. 窃听所有数据（密码、cookie、隐私）
2. 篡改请求/响应（注入恶意代码）
3. 伪装成服务器（钓鱼）
```

**攻击示例**：
```javascript
// 用户在咖啡厅连接免费 Wi-Fi
// 攻击者控制路由器

// 1. 用户访问 http://bank.com
// 2. 攻击者截获请求
// 3. 攻击者伪装成银行网站
// 4. 用户输入账号密码
// 5. 攻击者获取凭证，转发给真实银行
// 6. 用户毫无察觉
```

---

#### HTTPS 防御中间人攻击

```
客户端  ←→  攻击者  ←→  服务器
           (无法解密)

即使攻击者截获数据：
1. 数据已加密，无法读取
2. 攻击者没有私钥，无法解密
3. 伪装服务器会因证书验证失败而被发现
```

**攻击失败原因**：
```javascript
// 攻击者尝试伪装服务器
// 客户端验证证书

if (cert.subject.CN !== 'bank.com') {
  throw new Error('域名不匹配');
}

if (!verifySignature(cert, trustedCA)) {
  throw new Error('证书无效'); // ← 攻击者无法伪造 CA 签名
}

// 浏览器显示警告：
// "您的连接不是私密连接"
// "NET::ERR_CERT_AUTHORITY_INVALID"
```

---

### 6.2 SSL 剥离攻击（SSL Stripping）

#### 攻击原理

```
用户输入：bank.com（未指定协议）
浏览器：默认使用 http://bank.com
         ↓
攻击者劫持 HTTP 请求
         ↓
攻击者与服务器：HTTPS 加密通信
攻击者与用户：HTTP 明文通信
         ↓
用户看到的链接都是 HTTP
（攻击者将所有 HTTPS 链接改成 HTTP）
```

**攻击流程**：
```
1. 服务器：https://bank.com/transfer
           ↓
2. 攻击者篡改：http://bank.com/transfer
           ↓
3. 用户浏览器显示：http://bank.com/transfer
           ↓
4. 用户输入密码（HTTP 明文）
           ↓
5. 攻击者截获密码
           ↓
6. 攻击者用 HTTPS 转发给服务器
```

---

#### 防御方法

**① HSTS（HTTP Strict Transport Security）**

```http
// 服务器响应头
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

参数说明：
- max-age=31536000: 一年内强制 HTTPS（秒）
- includeSubDomains: 包含所有子域名
- preload: 加入浏览器预加载列表
```

```javascript
// 工作原理
// 用户首次访问 https://bank.com
// 服务器返回 HSTS 头
// 浏览器记住：未来一年内，所有请求强制 HTTPS

// 后续访问
if (userInput === 'http://bank.com') {
  // 浏览器自动转换
  window.location.href = 'https://bank.com';
}

// 即使攻击者劫持 HTTP，浏览器也不会发送请求
```

---

**② HSTS Preload List**

```
问题：首次访问仍可能被攻击

解决：将域名加入浏览器预加载列表
- Chrome/Firefox/Safari 内置列表
- 无需首次访问即强制 HTTPS

申请方式：https://hstspreload.org/
```

---

**③ 前端强制跳转**

```javascript
// 页面加载时检查协议
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace('https://' + location.host + location.pathname + location.search);
}
```

---

**④ 服务器 301 重定向**

```nginx
# Nginx 配置
server {
    listen 80;
    server_name bank.com;
    return 301 https://$server_name$request_uri;
}
```

---

### 6.3 证书伪造攻击

#### 攻击场景

```
攻击者自签名证书：
CN: bank.com
Issuer: Fake CA（攻击者自建）

如果用户点击"仍然访问" → 攻击成功
```

#### 防御方法

**① Certificate Pinning（证书固定）**

```javascript
// 移动端 App 内置证书/公钥指纹
const TRUSTED_CERT_HASH = 'sha256/AAAAAAAAAAAAAAAAAAAAAA==';

function verifyServerCertificate(cert) {
  const certHash = sha256(cert);
  if (certHash !== TRUSTED_CERT_HASH) {
    throw new Error('证书不匹配，可能遭受攻击');
  }
}

// 即使 CA 被攻破，攻击者也无法伪造
```

**缺点**：
- 证书更新需要发布新版本 App
- 不适用于 Web（无法内置证书）

---

**② Certificate Transparency（证书透明度）**

```
所有 CA 颁发的证书必须记录在公开日志中
任何人都可以监控

如果发现未经授权的证书：
1. 及时发现攻击
2. 通知 CA 吊销证书
3. 追溯攻击来源
```

---

### 6.4 降级攻击

#### 攻击原理

```
攻击者拦截 Client Hello
修改支持的 TLS 版本：
TLS 1.3, TLS 1.2, TLS 1.1, TLS 1.0
                    ↓
TLS 1.0（有已知漏洞）
```

#### 防御方法

```javascript
// 客户端/服务器只支持安全版本
const ALLOWED_TLS_VERSIONS = ['TLS 1.3', 'TLS 1.2'];

if (!ALLOWED_TLS_VERSIONS.includes(negotiatedVersion)) {
  throw new Error('TLS 版本不安全');
}
```

```nginx
# Nginx 配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
```

---

## 7. 性能优化

### 7.1 TLS 握手优化

#### ① TLS 版本升级

| 版本 | 握手时间 | 优势 |
|------|---------|------|
| TLS 1.2 | 2-RTT | 广泛支持 |
| TLS 1.3 | 1-RTT | 快 50% |
| TLS 1.3 + 0-RTT | 0-RTT | 最快，但有重放风险 |

```nginx
# Nginx 启用 TLS 1.3
ssl_protocols TLSv1.2 TLSv1.3;
```

---

#### ② Session Resumption（会话恢复）

**Session ID 方式**：
```
首次连接：
Client → Server: Client Hello
Server → Client: Server Hello + Session ID (abc123)

后续连接：
Client → Server: Client Hello + Session ID (abc123)
Server → Client: 恢复会话，跳过证书验证

优点：省去完整握手
缺点：服务器需要存储会话（内存开销）
```

---

**Session Ticket 方式**：
```
首次连接：
Server → Client: 加密的会话信息（Session Ticket）

后续连接：
Client → Server: Client Hello + Session Ticket
Server → Client: 解密 Ticket，恢复会话

优点：服务器无状态（不存储会话）
缺点：Ticket 泄露风险
```

```nginx
# Nginx 配置
ssl_session_cache shared:SSL:10m;    # 10MB 缓存
ssl_session_timeout 10m;             # 10 分钟过期
ssl_session_tickets on;              # 启用 Session Ticket
```

---

#### ③ OCSP Stapling

```
传统方式：
TLS 握手 → 客户端向 CA 查询证书状态（额外请求）
总时间 = 握手时间 + OCSP 查询时间

OCSP Stapling：
服务器定期查询 OCSP，缓存结果
TLS 握手 → 服务器附带 OCSP 响应（无额外请求）
```

```nginx
# Nginx 配置
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /path/to/chain.pem;
resolver 8.8.8.8;
```

---

### 7.2 HTTP/2 优化

```
HTTPS + HTTP/1.1：
- 每个请求一个 TCP 连接
- 队头阻塞
- 头部冗余

HTTPS + HTTP/2：
- 单一 TCP 连接
- 多路复用
- 头部压缩（HPACK）
- 服务器推送
```

**性能提升**：
```
100 个请求：
HTTP/1.1: 100 个连接 × 2-RTT = 200-RTT
HTTP/2:   1 个连接 × 2-RTT = 2-RTT（快 100 倍）
```

```nginx
# Nginx 启用 HTTP/2
listen 443 ssl http2;
```

---

### 7.3 其他优化

#### ① 减少证书链长度

```
长证书链：
网站证书 → 中间 CA 1 → 中间 CA 2 → 根 CA
传输大小：约 4-5 KB

短证书链：
网站证书 → 中间 CA → 根 CA
传输大小：约 3-4 KB

优化：选择证书链短的 CA
```

---

#### ② 使用 ECC 证书

```
RSA 2048-bit：安全性 112-bit
ECC 256-bit：安全性 128-bit

优势：
- ECC 更短（证书体积小 30%）
- 计算更快（握手快 10-20%）
```

```bash
# 生成 ECC 证书
openssl ecparam -genkey -name prime256v1 -out ecc-key.pem
openssl req -new -key ecc-key.pem -out ecc-csr.pem
```

---

#### ③ 启用 Keep-Alive

```http
// HTTP/1.1 默认启用
Connection: keep-alive

// 复用 TCP 连接，避免重复握手
```

```nginx
# Nginx 配置
keepalive_timeout 65;
keepalive_requests 100;
```

---

#### ④ CDN 加速

```
用户                CDN 边缘节点           源服务器
 │                      │                    │
 │  HTTPS 握手（近）     │                    │
 │  ←─────────────────→ │                    │
 │  应用数据            │  HTTPS 握手（远）   │
 │  ←─────────────────→ │  ←────────────────→│
                        │  应用数据           │
                        │  ←────────────────→│

优势：
- 边缘节点距离用户近，RTT 低
- CDN 与源服务器建立长连接，复用握手
```

---

## 8. 前端实践

### 8.1 检测 HTTPS

```javascript
// 1. 检查当前页面协议
if (location.protocol === 'https:') {
  console.log('✓ 安全连接');
} else {
  console.warn('⚠️ 不安全连接');
}

// 2. 强制跳转 HTTPS
if (location.protocol !== 'https:' && 
    location.hostname !== 'localhost' && 
    location.hostname !== '127.0.0.1') {
  location.replace(`https://${location.host}${location.pathname}${location.search}`);
}

// 3. 检测混合内容
window.addEventListener('securitypolicyviolation', (e) => {
  console.error('混合内容警告:', e.violatedDirective, e.blockedURI);
});
```

---

### 8.2 混合内容问题

#### 什么是混合内容？

```
HTTPS 页面加载 HTTP 资源：
https://example.com/page.html
    ↓
<img src="http://cdn.example.com/image.jpg">  ⚠️ 混合内容
<script src="http://cdn.example.com/script.js"> ⚠️ 混合内容
```

**风险**：
- HTTP 资源可被中间人篡改
- 攻击者注入恶意代码
- 破坏 HTTPS 的安全性

---

#### 浏览器行为

| 资源类型 | 浏览器行为 |
|---------|-----------|
| **被动混合内容**（图片、视频） | 显示警告，但仍加载 |
| **主动混合内容**（JS、CSS） | 阻止加载 |

---

#### 解决方案

**① 使用协议相对 URL**

```html
<!-- ❌ 错误：硬编码 HTTP -->
<img src="http://cdn.example.com/image.jpg">
<script src="http://cdn.example.com/script.js"></script>

<!-- ✅ 可行：协议相对 URL -->
<img src="//cdn.example.com/image.jpg">
<script src="//cdn.example.com/script.js"></script>

<!-- ✅ 更好：明确使用 HTTPS -->
<img src="https://cdn.example.com/image.jpg">
<script src="https://cdn.example.com/script.js"></script>
```

---

**② 使用 CSP 自动升级**

```html
<meta http-equiv="Content-Security-Policy" 
      content="upgrade-insecure-requests">
```

```javascript
// 效果：浏览器自动将 HTTP 请求升级为 HTTPS
<img src="http://cdn.example.com/image.jpg">
// 实际请求：https://cdn.example.com/image.jpg
```

---

**③ JavaScript 动态检测**

```javascript
function ensureHttps(url) {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

const imageUrl = ensureHttps('http://cdn.example.com/image.jpg');
```

---

### 8.3 Cookie 安全

```javascript
// 设置安全 Cookie
document.cookie = "session=abc123; Secure; HttpOnly; SameSite=Strict; Max-Age=3600";

// 参数说明：
// Secure: 仅通过 HTTPS 传输
// HttpOnly: 禁止 JavaScript 访问（防 XSS）
// SameSite: 防止 CSRF 攻击
//   - Strict: 跨站点完全禁止
//   - Lax: 导航允许，表单提交禁止
//   - None: 允许跨站点（需配合 Secure）
// Max-Age: 过期时间（秒）
```

---

### 8.4 Fetch API with HTTPS

```javascript
// 1. 基础请求
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));

// 2. 设置安全头
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include', // 发送 Cookie
  body: JSON.stringify({ key: 'value' })
});

// 3. 错误处理
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .catch(error => {
    if (error.message.includes('ERR_CERT')) {
      console.error('证书错误');
    }
  });
```

---

## 9. 面试高频问答

### Q1: HTTPS 一定安全吗？

**答案**：不一定

**HTTPS 防护范围**：
- ✅ **防窃听**：传输数据加密
- ✅ **防篡改**：MAC 保证完整性
- ✅ **防冒充**：证书验证服务器身份

**HTTPS 无法防护**：
- ❌ 服务器被攻破（数据库泄露）
- ❌ 用户主动信任假证书
- ❌ 弱加密算法（如 DES、RC4）
- ❌ 0-day 漏洞（如 Heartbleed）
- ❌ 钓鱼网站（httрs://example.com，用西里尔字母 р）
- ❌ 恶意软件窃取本地数据

---

### Q2: HTTPS 为什么比 HTTP 慢？慢多少？

**答案**：

**慢的原因**：
1. **TLS 握手**：多 1-2 个 RTT（约 100-200ms）
2. **加密/解密**：CPU 计算开销（现代硬件影响 < 1%）
3. **证书验证**：OCSP 查询（可用 Stapling 消除）

**实际性能**：
```
TLS 1.2: 慢 10-20%（主要是握手）
TLS 1.3: 慢 5-10%（握手优化）
HTTP/2: 可能更快（多路复用抵消握手开销）
```

**优化后**：
- TLS 1.3 + Session Resumption + HTTP/2
- 性能与 HTTP 相当，甚至更快

---

### Q3: 对称加密和非对称加密有什么区别？

| 特性 | 对称加密 | 非对称加密 |
|------|---------|-----------|
| **密钥** | 同一个 | 公钥 + 私钥 |
| **速度** | 快（1 GB/s） | 慢（1 MB/s）|
| **安全性** | 密钥分发困难 | 密钥分发安全 |
| **用途** | 批量数据加密 | 密钥交换、数字签名 |
| **算法** | AES、DES、3DES | RSA、ECC、DSA |
| **密钥长度** | 128/256-bit | 2048/4096-bit |

**HTTPS 的使用**：
```
非对称加密（RSA）：TLS 握手，传输对称密钥
对称加密（AES）：应用数据加密
```

---

### Q4: 什么是证书链？为什么需要？

**答案**：

**证书链结构**：
```
网站证书（example.com）
    ↓ 被签名
中间 CA 证书（Let's Encrypt R3）
    ↓ 被签名
根 CA 证书（ISRG Root X1，浏览器内置）
```

**验证流程**：
```javascript
1. 用中间 CA 的公钥验证网站证书签名
2. 用根 CA 的公钥验证中间 CA 证书签名
3. 根 CA 证书是浏览器内置的可信证书
```

**为什么需要**：
1. **安全**：根证书私钥很少使用，降低泄露风险
2. **灵活**：中间 CA 可以随时吊销，无需更新浏览器
3. **扩展性**：多个中间 CA 分担签发压力
4. **隔离**：不同业务使用不同中间 CA

---

### Q5: Let's Encrypt 是什么？

**答案**：

- **免费**：无需购买证书
- **自动化**：ACME 协议自动签发和续期
- **开放**：非营利性 CA
- **DV 证书**：域名验证型（90 天有效期）

**工作原理**：
```
1. 申请证书：certbot --nginx -d example.com
2. 域名验证：
   - HTTP-01: 在网站根目录放置验证文件
   - DNS-01: 添加 TXT 记录
3. 签发证书：Let's Encrypt 签发 90 天证书
4. 自动续期：certbot renew（建议 cron 每天执行）
```

**为什么 90 天**：
- 鼓励自动化
- 缩短证书泄露风险窗口
- 更快响应安全事件

---

### Q6: 如何防止中间人攻击？

**答案**：

**技术手段**：
1. **使用 HTTPS**：加密传输
2. **验证证书**：检查域名、有效期、签名
3. **HSTS**：强制 HTTPS
4. **Certificate Pinning**（移动端）：固定证书/公钥
5. **Certificate Transparency**：监控未授权证书
6. **DNSSEC**：防止 DNS 劫持

**用户习惯**：
1. 检查地址栏锁图标
2. 查看证书详情
3. 避免公共 Wi-Fi 输入敏感信息
4. 不点击"仍然访问"（证书错误）

---

### Q7: HTTP/2 必须用 HTTPS 吗？

**答案**：

**理论上**：HTTP/2 协议支持明文（h2c）

**实际上**：主流浏览器只支持 HTTPS 上的 HTTP/2（h2）

**原因**：
1. **安全**：HTTP/2 特性（服务器推送）可能被滥用
2. **部署简单**：HTTPS 已成标配
3. **性能**：HTTP/2 + HTTPS 比 HTTP/1.1 + HTTP 更快

**结论**：要用 HTTP/2，必须先部署 HTTPS

---

### Q8: TLS 1.2 和 TLS 1.3 有什么区别？

| 特性 | TLS 1.2 | TLS 1.3 |
|------|---------|---------|
| **握手时间** | 2-RTT | 1-RTT |
| **0-RTT** | 不支持 | 支持（会话恢复）|
| **加密算法** | RSA、DH、ECDHE | 仅 ECDHE（前向保密）|
| **加密套件** | 37 个 | 5 个（移除弱算法）|
| **证书加密** | 否 | 是 |
| **安全性** | 较高 | 更高 |

**TLS 1.3 优势**：
- 更快：握手快 50%
- 更安全：强制前向保密
- 更简单：移除过时算法

---

### Q9: 什么是前向保密（Forward Secrecy）？

**答案**：

即使服务器私钥泄露，过去的通信仍然安全

**工作原理**：
```
传统 RSA 密钥交换：
- 客户端用服务器公钥加密 Pre-Master Secret
- 攻击者记录所有流量
- 服务器私钥泄露 → 攻击者解密所有历史流量

前向保密（ECDHE）：
- 每次连接生成临时密钥对
- 握手后立即销毁私钥
- 服务器私钥泄露 → 历史流量仍安全（临时密钥已销毁）
```

**实现方式**：
- Diffie-Hellman（DH）
- Elliptic Curve Diffie-Hellman Ephemeral（ECDHE）

**检查方法**：
```bash
openssl s_client -connect example.com:443 -cipher 'ECDHE'
```

---

### Q10: 什么是 SNI（Server Name Indication）？

**答案**：

**问题**：一个 IP 多个域名，服务器不知道返回哪个证书

**传统方案**：
- 每个域名一个 IP（成本高）
- 通配符证书（不灵活）

**SNI 方案**：
```
Client Hello 中包含域名：
┌────────────────────────┐
│  Client Hello          │
│  - TLS Version: 1.3    │
│  - SNI: example.com    │ ← 明文域名
│  - Cipher Suites: ...  │
└────────────────────────┘

服务器根据 SNI 返回对应证书
```

**问题**：SNI 明文传输，泄露访问域名

**解决**：ESNI（Encrypted SNI）/ ECH（Encrypted Client Hello）

---

## 10. 实战案例

### 10.1 配置 Nginx HTTPS

```nginx
# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://example.com$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    # 证书路径
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # TLS 版本
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 加密套件（优先使用强加密）
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_prefer_server_ciphers on;
    
    # Session 缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;  # 关闭 Ticket，提高安全性
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 日志
    access_log /var/log/nginx/example.com.access.log;
    error_log /var/log/nginx/example.com.error.log;
    
    # 网站根目录
    root /var/www/example.com;
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

### 10.2 使用 Certbot 申请免费证书

```bash
# 1. 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. 申请证书（自动配置 Nginx）
sudo certbot --nginx -d example.com -d www.example.com

# 3. 测试续期
sudo certbot renew --dry-run

# 4. 设置自动续期（cron）
sudo crontab -e
# 添加以下行（每天凌晨 2 点检查）
0 2 * * * certbot renew --quiet --post-hook "systemctl reload nginx"

# 5. 查看证书信息
sudo certbot certificates
```

---

### 10.3 生成自签名证书（开发环境）

```bash
# 1. 生成私钥
openssl genrsa -out localhost.key 2048

# 2. 生成证书签名请求（CSR）
openssl req -new -key localhost.key -out localhost.csr
# 输入信息：
# Country Name: CN
# Common Name: localhost

# 3. 自签名生成证书（有效期 365 天）
openssl x509 -req -days 365 -in localhost.csr \
  -signkey localhost.key -out localhost.crt

# 4. 查看证书
openssl x509 -in localhost.crt -text -noout

# 5. Node.js 使用
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello HTTPS');
}).listen(443);
```

---

### 10.4 检测网站 HTTPS 配置

```bash
# 1. 在线检测（最全面）
# https://www.ssllabs.com/ssltest/

# 2. OpenSSL 命令行
openssl s_client -connect example.com:443 -servername example.com

# 输出信息：
# - 证书链
# - TLS 版本
# - 加密套件
# - 证书详情

# 3. 检查证书过期时间
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | \
  openssl x509 -noout -dates

# 4. 检查 HSTS
curl -I https://example.com | grep -i strict

# 5. 检查 HTTP/2
curl -I --http2 https://example.com | grep -i http/2
```

---

### 10.5 前端完整 HTTPS 实践

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 强制 HTTPS -->
  <meta http-equiv="Content-Security-Policy" 
        content="upgrade-insecure-requests">
  
  <!-- CSP 安全策略 -->
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
  
  <title>HTTPS 最佳实践</title>
</head>
<body>
  <script>
    // 1. 检查 HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      location.replace(`https://${location.host}${location.pathname}`);
    }
    
    // 2. 安全的 Fetch 请求
    async function fetchData() {
      try {
        const response = await fetch('https://api.example.com/data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // 发送 Cookie
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        if (error.message.includes('ERR_CERT')) {
          console.error('证书错误，可能遭受中间人攻击');
        }
        throw error;
      }
    }
    
    // 3. 安全的 Cookie 设置
    function setSecureCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; HttpOnly; SameSite=Strict`;
    }
    
    // 4. 检测混合内容
    window.addEventListener('securitypolicyviolation', (e) => {
      console.error('混合内容警告:', {
        directive: e.violatedDirective,
        blockedURI: e.blockedURI
      });
    });
    
    // 5. 监控 HTTPS 状态
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log('连接信息:', {
              protocol: entry.nextHopProtocol, // h2, http/1.1
              encrypted: location.protocol === 'https:'
            });
          }
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
    }
  </script>
</body>
</html>
```

---

## 11. 总结

### 11.1 核心要点

| 知识点 | 要点 |
|-------|------|
| **HTTP** | 明文传输，不安全，易被窃听、篡改、冒充 |
| **HTTPS** | HTTP + SSL/TLS，加密传输，保证机密性、完整性、身份认证 |
| **加密** | 非对称加密传输密钥（安全），对称加密传输数据（快速）|
| **证书** | 证明服务器身份，防止中间人攻击，基于 CA 信任链 |
| **握手** | TLS 1.2: 2-RTT，TLS 1.3: 1-RTT，0-RTT: 会话恢复 |
| **性能** | TLS 1.3 + Session Resumption + HTTP/2 + OCSP Stapling |
| **安全** | HSTS + CSP + Secure Cookie + Certificate Pinning |

---

### 11.2 面试加分项

**能画出 TLS 握手流程图** ⭐⭐⭐⭐⭐
```
Client Hello → Server Hello → Certificate → 
Client Key Exchange → Change Cipher Spec → Finished
```

**理解证书链和 CA 机制** ⭐⭐⭐⭐⭐
```
网站证书 → 中间 CA → 根 CA（浏览器内置）
```

**知道常见攻击** ⭐⭐⭐⭐
```
- 中间人攻击（MITM）
- SSL 剥离攻击（SSL Stripping）
- 证书伪造攻击
```

**了解性能优化** ⭐⭐⭐⭐
```
- TLS 1.3（1-RTT）
- Session Resumption（0-RTT）
- OCSP Stapling
- HTTP/2
```

**掌握 Nginx HTTPS 配置** ⭐⭐⭐
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256';
ssl_session_cache shared:SSL:10m;
ssl_stapling on;
add_header Strict-Transport-Security "max-age=31536000" always;
```

---

### 11.3 学习建议

1. **理解 > 记忆**：理解原理，而不是死记概念
2. **动手实践**：自己申请证书、配置 HTTPS、抓包分析
3. **关注安全**：了解最新漏洞和防御方法
4. **性能优化**：在安全的基础上追求性能

---

## 📚 参考资料

- [RFC 5246 - TLS 1.2](https://datatracker.ietf.org/doc/html/rfc5246)
- [RFC 8446 - TLS 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
- [MDN - HTTPS](https://developer.mozilla.org/zh-CN/docs/Glossary/HTTPS)
- [Let's Encrypt](https://letsencrypt.org/)
- [SSL Labs](https://www.ssllabs.com/)

---

**祝面试成功！** 🚀
