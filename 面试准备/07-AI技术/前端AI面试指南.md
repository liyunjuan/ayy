# 前端 AI 面试指南 2026

## 目录
1. [AI 基础概念](#ai-基础概念)
2. [LLM 与前端集成](#llm-与前端集成)
3. [提示工程](#提示工程)
4. [前端 AI 框架与工具](#前端-ai-框架与工具)
5. [实战应用场景](#实战应用场景)
6. [AI 辅助开发](#ai-辅助开发)
7. [性能优化与最佳实践](#性能优化与最佳实践)
8. [面试常见问题](#面试常见问题)

---

## AI 基础概念

### 1. LLM（大语言模型）基础

#### 主流模型对比（2026）
```javascript
const LLM_MODELS = {
  openai: {
    'gpt-4o': {
      context: 128000,
      pricing: { input: 2.5, output: 10 }, // $/1M tokens
      features: ['vision', 'function-calling', 'json-mode']
    },
    'gpt-4-turbo': {
      context: 128000,
      pricing: { input: 10, output: 30 }
    }
  },
  anthropic: {
    'claude-sonnet-4-6': {
      context: 200000,
      pricing: { input: 3, output: 15 },
      features: ['vision', 'tool-use', 'thinking']
    },
    'claude-opus-4-8': {
      context: 200000,
      pricing: { input: 15, output: 75 }
    }
  },
  google: {
    'gemini-2.0-flash': {
      context: 1000000,
      pricing: { input: 0.075, output: 0.3 },
      features: ['multimodal', 'live-api']
    }
  }
};
```

#### Token 计算
```javascript
// 估算 token 数量（英文约 4 字符/token，中文约 2 字符/token）
function estimateTokens(text, language = 'en') {
  const charPerToken = language === 'zh' ? 2 : 4;
  return Math.ceil(text.length / charPerToken);
}

// 计算成本
function calculateCost(inputTokens, outputTokens, model) {
  const pricing = LLM_MODELS.anthropic['claude-sonnet-4-6'].pricing;
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  return inputCost + outputCost;
}

// 示例
const prompt = "请帮我写一个 React 组件";
const response = "当然，这是一个示例组件..."; // 假设 500 tokens
const cost = calculateCost(
  estimateTokens(prompt, 'zh'),
  500,
  'claude-sonnet-4-6'
);
console.log(`成本: $${cost.toFixed(6)}`);
```

### 2. 核心概念

#### Temperature（温度）
```javascript
// 控制输出的随机性
const requestConfig = {
  temperature: 0.0,  // 确定性输出，适合代码生成、数据提取
  // temperature: 0.7,  // 平衡创造性和准确性，适合通用对话
  // temperature: 1.0,  // 高创造性，适合创意写作
};
```

#### System Prompt vs User Prompt
```javascript
const chatRequest = {
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: `你是一个专业的前端开发助手。
规则：
- 总是使用 TypeScript
- 遵循 React 最佳实践
- 代码要包含完整的类型定义`,
  messages: [
    {
      role: 'user',
      content: '创建一个可复用的 Button 组件'
    }
  ]
};
```

#### Function Calling / Tool Use
```javascript
// 让 LLM 调用自定义函数
const tools = [
  {
    name: 'get_weather',
    description: '获取指定城市的天气信息',
    input_schema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: '城市名称，如"北京"'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: '温度单位'
        }
      },
      required: ['city']
    }
  }
];

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  tools,
  messages: [
    { role: 'user', content: '北京今天天气怎么样？' }
  ]
});

// LLM 会返回 tool_use
if (response.content[0].type === 'tool_use') {
  const toolCall = response.content[0];
  const weather = await getWeather(toolCall.input.city);
  
  // 继续对话，传入工具执行结果
  const finalResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools,
    messages: [
      { role: 'user', content: '北京今天天气怎么样？' },
      { role: 'assistant', content: response.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: JSON.stringify(weather)
          }
        ]
      }
    ]
  });
}
```

---

## LLM 与前端集成

### 1. 基础 API 调用

#### Anthropic Claude API
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function chat(message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: message }
    ],
  });

  return response.content[0].text;
}

// 使用
const answer = await chat('React 和 Vue 的主要区别是什么？');
console.log(answer);
```

#### OpenAI API
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chat(message: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: '你是一个前端专家' },
      { role: 'user', content: message }
    ],
  });

  return completion.choices[0].message.content;
}
```

### 2. 流式响应（Streaming）

#### 实现打字机效果
```typescript
// 后端 API (Next.js Route Handler)
import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const { message } = await req.json();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: message }],
  });

  // 创建 ReadableStream
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const text = event.delta.text;
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

```typescript
// 前端组件
'use client';

import { useState } from 'react';

export default function StreamingChat() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const text = decoder.decode(value);
      setResponse((prev) => prev + text);
    }

    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入消息..."
        />
        <button type="submit" disabled={loading}>
          发送
        </button>
      </form>

      <div className="response">
        {response}
        {loading && <span className="cursor">▊</span>}
      </div>
    </div>
  );
}
```

### 3. Server-Sent Events (SSE)

```typescript
// 前端使用 EventSource
function useStreamingChat() {
  const [response, setResponse] = useState('');

  const sendMessage = (message: string) => {
    setResponse('');
    const eventSource = new EventSource(
      `/api/chat?message=${encodeURIComponent(message)}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResponse((prev) => prev + data.text);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  };

  return { response, sendMessage };
}
```

### 4. 对话历史管理

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class ConversationManager {
  private messages: Message[] = [];
  private maxMessages: number;

  constructor(maxMessages = 20) {
    this.maxMessages = maxMessages;
  }

  addMessage(role: 'user' | 'assistant', content: string) {
    this.messages.push({
      role,
      content,
      timestamp: new Date(),
    });

    // 保持对话历史在限制内
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getMessages() {
    return this.messages;
  }

  // 计算总 token 数
  estimateTokens() {
    const totalChars = this.messages.reduce(
      (sum, msg) => sum + msg.content.length,
      0
    );
    return Math.ceil(totalChars / 4);
  }

  // 保存到本地存储
  save(conversationId: string) {
    localStorage.setItem(
      `conversation_${conversationId}`,
      JSON.stringify(this.messages)
    );
  }

  // 从本地存储加载
  load(conversationId: string) {
    const data = localStorage.getItem(`conversation_${conversationId}`);
    if (data) {
      this.messages = JSON.parse(data);
    }
  }

  clear() {
    this.messages = [];
  }
}

// 使用
const conversation = new ConversationManager();
conversation.addMessage('user', '你好');
conversation.addMessage('assistant', '你好！有什么可以帮助你的吗？');
```

---

## 提示工程

### 1. 提示工程基础原则

#### Few-Shot Learning
```typescript
const fewShotPrompt = `你是一个 React 组件生成器。请根据描述生成组件。

示例 1:
输入: 一个红色的按钮
输出:
\`\`\`tsx
interface ButtonProps {
  onClick: () => void;
}

export function Button({ onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: 'red', color: 'white', padding: '8px 16px' }}
    >
      点击我
    </button>
  );
}
\`\`\`

示例 2:
输入: 一个输入框和提交按钮的表单
输出:
\`\`\`tsx
import { useState } from 'react';

export function Form() {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交的值:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

现在，请生成：一个带有标题和描述的卡片组件`;
```

#### Chain of Thought（思维链）
```typescript
const chainOfThoughtPrompt = `请帮我优化这段代码的性能。

要求：
1. 首先分析代码的性能问题
2. 然后解释为什么会有这些问题
3. 最后给出优化后的代码

代码：
\`\`\`javascript
function ExpensiveList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} onClick={() => console.log(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
\`\`\`

请按照上述步骤逐步分析和优化。`;
```

#### 角色提示
```typescript
const systemPrompts = {
  codeReviewer: `你是一位资深的前端技术专家，拥有 10 年以上的开发经验。
你的职责是进行代码审查，关注：
1. 代码质量和可维护性
2. 性能优化
3. 安全性问题
4. 最佳实践
5. 潜在的 bug

请用专业但友好的语气提供建设性的反馈。`,

  juniorMentor: `你是一位耐心的前端导师，擅长用简单易懂的方式解释复杂概念。
你的目标是帮助初学者理解前端技术，请：
1. 使用简单的语言
2. 提供具体的代码示例
3. 解释为什么要这样做
4. 鼓励学习者提问`,

  debugger: `你是一个调试专家。当用户描述问题时，请：
1. 询问关键信息（错误信息、环境、复现步骤）
2. 分析可能的原因
3. 提供排查步骤
4. 给出解决方案
5. 建议如何预防类似问题`,
};
```

### 2. 实用提示词模板

#### 代码生成
```typescript
const codeGenerationTemplate = (requirement: string, context?: string) => `
作为一个前端开发专家，请根据以下需求生成代码：

需求：${requirement}

${context ? `上下文信息：\n${context}\n` : ''}

要求：
- 使用 TypeScript
- 包含完整的类型定义
- 遵循 React 最佳实践
- 添加必要的注释
- 处理边界情况
- 考虑可访问性（a11y）

请直接输出代码，不需要额外解释。
`;

// 使用
const prompt = codeGenerationTemplate(
  '创建一个支持多选的下拉框组件',
  '项目使用 React 18 + TypeScript + Tailwind CSS'
);
```

#### 代码优化
```typescript
const codeOptimizationTemplate = (code: string, focus: string[]) => `
请优化以下代码，重点关注：${focus.join('、')}

原始代码：
\`\`\`typescript
${code}
\`\`\`

请提供：
1. 问题分析
2. 优化后的代码
3. 性能提升说明（如适用）
4. 其他建议
`;

// 使用
const prompt = codeOptimizationTemplate(
  `function MyComponent() { /* ... */ }`,
  ['性能', '可读性', '类型安全']
);
```

#### 代码审查
```typescript
const codeReviewTemplate = (code: string, prDescription?: string) => `
请对以下代码进行审查：

${prDescription ? `PR 描述：${prDescription}\n` : ''}

代码：
\`\`\`typescript
${code}
\`\`\`

请从以下维度评审：
1. 代码质量（命名、结构、可读性）
2. 潜在的 bug
3. 性能问题
4. 安全隐患
5. 最佳实践
6. 测试建议

对于每个问题，请标注严重程度：🔴 严重 / 🟡 中等 / 🟢 建议
`;
```

### 3. Prompt Caching（提示词缓存）

```typescript
// Anthropic 的 Prompt Caching 功能
const systemPromptWithCaching = [
  {
    type: 'text',
    text: `你是一个前端开发助手。以下是项目的代码规范：

${largeStyleGuide}`, // 假设这是一个很长的规范文档
    cache_control: { type: 'ephemeral' }, // 缓存这部分
  },
];

async function chatWithCaching(userMessage: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPromptWithCaching,
    messages: [{ role: 'user', content: userMessage }],
  });

  // 后续请求会重用缓存，节省成本和延迟
  console.log('Cache stats:', {
    cacheCreationTokens: response.usage.cache_creation_input_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens,
  });

  return response.content[0].text;
}
```

---

## 前端 AI 框架与工具

### 1. Vercel AI SDK

```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// API Route
export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.createChatCompletion({
    model: 'gpt-4o',
    stream: true,
    messages,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

```typescript
// React 组件
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### 2. LangChain.js

```typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

// 创建提示模板
const template = `你是一个{role}。
用户问题：{question}
请提供专业的回答。`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ['role', 'question'],
});

// 创建 LLM
const model = new ChatOpenAI({ temperature: 0.7 });

// 创建链
const chain = new LLMChain({ llm: model, prompt });

// 执行
const result = await chain.call({
  role: '前端开发专家',
  question: 'React 18 的新特性有哪些？',
});

console.log(result.text);
```

#### 文档检索（RAG）
```typescript
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RetrievalQAChain } from 'langchain/chains';

// 1. 加载文档
const docs = [
  '我们的组件库使用 Tailwind CSS 进行样式设置...',
  '所有组件必须支持暗色模式...',
  '性能优化的首要原则是避免不必要的重渲染...',
];

// 2. 分割文档
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const splitDocs = await splitter.createDocuments(docs);

// 3. 创建向量存储
const embeddings = new OpenAIEmbeddings();
const vectorStore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

// 4. 创建检索链
const model = new ChatOpenAI({ temperature: 0 });
const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

// 5. 查询
const response = await chain.call({
  query: '我们的组件如何处理暗色模式？',
});

console.log(response.text);
```

### 3. AI.JSX (React-like 的 AI 应用框架)

```tsx
import * as AI from 'ai-jsx';
import { ChatCompletion, UserMessage } from 'ai-jsx/core/completion';

function App() {
  return (
    <ChatCompletion>
      <UserMessage>
        请用 TypeScript 创建一个 Todo List 组件
      </UserMessage>
    </ChatCompletion>
  );
}

// 执行
const result = await AI.createRenderContext().render(<App />);
console.log(result);
```

### 4. ModelFusion

```typescript
import { generateText, openai } from 'modelfusion';

const text = await generateText({
  model: openai.ChatTextGenerator({
    model: 'gpt-4o',
    temperature: 0.7,
  }),
  prompt: '解释 React Server Components 的工作原理',
});

console.log(text);
```

---

## 实战应用场景

### 1. AI 聊天机器人

```typescript
// app/chat/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-2 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          发送
        </button>
      </form>
    </div>
  );
}
```

### 2. AI 代码生成器

```typescript
// components/CodeGenerator.tsx
'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setCode(data.code);
    } catch (error) {
      console.error('生成代码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI 代码生成器</h1>

      <div className="mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要的组件，例如：一个带有加载状态的搜索框"
          className="w-full border rounded-lg p-4 h-32 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={generateCode}
          disabled={loading || !prompt}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '生成中...' : '生成代码'}
        </button>
      </div>

      {code && (
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            复制
          </button>
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{ borderRadius: '0.5rem', padding: '1.5rem' }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
```

```typescript
// app/api/generate-code/route.ts
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const systemPrompt = `你是一个 React + TypeScript 代码生成器。
根据用户描述生成高质量的组件代码。

要求：
- 使用 TypeScript
- 使用 React 18+ 的特性
- 包含完整的类型定义
- 代码要简洁、可读
- 只输出代码，不要其他解释

如果用户没有指定样式方案，使用 Tailwind CSS。`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // 提取代码块
  const content = response.content[0].text;
  const codeMatch = content.match(/```(?:tsx?|javascript)?\n([\s\S]*?)\n```/);
  const code = codeMatch ? codeMatch[1] : content;

  return Response.json({ code });
}
```

### 3. AI 智能搜索

```typescript
// components/AISearch.tsx
'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  relevance: number;
}

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResults(data.results);
      setAnswer(data.answer);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AI 智能搜索</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && search()}
            placeholder="问我任何问题..."
            className="flex-1 border rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={search}
            disabled={loading || !query}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            搜索
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <p className="mt-4 text-gray-600">AI 正在思考...</p>
        </div>
      )}

      {answer && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-2xl mr-2">🤖</span>
            AI 回答
          </h2>
          <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">相关结果</h2>
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-blue-600 mb-2">
                  {result.title}
                </h3>
                <p className="text-gray-700">{result.snippet}</p>
                <div className="mt-2 text-sm text-gray-500">
                  相关度: {(result.relevance * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4. AI 图像识别（Vision）

```typescript
// 图片分析组件
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('分析失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI 图像分析</h1>

      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {image && (
        <div className="mb-6">
          <div className="relative w-full h-96 mb-4">
            <Image
              src={image}
              alt="上传的图片"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={analyzeImage}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '分析中...' : '分析图片'}
          </button>
        </div>
      )}

      {analysis && (
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">分析结果：</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
}
```

```typescript
// API Route
import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const { image } = await req.json();
  
  // 移除 data URL 前缀
  const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: '请详细描述这张图片的内容，包括主要元素、颜色、场景等。',
          },
        ],
      },
    ],
  });

  return Response.json({
    analysis: response.content[0].text,
  });
}
```

---

## AI 辅助开发

### 1. GitHub Copilot

#### 最佳实践
```typescript
// 1. 使用清晰的函数名和注释
// 计算两个日期之间的工作日数量（排除周末）
function calculateWorkdays(startDate: Date, endDate: Date): number {
  // Copilot 会自动生成实现
}

// 2. 使用类型定义引导生成
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// 根据角色过滤用户
function filterUsersByRole(users: User[], role: User['role']): User[] {
  // Copilot 理解类型并生成正确代码
}

// 3. Few-shot 示例
// 示例：parseJSON('{"name":"John"}') => {name: "John"}
// 示例：parseJSON('invalid') => null
function parseJSON(str: string): any {
  // Copilot 会根据示例生成实现
}
```

### 2. Cursor / Claude Code

```typescript
// 使用 AI 聊天进行代码重构
// 选中代码后在 Cursor 中提问：
// "将这个组件拆分为更小的子组件，提高可维护性"

function ComplexComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // ...长代码
  };

  return (
    <div>
      {/* ...复杂的 JSX */}
    </div>
  );
}

// AI 会自动重构为：
// - useDataFetching Hook
// - LoadingState 组件
// - ErrorDisplay 组件
// - DataList 组件
```

### 3. AI Code Review

```typescript
// .github/workflows/ai-code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: AI Code Review
        uses: your-org/ai-code-review-action@v1
        with:
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          review_level: 'thorough' # quick | standard | thorough
          focus_areas: 'security,performance,best-practices'
```

### 4. AI 单元测试生成

```typescript
// 原始代码
export function calculateDiscount(
  price: number,
  discountPercent: number,
  userLevel: 'basic' | 'premium' | 'vip'
): number {
  let discount = (price * discountPercent) / 100;

  if (userLevel === 'premium') {
    discount *= 1.2;
  } else if (userLevel === 'vip') {
    discount *= 1.5;
  }

  return Math.max(0, price - discount);
}

// 使用 AI 生成测试（提示词：为上面的函数生成完整的单元测试）
describe('calculateDiscount', () => {
  it('should calculate basic discount correctly', () => {
    expect(calculateDiscount(100, 10, 'basic')).toBe(90);
  });

  it('should apply premium multiplier', () => {
    expect(calculateDiscount(100, 10, 'premium')).toBe(88);
  });

  it('should apply VIP multiplier', () => {
    expect(calculateDiscount(100, 10, 'vip')).toBe(85);
  });

  it('should not return negative values', () => {
    expect(calculateDiscount(100, 200, 'vip')).toBe(0);
  });

  it('should handle zero discount', () => {
    expect(calculateDiscount(100, 0, 'basic')).toBe(100);
  });
});
```

---

## 性能优化与最佳实践

### 1. Token 优化

```typescript
// 压缩历史消息
function compressConversationHistory(messages: Message[]): Message[] {
  // 保留最近的 N 条完整消息
  const recentMessages = messages.slice(-10);

  // 对更早的消息进行摘要
  const olderMessages = messages.slice(0, -10);
  if (olderMessages.length > 0) {
    return [
      {
        role: 'system',
        content: `以下是之前对话的摘要：\n${summarizeMessages(olderMessages)}`,
      },
      ...recentMessages,
    ];
  }

  return recentMessages;
}

function summarizeMessages(messages: Message[]): string {
  // 提取关键信息
  const summary = messages
    .map((m) => `${m.role}: ${m.content.slice(0, 100)}...`)
    .join('\n');
  return summary;
}
```

### 2. 缓存策略

```typescript
// Redis 缓存 LLM 响应
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedLLMResponse(
  prompt: string,
  model: string
): Promise<string | null> {
  const cacheKey = `llm:${model}:${hashString(prompt)}`;
  const cached = await redis.get(cacheKey);
  return cached;
}

async function setCachedLLMResponse(
  prompt: string,
  model: string,
  response: string,
  ttl = 3600 // 1 hour
): Promise<void> {
  const cacheKey = `llm:${model}:${hashString(prompt)}`;
  await redis.setex(cacheKey, ttl, response);
}

function hashString(str: string): string {
  // 简单哈希函数
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// 使用
async function chatWithCache(prompt: string) {
  const cached = await getCachedLLMResponse(prompt, 'claude-sonnet-4-6');
  if (cached) {
    return cached;
  }

  const response = await callLLM(prompt);
  await setCachedLLMResponse(prompt, 'claude-sonnet-4-6', response);
  return response;
}
```

### 3. 错误处理

```typescript
// 带重试的 LLM 调用
async function callLLMWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.content[0].text;
    } catch (error: any) {
      lastError = error;

      // 速率限制 - 等待后重试
      if (error.status === 429) {
        const waitTime = Math.pow(2, i) * 1000; // 指数退避
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // 服务器错误 - 重试
      if (error.status >= 500) {
        console.log(`Server error. Retry ${i + 1}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // 其他错误 - 直接抛出
      throw error;
    }
  }

  throw lastError;
}
```

### 4. 成本监控

```typescript
// 跟踪 API 使用情况
interface UsageStats {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

class LLMUsageTracker {
  private stats: Map<string, UsageStats> = new Map();

