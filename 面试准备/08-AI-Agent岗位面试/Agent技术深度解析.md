# Agent 技术深度解析

## 目录
1. [Agent核心概念](#agent核心概念)
2. [LangChain深度解析](#langchain深度解析)
3. [LlamaIndex深度解析](#llamaindex深度解析)
4. [Dify平台实战](#dify平台实战)
5. [ReAct算法详解](#react算法详解)
6. [Reflexion算法详解](#reflexion算法详解)

---

## Agent核心概念

### 什么是AI Agent？

**Agent = Planning（规划） + Memory（记忆） + Tool Use（工具使用）**

```javascript
// 从前端角度理解Agent
class AIAgent {
  constructor() {
    this.llm = new OpenAI();           // 大脑（决策中心）
    this.memory = new ConversationMemory();  // 记忆（类似Vuex/Redux）
    this.tools = [                     // 工具（类似API调用）
      new SearchTool(),
      new CalculatorTool(),
      new DatabaseTool()
    ];
  }
  
  async run(task) {
    // 1. Planning：思考如何完成任务
    const plan = await this.llm.plan(task, this.memory);
    
    // 2. Tool Use：执行具体操作
    for (const step of plan) {
      const tool = this.tools.find(t => t.name === step.tool);
      const result = await tool.execute(step.params);
      
      // 3. Memory：记录执行结果
      this.memory.add(step, result);
    }
    
    // 4. 生成最终答案
    return this.llm.generateAnswer(this.memory);
  }
}
```

### Agent vs 传统Chatbot

| 维度 | 传统Chatbot | AI Agent |
|------|------------|----------|
| **交互方式** | 固定流程（决策树） | 动态推理 |
| **能力范围** | 预设问答 | 可调用外部工具 |
| **学习能力** | 无（需要人工更新） | 有（从对话中学习） |
| **复杂任务** | 不支持 | 支持多步推理 |

**示例对比**：

```
任务：帮我订一张明天去上海的机票

【传统Chatbot】
Bot: 请选择出发城市
User: 北京
Bot: 请选择目的地城市
User: 上海
Bot: 请选择日期
User: 明天
Bot: 正在查询...（只能按固定流程）

【AI Agent】
Agent: 
  思考：我需要先确认用户的出发城市
  行动：询问 "请问您从哪里出发？"
  观察：用户回复"北京"
  
  思考：现在我知道是北京到上海，需要查询明天的航班
  行动：调用 search_flights(from="北京", to="上海", date="明天")
  观察：找到5个航班
  
  思考：我需要推荐最合适的航班
  行动：分析价格、时间、航空公司
  观察：CA1234最优（价格适中，时间合理）
  
  最终回答："我为您查到明天北京到上海有5个航班，推荐CA1234..."
```

---

## LangChain深度解析

### 架构设计哲学

LangChain的核心思想：**可组合性（Composability）**

```python
# LangChain的设计像乐高积木，每个组件可以自由组合

# 组件1：LLM
from langchain.llms import OpenAI
llm = OpenAI(temperature=0.7)

# 组件2：Prompt Template
from langchain.prompts import PromptTemplate
prompt = PromptTemplate(
    input_variables=["product"],
    template="为{product}写一段广告文案"
)

# 组件3：Chain（组合前两个组件）
from langchain.chains import LLMChain
chain = LLMChain(llm=llm, prompt=prompt)

# 执行
result = chain.run(product="iPhone 15")
```

### 核心组件详解

#### 1. LLM Wrappers（大模型封装）

**统一接口，支持多种模型**：

```python
# OpenAI
from langchain.llms import OpenAI
llm = OpenAI(model_name="gpt-4", temperature=0)

# Claude
from langchain.llms import Anthropic
llm = Anthropic(model="claude-3-opus-20240229")

# 本地模型（Ollama）
from langchain.llms import Ollama
llm = Ollama(model="llama2")

# 自定义LLM
from langchain.llms.base import LLM
from typing import Optional, List

class CustomLLM(LLM):
    api_url: str
    
    @property
    def _llm_type(self) -> str:
        return "custom"
    
    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        # 调用自己的API
        response = requests.post(self.api_url, json={"prompt": prompt})
        return response.json()["text"]
```

**流式响应**（重要！用户体验优化）：

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = OpenAI(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# 流式输出，实时展示
for chunk in llm.stream("写一篇关于AI的文章"):
    print(chunk, end="", flush=True)
```

#### 2. Prompt Engineering

**PromptTemplate：动态构建提示词**

```python
from langchain.prompts import PromptTemplate

# 基础用法
template = PromptTemplate(
    input_variables=["product", "audience"],
    template="""
    为{product}写一段面向{audience}的广告文案。
    要求：简洁、吸引人、突出核心卖点。
    """
)

prompt = template.format(product="iPhone 15", audience="年轻人")
```

**ChatPromptTemplate：对话式提示词**

```python
from langchain.prompts import ChatPromptTemplate

template = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的{role}"),
    ("human", "{user_input}"),
])

messages = template.format_messages(
    role="Python工程师",
    user_input="如何优化这段代码？"
)
```

**Few-shot Prompting：提供示例**

```python
from langchain.prompts import FewShotPromptTemplate

# 定义示例
examples = [
    {
        "input": "我很开心",
        "output": "正面"
    },
    {
        "input": "我很难过",
        "output": "负面"
    }
]

# 定义示例格式
example_template = """
输入：{input}
输出：{output}
"""

example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template=example_template
)

# 组合成Few-shot Prompt
few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    prefix="以下是一些情感分析的例子：",
    suffix="输入：{input}\n输出：",
    input_variables=["input"]
)

print(few_shot_prompt.format(input="今天天气不错"))
```

#### 3. Chains（链式调用）

**LLMChain：最基础的链**

```python
from langchain.chains import LLMChain

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(product="iPhone")
```

**SequentialChain：串联多个链**

```python
from langchain.chains import SequentialChain

# Chain 1: 生成大纲
outline_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["topic"],
        template="为'{topic}'生成文章大纲"
    ),
    output_key="outline"
)

# Chain 2: 根据大纲写文章
writing_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["outline"],
        template="根据以下大纲写一篇文章：\n{outline}"
    ),
    output_key="article"
)

