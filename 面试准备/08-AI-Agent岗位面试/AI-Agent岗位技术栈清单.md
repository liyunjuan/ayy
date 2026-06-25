# AI Agent 岗位技术栈清单

> 基于岗位JD分析，适用于9年前端工程师转型AI Agent方向

---

## 一、技术栈全景图

```
AI Agent 岗位技术栈
├── 1. AI框架与工具（核心）⭐⭐⭐⭐⭐
│   ├── Dify（低代码AI应用开发）
│   ├── LangChain（Agent编排）
│   ├── LlamaIndex（数据索引）
│   └── AutoGPT/MetaGPT（Agent框架）
│
├── 2. Agent核心技术（核心）⭐⭐⭐⭐⭐
│   ├── Planning（规划）
│   ├── Memory（记忆）
│   ├── Tool Use（工具调用）
│   ├── ReAct算法
│   └── Reflexion算法
│
├── 3. RAG系统（核心）⭐⭐⭐⭐⭐
│   ├── 文档解析（PDF/Word/PPT）
│   ├── 向量化（Embedding）
│   ├── 向量数据库（Pinecone/Milvus/Chroma）
│   ├── 语义检索
│   └── 重排序（Reranking）
│
├── 4. 多模态技术（重要）⭐⭐⭐⭐
│   ├── 文本处理
│   ├── 图像理解（GPT-4V/Claude）
│   ├── 语音交互（Whisper/TTS）
│   └── 跨模态融合
│
├── 5. 大模型应用（必须）⭐⭐⭐⭐⭐
│   ├── OpenAI API（GPT-4）
│   ├── Claude API
│   ├── Prompt Engineering
│   └── Fine-tuning（可选）
│
├── 6. 后端技术（必须）⭐⭐⭐⭐
│   ├── Python（核心语言）
│   ├── FastAPI/Flask
│   ├── 异步编程（asyncio）
│   └── 微服务架构
│
├── 7. 前端技术（加分项）⭐⭐⭐
│   ├── React/Vue（你的优势！）
│   ├── TypeScript
│   └── AI应用UI设计
│
└── 8. 性能与工程化（重要）⭐⭐⭐⭐
    ├── 模型量化
    ├── 缓存策略
    ├── 高并发处理
    └── 监控与日志
```

---

## 二、技术栈优先级分级

### P0 - 必须掌握（面试必考）

```javascript
const P0技术栈 = {
  
  // 1. AI框架三件套
  Dify: {
    重要性: "⭐⭐⭐⭐⭐",
    掌握程度: "熟练使用，了解架构",
    学习时间: "1-2周",
    考察点: [
      "Dify的核心功能",
      "如何用Dify快速搭建Agent",
      "Workflow设计",
      "工具集成"
    ]
  },
  
  LangChain: {
    重要性: "⭐⭐⭐⭐⭐",
    掌握程度: "深入理解，能手写Agent",
    学习时间: "2-3周",
    考察点: [
      "Chain的概念和类型",
      "Agent的实现原理",
      "Memory机制",
      "Tool调用流程",
      "LangGraph（状态机）"
    ]
  },
  
  LlamaIndex: {
    重要性: "⭐⭐⭐⭐⭐",
    掌握程度: "熟练使用，了解索引原理",
    学习时间: "1-2周",
    考察点: [
      "数据索引方式",
      "Query Engine",
      "与LangChain的区别",
      "RAG场景应用"
    ]
  },
  
  // 2. Agent核心技术
  Agent核心概念: {
    重要性: "⭐⭐⭐⭐⭐",
    必须掌握: [
      "Planning（规划）- 如何分解任务",
      "Memory（记忆）- 短期/长期记忆",
      "Tool Use（工具调用）- Function Calling",
      "Reasoning（推理）- CoT/ReAct"
    ],
    考察点: "画出Agent执行流程图"
  },
  
  ReAct算法: {
    重要性: "⭐⭐⭐⭐⭐",
    原理: "Reasoning + Acting 交替执行",
    必须会: "手写简易ReAct实现",
    论文: "必读"
  },
  
  // 3. RAG系统
  RAG全流程: {
    重要性: "⭐⭐⭐⭐⭐",
    必须掌握: [
      "文档解析（PyPDF2/Unstructured）",
      "文本分块（Chunking策略）",
      "向量化（Embedding模型）",
      "向量数据库（至少一个）",
      "检索策略（相似度/混合检索）",
      "重排序（Reranking）"
    ],
    考察点: "画出RAG架构图，讲清楚每个环节"
  },
  
  向量数据库: {
    重要性: "⭐⭐⭐⭐",
    必须会一个: "Chroma（最简单）或Pinecone",
    加分项: "Milvus/Weaviate",
    考察点: "向量检索原理（ANN算法）"
  },
  
  // 4. 大模型API
  OpenAI_API: {
    重要性: "⭐⭐⭐⭐⭐",
    必须掌握: [
      "Chat Completions API",
      "Function Calling",
      "Stream输出",
      "Token计算",
      "Error处理"
    ]
  },
  
  Prompt_Engineering: {
    重要性: "⭐⭐⭐⭐⭐",
    必须掌握: [
      "Few-shot Learning",
      "Chain-of-Thought",
      "System/User/Assistant角色",
      "Prompt模板设计"
    ]
  },
  
  // 5. Python编程
  Python: {
    重要性: "⭐⭐⭐⭐⭐",
    水平要求: "中高级",
    必须掌握: [
      "异步编程（asyncio/await）",
      "装饰器",
      "上下文管理器",
      "类型注解（Type Hints）",
      "并发处理"
    ]
  },
  
  FastAPI: {
    重要性: "⭐⭐⭐⭐",
    掌握程度: "熟练开发API",
    考察点: [
      "路由设计",
      "依赖注入",
      "异步处理",
      "WebSocket（流式输出）"
    ]
  }
}
```

