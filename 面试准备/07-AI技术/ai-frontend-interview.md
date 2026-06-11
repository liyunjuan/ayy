# AI 前端面试指南 - 2024-2026

> 前端工程师必备的 AI 技术知识与实战应用

---

## 目录

- [一、AI 基础概念](#一ai-基础概念)
- [二、LLM API 集成](#二llm-api-集成)
- [三、Prompt Engineering](#三prompt-engineering)
- [四、流式响应](#四流式响应)
- [五、Function Calling](#五function-calling)
- [六、AI 框架与工具](#六ai-框架与工具)
- [七、实战项目案例](#七实战项目案例)
- [八、AI 辅助开发](#八ai-辅助开发)
- [九、性能与优化](#九性能与优化)
- [十、面试高频问答](#十面试高频问答)

---

## 一、AI 基础概念

### 1.1 大语言模型（LLM）

**什么是 LLM？**
- Large Language Model（大语言模型）
- 基于 Transformer 架构，通过海量文本数据训练
- 能理解和生成自然语言文本
- 代表产品：GPT-4、Claude、Gemini、文心一言

**主流模型对比（2024）**

| 模型 | 公司 | 上下文长度 | 特点 |
|------|------|-----------|------|
| **GPT-4 Turbo** | OpenAI | 128K tokens | 性能强，生态完善 |
| **Claude 3 Opus** | Anthropic | 200K tokens | 长文本处理好，安全性高 |
| **Gemini 1.5 Pro** | Google | 1M tokens | 超长上下文 |
| **文心一言 4.0** | 百度 | 128K tokens | 中文优化 |

**Token 概念**
```javascript
// 1 token ≈ 0.75 个英文单词
// 1 token ≈ 0.5 个中文字
"Hello World" // 约 2-3 tokens
"你好世界"     // 约 6-8 tokens

// 计算成本
const inputTokens = 1000;
const outputTokens = 500;
const costPer1KInputTokens = 0.01; // $0.01/1K tokens
const costPer1KOutputTokens = 0.03; // $0.03/1K tokens

const cost = 
  (inputTokens / 1000) * costPer1KInputTokens +
  (outputTokens / 1000) * costPer1KOutputTokens;
// 约 $0.025
```

---

### 1.2 AI 在前端的应用场景

**1. 内容生成**
- 文章生成、摘要提取
- 代码生成与补全
- 图片描述、alt 文本生成

**2. 智能交互**
- AI 聊天机器人
- 智能客服
- 语音助手

**3. 数据处理**
- 文本分类与标注
- 情感分析
- 信息提取

**4. 开发辅助**
- 代码审查
- Bug 修复建议
- 测试用例生成

**5. 用户体验**
- 个性化推荐
- 智能搜索
- 自动化工作流

---

## 二、LLM API 集成

### 2.1 OpenAI API（GPT）

**安装**
```bash
npm install openai
```

**基础使用**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat Completion
async function chat(message: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });
  
  return completion.choices[0].message.content;
}

// 使用
const response = await chat('What is React?');
console.log(response);
```

**流式响应**
```typescript
async function streamChat(message: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: message }],
    stream: true
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content);
  }
}
```

**前端集成（Next.js）**
```typescript
// app/api/chat/route.ts
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    stream: true
  });
  
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}

// app/page.tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

---

### 2.2 Anthropic API（Claude）

**安装**
```bash
npm install @anthropic-ai/sdk
```

**基础使用**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function chat(message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: message }
    ]
  });
  
  return response.content[0].text;
}
```

**流式响应**
```typescript
async function streamChat(message: string) {
  const stream = await anthropic.messages.stream({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }]
  });
  
  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      process.stdout.write(event.delta.text);
    }
  }
}
```

**前端集成（使用 Vercel AI SDK）**
```typescript
// app/api/chat/route.ts
import { Anthropic } from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages,
    stream: true
  });
  
  const stream = AnthropicStream(response);
  return new StreamingTextResponse(stream);
}
```

---

### 2.3 Google Gemini API

**安装**
```bash
npm install @google/generative-ai
```

**基础使用**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function chat(message: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(message);
  const response = await result.response;
  return response.text();
}
```