# 串联执行
overall_chain = SequentialChain(
    chains=[outline_chain, writing_chain],
    input_variables=["topic"],
    output_variables=["article"]
)

result = overall_chain({"topic": "AI的未来"})
```

**RouterChain：根据输入路由到不同链**

```python
from langchain.chains.router import MultiPromptChain

# 定义多个专用链
physics_template = """你是物理学家，回答物理问题：{input}"""
math_template = """你是数学家，回答数学问题：{input}"""

prompt_infos = [
    {
        "name": "physics",
        "description": "适合回答物理问题",
        "prompt_template": physics_template
    },
    {
        "name": "math",
        "description": "适合回答数学问题",
        "prompt_template": math_template
    }
]

# 路由链
chain = MultiPromptChain.from_prompts(llm, prompt_infos)

# 自动路由
chain.run("光速是多少？")  # 路由到physics
chain.run("1+1等于几？")   # 路由到math
```

#### 4. Memory（记忆机制）

**ConversationBufferMemory：完整历史**

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm,
    memory=memory
)

conversation.run("我叫张三")
conversation.run("我喜欢Python")
conversation.run("我叫什么名字？")  # "你叫张三"
```

**ConversationBufferWindowMemory：滑动窗口**

```python
from langchain.memory import ConversationBufferWindowMemory

# 只保留最近3轮对话
memory = ConversationBufferWindowMemory(k=3)
```

**ConversationSummaryMemory：摘要压缩**

```python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=llm)
# 自动将历史对话压缩成摘要，节省Token
```

**ConversationKGMemory：知识图谱**

```python
from langchain.memory import ConversationKGMemory

memory = ConversationKGMemory(llm=llm)

# 自动提取实体和关系
conversation.run("我是张三，我在阿里巴巴工作")
conversation.run("我的同事李四是Python工程师")
conversation.run("告诉我关于张三的信息")

# Memory会自动构建知识图谱：
# 张三 -[工作于]-> 阿里巴巴
# 李四 -[是]-> Python工程师
# 张三 -[同事]-> 李四
```

#### 5. Agents（智能体）

**Agent类型**：