---

### P1 - 重要掌握（面试加分）

```javascript
const P1技术栈 = {
  
  // 1. 多模态技术
  多模态模型: {
    重要性: "⭐⭐⭐⭐",
    了解程度: "知道怎么用API",
    涉及: [
      "GPT-4V（图像理解）",
      "Claude（多模态）",
      "Whisper（语音识别）",
      "DALL-E（图像生成）"
    ]
  },
  
  // 2. 高级Agent框架
  AutoGPT: {
    重要性: "⭐⭐⭐",
    了解程度: "知道原理，看过源码",
    亮点: "自主执行任务的Agent"
  },
  
  MetaGPT: {
    重要性: "⭐⭐⭐",
    了解程度: "知道多Agent协作概念",
    亮点: "模拟软件公司的多角色协作"
  },
  
  // 3. 性能优化
  模型量化: {
    重要性: "⭐⭐⭐",
    了解: "INT8/INT4量化原理",
    工具: "llama.cpp, GPTQ"
  },
  
  缓存策略: {
    重要性: "⭐⭐⭐⭐",
    必须会: [
      "Redis缓存",
      "Embedding缓存",
      "API Response缓存"
    ]
  },
  
  // 4. 监控与可观测性
  监控: {
    重要性: "⭐⭐⭐",
    工具: "LangSmith, Prometheus",
    考察点: "如何监控Agent执行过程"
  }
}
```

---

### P2 - 了解即可（锦上添花）

```javascript
const P2技术栈 = {
  
  Fine_tuning: {
    重要性: "⭐⭐",
    了解程度: "知道概念和流程",
    工具: "LoRA, QLoRA"
  },
  
  本地部署: {
    重要性: "⭐⭐",
    了解: "Ollama, vLLM",
    场景: "私有化部署"
  },
  
  MCP协议: {
    重要性: "⭐⭐",
    了解: "Claude的Model Context Protocol"
  }
}
```

---

## 三、学习路径（按优先级）

### 第一阶段（1-2周）：基础入门

```
Week 1: AI框架快速上手
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day 1-2: Dify官网教程 + 搭建第一个Agent
Day 3-4: LangChain官方文档 + 基础示例
Day 5-6: OpenAI API调试 + Prompt Engineering
Day 7: 总结 + 做一个简单的聊天机器人

Week 2: RAG系统入门
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day 1-2: 文档解析实战（PDF → 文本）
Day 3-4: Embedding + 向量数据库（Chroma）
Day 5-6: 实现简单的RAG问答系统
Day 7: 优化检索效果（Chunking策略）
```

---

### 第二阶段（2-3周）：核心技术深入