**流式响应**
```typescript
async function streamChat(message: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContentStream(message);
  
  for await (const chunk of result.stream) {
    const text = chunk.text();
    process.stdout.write(text);
  }
}
```

---

### 2.4 API 调用最佳实践

**错误处理**
```typescript
async function chatWithRetry(message: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await chat(message);
    } catch (error) {
      if (error.status === 429) {
        // Rate limit，等待后重试
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else if (i === retries - 1) {
        throw error;
      }
    }
  }
}
```

**成本控制**
```typescript
function estimateCost(text: string, model: string) {
  const tokens = Math.ceil(text.length * 0.75); // 粗略估算
  
  const pricing = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 }
  };
  
  const price = pricing[model];
  return (tokens / 1000) * price.input;
}

// 使用前估算
const cost = estimateCost(userInput, 'gpt-4');
if (cost > MAX_COST_PER_REQUEST) {
  throw new Error('Request too expensive');
}
```

**缓存策略**
```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60 // 1 小时
});

async function cachedChat(message: string) {
  const cacheKey = `chat:${message}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  
  const response = await chat(message);
  cache.set(cacheKey, response);
  return response;
}
```

---

## 三、Prompt Engineering

### 3.1 基础原则

**1. 明确清晰**
```typescript
// ❌ 模糊的提示
const prompt = "Write about AI";

// ✅ 清晰的提示
const prompt = `Write a 200-word introduction to artificial intelligence for beginners. 
Include:
- Definition of AI
- Main applications
- Benefits and challenges
Use simple language.`;
```

**2. 提供上下文**
```typescript
// ❌ 缺少上下文
const prompt = "Fix this code";

// ✅ 提供上下文
const prompt = `I'm building a React component that fetches user data.
The code below has a bug where the loading state never changes.
Please fix it and explain what was wrong.

\`\`\`tsx
${codeSnippet}
\`\`\``;
```

**3. 指定格式**
```typescript
// ✅ 指定输出格式
const prompt = `Analyze this code for potential issues.
Return the result as JSON with this structure:

{
  "issues": [
    {
      "severity": "high|medium|low",
      "line": number,
      "description": string,
      "fix": string
    }
  ]
}

Code:
\`\`\`
${code}
\`\`\``;
```

---

### 3.2 高级技巧

**Few-Shot Learning**
```typescript
const prompt = `Convert natural language to SQL queries.

Examples:
User: "Find all users older than 25"
SQL: SELECT * FROM users WHERE age > 25;

User: "Get the top 10 products by price"
SQL: SELECT * FROM products ORDER BY price DESC LIMIT 10;

User: "Count how many orders were placed today"
SQL: SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE();

Now convert this:
User: "${userQuery}"
SQL:`;
```

**Chain of Thought（思维链）**
```typescript
const prompt = `Solve this problem step by step:

Problem: A company has 100 employees. 60% work in engineering, 
and 40% of engineers are senior. How many senior engineers are there?

Think through this step by step:
1. First, calculate...
2. Then, calculate...
3. Finally...

Show your reasoning.`;
```

**Role Prompting**
```typescript
const prompt = `You are an expert React developer with 10 years of experience.
You specialize in performance optimization and best practices.

Review this component and provide:
1. Performance issues
2. Best practice violations
3. Specific improvements

Component:
\`\`\`tsx
${componentCode}
\`\`\``;
```

---

### 3.3 实用 Prompt 模板

**代码审查**
```typescript
function createCodeReviewPrompt(code: string, language: string) {
  return `Review this ${language} code for:
- Bugs and potential errors
- Performance issues
- Security vulnerabilities
- Code style and best practices
- Suggestions for improvement

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed analysis with specific line numbers and examples.`;
}
```

**文档生成**
```typescript
function createDocPrompt(code: string) {
  return `Generate comprehensive documentation for this function.

Include:
- Brief description
- @param for each parameter (type and description)
- @returns (type and description)
- @example with 2-3 usage examples
- @throws for possible errors

Code:
\`\`\`typescript
${code}
\`\`\`

Format as JSDoc comments.`;
}
```

**单元测试生成**
```typescript
function createTestPrompt(code: string) {
  return `Generate unit tests for this function using Jest.

Requirements:
- Test happy path
- Test edge cases
- Test error handling
- Use descriptive test names
- Include setup and teardown if needed

Code:
\`\`\`typescript
${code}
\`\`\`

Generate complete test file with all imports.`;
}
```

---

## 四、流式响应

### 4.1 服务端流式响应

**Node.js 实现**
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    stream: true
  });
  
  // 创建可读流
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    }
  });
}
```

