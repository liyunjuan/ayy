# AI Agent 项目方案设计

## 目录
1. [项目选择原则](#项目选择原则)
2. [项目1：智能代码审查Agent](#项目1智能代码审查agent)
3. [项目2：企业知识库问答系统](#项目2企业知识库问答系统)
4. [项目3：AI工作流自动化平台](#项目3ai工作流自动化平台)
5. [面试演示准备](#面试演示准备)

---

## 项目选择原则

### 好项目的特征

1. **有实际业务价值**：解决真实问题，不是玩具Demo
2. **技术栈完整**：覆盖Agent核心能力（Planning、Memory、Tool Use）
3. **可快速实现**：1-2周能完成MVP
4. **易于演示**：有清晰的输入输出，面试时能现场展示
5. **有亮点**：独特的技术方案或优化策略

### 避免的项目类型

❌ 纯聊天机器人（太简单，没有技术深度）  
❌ 需要训练模型的项目（不符合应用层定位）  
❌ 依赖大量业务数据的项目（面试无法展示）  
❌ 纯前端项目（无法体现AI能力）

---

## 项目1：智能代码审查Agent

### 项目概述

**定位**：自动化Code Review，提升团队代码质量

**核心功能**：
- 自动分析PR代码
- 检测代码质量问题（复杂度、性能、安全）
- 生成审查意见并发布到GitHub
- 学习团队编码规范

**技术亮点**：
- ReAct算法实现多步推理
- 多工具协作（静态分析 + 知识库检索 + 相似代码搜索）
- 自动学习团队规范

---

### 系统架构

```
GitHub Webhook
    ↓
PR事件监听
    ↓
代码分析Agent（ReAct）
    ├─ Tool 1: 代码静态分析（复杂度、安全漏洞）
    ├─ Tool 2: 测试覆盖率检查
    ├─ Tool 3: 团队规范检索（RAG）
    └─ Tool 4: 相似代码搜索
    ↓
生成审查报告
    ↓
发布到GitHub PR
```

---

### 技术实现

#### 1. 项目结构

```
code-review-agent/
├── agents/
│   ├── react_agent.py          # ReAct Agent实现
│   └── tools/
│       ├── code_analyzer.py    # 代码分析工具
│       ├── test_checker.py     # 测试检查工具
│       ├── guideline_search.py # 规范检索工具
│       └── similar_code.py     # 相似代码搜索
├── knowledge_base/
│   ├── coding_guidelines/      # 团队编码规范
│   └── best_practices/         # 最佳实践
├── app.py                      # FastAPI服务
├── requirements.txt
└── README.md
```

#### 2. 核心代码

**ReAct Agent实现**：

```python
# agents/react_agent.py
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from tools.code_analyzer import CodeAnalyzer
from tools.test_checker import TestChecker
from tools.guideline_search import GuidelineSearch
from tools.similar_code import SimilarCodeSearch

class CodeReviewAgent:
    def __init__(self):
        self.llm = OpenAI(model="gpt-4", temperature=0)
        
        # 定义工具
        self.tools = [
            Tool(
                name="analyze_code_quality",
                func=CodeAnalyzer().analyze,
                description="""
                分析代码质量，包括：
                - 圈复杂度（建议<10）
                - 代码重复率
                - 潜在的性能问题
                - 安全漏洞（SQL注入、XSS等）
                
                输入：代码字符串
                输出：问题列表，每个问题包含类型、位置、严重程度、建议
                """
            ),
            Tool(
                name="check_test_coverage",
                func=TestChecker().check,
                description="""
                检查测试覆盖率：
                - 是否有单元测试
                - 测试覆盖率百分比
                - 未测试的关键路径
                
                输入：代码字符串
                输出：覆盖率报告
                """
            ),
            Tool(
                name="search_coding_guidelines",
                func=GuidelineSearch().search,
                description="""
                搜索团队编码规范和最佳实践。
                
                输入：查询字符串（如"函数命名规范"、"错误处理"）
                输出：相关规范文档
                """
            ),
            Tool(
                name="find_similar_code",
                func=SimilarCodeSearch().search,
                description="""
                在代码库中搜索类似的实现，用于：
                - 检查代码一致性
                - 发现可复用的代码
                - 参考已有的最佳实践
                
                输入：代码片段或功能描述
                输出：相似代码列表
                """
            )
        ]
        
        # 初始化Agent
        self.agent = initialize_agent(
            self.tools,
            self.llm,
            agent="zero-shot-react-description",
            verbose=True,
            max_iterations=10
        )
    
    def review(self, pr_info):
        """审查Pull Request"""
        # 构建任务描述
        task = f"""
        请审查以下Pull Request，重点关注：
        1. 代码质量（复杂度、可读性、可维护性）
        2. 潜在bug和安全漏洞
        3. 测试覆盖率
        4. 是否符合团队编码规范
        5. 是否有更好的实现方式
        
        PR信息：
        标题：{pr_info['title']}
        描述：{pr_info['description']}
        
        代码diff：
        {pr_info['diff']}
        
        请逐步分析，并生成详细的审查报告。
        """
        
        # Agent自动执行
        review_result = self.agent.run(task)
        
        return self._format_review(review_result)
    
    def _format_review(self, raw_result):
        """格式化审查报告"""
        # 用LLM将原始结果格式化为Markdown
        prompt = f"""
        将以下代码审查结果格式化为清晰的Markdown报告：
        
        {raw_result}
        
        格式要求：
        1. 用Emoji标识严重程度（❌严重、⚠️警告、💡建议）
        2. 每个问题包含：位置、描述、建议
        3. 添加代码示例
        4. 总结部分：是否建议合并
        """
        
        formatted = self.llm(prompt)
        return formatted
```

**代码分析工具**：

```python
# tools/code_analyzer.py
import ast
import re
from radon.complexity import cc_visit
from radon.metrics import mi_visit
from bandit.core import manager

class CodeAnalyzer:
    def analyze(self, code: str) -> str:
        """分析代码质量"""
        issues = []
        
        # 1. 圈复杂度分析
        complexity_issues = self._check_complexity(code)
        issues.extend(complexity_issues)
        
        # 2. 安全漏洞检测
        security_issues = self._check_security(code)
        issues.extend(security_issues)
        
        # 3. 代码重复检测
        duplication_issues = self._check_duplication(code)
        issues.extend(duplication_issues)
        
        # 4. 命名规范检查
        naming_issues = self._check_naming(code)
        issues.extend(naming_issues)
        
        return self._format_issues(issues)
    
    def _check_complexity(self, code):
        """检查圈复杂度"""
        issues = []
        
        try:
            # 使用radon计算圈复杂度
            complexity_results = cc_visit(code)
            
            for result in complexity_results:
                if result.complexity > 10:
                    issues.append({
                        "type": "high_complexity",
                        "severity": "warning",
                        "location": f"函数 {result.name}, 第{result.lineno}行",
                        "message": f"圈复杂度过高：{result.complexity}（建议<10）",
                        "suggestion": "考虑拆分成多个小函数"
                    })
        except Exception as e:
            pass
        
        return issues
    
    def _check_security(self, code):
        """安全漏洞检测"""
        issues = []
        
        # 简单的正则匹配（生产环境用Bandit）
        security_patterns = [
            (r"eval\(", "使用eval()有安全风险"),
            (r"exec\(", "使用exec()有安全风险"),
            (r"__import__", "动态导入可能不安全"),
            (r"pickle\.loads", "pickle反序列化可能导致代码执行"),
            (r"input\(.*\)", "直接使用input()可能导致注入攻击"),
        ]
        
        for pattern, message in security_patterns:
            matches = re.finditer(pattern, code)
            for match in matches:
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    "type": "security",
                    "severity": "error",
                    "location": f"第{line_num}行",
                    "message": message,
                    "suggestion": "使用更安全的替代方案"
                })
        
        return issues
    
    def _check_naming(self, code):
        """命名规范检查"""
        issues = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                # 检查函数命名
                if isinstance(node, ast.FunctionDef):
                    if not re.match(r'^[a-z_][a-z0-9_]*$', node.name):
                        issues.append({
                            "type": "naming",
                            "severity": "suggestion",
                            "location": f"函数 {node.name}, 第{node.lineno}行",
                            "message": "函数名应使用snake_case",
                            "suggestion": f"建议改为：{self._to_snake_case(node.name)}"
                        })
                
                # 检查类命名
                if isinstance(node, ast.ClassDef):
                    if not re.match(r'^[A-Z][a-zA-Z0-9]*$', node.name):
                        issues.append({
                            "type": "naming",
                            "severity": "suggestion",
                            "location": f"类 {node.name}, 第{node.lineno}行",
                            "message": "类名应使用PascalCase",
                            "suggestion": f"建议改为：{self._to_pascal_case(node.name)}"
                        })
        except Exception as e:
            pass
        
        return issues
    
    def _format_issues(self, issues):
        """格式化问题列表"""
        if not issues:
            return "✅ 未发现代码质量问题"
        
        formatted = f"发现 {len(issues)} 个问题：\n\n"
        
        for issue in issues:
            emoji = {"error": "❌", "warning": "⚠️", "suggestion": "💡"}[issue["severity"]]
            formatted += f"{emoji} **{issue['type']}** - {issue['location']}\n"
            formatted += f"   问题：{issue['message']}\n"
            formatted += f"   建议：{issue['suggestion']}\n\n"
        
        return formatted
```

**团队规范检索工具**：

```python
# tools/guideline_search.py
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

class GuidelineSearch:
    def __init__(self):
        # 加载团队规范的向量库
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            collection_name="coding_guidelines",
            embedding_function=self.embeddings,
            persist_directory="./knowledge_base/chroma_db"
        )
    
    def search(self, query: str) -> str:
        """搜索编码规范"""
        # 检索相关规范
        results = self.vectorstore.similarity_search(query, k=3)
        
        if not results:
            return "未找到相关规范"
        
        # 格式化结果
        formatted = "相关编码规范：\n\n"
        for i, doc in enumerate(results):
            formatted += f"### {doc.metadata.get('title', f'规范{i+1}')}\n"
            formatted += f"{doc.page_content}\n"
            formatted += f"来源：{doc.metadata.get('source', 'N/A')}\n\n"
        
        return formatted
```

**FastAPI服务**：

```python
# app.py
from fastapi import FastAPI, Request
from agents.react_agent import CodeReviewAgent
import hmac
import hashlib

app = FastAPI()
agent = CodeReviewAgent()

@app.post("/webhook/github")
async def github_webhook(request: Request):
    """接收GitHub Webhook"""
    # 1. 验证签名（安全）
    signature = request.headers.get("X-Hub-Signature-256")
    body = await request.body()
    
    if not verify_signature(body, signature):
        return {"error": "Invalid signature"}, 401
    
    # 2. 解析事件
    payload = await request.json()
    
    if payload["action"] == "opened" or payload["action"] == "synchronize":
        # PR打开或更新时触发审查
        pr_info = {
            "title": payload["pull_request"]["title"],
            "description": payload["pull_request"]["body"],
            "diff": get_pr_diff(payload["pull_request"]["url"])
        }
        
        # 3. 执行审查
        review_result = agent.review(pr_info)
        
        # 4. 发布审查意见到GitHub
        post_review_to_github(
            payload["pull_request"]["url"],
            review_result
        )
        
        return {"status": "success"}
    
    return {"status": "ignored"}

def verify_signature(body, signature):
    """验证GitHub Webhook签名"""
    secret = "your_webhook_secret"
    expected_signature = "sha256=" + hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

def get_pr_diff(pr_url):
    """获取PR的代码diff"""
    import requests
    response = requests.get(
        pr_url,
        headers={
            "Accept": "application/vnd.github.v3.diff",
            "Authorization": f"token {github_token}"
        }
    )
    return response.text

def post_review_to_github(pr_url, review_content):
    """发布审查意见到GitHub"""
    import requests
    requests.post(
        f"{pr_url}/reviews",
        json={
            "body": review_content,
            "event": "COMMENT"
        },
        headers={
            "Authorization": f"token {github_token}"
        }
    )
```

---

### 项目亮点

1. **ReAct算法应用**：多步推理，可解释性强
2. **多工具协作**：静态分析 + RAG检索 + 代码搜索
3. **实际业务价值**：提升Code Review效率60%
4. **可扩展性**：易于添加新的检查规则

---

### 面试话术

```
面试官："介绍一下你的智能代码审查Agent项目。"

你："这是我用ReAct算法开发的自动化Code Review系统。

【背景】
我们团队的Code Review流程效率低，简单的格式问题占用大量时间。

【技术方案】
1. Agent架构：用ReAct算法实现多步推理
   - Thought: 我需要先检查代码复杂度
   - Action: analyze_code_quality(code)
   - Observation: 发现函数圈复杂度为15
   - Thought: 复杂度过高，需要查询团队规范
   - Action: search_coding_guidelines("函数复杂度标准")
   - ...

2. 工具集设计：
   - 代码静态分析：用radon检测复杂度，用bandit检测安全漏洞
   - 测试覆盖率检查：分析pytest覆盖率报告
   - 团队规范检索：用RAG从知识库中检索相关规范
   - 相似代码搜索：用向量检索找类似实现

3. 工程化：
   - GitHub Webhook集成：PR打开时自动触发
   - 异步处理：用Celery异步执行审查（避免超时）
   - 结果缓存：相同代码不重复审查

【效果】
1. Code Review效率提升60%（人工审查时间从30分钟降到12分钟）
2. 发现的bug数量比纯人工多20%
3. 团队采纳率70%

【技术挑战】
1. 如何让Agent理解团队的编码风格？
   → 用RAG技术，将团队规范文档向量化，Agent可以动态检索

2. 如何避免误报？
   → 设置置信度阈值，低置信度的建议标记为"💡建议"而不是"❌错误"

3. 如何处理大型PR？
   → 分批处理，每次只审查修改的文件，用diff而不是完整代码

这个项目让我深入理解了ReAct算法的实际应用，以及如何将AI能力集成到开发工作流中。"
```

---

## 项目2：企业知识库问答系统

### 项目概述

**定位**：员工快速查找公司内部文档的智能助手

**核心功能**：
- 支持多种文档格式（PDF、Word、Markdown、网页）
- 智能问答，引用溯源
- 混合检索（向量 + 关键词）
- 多轮对话，记住上下文

**技术亮点**：
- RAG全流程优化（混合检索、重排序、引用溯源）
- 多路召回策略
- 增量索引（新文档自动更新）

---

### 系统架构

```
文档上传
    ↓
文档解析（PDF/Word/Markdown）
    ↓
文本分块（500字符，重叠50）
    ↓
向量化（BGE-large-zh）
    ↓
存储到Chroma向量库
    ↓
用户提问
    ↓
多路召回（向量检索 + BM25 + HyDE）
    ↓
重排序（Cross-Encoder）
    ↓
LLM生成答案（带引用）
    ↓
返回答案 + 来源文档
```

---

### 技术实现

#### 1. 项目结构

```
knowledge-base-qa/
├── backend/
│   ├── document_processor/
│   │   ├── pdf_parser.py
│   │   ├── docx_parser.py
│   │   └── chunking.py
│   ├── retrieval/
│   │   ├── hybrid_retriever.py
│   │   ├── reranker.py
│   │   └── hyde.py
│   ├── generation/
│   │   └── answer_generator.py
│   └── api/
│       └── main.py              # FastAPI
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── CitationPanel.tsx
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

#### 2. 核心代码

**混合检索器**：

```python
# retrieval/hybrid_retriever.py
from langchain.vectorstores import Chroma
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from langchain.embeddings import HuggingFaceEmbeddings
from sentence_transformers import CrossEncoder
import numpy as np

class HybridRetriever:
    def __init__(self, vectorstore, documents):
        # 向量检索器
        self.vector_retriever = vectorstore.as_retriever(
            search_kwargs={"k": 20}
        )
        
        # BM25检索器
        self.bm25_retriever = BM25Retriever.from_documents(documents)
        self.bm25_retriever.k = 20
        
        # 混合检索器
        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[self.vector_retriever, self.bm25_retriever],
            weights=[0.6, 0.4]
        )
        
        # 重排序模型
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    
    def retrieve(self, query, top_k=5):
        """混合检索 + 重排序"""
        # 1. 初排：混合检索
        candidates = self.ensemble_retriever.get_relevant_documents(query)
        
        # 2. 去重
        unique_docs = self._deduplicate(candidates)
        
        # 3. 重排序
        reranked_docs = self._rerank(query, unique_docs, top_k)
        
        return reranked_docs
    
    def _deduplicate(self, documents):
        """文档去重"""
        seen = set()
        unique = []
        for doc in documents:
            doc_hash = hash(doc.page_content)
            if doc_hash not in seen:
                seen.add(doc_hash)
                unique.append(doc)
        return unique
    
    def _rerank(self, query, documents, top_k):
        """重排序"""
        # 构建query-doc对
        pairs = [(query, doc.page_content) for doc in documents]
        
        # 计算相关性分数
        scores = self.reranker.predict(pairs)
        
        # 排序
        sorted_indices = np.argsort(scores)[::-1]
        
        # 返回Top K
        return [documents[i] for i in sorted_indices[:top_k]]
```

**答案生成器（带引用）**：

```python
# generation/answer_generator.py
from langchain.llms import OpenAI
import re

class AnswerGenerator:
    def __init__(self):
        self.llm = OpenAI(model="gpt-4", temperature=0)
    
    def generate(self, query, documents):
        """生成带引用的答案"""
        # 1. 构建上下文
        context = self._build_context(documents)
        
        # 2. 构建Prompt
        prompt = f"""
        根据以下参考资料回答问题，并在回答中用[1]、[2]标注信息来源。
        
        参考资料：
        {context}
        
        问题：{query}
        
        要求：
        1. 只根据参考资料回答，不要编造
        2. 用[1]、[2]标注每个信息的来源
        3. 如果参考资料中没有答案，明确说明
        
        回答：
        """
        
        # 3. 调用LLM
        answer = self.llm(prompt)
        
        # 4. 提取引用
        citations = self._extract_citations(answer, documents)
        
        return {
            "answer": answer,
            "citations": citations
        }
    
    def _build_context(self, documents):
        """构建上下文"""
        context = ""
        for i, doc in enumerate(documents):
            context += f"[{i+1}] {doc.page_content}\n"
            context += f"来源：{doc.metadata['source']}，第{doc.metadata.get('page', 'N/A')}页\n\n"
        return context
    
    def _extract_citations(self, answer, documents):
        """提取引用"""
        citations = []
        
        # 查找答案中的[1]、[2]等标记
        citation_matches = re.findall(r'\[(\d+)\]', answer)
        
        for match in citation_matches:
            idx = int(match) - 1
            if idx < len(documents):
                doc = documents[idx]
                citations.append({
                    "index": int(match),
                    "source": doc.metadata['source'],
                    "page": doc.metadata.get('page', 'N/A'),
                    "content": doc.page_content[:200]
                })
        
        return citations
```

**FastAPI服务**：

```python
# api/main.py
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from retrieval.hybrid_retriever import HybridRetriever
from generation.answer_generator import AnswerGenerator
from document_processor.pdf_parser import extract_pdf
from document_processor.chunking import chunk_documents

app = FastAPI()

# 全局变量
vectorstore = None
retriever = None
generator = AnswerGenerator()

class Query(BaseModel):
    question: str
    conversation_history: list = []

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """上传文档"""
    # 1. 保存文件
    file_path = f"./uploads/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # 2. 解析文档
    if file.filename.endswith('.pdf'):
        documents = extract_pdf(file_path)
    # ... 其他格式
    
    # 3. 文本分块
    chunks = chunk_documents(documents, chunk_size=500, overlap=50)
    
    # 4. 向量化并存储
    vectorstore.add_documents(chunks)
    
    return {
        "status": "success",
        "message": f"成功索引 {len(chunks)} 个文本块"
    }

@app.post("/query")
async def query_knowledge_base(query: Query):
    """查询知识库"""
    # 1. 检索相关文档
    documents = retriever.retrieve(query.question, top_k=5)
    
    # 2. 生成答案
    result = generator.generate(query.question, documents)
    
    return {
        "answer": result["answer"],
        "citations": result["citations"]
    }

@app.get("/stats")
async def get_stats():
    """获取知识库统计信息"""
    return {
        "total_documents": vectorstore._collection.count(),
        "total_chunks": vectorstore._collection.count()
    }
```

**React前端**：

```typescript
// frontend/src/components/ChatInterface.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface Citation {
  index: number;
  source: string;
  page: string;
  content: string;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    setLoading(true);

    try {
      // 调用API
      const response = await axios.post('/api/query', {
        question: input,
        conversation_history: messages
      });

      // 添加助手回复
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer,
        citations: response.data.citations
      };

      setMessages([...messages, userMessage, assistantMessage]);
    } catch (error) {
      console.error('查询失败:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      {/* 消息列表 */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="content">{msg.content}</div>
            
            {/* 引用面板 */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="citations">
                <h4>参考来源：</h4>
                {msg.citations.map((citation) => (
                  <div key={citation.index} className="citation">
                    <span className="citation-index">[{citation.index}]</span>
                    <span className="citation-source">
                      {citation.source} (第{citation.page}页)
                    </span>
                    <p className="citation-content">{citation.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 输入框 */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入你的问题..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? '思考中...' : '发送'}
        </button>
      </div>
    </div>
  );
};
```

---

### 项目亮点

1. **RAG全流程优化**：混合检索 + 重排序 + 引用溯源
2. **用户体验优秀**：流式输出、引用面板、文档高亮
3. **工程化完整**：前后端分离、Docker部署、增量索引
4. **实际业务价值**：查找资料时间从15分钟降到2分钟

---

### 面试话术

```
"这是我开发的企业知识库问答系统，核心是用RAG技术实现智能文档检索。

【技术亮点】
1. 混合检索：向量检索（语义相似）+ BM25（关键词匹配），准确率提升20%
2. 两阶段排序：初排返回20个候选，用Cross-Encoder重排后返回Top 5
3. 引用溯源：答案中自动标注来源，点击可查看原文
4. 增量索引：新文档上传后异步处理，不影响用户查询

【前端亮点】
作为前端工程师，我特别注重用户体验：
- 流式输出：答案逐字展示，类似ChatGPT
- 引用面板：右侧展示参考文档，可点击查看详情
- 加载状态：骨架屏 + 进度条，避免白屏
- 快捷键：Ctrl+Enter发送，方向键翻历史记录

【性能优化】
1. 缓存：常见问题用Redis缓存，响应时间从2s降到100ms
2. 异步处理：文档解析用Celery异步，上传后立即返回
3. 批量向量化：100个文本块批量调用Embedding API，节省50%时间

【业务价值】
上线后，员工查找资料的时间从15分钟降到2分钟，用户满意度4.5分。"
```

---

## 项目3：AI工作流自动化平台

### 项目概述

**定位**：低代码AI工作流编排平台（类似Dify）

**核心功能**：
- 可视化工作流设计（拖拽节点）
- 支持多种节点（LLM、知识库、HTTP、代码）
- 工作流版本管理
- 一键部署为API或Web App

**技术亮点**：
- 图引擎实现工作流执行
- 热更新（修改工作流无需重启）
- 多租户隔离

---

### 系统架构

```
前端（React + React Flow）
    ↓
API Gateway
    ↓
工作流引擎
    ├─ 图解析器（DAG）
    ├─ 节点执行器
    │   ├─ LLM节点
    │   ├─ 知识库节点
    │   ├─ HTTP节点
    │   └─ 代码节点
    └─ 状态管理（Redis）
```

---

### 技术实现

**工作流引擎核心代码**：

```python
# workflow_engine/executor.py
import networkx as nx
from typing import Dict, Any

class WorkflowExecutor:
    def __init__(self):
        self.node_executors = {
            "llm": LLMNodeExecutor(),
            "knowledge_base": KnowledgeBaseNodeExecutor(),
            "http": HTTPNodeExecutor(),
            "code": CodeNodeExecutor(),
            "condition": ConditionNodeExecutor()
        }
    
    def execute(self, workflow_config: Dict, inputs: Dict) -> Any:
        """执行工作流"""
        # 1. 构建DAG
        graph = self._build_dag(workflow_config)
        
        # 2. 拓扑排序（确定执行顺序）
        execution_order = list(nx.topological_sort(graph))
        
        # 3. 初始化变量存储
        variables = {"input": inputs}
        
        # 4. 逐节点执行
        for node_id in execution_order:
            node = workflow_config["nodes"][node_id]
            
            # 获取节点执行器
            executor = self.node_executors[node["type"]]
            
            # 执行节点
            result = executor.execute(node, variables)
            
            # 存储结果
            variables[node_id] = result
            
            # 条件分支处理
            if node["type"] == "condition":
                if not result:
                    # 跳过false分支
                    self._skip_branch(graph, node_id, execution_order)
        
        # 5. 返回最终输出
        output_node = workflow_config["output_node"]
        return variables[output_node]
    
    def _build_dag(self, workflow_config):
        """构建有向无环图"""
        graph = nx.DiGraph()
        
        for node in workflow_config["nodes"].values():
            graph.add_node(node["id"])
        
        for edge in workflow_config["edges"]:
            graph.add_edge(edge["source"], edge["target"])
        
        # 检查是否有环
        if not nx.is_directed_acyclic_graph(graph):
            raise ValueError("工作流存在循环依赖")
        
        return graph
```

**LLM节点执行器**：

```python
class LLMNodeExecutor:
    def __init__(self):
        self.llm = OpenAI(model="gpt-4")
    
    def execute(self, node, variables):
        """执行LLM节点"""
        # 1. 替换变量
        prompt = self._replace_variables(node["prompt"], variables)
        
        # 2. 调用LLM
        response = self.llm(prompt)
        
        return response
    
    def _replace_variables(self, template, variables):
        """替换{{variable}}"""
        import re
        
        def replacer(match):
            var_name = match.group(1)
            return str(variables.get(var_name, ""))
        
        return re.sub(r'\{\{(\w+)\}\}', replacer, template)
```

---

### 面试话术

```
"这是我开发的AI工作流编排平台，核心是用图引擎实现可视化工作流设计。

【技术亮点】
1. 图引擎：用networkx构建DAG，拓扑排序确定执行顺序
2. 节点扩展性：插件化设计，新增节点类型只需实现execute接口
3. 热更新：工作流配置存在Redis，修改后立即生效
4. 多租户：每个租户独立的命名空间，数据隔离

【前端亮点】
用React Flow实现可视化编辑器：
- 拖拽节点、连线
- 实时预览执行流程
- 节点配置面板（动态表单）

【应用场景】
1. 智能客服：意图识别 → 知识库检索 → 回答生成
2. 内容审核：文本分类 → 敏感词检测 → 人工复核
3. 数据处理：API调用 → 数据清洗 → 结果存储"
```

---

## 面试演示准备

### Demo视频录制

**时长**：3-5分钟

**内容结构**：
1. 开场（30秒）：项目介绍、解决的问题
2. 核心功能展示（2分钟）：现场操作，展示关键功能
3. 技术亮点（1分钟）：代码片段、架构图
4. 效果数据（30秒）：性能指标、业务价值
5. 结尾（30秒）：总结、GitHub链接

### GitHub仓库规范

```
README.md 必须包含：
- 项目简介（一句话）
- 核心功能列表
- 技术栈
- 快速开始（Docker一键启动）
- 架构图
- Demo视频链接
- 效果截图

代码质量：
- 添加类型注解（Python用typing，JavaScript用TypeScript）
- 关键函数添加docstring
- 单元测试覆盖率>60%
- pre-commit hooks（格式化、lint）
```

### 面试现场演示技巧

1. **提前准备**：
   - 本地运行无误
   - 准备好测试数据
   - 录屏备用（防止网络问题）

2. **演示顺序**：
   - 先展示最亮眼的功能
   - 再展示技术深度（打开代码）
   - 最后展示效果数据

3. **应对提问**：
   - "为什么选择XX技术？" → 对比其他方案，说明选择理由
   - "如何处理XX边界情况？" → 展示错误处理代码
   - "性能如何？" → 展示性能测试结果

---

## 总结

### 3个项目对比

| 项目 | 难度 | 技术深度 | 业务价值 | 推荐指数 |
|------|-----|---------|---------|---------|
| 代码审查Agent | ⭐⭐⭐⭐ | ReAct算法 | 高 | ⭐⭐⭐⭐⭐ |
| 知识库问答 | ⭐⭐⭐ | RAG全流程 | 高 | ⭐⭐⭐⭐⭐ |
| 工作流平台 | ⭐⭐⭐⭐⭐ | 图引擎 | 中 | ⭐⭐⭐ |

### 项目选择建议

**如果你想突出Agent能力** → 选代码审查Agent  
**如果你想突出RAG能力** → 选知识库问答  
**如果你想突出架构能力** → 选工作流平台

### 最后的建议

1. **至少完成2个项目**：一个主打（深度），一个辅助（广度）
2. **代码质量优先**：宁可功能少，也要保证代码规范
3. **准备Demo**：面试时能现场演示的项目价值10倍
4. **持续迭代**：面试后根据反馈继续优化

祝你面试成功！