```
Week 3-4: Agent核心技术
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ReAct算法原理 + 手写实现
✅ Memory机制（短期/长期记忆）
✅ Tool Use（Function Calling实战）
✅ LangGraph状态机
✅ 多Agent协作（MetaGPT概念）

Week 5: 多模态应用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ GPT-4V图像理解实战
✅ Whisper语音识别
✅ 跨模态应用demo
```

---

### 第三阶段（1-2周）：实战项目

```
Week 6-7: 做2-3个完整项目
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
项目1: 企业级RAG知识库
  - 文档管理
  - 语义检索
  - 重排序优化
  
项目2: 自动化业务助手Agent
  - 任务分解
  - 工具调用（API集成）
  - 错误恢复
  
项目3: 多模态应用（图文问答）
  - 图像理解
  - 结合RAG
```

---

## 四、技术栈速查表

### 开发语言

| 语言 | 优先级 | 用途 | 要求水平 |
|------|--------|------|----------|
| **Python** | P0 ⭐⭐⭐⭐⭐ | Agent/RAG开发 | 中高级 |
| **TypeScript** | P1 ⭐⭐⭐ | 前端界面 | 熟练（你的优势）|
| JavaScript | P2 ⭐⭐ | 前端 | 精通（你的优势）|

---

### AI框架

| 框架 | 优先级 | 用途 | 学习成本 |
|------|--------|------|----------|
| **Dify** | P0 ⭐⭐⭐⭐⭐ | 低代码AI开发 | 低（1周）|
| **LangChain** | P0 ⭐⭐⭐⭐⭐ | Agent编排 | 中（2-3周）|
| **LlamaIndex** | P0 ⭐⭐⭐⭐⭐ | RAG数据索引 | 低（1周）|
| AutoGPT | P1 ⭐⭐⭐ | 自主Agent | 中 |
| MetaGPT | P1 ⭐⭐⭐ | 多Agent协作 | 中 |

---

### 向量数据库

| 数据库 | 优先级 | 特点 | 推荐度 |
|--------|--------|------|--------|
| **Chroma** | P0 ⭐⭐⭐⭐⭐ | 简单易用 | 入门首选 |
| **Pinecone** | P0 ⭐⭐⭐⭐ | 云服务 | 生产推荐 |
| Milvus | P1 ⭐⭐⭐ | 开源强大 | 企业级 |
| Weaviate | P1 ⭐⭐⭐ | 功能丰富 | 进阶 |
| FAISS | P2 ⭐⭐ | Meta开源 | 本地 |

---

### 大模型API

| 模型 | 优先级 | 用途 | 必须掌握 |
|------|--------|------|----------|
| **GPT-4** | P0 ⭐⭐⭐⭐⭐ | 通用AI | Chat + Function |
| **Claude** | P0 ⭐⭐⭐⭐ | 多模态 | API调用 |
| GPT-4V | P1 ⭐⭐⭐⭐ | 图像理解 | 多模态场景 |
| Whisper | P1 ⭐⭐⭐ | 语音识别 | 了解 |
| Embedding模型 | P0 ⭐⭐⭐⭐⭐ | 向量化 | text-embedding-ada-002 |

---

## 五、前端工程师的优势

### 你的核心优势（9年前端经验）

```javascript
const 前端转AI优势 = {
  
  技术迁移优势: {
    优势1: "TypeScript精通 → Python快速上手",
    优势2: "React/Vue经验 → AI应用前端开发",
    优势3: "异步编程 → Python asyncio无缝衔接",
    优势4: "API调用 → 大模型API调用相同思路",
    优势5: "性能优化 → 模型推理优化相通"
  },
  
  业务理解优势: {
    优势1: "用户体验 → AI应用交互设计",
    优势2: "前端架构 → AI应用架构设计",
    优势3: "工程化 → AI工程化实践"
  },
  
  差异化竞争力: {
    亮点: "前端 + AI双栈能力",
    稀缺: "大多数AI工程师前端弱",
    价值: "能独立完成AI应用全栈开发"
  }
}
```

---

### 你需要补的短板