**使用 Vercel AI SDK**
```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    stream: true
  });
  
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

---

### 4.2 前端流式接收

**使用 Fetch API**
```typescript
async function streamChat(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  let result = '';
  
  while (true) {
    const { done, value } = await reader!.read();
    
    if (done) break;
    
    const chunk = decoder.decode(value);
    result += chunk;
    
    // 实时更新 UI
    updateUI(result);
  }
  
  return result;
}
```

**使用 EventSource（SSE）**
```typescript
// 服务端
export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      for await (const chunk of aiStream) {
        const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
        controller.enqueue(encoder.encode(data));
      }
      
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// 客户端
const eventSource = new EventSource('/api/chat?message=' + encodeURIComponent(message));

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.text === '[DONE]') {
    eventSource.close();
    return;
  }
  
  updateUI(data.text);
};

eventSource.onerror = () => {
  eventSource.close();
};
```

**使用 Vercel AI SDK React Hook**
```typescript
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat'
  });
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(m => (
          <div key={m.id} className={`message message-${m.role}`}>
            {m.content}
          </div>
        ))}
        {isLoading && <div className="loading">Thinking...</div>}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

---

### 4.3 流式响应优化

**打字机效果**
```typescript
function useTypewriter(text: string, speed = 50) {
  const [displayText, setDisplayText] = React.useState('');
  
  React.useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return displayText;
}

// 使用
function Message({ content }: { content: string }) {
  const displayText = useTypewriter(content);
  return <div>{displayText}</div>;
}
```

**中断流式响应**
```typescript
function Chat() {
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const handleSubmit = async (message: string) => {
    // 创建 AbortController
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
        signal: abortControllerRef.current.signal
      });
      
      // ... 处理流式响应
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      }
    }
  };
  
  const handleStop = () => {
    abortControllerRef.current?.abort();
  };
  
  return (
    <div>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
}
```

---

## 五、Function Calling

### 5.1 基本概念

Function Calling 允许 LLM 调用外部函数，获取实时数据或执行操作。

**流程**：
1. 定义可用函数的 schema
2. LLM 根据用户输入决定是否调用函数
3. 执行函数调用
4. 将结果返回给 LLM
5. LLM 生成最终回复

---

### 5.2 OpenAI Function Calling

**定义函数**
```typescript
const functions = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The temperature unit'
        }
      },
      required: ['location']
    }
  },
  {
    name: 'search_database',
    description: 'Search for information in the database',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results'
        }
      },
      required: ['query']
    }
  }
];
```

**实现函数**
```typescript
const availableFunctions = {
  get_weather: async ({ location, unit = 'celsius' }: any) => {
    // 实际项目中调用天气 API
    const response = await fetch(
      `https://api.weather.com/v1/current?location=${location}&unit=${unit}`
    );
    return response.json();
  },
  
  search_database: async ({ query, limit = 10 }: any) => {
    // 查询数据库
    const results = await db.search(query, limit);
    return results;
  }
};
```

**调用流程**
```typescript
async function chatWithFunctions(messages: any[]) {
  // 1. 发送请求给 GPT
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    functions,
    function_call: 'auto' // 让 GPT 决定是否调用函数
  });
  
  const message = response.choices[0].message;
  
  // 2. 检查是否需要调用函数
  if (message.function_call) {
    const functionName = message.function_call.name;
    const functionArgs = JSON.parse(message.function_call.arguments);
    
    // 3. 执行函数
    const functionToCall = availableFunctions[functionName];
    const functionResponse = await functionToCall(functionArgs);
    
    // 4. 将函数结果返回给 GPT
    messages.push(message);
    messages.push({
      role: 'function',
      name: functionName,
      content: JSON.stringify(functionResponse)
    });
    
    // 5. 获取最终回复
    const secondResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages
    });
    
    return secondResponse.choices[0].message.content;
  }
  
  return message.content;
}