  track(userId: string, inputTokens: number, outputTokens: number) {
    const existing = this.stats.get(userId) || {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCost: 0,
    };

    const cost = this.calculateCost(inputTokens, outputTokens);

    this.stats.set(userId, {
      requests: existing.requests + 1,
      inputTokens: existing.inputTokens + inputTokens,
      outputTokens: existing.outputTokens + outputTokens,
      estimatedCost: existing.estimatedCost + cost,
    });
  }

  calculateCost(inputTokens: number, outputTokens: number): number {
    const INPUT_PRICE = 3 / 1_000_000; // $3 per 1M tokens
    const OUTPUT_PRICE = 15 / 1_000_000; // $15 per 1M tokens

    return inputTokens * INPUT_PRICE + outputTokens * OUTPUT_PRICE;
  }

  getStats(userId: string): UsageStats | undefined {
    return this.stats.get(userId);
  }

  // 检查用户是否超出配额
  isOverQuota(userId: string, dailyLimit: number): boolean {
    const stats = this.stats.get(userId);
    return stats ? stats.estimatedCost > dailyLimit : false;
  }
}

const tracker = new LLMUsageTracker();

// 在 API 中使用
export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id');
  
  if (tracker.isOverQuota(userId, 10)) { // $10 daily limit
    return Response.json(
      { error: '已超出每日配额' },
      { status: 429 }
    );
  }