| Agent类型 | 适用场景 | 优缺点 |
|----------|---------|-------|
| **zero-shot-react-description** | 通用场景 | 灵活但Token消耗大 |
| **structured-chat-zero-shot-react-description** | 需要结构化输入的工具 | 支持复杂参数 |
| **openai-functions** | 使用OpenAI API | 最可靠，推荐！ |
| **conversational-react-description** | 对话场景 | 带记忆功能 |

**创建Agent**：

```python
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType

# 定义工具
tools = [
    Tool(
        name="Search",
        func=search_func,
        description="用于搜索互联网信息"
    ),
    Tool(
        name="Calculator",
        func=calculator_func,
        description="用于数学计算"
    )
]

# 初始化Agent（推荐用OpenAI Functions）
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True  # 打印思考过程
)

# 执行
result = agent.run("北京今天温度是多少度？比昨天高几度？")
```

**自定义Tool**（重要！）：

```python
from langchain.tools import BaseTool
from typing import Optional
from pydantic import Field

class WeatherTool(BaseTool):
    name = "get_weather"
    description = "获取指定城市的天气信息。输入城市名，返回温度、天气状况。"
    
    # 可选：API密钥
    api_key: str = Field(default="", description="天气API密钥")
    
    def _run(self, city: str) -> str:
        """同步执行"""
        import requests
        response = requests.get(
            f"https://api.openweathermap.org/data/2.5/weather?q={city}",
            params={"appid": self.api_key}
        )
        data = response.json()
        return f"{city}的温度是{data['main']['temp']}°C，{data['weather'][0]['description']}"
    
    async def _arun(self, city: str) -> str:
        """异步执行（推荐）"""
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"https://api.openweathermap.org/data/2.5/weather?q={city}",
                params={"appid": self.api_key}
            ) as response:
                data = await response.json()
                return f"{city}的温度是{data['main']['temp']}°C"

# 使用
weather_tool = WeatherTool(api_key="your_api_key")
agent = initialize_agent([weather_tool], llm, agent=AgentType.OPENAI_FUNCTIONS)
```

### LangChain源码解析

**Agent执行流程源码（核心！）**：

```python
# langchain/agents/agent.py (简化版)

class Agent:
    def run(self, input: str) -> str:
        """执行Agent的主循环"""
        intermediate_steps = []
        
        for i in range(self.max_iterations):
            # 1. 决策：选择下一步行动
            action = self._decide_next_action(input, intermediate_steps)
            
            # 2. 执行工具
            if action.is_final_answer:
                return action.output
            
            observation = self._execute_tool(action.tool, action.tool_input)
            
            # 3. 记录中间步骤
            intermediate_steps.append((action, observation))
        
        return "达到最大迭代次数"
    
    def _decide_next_action(self, input: str, steps: list):
        """决策下一步行动（调用LLM）"""
        # 构建Prompt
        prompt = self._construct_prompt(input, steps)
        
        # 调用LLM
        llm_output = self.llm(prompt)
        
        # 解析LLM输出
        action = self._parse_output(llm_output)
        
        return action
    
    def _construct_prompt(self, input: str, steps: list) -> str:
        """构建Prompt（ReAct格式）"""
        prompt = f"""
        回答以下问题，你可以使用这些工具：
        {self._format_tools()}
        
        使用以下格式：
        Question: 输入的问题
        Thought: 思考该做什么
        Action: 工具名称
        Action Input: 工具的输入
        Observation: 工具的输出
        ... (重复 Thought/Action/Observation)
        Thought: 我现在知道最终答案了
        Final Answer: 最终答案
        
        开始！
        
        Question: {input}
        """
        
        # 添加历史步骤
        for action, observation in steps:
            prompt += f"\nThought: {action.thought}"
            prompt += f"\nAction: {action.tool}"
            prompt += f"\nAction Input: {action.tool_input}"
            prompt += f"\nObservation: {observation}"
        
        prompt += "\nThought:"
        
        return prompt
```

**OpenAI Functions Agent的实现**（推荐使用）：