// 使用
const messages = [
  { role: 'user', content: "What's the weather in San Francisco?" }
];

const reply = await chatWithFunctions(messages);
console.log(reply); // "The current weather in San Francisco is..."
```

---

### 5.3 完整示例：智能助手

```typescript
// app/api/chat/route.ts
import OpenAI from 'openai';

const openai = new OpenAI();

const functions = [
  {
    name: 'get_user_info',
    description: 'Get information about a user by ID',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'The user ID' }
      },
      required: ['userId']
    }
  },
  {
    name: 'create_task',
    description: 'Create a new task',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        dueDate: { type: 'string', description: 'Due date in ISO format' }
      },
      required: ['title']
    }
  }
];

const availableFunctions = {
  get_user_info: async ({ userId }: { userId: string }) => {
    // 查询数据库
    const user = await db.users.findUnique({ where: { id: userId } });
    return user;
  },
  
  create_task: async ({ title, description, dueDate }: any) => {
    const task = await db.tasks.create({
      data: { title, description, dueDate }
    });
    return task;
  }
};

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  let currentMessages = [...messages];
  let attempts = 0;
  const maxAttempts = 5; // 防止无限循环
  
  while (attempts < maxAttempts) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: currentMessages,
      functions,
      function_call: 'auto'
    });
    
    const message = response.choices[0].message;
    
    if (!message.function_call) {
      // 没有函数调用，返回最终回复
      return Response.json({ message: message.content });
    }
    
    // 执行函数调用
    const functionName = message.function_call.name;
    const functionArgs = JSON.parse(message.function_call.arguments);
    const functionToCall = availableFunctions[functionName];
    
    if (!functionToCall) {
      return Response.json({ error: 'Function not found' }, { status: 400 });
    }
    
    const functionResponse = await functionToCall(functionArgs);
    
    // 添加到消息历史
    currentMessages.push(message);
    currentMessages.push({
      role: 'function',
      name: functionName,
      content: JSON.stringify(functionResponse)
    });
    
    attempts++;
  }
  
  return Response.json({ error: 'Max attempts reached' }, { status: 500 });
}
```

**前端使用**
```typescript
'use client';
import { useState } from 'react';

export default function Assistant() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await response.json();
      
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.message }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

---

## 六、AI 框架与工具

### 6.1 Vercel AI SDK

**安装**
```bash
npm install ai
```

**核心功能**
- 统一的 API 接口（支持 OpenAI、Anthropic、Cohere 等）
- React Hooks（`useChat`、`useCompletion`）
- 流式响应处理
- 函数调用支持

**基础使用**
```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages
  });
  
  return result.toAIStreamResponse();
}

// app/page.tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

---

### 6.2 LangChain.js

**安装**
```bash
npm install langchain
```

**核心概念**
- **Models**：LLM 封装
- **Prompts**：提示词模板
- **Chains**：组合多个步骤
- **Memory**：对话历史管理
- **Agents**：智能决策与工具调用

**基础示例**
```typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';

const chat = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview',
  temperature: 0.7
});

const response = await chat.call([
  new SystemMessage('You are a helpful assistant.'),
  new HumanMessage('What is React?')
]);

console.log(response.content);
```

**使用 Prompt Template**
```typescript
import { PromptTemplate } from 'langchain/prompts';
import { OpenAI } from 'langchain/llms/openai';
import { LLMChain } from 'langchain/chains';

const llm = new OpenAI({ temperature: 0.7 });

const template = `You are a {role}.
User question: {question}
Your answer:`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ['role', 'question']
});

const chain = new LLMChain({ llm, prompt });

const result = await chain.call({
  role: 'helpful assistant',
  question: 'What is TypeScript?'
});

console.log(result.text);
```

**使用 Memory**
```typescript
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';

const memory = new BufferMemory();
const chain = new ConversationChain({ llm, memory });

// 第一轮对话
await chain.call({ input: 'My name is Tom' });

// 第二轮对话（记住上下文）
const result = await chain.call({ input: "What's my name?" });
console.log(result.response); // "Your name is Tom"
```

---

### 6.3 向量数据库

**为什么需要向量数据库？**
- LLM 上下文长度有限
- 需要检索大量文档
- 实现 RAG（Retrieval-Augmented Generation）

**流程**：
1. 将文档转换为向量（Embedding）
2. 存储到向量数据库
3. 用户提问时，查询相关文档
4. 将文档作为上下文传给 LLM

**使用 Pinecone**
```typescript
import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

