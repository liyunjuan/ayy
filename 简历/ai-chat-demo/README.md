# AI 聊天 Demo

一个完整的 AI 聊天应用示例，支持流式输出（打字机效果）。

## 📋 功能特性

- ✅ 实时 AI 对话
- ✅ 流式输出（打字机效果）
- ✅ 会话历史记录
- ✅ Markdown 渲染
- ✅ 代码高亮
- ✅ 错误处理
- ✅ 加载状态

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- react-markdown（Markdown 渲染）
- react-syntax-highlighter（代码高亮）

### 后端
- Node.js
- Express
- OpenAI API / Claude API

## 📦 项目结构

```
ai-chat-demo/
├── frontend/           # 前端项目
│   ├── src/
│   │   ├── App.tsx    # 主组件
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx      # 消息组件
│   │   │   ├── ChatInput.tsx        # 输入框组件
│   │   │   └── TypingIndicator.tsx  # 加载动画
│   │   └── api/
│   │       └── chat.ts              # API 调用
│   └── package.json
│
├── backend/            # 后端项目
│   ├── server.js       # Express 服务器
│   ├── routes/
│   │   └── chat.js     # 聊天路由
│   └── package.json
│
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install
```

### 2. 配置 API Key

创建 `backend/.env` 文件：

```env
# 使用 OpenAI
OPENAI_API_KEY=sk-your-api-key-here
API_PROVIDER=openai

# 或使用 Claude
# ANTHROPIC_API_KEY=sk-ant-your-api-key-here
# API_PROVIDER=claude
```

### 3. 启动项目

```bash
# 启动后端（端口 3001）
cd backend
npm run dev

# 启动前端（端口 3000）
cd frontend
npm start
```

### 4. 访问应用

打开浏览器访问：http://localhost:3000

## 📝 核心代码说明

### 前端 - 流式接收

```typescript
// 使用 fetch + ReadableStream 接收流式数据
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, history })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  setAiReply(prev => prev + chunk); // 逐字追加
}
```

### 后端 - 流式输出

```javascript
// 使用 OpenAI Stream API
const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...history, { role: 'user', content: message }],
  stream: true
});

// 逐块返回给前端
for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta?.content || '';
  res.write(text);
}

res.end();
```

## 🎨 界面预览

```
┌─────────────────────────────────────────┐
│  AI 智能助手                      [设置] │
├─────────────────────────────────────────┤
│                                         │
│  👤 你好，帮我写一个 React 组件         │
│                                         │
│  🤖 好的，我为您生成一个...             │
│     ```jsx                              │
│     function Example() {                │
│       return <div>Hello</div>           │
│     }                                   │
│     ```                                 │
│                                         │
├─────────────────────────────────────────┤
│  [输入消息...]              [发送] ➤   │
└─────────────────────────────────────────┘
```

## 📚 API 说明

### POST /api/chat

**请求体**：
```json
{
  "message": "用户输入的消息",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**响应**：
- Content-Type: `text/event-stream`
- 流式返回 AI 生成的文本

## 🔧 自定义配置

### 修改模型

编辑 `backend/routes/chat.js`：

```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4',        // 修改为 gpt-3.5-turbo 更便宜
  temperature: 0.7,      // 创造性 (0-2)
  max_tokens: 1000,      // 最大输出长度
  stream: true
});
```

### 修改系统提示词

```javascript
const messages = [
  {
    role: 'system',
    content: '你是一个专业的前端工程师助手，擅长 React、Vue、TypeScript。'
  },
  ...history,
  { role: 'user', content: message }
];
```

## 🐛 常见问题

### 1. API Key 错误
检查 `.env` 文件是否正确配置，Key 是否有效。

### 2. CORS 错误
后端已配置 CORS，允许 `http://localhost:3000` 访问。

### 3. 流式输出不生效
检查浏览器是否支持 `ReadableStream`（Chrome 93+）。

### 4. 费用问题
- GPT-4: $0.03 / 1K tokens（输入）
- GPT-3.5-turbo: $0.0015 / 1K tokens（便宜 20 倍）
- 建议开发时使用 GPT-3.5-turbo

## 📈 扩展功能

### 1. 添加身份验证
```javascript
// 中间件验证 Token
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 2. 保存聊天历史
```javascript
// 使用 MongoDB/MySQL 保存
await ChatHistory.create({
  userId: req.user.id,
  messages: [...history, userMessage, aiReply],
  createdAt: new Date()
});
```

### 3. 添加 RAG（知识库检索）
```javascript
// 1. 检索相关文档
const docs = await vectorSearch(message);

// 2. 组合 Prompt
const prompt = `基于以下文档回答：\n${docs}\n\n问题：${message}`;
```

### 4. 多轮对话优化
```javascript
// 限制历史记录条数，避免 Token 超限
const recentHistory = history.slice(-10); // 只保留最近 10 条
```

## 📝 写进简历

完成这个 Demo 后，你可以这样写简历：

```markdown
### AI 聊天助手（个人项目）
**技术栈**：React、TypeScript、Node.js、OpenAI API

**项目简介**：
一个基于大模型的智能聊天应用，支持实时对话和流式输出。

**技术实现**：
- 使用 OpenAI API 集成 GPT-4 模型
- 实现 Server-Sent Events 流式输出，打字机效果
- 使用 react-markdown 渲染 Markdown 内容
- 使用 react-syntax-highlighter 实现代码高亮
- 会话历史管理，支持多轮对话

**项目亮点**：
- 完整的前后端实现，了解大模型应用开发流程
- 掌握 Prompt Engineering，优化 AI 输出质量
- 流式输出实现，提升用户体验
```

## 🎯 下一步学习

1. **LangChain**：AI 应用开发框架
2. **向量数据库**：实现 RAG（检索增强生成）
3. **Function Calling**：让 AI 调用自定义函数
4. **Prompt Engineering**：写出高质量提示词

## 📞 联系方式

如有问题，欢迎交流：lyj_515@163.com

---

**祝你学习愉快！** 🚀