```python
# langchain/agents/openai_functions_agent.py (简化版)

class OpenAIFunctionsAgent(Agent):
    def _decide_next_action(self, input: str, steps: list):
        """使用OpenAI Function Calling"""
        # 1. 构建消息历史
        messages = [
            {"role": "system", "content": "你是一个有用的助手"},
            {"role": "user", "content": input}
        ]
        
        # 2. 添加历史步骤
        for action, observation in steps:
            messages.append({
                "role": "assistant",
                "content": None,
                "function_call": {
                    "name": action.tool,
                    "arguments": json.dumps(action.tool_input)
                }
            })
            messages.append({
                "role": "function",
                "name": action.tool,
                "content": observation
            })
        
        # 3. 调用OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            functions=self._get_function_schemas(),
            function_call="auto"
        )
        
        # 4. 解析响应
        if response.choices[0].message.get("function_call"):
            # LLM决定调用工具
            function_call = response.choices[0].message.function_call
            return Action(
                tool=function_call.name,
                tool_input=json.loads(function_call.arguments),
                thought=""
            )
        else:
            # LLM给出最终答案
            return Action(
                is_final_answer=True,
                output=response.choices[0].message.content
            )
```

---

## LlamaIndex深度解析

### 核心定位：专注于数据索引和检索

LlamaIndex（原名GPT Index）专注于**将私有数据与LLM连接**。

```python
# LlamaIndex的典型用法（超简单！）
from llama_index import VectorStoreIndex, SimpleDirectoryReader

# 1. 加载文档
documents = SimpleDirectoryReader('./data').load_data()

# 2. 构建索引
index = VectorStoreIndex.from_documents(documents)

# 3. 查询
query_engine = index.as_query_engine()
response = query_engine.query("Python是什么？")

print(response)
```

### 核心组件

#### 1. Data Connectors（数据连接器）

**支持100+数据源**：

```python
# 本地文件
from llama_index import SimpleDirectoryReader
documents = SimpleDirectoryReader('./docs').load_data()

# Notion
from llama_index import NotionPageReader
documents = NotionPageReader(notion_token).load_data()

# Google Docs
from llama_index import GoogleDocsReader
documents = GoogleDocsReader().load_data(document_ids=['xxx'])

# 数据库
from llama_index import DatabaseReader
documents = DatabaseReader(
    sql_database=engine,
    query="SELECT * FROM users"
).load_data()

# 网页
from llama_index import BeautifulSoupWebReader
documents = BeautifulSoupWebReader().load_data(['https://example.com'])
```

#### 2. Indexes（索引类型）

**VectorStoreIndex：向量索引（最常用）**

```python
from llama_index import VectorStoreIndex

index = VectorStoreIndex.from_documents(documents)

# 持久化
index.storage_context.persist(persist_dir="./storage")

# 加载
from llama_index import StorageContext, load_index_from_storage
storage_context = StorageContext.from_defaults(persist_dir="./storage")
index = load_index_from_storage(storage_context)
```

**ListIndex：列表索引（遍历所有文档）**

```python
from llama_index import ListIndex

# 适合文档数量少的场景
index = ListIndex.from_documents(documents)
```

**TreeIndex：树形索引（层次化检索）**

```python
from llama_index import TreeIndex

# 先检索顶层，再递归检索子节点
index = TreeIndex.from_documents(documents)
```

**KeywordTableIndex：关键词索引**

```python
from llama_index import KeywordTableIndex

# 基于关键词匹配
index = KeywordTableIndex.from_documents(documents)
```

#### 3. Query Engine（查询引擎）

**基础查询**：

```python
query_engine = index.as_query_engine()
response = query_engine.query("什么是Python？")

print(response.response)  # 答案
print(response.source_nodes)  # 引用来源
```

**流式查询**：

```python
query_engine = index.as_query_engine(streaming=True)
response = query_engine.query("写一篇关于AI的文章")

# 流式输出
for chunk in response.response_gen:
    print(chunk, end="", flush=True)
```

**定制查询引擎**：

```python
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.retrievers import VectorIndexRetriever
from llama_index.postprocessor import SimilarityPostprocessor

# 1. 定义检索器
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=10  # 初排返回10个
)

# 2. 定义后处理器（重排序）
postprocessor = SimilarityPostprocessor(similarity_cutoff=0.7)

# 3. 组合成查询引擎
query_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=[postprocessor]
)
```

#### 4. Chat Engine（对话引擎）

**带记忆的对话**：