  const response = await callLLM(prompt);
  
  tracker.track(userId, inputTokens, outputTokens);
  
  return Response.json({ response });
}
```

---

## 面试常见问题

### 技术问题

#### 1. 解释什么是 LLM，它如何工作？
**答案要点**：
- 基于 Transformer 架构的深度学习模型
- 通过大量文本数据训练，学习语言模式
- 使用注意力机制理解上下文
- 生成过程是逐 token 预测
- 不是真正"理解"，而是统计模式匹配

#### 2. Temperature 参数如何影响输出？
```javascript
// Temperature = 0: 确定性输出
{ temperature: 0 }
// "2 + 2 = 4"
// "2 + 2 = 4"  // 每次都一样

// Temperature = 0.7: 平衡
{ temperature: 0.7 }
// "The cat sat on the mat."
// "A cat was sitting on the mat."

// Temperature = 1.5: 高创造性
{ temperature: 1.5 }
// "Feline creature perched upon textile surface!"
```

#### 3. 如何优化 LLM API 调用的成本？
- 使用 Prompt Caching 缓存系统提示
- 压缩对话历史
- 选择合适的模型（不总是用最大的）
- 实现结果缓存
- 设置合理的 max_tokens
- 批处理请求

#### 4. 流式响应的实现原理？
- Server-Sent Events (SSE)
- ReadableStream API
- 逐 token 传输
- 客户端实时渲染

#### 5. 什么是 RAG（检索增强生成）？
```typescript
// 传统 LLM：仅依赖训练数据
const response = await llm.generate("公司政策是什么？");
// 可能产生幻觉