// 初始化
const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT
});

const index = client.Index('my-index');

// 存储文档
const embeddings = new OpenAIEmbeddings();
const vectorStore = await PineconeStore.fromTexts(
  ['Document 1 content', 'Document 2 content'],
  [{ id: '1' }, { id: '2' }],
  embeddings,
  { pineconeIndex: index }
);

// 查询相似文档
const results = await vectorStore.similaritySearch('user query', 3);
console.log(results);
```

**RAG 实现**
```typescript
import { RetrievalQAChain } from 'langchain/chains';

const chain = RetrievalQAChain.fromLLM(
  llm,
  vectorStore.asRetriever()
);

const response = await chain.call({
  query: 'What is the company policy on vacation?'
});

console.log(response.text);
```

---

## 七、实战项目案例

### 7.1 AI 聊天机器人

**功能**：
- 多轮对话
- 流式响应
- 对话历史
- Markdown 渲染

**完整实现**
```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful AI assistant.',
    messages
  });
  
  return result.toAIStreamResponse();
}

// app/components/Chat.tsx
'use client';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  
  return (
    <div className="flex flex-col h-screen">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter language={match[1]} {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

### 7.2 AI 代码生成器

**功能**：
- 根据需求生成代码
- 支持多种语言
- 代码高亮显示
- 一键复制

```typescript
// app/api/generate/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt, language } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    system: `You are an expert programmer. Generate clean, well-commented code.
Only return the code, no explanations outside code comments.`,
    prompt: `Generate ${language} code for: ${prompt}`
  });
  
  return result.toAIStreamResponse();
}

// app/page.tsx
'use client';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleGenerate = async () => {
    setLoading(true);
    setCode('');
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language })
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';
    
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      result += chunk;
      setCode(result);
    }
    
    setLoading(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">AI Code Generator</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-2">What do you want to build?</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="E.g., A function that validates email addresses"
            className="w-full p-2 border rounded h-32"
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? 'Generating...' : 'Generate Code'}
        </button>
        
        {code && (
          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Copy
            </button>
            <SyntaxHighlighter language={language}>
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 7.3 AI 文档问答（RAG）

**功能**：
- 上传文档
- 向量化存储
- 基于文档内容回答问题

```typescript
// lib/embeddings.ts
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const embeddings = new OpenAIEmbeddings();
const vectorStore = new MemoryVectorStore(embeddings);

export async function addDocument(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
  
  const docs = await splitter.createDocuments([text]);
  await vectorStore.addDocuments(docs);
}

export async function queryDocuments(query: string, k = 3) {
  const results = await vectorStore.similaritySearch(query, k);
  return results.map(doc => doc.pageContent).join('\n\n');
}

// app/api/qa/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { queryDocuments } from '@/lib/embeddings';

export async function POST(req: Request) {
  const { question } = await req.json();
  
  // 1. 查询相关文档
  const context = await queryDocuments(question);
  
  // 2. 生成回答
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    system: `You are a helpful assistant. Answer questions based on the provided context.
If the answer is not in the context, say "I don't have enough information to answer that."`,
    prompt: `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`
  });
  
  return result.toAIStreamResponse();
}
```

---

## 八、AI 辅助开发

### 8.1 GitHub Copilot

**功能**：
- 代码补全
- 函数生成
- 单元测试生成
- 文档生成

**最佳实践**：
```typescript
// 1. 写清晰的注释，Copilot 会根据注释生成代码
// Function to validate email address using regex
function validateEmail(email: string): boolean {
  // Copilot 会自动补全实现
}

// 2. 使用函数签名提示
function fetchUserData(userId: string): Promise<User> {
  // Copilot 会生成完整的 fetch 实现
}