```python
from llama_index import VectorStoreIndex

index = VectorStoreIndex.from_documents(documents)

# 创建Chat Engine
chat_engine = index.as_chat_engine()

# 多轮对话
response = chat_engine.chat("Python是什么？")
print(response)

response = chat_engine.chat("它的优势是什么？")  # 记住上下文
print(response)
```

**对话模式**：

```python
# 模式1：condense_question（压缩问题）
# 将多轮对话压缩成单个问题再检索
chat_engine = index.as_chat_engine(chat_mode="condense_question")

# 模式2：context（完整上下文）
# 保留完整对话历史
chat_engine = index.as_chat_engine(chat_mode="context")

# 模式3：react（ReAct Agent）
# 用ReAct算法决策
chat_engine = index.as_chat_engine(chat_mode="react")
```

### LlamaIndex vs LangChain

**对比表格**：

| 维度 | LlamaIndex | LangChain |
|------|-----------|-----------|
| **核心定位** | 数据索引和检索 | 通用Agent框架 |
| **学习曲线** | 平缓（开箱即用） | 陡峭（组件多） |
| **RAG能力** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Agent能力** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **数据连接器** | 100+ | 50+ |
| **文档质量** | 好 | 一般 |

**选择建议**：

```
场景1：简单的知识库问答 → 用LlamaIndex
场景2：复杂的Agent系统 → 用LangChain
场景3：RAG + Agent → LlamaIndex（数据层） + LangChain（Agent层）
```

**混合使用示例**：

```python
# 用LlamaIndex构建索引
from llama_index import VectorStoreIndex

index = VectorStoreIndex.from_documents(documents)

# 转换为LangChain工具
from llama_index.langchain_helpers.agents import IndexToolConfig, LlamaIndexTool

tool_config = IndexToolConfig(
    index=index,
    name="knowledge_base",
    description="公司知识库，可以回答关于产品、政策的问题"
)

tool = LlamaIndexTool.from_tool_config(tool_config)

# 在LangChain Agent中使用
from langchain.agents import initialize_agent

agent = initialize_agent(
    tools=[tool, search_tool, calculator_tool],
    llm=llm,
    agent="openai-functions"
)
```

---

## Dify平台实战

### Dify是什么？

Dify是一个**低代码AI应用开发平台**，可视化构建Agent工作流。

**适合人群**：
- 不会编程的产品经理
- 快速验证想法的开发者
- 需要快速交付的项目

### 核心功能

#### 1. Prompt编排

```
【可视化Prompt编辑器】
- 支持变量插入：{{user_input}}
- 支持上下文引用：{{#context}}
- 支持Few-shot Examples
```

#### 2. 工作流设计

**示例：智能客服工作流**

```
开始
  ↓
意图识别（LLM节点）
  ├─ 售前咨询 → 知识库检索 → 回答
  ├─ 售后问题 → 工单系统查询 → 回答
  └─ 投诉建议 → 转人工 + 创建工单
```

**节点类型**：

| 节点类型 | 作用 | 示例 |
|---------|------|------|
| **LLM节点** | 调用大模型 | 意图识别、文本生成 |
| **知识库检索** | RAG检索 | 从文档中查找答案 |
| **HTTP请求** | 调用外部API | 查询天气、订单状态 |
| **代码执行** | 运行Python代码 | 数据处理、格式转换 |
| **条件分支** | 流程控制 | if-else逻辑 |
| **变量赋值** | 存储中间结果 | 保存用户信息 |
| **循环** | 批量处理 | 遍历列表 |

#### 3. 知识库管理

```
【知识库功能】
1. 文档上传：支持PDF、Word、TXT、Markdown
2. 分块策略：自动/手动分块
3. 向量化：OpenAI/Azure/本地模型
4. 检索设置：Top K、相似度阈值
5. 测试：实时测试检索效果
```

#### 4. 应用发布

```
【发布方式】
1. Web App：直接生成聊天界面
2. API：提供RESTful API
3. 嵌入代码：iframe/JS SDK
4. 微信公众号：集成到公众号
```

### 实战案例：智能客服系统

**需求**：
- 自动回答常见问题
- 复杂问题转人工
- 自动创建工单

**工作流设计**：

