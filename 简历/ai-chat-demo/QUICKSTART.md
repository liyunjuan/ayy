# 🚀 快速启动指南

## 第一步：安装依赖

```bash
# 进入后端目录
cd backend
npm install

# 进入前端目录
cd ../frontend
npm install
```

## 第二步：配置 API Key

在 `backend` 目录下创建 `.env` 文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的 OpenAI API Key：

```env
OPENAI_API_KEY=sk-your-api-key-here
MODEL=gpt-3.5-turbo
PORT=3001
```

### 如何获取 OpenAI API Key？

1. 访问 https://platform.openai.com/api-keys
2. 注册/登录账号
3. 点击 "Create new secret key"
4. 复制 Key（注意：只显示一次）

### 没有 API Key？使用免费替代方案

如果你暂时无法获取 OpenAI API Key，可以：

**方案 1：使用国内大模型**
- 讯飞星火：https://xinghuo.xfyun.cn/
- 通义千问：https://dashscope.aliyun.com/
- 文心一言：https://cloud.baidu.com/product/wenxinworkshop

**方案 2：使用 Mock 数据（仅用于演示）**

修改 `backend/server.js`，将 API 调用部分替换为：

```javascript
// Mock 响应（仅用于演示）
const mockResponses = [
  '你好！我是 AI 助手，很高兴为你服务。',
  '这是一个很好的问题！让我来帮你分析一下...',
  '根据你的描述，我建议采用以下方案：\n\n1. 首先...\n2. 然后...\n3. 最后...'
];

const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];

// 模拟打字机效果
for (const char of response) {
  res.write(char);
  await new Promise(resolve => setTimeout(resolve, 50)); // 每个字符延迟 50ms
}

res.end();
```

## 第三步：启动项目

**开两个终端窗口**：

### 终端 1 - 启动后端

```bash
cd backend
npm run dev
```

看到以下输出说明启动成功：

```
╔════════════════════════════════════════╗
║   🚀 AI Chat Backend Started!         ║
╠════════════════════════════════════════╣
║   Server: http://localhost:3001       ║
║   Health: http://localhost:3001/api/health ║
║   Model:  gpt-3.5-turbo              ║
╚════════════════════════════════════════╝
```

### 终端 2 - 启动前端

```bash
cd frontend
npm run dev
```

看到以下输出说明启动成功：

```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 第四步：访问应用

打开浏览器访问：http://localhost:5173

## 🎯 测试建议

### 1. 基础对话测试

```
你好
```

### 2. 代码生成测试

```
帮我写一个 React 计数器组件
```

### 3. 问题解答测试

```
React Hooks 有哪些？分别是什么作用？
```

### 4. 复杂任务测试

```
帮我设计一个用户管理系统的数据库表结构
```

## ⚠️ 常见问题

### 问题 1：后端启动失败 - "OPENAI_API_KEY not found"

**解决方案**：
1. 检查 `backend/.env` 文件是否存在
2. 检查 API Key 是否正确填写
3. 重启后端服务

### 问题 2：前端无法连接后端 - "Failed to fetch"

**解决方案**：
1. 检查后端是否启动（访问 http://localhost:3001/api/health）
2. 检查端口是否被占用
3. 检查 CORS 配置

### 问题 3：API 调用失败 - "Insufficient credits"

**原因**：OpenAI 账户余额不足

**解决方案**：
1. 访问 https://platform.openai.com/account/billing
2. 充值（最低 $5）
3. 或使用 gpt-3.5-turbo（更便宜）

### 问题 4：流式输出不工作

**解决方案**：
1. 检查浏览器是否支持 `ReadableStream`（Chrome 93+）
2. 检查后端响应头是否正确设置
3. 打开浏览器控制台查看错误信息

## 💡 开发建议

### 1. 使用 gpt-3.5-turbo 节省费用

在 `.env` 中设置：

```env
MODEL=gpt-3.5-turbo
```

**费用对比**：
- gpt-4: $0.03 / 1K tokens
- gpt-3.5-turbo: $0.0015 / 1K tokens（便宜 20 倍）

### 2. 限制 Token 消耗

修改 `backend/server.js`：

```javascript
const stream = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: messages,
  max_tokens: 500,  // 限制输出长度
  temperature: 0.7,
  stream: true,
});
```

### 3. 限制历史记录长度

修改 `frontend/src/App.tsx`：

```javascript
// 只保留最近 10 条消息
const recentHistory = messages.slice(-10);

const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: userMessage,
    history: recentHistory  // 使用裁剪后的历史
  })
});
```

## 📊 预估费用

### 开发阶段（每天测试 50 次）

**使用 gpt-3.5-turbo**：
- 每次对话约 500 tokens
- 50 次 = 25,000 tokens
- 费用：$0.0375 / 天
- **每月约 $1**

**使用 gpt-4**：
- 每次对话约 500 tokens
- 50 次 = 25,000 tokens
- 费用：$0.75 / 天
- **每月约 $22.5**

💡 **建议**：开发阶段使用 gpt-3.5-turbo，足够满足需求且费用低。

## 🎉 完成后的下一步

### 1. 部署到线上

- 后端部署到 Vercel / Railway / Render
- 前端部署到 Vercel / Netlify
- 配置环境变量

### 2. 增强功能

- [ ] 添加用户身份验证
- [ ] 保存聊天历史到数据库
- [ ] 添加文件上传功能
- [ ] 添加语音输入/输出
- [ ] 添加多语言支持

### 3. 写进简历

完成这个 Demo 后，可以在简历中这样写：

```markdown
### AI 聊天助手（个人项目）
**技术栈**：React、TypeScript、Node.js、OpenAI API

**项目简介**：
基于大模型的智能聊天应用，支持实时对话和流式输出。

**技术实现**：
- 使用 OpenAI API 集成 GPT-3.5/4 模型
- 实现 Server-Sent Events 流式输出（打字机效果）
- 使用 react-markdown 渲染 Markdown 内容
- 使用 react-syntax-highlighter 实现代码高亮
- 会话历史管理，支持多轮对话上下文

**项目亮点**：
- 完整的前后端实现，掌握大模型应用开发流程
- 流式输出实现，提升用户体验
- Prompt Engineering 优化，提升 AI 输出质量
```

## 📞 需要帮助？

如有问题，可以：
1. 查看浏览器控制台错误信息
2. 查看后端终端日志
3. 查看 README.md 详细文档

---

**祝你开发顺利！** 🎉