// 3. 单元测试生成
// Test suite for validateEmail function
describe('validateEmail', () => {
  // Copilot 会生成测试用例
});
```

---

### 8.2 Cursor

**特色功能**：
- AI 代码编辑（Cmd+K）
- 智能补全
- 代码解释
- Bug 修复建议

**使用技巧**：
```typescript
// 选中代码，按 Cmd+K，输入指令：
// "优化这段代码的性能"
// "添加错误处理"
// "转换为 TypeScript"
// "生成单元测试"
```

---

### 8.3 自定义 AI 开发工具

**代码审查助手**
```typescript
// scripts/ai-review.ts
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function reviewCode() {
  // 获取 git diff
  const { stdout } = await execAsync('git diff HEAD');
  
  if (!stdout) {
    console.log('No changes to review');
    return;
  }
  
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: `Review this code diff and provide feedback:

${stdout}

Focus on:
- Potential bugs
- Performance issues
- Security vulnerabilities
- Best practices
- Suggestions for improvement

Format your response as markdown.`
  });
  
  console.log(text);
}

reviewCode();
```

**自动生成 Commit Message**
```typescript
// scripts/ai-commit.ts
async function generateCommitMessage() {
  const { stdout } = await execAsync('git diff --staged');
  
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: `Generate a concise git commit message for these changes:

${stdout}

Follow conventional commits format:
- feat: new feature
- fix: bug fix
- docs: documentation
- refactor: code refactor
- test: add tests
- chore: maintenance

Return only the commit message, no explanations.`
  });
  
  console.log(text);
  
  // 可选：自动提交
  // await execAsync(`git commit -m "${text}"`);
}
```

---

## 九、性能与优化

### 9.1 缓存策略

**Response Caching**
```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60 // 1小时
});

export async function POST(req: Request) {
  const { message } = await req.json();
  const cacheKey = `chat:${message}`;
  
  // 检查缓存
  if (cache.has(cacheKey)) {
    return Response.json({ message: cache.get(cacheKey) });
  }
  
  // 调用 API
  const response = await chat(message);
  
  // 存入缓存
  cache.set(cacheKey, response);
  
  return Response.json({ message: response });
}
```

**Prompt Caching（Claude）**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const response = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: 'Very long system prompt...',
      cache_control: { type: 'ephemeral' } // 缓存这部分
    }
  ],
  messages: [
    { role: 'user', content: 'User message' }
  ]
});
```

---

### 9.2 成本优化

**选择合适的模型**
```typescript
const MODEL_PRICING = {
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 }
};

function selectModel(complexity: 'simple' | 'complex') {
  // 简单任务用便宜模型
  if (complexity === 'simple') {
    return 'gpt-3.5-turbo';
  }
  return 'gpt-4-turbo';
}
```

**控制 Token 使用**
```typescript
async function chat(message: string, maxTokens = 500) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: message }],
    max_tokens: maxTokens,
    // 限制输出长度
    stop: ['\n\n\n'] // 遇到3个换行符停止
  });
  
  return response.choices[0].message.content;
}
```

**批量处理**
```typescript
async function batchProcess(tasks: string[]) {
  // 将多个小任务合并成一个请求
  const combinedPrompt = `Process these tasks:
${tasks.map((task, i) => `${i + 1}. ${task}`).join('\n')}

Return results as JSON array.`;
  
  const response = await chat(combinedPrompt);
  return JSON.parse(response);
}
```

---

### 9.3 错误处理与重试

```typescript
async function chatWithRetry(message: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chat(message);
    } catch (error: any) {
      // Rate limit
      if (error.status === 429) {
        const delay = Math.pow(2, i) * 1000; // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Server error，可以重试
      if (error.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // 其他错误，直接抛出
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## 十、面试高频问答

### Q1：什么是 LLM？与传统 AI 有什么区别？

A：LLM（Large Language Model）是大语言模型，基于 Transformer 架构，通过海量文本数据训练。

**与传统 AI 的区别**：
1. **通用性**：LLM 可以完成多种任务，传统 AI 通常针对特定任务
2. **少样本学习**：LLM 可以通过 Few-Shot Learning 快速适应新任务
3. **理解能力**：LLM 能理解上下文和语义
4. **生成能力**：LLM 可以生成连贯的自然语言

---

### Q2：前端如何集成 LLM API？

A：主要有两种方式：

**1. 服务端集成（推荐）**
- 在 API 路由中调用 LLM API
- 保护 API Key 安全
- 控制成本和速率限制

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { message } = await req.json();
  const response = await openai.chat.completions.create({...});
  return Response.json({ message: response });
}
```