```yaml
# Dify工作流配置（伪代码）
workflow:
  name: "智能客服"
  
  nodes:
    - id: "start"
      type: "start"
      
    - id: "intent_classification"
      type: "llm"
      prompt: |
        判断用户意图，分类为：
        1. 售前咨询
        2. 售后问题
        3. 投诉建议
        
        用户输入：{{user_input}}
        
        只返回类别编号。
      output_variable: "intent"
    
    - id: "branch"
      type: "condition"
      condition:
        - if: "{{intent}} == '1'"
          goto: "knowledge_base_search"
        - if: "{{intent}} == '2'"
          goto: "order_query"
        - if: "{{intent}} == '3'"
          goto: "create_ticket"
    
    - id: "knowledge_base_search"
      type: "knowledge_retrieval"
      knowledge_base: "faq"
      query: "{{user_input}}"
      top_k: 3
      output_variable: "kb_result"
    
    - id: "generate_answer"
      type: "llm"
      prompt: |
        根据以下参考资料回答用户问题：
        
        参考资料：{{kb_result}}
        
        用户问题：{{user_input}}
        
        回答：
      output_variable: "answer"
    
    - id: "confidence_check"
      type: "code"
      code: |
        # 检查答案置信度
        confidence = calculate_confidence(kb_result)
        if confidence < 0.7:
          return "low_confidence"
        else:
          return "high_confidence"
      output_variable: "confidence"
    
    - id: "final_answer"
      type: "condition"
      condition:
        - if: "{{confidence}} == 'high_confidence'"
          output: "{{answer}}"
        - if: "{{confidence}} == 'low_confidence'"
          output: "您的问题比较复杂，我已为您转接人工客服。"
          goto: "create_ticket"
    
    - id: "create_ticket"
      type: "http"
      method: "POST"
      url: "https://api.company.com/tickets"
      body:
        user_id: "{{user_id}}"
        question: "{{user_input}}"
        priority: "high"
      output_variable: "ticket_id"
    
    - id: "end"
      type: "end"
      output: "工单已创建，编号：{{ticket_id}}"
```

### Dify的优缺点

**优点**：
- 快速开发（0代码）
- 可视化调试
- 内置知识库管理
- 一键部署

**缺点**：
- 灵活性不如代码
- 复杂逻辑难以实现
- 依赖平台（vendor lock-in）

**适用场景**：
- MVP验证
- 简单的客服、问答系统
- 非技术人员使用

---

## ReAct算法详解

### 论文背景

**论文**：*ReAct: Synergizing Reasoning and Acting in Language Models*

**核心思想**：让LLM在执行任务时，**交替进行推理（Reasoning）和行动（Acting）**。

### 算法原理

**传统方法的问题**：

```
问题：北京今天的天气适合穿什么？

【方法1：Chain-of-Thought（只推理）】
LLM: 北京今天的天气...我不知道实时天气，只能猜测。
❌ 无法获取实时信息

【方法2：直接Action（只行动）】
Action: search("北京天气")
Observation: 15°C，小雨
❌ 没有推理，不知道推荐什么衣服
```

**ReAct方法（推理+行动）**：

```
Thought: 我需要先查询北京今天的天气
Action: search("北京今天天气")
Observation: 15°C，小雨

Thought: 15°C小雨，我需要推荐合适的衣服
Action: clothing_recommend(temperature=15, weather="rainy")
Observation: 建议穿长袖+薄外套，带雨伞

Thought: 我已经得到完整答案了
Final Answer: 北京今天15°C小雨，建议穿长袖+薄外套，记得带雨伞。
```

### 完整实现