// RAG：先检索相关文档，再生成
const docs = await vectorDB.search("公司政策");
const context = docs.map(d => d.content).join('\n');
const response = await llm.generate(
  `基于以下文档回答：\n${context}\n\n问题：公司政策是什么？`
);
// 基于真实文档回答
```

### 项目经验问题

#### 准备要点：
1. **你在项目中如何集成 AI？**
   - 具体使用场景
   - 技术选型理由
   - 遇到的挑战和解决方案

2. **AI 功能的性能如何优化？**
   - 缓存策略
   - Token 优化
   - 并发控制
   - 成本控制

3. **如何保证 AI 输出的质量？**
   - Prompt 工程
   - 输出验证
   - 回退机制
   - 人工审核流程

4. **AI 应用的安全性考虑？**
   - Prompt Injection 防护
   - 敏感信息过滤
   - 速率限制
   - 内容审核

### 实战题目

#### 题目：实现一个带上下文的聊天功能
```typescript
class ContextualChat {
  private messages: Array<{ role: string; content: string }> = [];
  private maxContextTokens = 4000;

  async chat(userMessage: string): Promise<string> {
    // 1. 添加用户消息
    this.messages.push({ role: 'user', content: userMessage });

    // 2. 修剪历史以适应上下文窗口
    const trimmedMessages = this.trimContext(this.messages);

    // 3. 调用 LLM
    const response = await this.callLLM(trimmedMessages);

    // 4. 保存助手回复
    this.messages.push({ role: 'assistant', content: response });

    return response;
  }

  private trimContext(messages: Message[]): Message[] {
    let totalTokens = 0;
    const result = [];

    // 从最新的消息开始，往前添加
    for (let i = messages.length - 1; i >= 0; i--) {
      const tokens = this.estimateTokens(messages[i].content);
      if (totalTokens + tokens > this.maxContextTokens) break;
      
      result.unshift(messages[i]);
      totalTokens += tokens;
    }

    return result;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private async callLLM(messages: Message[]): Promise<string> {
    // 实现 LLM 调用
    return '';
  }
}
```

---

## 学习资源

### 官方文档
- [Anthropic Claude API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [Google AI](https://ai.google.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

### 推荐课程
- DeepLearning.AI - ChatGPT Prompt Engineering
- Andrej Karpathy - Neural Networks
- Fast.ai - Practical Deep Learning

### 实战项目
- 构建 AI 聊天机器人
- AI 代码生成器
- 智能文档搜索
- AI 内容审核系统

### 开源项目
- [ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web)
- [Dify](https://github.com/langgenius/dify)
- [LangChain](https://github.com/langchain-ai/langchainjs)

---

**祝你在 AI + 前端领域大展拳脚！** 🚀🤖