```
核心短板（2-3周可补齐）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Python深度（异步、类型注解、装饰器）
2. LangChain/LlamaIndex框架
3. RAG系统原理与实践
4. Agent算法（ReAct、Reflexion）
5. 向量数据库使用

次要短板（边做边学）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 模型Fine-tuning
2. 性能优化（量化、缓存）
3. 多模态模型深度应用
```

---

## 六、学习资源推荐

### 官方文档（必看）

```
1. LangChain官方文档
   https://python.langchain.com/

2. LlamaIndex官方文档
   https://docs.llamaindex.ai/

3. Dify官方文档
   https://docs.dify.ai/

4. OpenAI API文档
   https://platform.openai.com/docs/
```

---

### 开源项目（学习+参考）

```
1. LangChain GitHub
   https://github.com/langchain-ai/langchain
   
2. Dify GitHub
   https://github.com/langgenius/dify
   
3. AutoGPT
   https://github.com/Significant-Gravitas/AutoGPT
   
4. RAG示例项目
   搜索关键词：langchain rag example
```

---

### 论文（建议读）

```
1. ReAct: Synergizing Reasoning and Acting
   - 必读！Agent核心算法
   
2. Reflexion: Language Agents with Verbal Reinforcement
   - 自我反思机制
   
3. Retrieval-Augmented Generation for Knowledge-Intensive NLP
   - RAG奠基论文
```

---

## 七、面试准备重点

### 技术深度考察（高频）

```
1. 画出Agent执行流程图
   - Planning → Tool Selection → Execution → Observation → Reflection

2. 讲清楚RAG全流程
   - 文档解析 → 分块 → Embedding → 存储 → 检索 → Rerank → 生成

3. ReAct算法原理
   - Reasoning和Acting交替执行
   - 如何克服幻觉问题

4. Memory机制实现
   - 短期记忆（对话历史）
   - 长期记忆（向量数据库）

5. Function Calling原理
   - 如何让LLM调用外部工具
```

---

### 项目经验准备

```
必须准备：
1. 一个RAG项目（企业知识库）
2. 一个Agent项目（自动化助手）
3. 一个多模态项目（图文理解）

每个项目准备：
- 技术栈选型理由
- 遇到的技术难点
- 如何解决的
- 性能优化措施
- 量化结果（准确率、响应时间）
```

---

## 八、30天速成计划

```
Week 1: 基础框架（Dify + LangChain + OpenAI API）
  ✅ Day 1-2: Dify搭建第一个Agent
  ✅ Day 3-5: LangChain文档 + 示例
  ✅ Day 6-7: 做一个简单聊天机器人

Week 2: RAG系统
  ✅ Day 8-10: 文档解析 + Embedding
  ✅ Day 11-13: 向量数据库 + 检索
  ✅ Day 14: 完成RAG知识库demo

Week 3: Agent技术
  ✅ Day 15-17: ReAct算法 + 手写实现
  ✅ Day 18-20: Memory + Tool Use
  ✅ Day 21: 完成自动化Agent demo

Week 4: 实战项目
  ✅ Day 22-24: 优化RAG项目（生产级）
  ✅ Day 25-27: 优化Agent项目
  ✅ Day 28-29: 多模态项目（GPT-4V）
  ✅ Day 30: 整理项目 + 准备面试话术
```

---

## 九、总结

### 核心技术栈（必须掌握）

```
P0优先级（面试必考）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Dify + LangChain + LlamaIndex（三件套）
2. Agent核心技术（Planning/Memory/Tool Use）
3. ReAct算法原理与实现
4. RAG全流程（文档→向量→检索→生成）
5. OpenAI API + Prompt Engineering
6. Python中高级（asyncio/装饰器/类型注解）
7. FastAPI开发
```

---

### 学习时间预估

```
快速上手：1-2周
  → 能用Dify/LangChain搭建简单Agent

深入掌握：3-4周
  → 理解原理，能手写Agent和RAG

生产级：6-8周
  → 能开发企业级AI应用
```

---

### 你的优势（前端9年）

```
✅ 前端精通 → AI应用全栈开发
✅ TypeScript → Python快速上手
✅ 异步编程 → asyncio无缝衔接
✅ 工程化经验 → AI工程化实践
✅ 用户体验 → AI交互设计

差异化竞争力：
前端 + AI双栈 = 稀缺人才！
```

---

**下一步：开始学习 + 做项目 + 准备面试！**