```python
import re
from typing import List, Tuple

class ReActAgent:
    def __init__(self, llm, tools, max_steps=5):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}
        self.max_steps = max_steps
    
    def run(self, task: str) -> str:
        """执行ReAct循环"""
        intermediate_steps = []
        
        for step in range(self.max_steps):
            # 构建Prompt
            prompt = self._build_prompt(task, intermediate_steps)
            
            # 调用LLM
            llm_output = self.llm(prompt)
            
            # 解析输出
            action, action_input = self._parse_output(llm_output)
            
            # 判断是否完成
            if action == "Final Answer":
                return action_input
            
            # 执行工具
            if action not in self.tools:
                observation = f"错误：工具'{action}'不存在"
            else:
                try:
                    observation = self.tools[action].run(action_input)
                except Exception as e:
                    observation = f"错误：{str(e)}"
            
            # 记录步骤
            intermediate_steps.append((action, action_input, observation))
        
        return "超过最大步数，任务未完成"
    
    def _build_prompt(self, task: str, steps: List[Tuple]) -> str:
        """构建ReAct Prompt"""
        # 工具描述
        tool_descriptions = "\n".join([
            f"{name}: {tool.description}"
            for name, tool in self.tools.items()
        ])
        
        # 基础Prompt
        prompt = f"""
Answer the following question as best you can. You have access to the following tools:

{tool_descriptions}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{", ".join(self.tools.keys())}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {task}
"""
        
        # 添加历史步骤
        for action, action_input, observation in steps:
            prompt += f"Thought: (思考)\n"
            prompt += f"Action: {action}\n"
            prompt += f"Action Input: {action_input}\n"
            prompt += f"Observation: {observation}\n"
        
        prompt += "Thought:"
        
        return prompt
    
    def _parse_output(self, llm_output: str) -> Tuple[str, str]:
        """解析LLM输出"""
        # 匹配Action
        action_match = re.search(r"Action: (.+)", llm_output)
        if not action_match:
            # 可能是Final Answer
            final_answer_match = re.search(r"Final Answer: (.+)", llm_output, re.DOTALL)
            if final_answer_match:
                return "Final Answer", final_answer_match.group(1).strip()
            else:
                return "Error", "无法解析LLM输出"
        
        action = action_match.group(1).strip()
        
        # 匹配Action Input
        action_input_match = re.search(r"Action Input: (.+)", llm_output)
        if not action_input_match:
            return "Error", "缺少Action Input"
        
        action_input = action_input_match.group(1).strip()
        
        return action, action_input
```

### ReAct的优缺点

**优点**：
- 可解释性强（每步都有思考过程）
- 能处理复杂、多步骤任务
- 错误时可以自我纠正

**缺点**：
- Token消耗大（每步都要调用LLM）
- 速度慢（多轮交互）
- 依赖LLM的推理能力

### 优化技巧

**1. Few-shot Prompting**

```python
# 在Prompt中添加示例
examples = """
Example 1:
Question: 北京今天天气如何？
Thought: 我需要查询北京的实时天气
Action: search
Action Input: 北京今天天气
Observation: 15°C，晴
Thought: 我现在知道答案了
Final Answer: 北京今天天气晴朗，温度15°C

Example 2:
Question: 1000的平方根是多少？
Thought: 我需要计算平方根
Action: calculator
Action Input: sqrt(1000)
Observation: 31.62
Thought: 我现在知道答案了
Final Answer: 1000的平方根约为31.62
"""

# 将examples插入到Prompt中
```

**2. 早停（Early Stopping）**

```python
# 如果连续3步没有进展，提前终止
def run_with_early_stop(self, task):
    no_progress_count = 0
    last_observation = None
    
    for step in range(self.max_steps):
        # ... 执行步骤 ...
        
        # 检查是否有进展
        if observation == last_observation:
            no_progress_count += 1
            if no_progress_count >= 3:
                return "任务陷入循环，提前终止"
        else:
            no_progress_count = 0
        
        last_observation = observation
```

---

## Reflexion算法详解

### 核心思想

**Reflexion = ReAct + Self-Reflection（自我反思）**

让Agent在失败后，能够**反思错误原因**，并在下次尝试时改进。

### 算法流程

```
Attempt 1: 尝试完成任务（用ReAct）
  ↓
失败
  ↓
Reflection: 反思失败原因
  ↓
Attempt 2: 带着反思经验重新尝试
  ↓
成功/失败
  ↓
...（最多3次尝试）
```

### 完整实现