**2. 客户端集成（不推荐）**
- API Key 暴露风险
- 无法控制成本
- 仅用于演示或个人项目

---

### Q3：什么是 Prompt Engineering？有哪些技巧？

A：Prompt Engineering 是设计有效提示词的技术。

**核心技巧**：
1. **明确清晰**：详细描述任务和期望输出
2. **提供示例**：Few-Shot Learning
3. **角色扮演**：让 AI 扮演专家角色
4. **思维链**：让 AI 逐步思考
5. **指定格式**：要求特定的输出格式（JSON、Markdown）

---

### Q4：什么是流式响应？如何实现？

A：流式响应是指 AI 逐字生成内容，而不是等全部完成再返回。

**优势**：
- 更好的用户体验
- 减少感知延迟
- 实时反馈

**实现方式**：
- Server-Sent Events (SSE)
- ReadableStream
- 使用 Vercel AI SDK 的 `useChat` Hook

---

### Q5：什么是 Function Calling？

A：Function Calling 允许 LLM 调用外部函数，获取实时数据或执行操作。

**应用场景**：
- 查询数据库
- 调用第三方 API（天气、股票）
- 执行业务逻辑

**流程**：
1. 定义函数 schema
2. LLM 决定是否调用函数
3. 执行函数
4. 将结果返回给 LLM
5. 生成最终回复

---

### Q6：如何优化 AI 应用的性能？

A：
1. **缓存**：缓存常见问题的回答
2. **选择合适模型**：简单任务用便宜模型
3. **限制 Token**：设置 `max_tokens`
4. **批量处理**：合并多个小任务
5. **Prompt 优化**：精简提示词

---

### Q7：如何控制 AI 应用的成本？

A：
1. **模型选择**：根据任务复杂度选择模型
2. **Token 限制**：设置 `max_tokens`
3. **缓存策略**：避免重复请求
4. **速率限制**：防止滥用
5. **监控告警**：设置成本阈值

---

### Q8：什么是 RAG？如何实现？

A：RAG（Retrieval-Augmented Generation）是检索增强生成，结合向量数据库和 LLM。

**流程**：
1. 将文档转换为向量
2. 存储到向量数据库
3. 用户提问时查询相关文档
4. 将文档作为上下文传给 LLM
5. 生成回答

**优势**：
- 突破上下文长度限制
- 实时更新知识
- 减少幻觉（Hallucination）

---

### Q9：AI 应用有哪些安全问题？

A：
1. **API Key 泄露**：服务端调用，不要暴露到前端
2. **Prompt Injection**：用户输入可能影响 AI 行为
3. **敏感信息泄露**：不要发送敏感数据给 LLM
4. **成本攻击**：恶意用户大量调用 API

**防御措施**：
- API Key 存环境变量
- 输入验证和过滤
- 速率限制
- 成本监控

---

### Q10：GitHub Copilot、Cursor 等 AI 工具如何提高开发效率？

A：
1. **代码补全**：自动补全代码，减少重复劳动
2. **代码生成**：根据注释生成函数实现
3. **单元测试**：自动生成测试用例
4. **代码解释**：帮助理解复杂代码
5. **Bug 修复**：智能建议修复方案

**最佳实践**：
- 写清晰的注释
- 审查 AI 生成的代码
- 结合单元测试验证
- 作为辅助工具，而非完全依赖

---

## 总结

这份 AI 前端面试指南涵盖了：

1. **AI 基础**：LLM 概念、应用场景
2. **API 集成**：OpenAI、Claude、Gemini 使用
3. **Prompt Engineering**：提示词设计技巧
4. **流式响应**：实现实时交互
5. **Function Calling**：调用外部函数
6. **AI 框架**：Vercel AI SDK、LangChain.js
7. **实战项目**：聊天机器人、代码生成器、文档问答
8. **AI 辅助开发**：GitHub Copilot、Cursor
9. **性能优化**：缓存、成本控制、错误处理
10. **面试问答**：高频问题与标准答案

---

**AI 技术正在改变前端开发，掌握 AI 集成能力是 2024-2026 年的核心竞争力！** 🚀