```python
class ReflexionAgent:
    def __init__(self, llm, tools, max_attempts=3):
        self.llm = llm
        self.tools = tools
        self.max_attempts = max_attempts
        self.reflections = []  # 存储反思经验
    
    def run(self, task: str) -> str:
        """执行Reflexion循环"""
        for attempt in range(self.max_attempts):
            print(f"\n=== Attempt {attempt + 1} ===")
            
            # 1. 尝试完成任务（用ReAct）
            react_agent = ReActAgent(self.llm, self.tools)
            result, steps = react_agent.run_with_steps(task, self.reflections)
            
            # 2. 评估结果
            is_success = self._evaluate(task, result)
            
            if is_success:
                print("✅ 任务成功完成")
                return result
            
            # 3. 反思失败原因
            print("❌ 任务失败，开始反思...")
            reflection = self._reflect(task, steps, result)
            self.reflections.append(reflection)
            
            print(f"💡 反思结果：{reflection}")
        
        return "多次尝试后仍然失败"
    
    def _evaluate(self, task: str, result: str) -> bool:
        """评估结果是否成功"""
        prompt = f"""
        任务：{task}
        结果：{result}
        
        请判断结果是否成功完成了任务。
        只回答"成功"或"失败"。
        """
        
        evaluation = self.llm(prompt).strip()
        return "成功" in evaluation
    
    def _reflect(self, task: str, steps: list, result: str) -> str:
        """反思失败原因"""
        # 格式化执行步骤
        steps_text = "\n".join([
            f"Step {i+1}:\n  Action: {action}\n  Input: {input}\n  Observation: {obs}"
            for i, (action, input, obs) in enumerate(steps)
        ])
        
        prompt = f"""
        我尝试完成以下任务，但失败了：
        
        任务：{task}
        
        执行过程：
        {steps_text}
        
        最终结果：{result}
        
        请分析失败的原因，并给出改进建议。
        
        回答格式：
        失败原因：...
        改进建议：...
        """
        
        reflection = self.llm(prompt)
        return reflection
```

### 实际案例

**任务**：帮我订一张明天去上海的机票

**Attempt 1**：
```
Step 1:
  Thought: 我需要查询航班信息
  Action: book_flight
  Input: {"destination": "上海", "date": "明天"}
  Observation: 错误：缺少出发城市参数

❌ 失败

Reflection:
失败原因：我直接调用了book_flight工具，但没有先询问用户的出发城市。
改进建议：应该先用ask_user工具询问出发城市，再调用book_flight。
```

**Attempt 2**：
```
Step 1:
  Thought: 根据上次的反思，我需要先询问出发城市
  Action: ask_user
  Input: "请问您从哪里出发？"
  Observation: 北京

Step 2:
  Thought: 现在我知道是北京到上海，可以查询航班了
  Action: search_flights
  Input: {"from": "北京", "to": "上海", "date": "明天"}
  Observation: 找到5个航班 [...]

Step 3:
  Thought: 我需要选择最合适的航班
  Action: recommend_flight
  Input: [航班列表]
  Observation: 推荐CA1234（价格适中，时间合理）

Step 4:
  Thought: 现在可以订票了
  Action: book_flight
  Input: {"flight": "CA1234"}
  Observation: 订票成功

✅ 成功
```

### Reflexion的优势

1. **从错误中学习**：每次失败都会积累经验
2. **提高成功率**：复杂任务的成功率显著提升
3. **减少人工干预**：Agent能自我改进

### 局限性

1. **Token消耗更大**：需要额外的反思步骤
2. **时间更长**：多次尝试增加延迟
3. **依赖LLM的反思能力**：LLM需要有足够的推理能力

---

## 总结

### 技术选型建议

| 场景 | 推荐框架 | 原因 |
|------|---------|------|
| 简单知识库问答 | LlamaIndex | 开箱即用 |
| 复杂Agent系统 | LangChain | 灵活性强 |
| 快速原型验证 | Dify | 0代码开发 |
| 生产级系统 | LangChain + 自定义 | 可控性高 |

### 学习路径

**Week 1: 基础概念**
- Agent的三要素（Planning、Memory、Tool Use）
- ReAct算法原理
- LLM基础知识

**Week 2: LangChain实战**
- LLMChain、SequentialChain
- Memory机制
- 自定义Tool

**Week 3: RAG系统**
- LlamaIndex使用
- 向量数据库（Chroma）
- 检索优化（混合检索、重排序）

**Week 4: 高级特性**
- ReAct Agent实现
- Reflexion算法
- 性能优化（缓存、异步）

### 进阶方向

1. **多Agent协作**：让多个Agent协同完成复杂任务
2. **长期记忆**：用向量数据库存储长期记忆
3. **人机协作**：Human-in-the-Loop设计
4. **安全性**：防御Prompt Injection攻击
5. **可观测性**：LangSmith、LangFuse等监控工具
