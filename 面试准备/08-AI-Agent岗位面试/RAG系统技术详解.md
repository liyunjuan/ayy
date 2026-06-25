# RAG 系统技术详解

## 目录
1. [RAG核心概念](#rag核心概念)
2. [文档解析与预处理](#文档解析与预处理)
3. [文本分块策略](#文本分块策略)
4. [Embedding技术](#embedding技术)
5. [向量数据库](#向量数据库)
6. [检索算法](#检索算法)
7. [重排序技术](#重排序技术)
8. [RAG优化技巧](#rag优化技巧)

---

## RAG核心概念

### 什么是RAG？

**RAG = Retrieval Augmented Generation（检索增强生成）**

**核心思想**：在生成答案之前，先从外部知识库检索相关信息。

```
传统LLM：
  用户问题 → LLM → 答案
  问题：只能依赖训练数据，无法回答实时/私有信息

RAG：
  用户问题 → 检索相关文档 → LLM（问题+文档） → 答案
  优势：可以回答私有数据、实时信息
```

### RAG的应用场景

1. **企业知识库问答**：员工手册、技术文档、政策规定
2. **客服系统**：产品FAQ、历史工单
3. **法律咨询**：法律法规检索
4. **医疗问答**：医学文献检索
5. **代码助手**：代码库检索

### RAG的完整流程

```python
def rag_pipeline(query: str) -> str:
    """RAG完整流程"""
    
    # 阶段1：索引构建（Indexing）- 离线执行
    # 1.1 文档加载
    documents = load_documents(['doc1.pdf', 'doc2.docx'])
    
    # 1.2 文档解析（提取文本、表格、图片）
    parsed_docs = parse_documents(documents)
    
    # 1.3 文本分块
    chunks = split_into_chunks(parsed_docs, chunk_size=500)
    
    # 1.4 向量化（Embedding）
    embeddings = embed_chunks(chunks)
    
    # 1.5 存储到向量数据库
    vectorstore.add(chunks, embeddings)
    
    # 阶段2：检索（Retrieval）- 在线执行
    # 2.1 查询向量化
    query_embedding = embed_query(query)
    
    # 2.2 相似度搜索
    candidate_docs = vectorstore.similarity_search(query_embedding, top_k=20)
    
    # 2.3 重排序
    reranked_docs = rerank(query, candidate_docs, top_k=5)
    
    # 阶段3：生成（Generation）- 在线执行
    # 3.1 构建Prompt
    context = "\n\n".join([doc.content for doc in reranked_docs])
    prompt = f"""
    根据以下参考资料回答问题：
    
    参考资料：
    {context}
    
    问题：{query}
    
    回答：
    """
    
    # 3.2 调用LLM
    answer = llm.generate(prompt)
    
    # 3.3 返回答案 + 引用
    return {
        "answer": answer,
        "sources": [doc.metadata for doc in reranked_docs]
    }
```

---

## 文档解析与预处理

### 支持的文档格式

#### 1. PDF解析

**工具选择**：

| 工具 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **PyPDF2** | 简单快速 | 不支持图片/表格 | 纯文本PDF |
| **pdfplumber** | 支持表格提取 | 速度较慢 | 带表格的PDF |
| **PyMuPDF** | 速度快，功能全 | 依赖C库 | 复杂PDF |
| **Unstructured** | 智能布局识别 | 需要外部模型 | 扫描件PDF |

**代码示例**：

```python
# 方法1：PyPDF2（简单快速）
from PyPDF2 import PdfReader

def extract_text_pypdf2(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# 方法2：pdfplumber（支持表格）
import pdfplumber

def extract_with_tables(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        documents = []
        for page in pdf.pages:
            # 提取文本
            text = page.extract_text()
            
            # 提取表格
            tables = page.extract_tables()
            
            # 将表格转为文本
            for table in tables:
                table_text = "\n".join([
                    " | ".join(row) for row in table
                ])
                text += f"\n\n表格：\n{table_text}"
            
            documents.append({
                "content": text,
                "metadata": {
                    "source": pdf_path,
                    "page": page.page_number
                }
            })
        
        return documents

# 方法3：Unstructured（智能解析）
from unstructured.partition.pdf import partition_pdf

def extract_unstructured(pdf_path):
    elements = partition_pdf(pdf_path)
    
    # 分类处理不同元素
    documents = []
    for element in elements:
        if element.category == "Title":
            # 标题
            documents.append({
                "type": "title",
                "content": element.text,
                "metadata": element.metadata
            })
        elif element.category == "Table":
            # 表格
            documents.append({
                "type": "table",
                "content": element.text,
                "metadata": element.metadata
            })
        elif element.category == "Image":
            # 图片（可以用GPT-4V识别）
            documents.append({
                "type": "image",
                "content": element.text,
                "image_path": element.metadata["image_path"]
            })
    
    return documents
```

#### 2. Word文档解析

```python
# 方法1：python-docx
from docx import Document

def extract_text_docx(docx_path):
    doc = Document(docx_path)
    
    # 提取段落
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    
    # 提取表格
    tables = []
    for table in doc.tables:
        table_data = []
        for row in table.rows:
            row_data = [cell.text for cell in row.cells]
            table_data.append(row_data)
        tables.append(table_data)
    
    return {
        "paragraphs": paragraphs,
        "tables": tables
    }

# 方法2：docx2txt（更简单）
import docx2txt

def extract_simple(docx_path):
    text = docx2txt.process(docx_path)
    return text
```

#### 3. Markdown解析

```python
from langchain.document_loaders import UnstructuredMarkdownLoader

def extract_markdown(md_path):
    loader = UnstructuredMarkdownLoader(md_path)
    documents = loader.load()
    return documents

# 自定义解析（保留结构）
import re

def parse_markdown_with_structure(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取标题和内容
    sections = []
    current_section = {"title": "", "level": 0, "content": ""}
    
    for line in content.split('\n'):
        # 匹配标题
        heading_match = re.match(r'^(#{1,6})\s+(.+)$', line)
        if heading_match:
            if current_section["content"]:
                sections.append(current_section)
            
            level = len(heading_match.group(1))
            title = heading_match.group(2)
            current_section = {
                "title": title,
                "level": level,
                "content": ""
            }
        else:
            current_section["content"] += line + "\n"
    
    if current_section["content"]:
        sections.append(current_section)
    
    return sections
```

### 文档预处理

```python
def preprocess_document(text: str) -> str:
    """文档预处理"""
    
    # 1. 去除多余空白
    text = re.sub(r'\s+', ' ', text)
    
    # 2. 去除特殊字符（保留中英文、数字、标点）
    text = re.sub(r'[^一-龥a-zA-Z0-9\s\.\,\?\!\:\;\(\)\[\]\{\}]', '', text)
    
    # 3. 统一标点符号
    text = text.replace('，', ',').replace('。', '.')
    
    # 4. 去除页眉页脚（常见模式）
    text = re.sub(r'第\s*\d+\s*页', '', text)  # 去除"第X页"
    text = re.sub(r'\d+\s*/\s*\d+', '', text)  # 去除"1/10"
    
    # 5. 去除目录（可选）
    # ...
    
    return text.strip()
```

---

## 文本分块策略

### 为什么要分块？

1. **Embedding模型限制**：大多数模型最大支持512 tokens
2. **检索精度**：小块更精准，大块语义更完整
3. **成本控制**：减少LLM的输入Token数

### 分块策略

#### 1. 固定长度分块（最简单）

```python
def chunk_by_length(text: str, chunk_size: int = 500, overlap: int = 50):
    """固定长度分块"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap  # 重叠部分
    
    return chunks

# 示例
text = "这是一段很长的文本..." * 100
chunks = chunk_by_length(text, chunk_size=500, overlap=50)
```

**优点**：简单快速  
**缺点**：可能在句子中间截断，破坏语义

#### 2. 按分隔符分块（推荐）

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

def chunk_by_separator(text: str, chunk_size: int = 500, overlap: int = 50):
    """按分隔符分块（优先级：段落 > 句子 > 词）"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=[
            "\n\n",  # 段落
            "\n",    # 行
            "。",    # 句子（中文）
            "！",
            "？",
            ".",     # 句子（英文）
            "!",
            "?",
            " ",     # 词
            ""       # 字符
        ]
    )
    
    chunks = splitter.split_text(text)
    return chunks

# 示例
text = """
第一段内容...

第二段内容...

第三段内容...
"""
chunks = chunk_by_separator(text, chunk_size=500)
```

**优点**：保持语义完整  
**缺点**：块大小不完全均匀

#### 3. 语义分块（最智能）

```python
from langchain.text_splitter import SemanticChunker
from langchain.embeddings import OpenAIEmbeddings

def chunk_by_semantics(text: str):
    """根据语义相似度分块"""
    embeddings = OpenAIEmbeddings()
    
    splitter = SemanticChunker(
        embeddings=embeddings,
        breakpoint_threshold_type="percentile",  # 分块阈值
        breakpoint_threshold_amount=95  # 相似度低于95%时分块
    )
    
    chunks = splitter.split_text(text)
    return chunks
```

**优点**：语义完整性最好  
**缺点**：速度慢，需要调用Embedding API

#### 4. 按文档结构分块（适合Markdown）

```python
from langchain.text_splitter import MarkdownTextSplitter

def chunk_markdown(md_text: str):
    """按Markdown标题分块"""
    splitter = MarkdownTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    
    chunks = splitter.split_text(md_text)
    return chunks

# 示例：自定义实现
def chunk_by_headers(md_text: str):
    """按标题分块，保留层级信息"""
    sections = []
    current_section = {"title": "", "level": 0, "content": ""}
    title_stack = []  # 标题栈（保留父标题）
    
    for line in md_text.split('\n'):
        heading_match = re.match(r'^(#{1,6})\s+(.+)$', line)
        if heading_match:
            # 保存上一个section
            if current_section["content"]:
                sections.append({
                    **current_section,
                    "path": " > ".join(title_stack)  # 标题路径
                })
            
            # 更新标题栈
            level = len(heading_match.group(1))
            title = heading_match.group(2)
            
            while title_stack and len(title_stack) >= level:
                title_stack.pop()
            title_stack.append(title)
            
            current_section = {
                "title": title,
                "level": level,
                "content": ""
            }
        else:
            current_section["content"] += line + "\n"
    
    if current_section["content"]:
        sections.append({
            **current_section,
            "path": " > ".join(title_stack)
        })
    
    return sections

# 示例结果
# {
#   "title": "安装步骤",
#   "level": 2,
#   "content": "1. 下载安装包\n2. 运行安装程序",
#   "path": "用户手册 > 快速开始 > 安装步骤"
# }
```

### 分块参数调优

**经验值**：

| 场景 | chunk_size | chunk_overlap | 说明 |
|------|-----------|--------------|------|
| **问答系统** | 500-1000 | 50-100 | 平衡精度和召回 |
| **摘要生成** | 1000-2000 | 100-200 | 需要更多上下文 |
| **代码检索** | 200-500 | 20-50 | 代码块相对独立 |
| **法律文档** | 1000-1500 | 100-150 | 长句子，需完整性 |

**调优方法**：

```python
def evaluate_chunking(chunks, queries):
    """评估分块效果"""
    metrics = {
        "avg_chunk_size": sum(len(c) for c in chunks) / len(chunks),
        "min_chunk_size": min(len(c) for c in chunks),
        "max_chunk_size": max(len(c) for c in chunks),
        "num_chunks": len(chunks)
    }
    
    # 测试检索效果
    vectorstore = build_vectorstore(chunks)
    
    recall_scores = []
    for query in queries:
        results = vectorstore.similarity_search(query, k=5)
        # 人工标注正确答案，计算召回率
        recall = calculate_recall(results, ground_truth[query])
        recall_scores.append(recall)
    
    metrics["avg_recall"] = sum(recall_scores) / len(recall_scores)
    
    return metrics

# 网格搜索最佳参数
best_params = None
best_recall = 0

for chunk_size in [300, 500, 800, 1000]:
    for overlap in [50, 100, 150]:
        chunks = chunk_by_separator(text, chunk_size, overlap)
        metrics = evaluate_chunking(chunks, test_queries)
        
        if metrics["avg_recall"] > best_recall:
            best_recall = metrics["avg_recall"]
            best_params = {"chunk_size": chunk_size, "overlap": overlap}

print(f"最佳参数：{best_params}，召回率：{best_recall}")
```

---

## Embedding技术

### 什么是Embedding？

**Embedding = 将文本转换为向量**

```
文本："苹果很好吃" 
  ↓ Embedding模型
向量：[0.2, -0.5, 0.8, ..., 0.1]  (1536维)
```

### Embedding模型选择

| 模型 | 维度 | 适用语言 | 性能 | 成本 |
|------|------|---------|------|------|
| **OpenAI text-embedding-3-small** | 1536 | 多语言 | ⭐⭐⭐⭐ | $0.02/1M tokens |
| **OpenAI text-embedding-3-large** | 3072 | 多语言 | ⭐⭐⭐⭐⭐ | $0.13/1M tokens |
| **BGE-large-zh** | 1024 | 中文 | ⭐⭐⭐⭐ | 免费（本地） |
| **M3E-base** | 768 | 中文 | ⭐⭐⭐ | 免费（本地） |
| **Cohere embed-multilingual** | 768 | 多语言 | ⭐⭐⭐⭐ | $0.10/1M tokens |

### 使用示例

#### 1. OpenAI Embeddings

```python
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key="your_api_key"
)

# 向量化单个文本
vector = embeddings.embed_query("苹果很好吃")
print(len(vector))  # 1536

# 批量向量化
texts = ["文本1", "文本2", "文本3"]
vectors = embeddings.embed_documents(texts)
```

#### 2. 本地Embedding模型（推荐用于生产）

```python
from langchain.embeddings import HuggingFaceEmbeddings

# 使用BGE模型（中文效果好）
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",
    model_kwargs={'device': 'cuda'},  # 使用GPU
    encode_kwargs={'normalize_embeddings': True}  # 归一化
)

# 使用
vector = embeddings.embed_query("苹果很好吃")
```

#### 3. 自定义Embedding模型

```python
from langchain.embeddings.base import Embeddings
import requests

class CustomEmbeddings(Embeddings):
    def __init__(self, api_url: str):
        self.api_url = api_url
    
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """批量向量化"""
        response = requests.post(
            f"{self.api_url}/embed",
            json={"texts": texts}
        )
        return response.json()["embeddings"]
    
    def embed_query(self, text: str) -> list[float]:
        """向量化单个查询"""
        return self.embed_documents([text])[0]

# 使用
embeddings = CustomEmbeddings(api_url="https://your-api.com")
```

### Embedding优化技巧

#### 1. 添加查询前缀（提升检索效果）

```python
# BGE模型推荐的做法
def embed_with_prefix(embeddings, texts, is_query=False):
    if is_query:
        # 查询添加前缀
        texts = [f"为这个句子生成表示以用于检索相关文章：{text}" for text in texts]
    
    return embeddings.embed_documents(texts)

# 使用
query_vector = embed_with_prefix(embeddings, ["Python教程"], is_query=True)
doc_vectors = embed_with_prefix(embeddings, documents, is_query=False)
```

#### 2. 混合Embedding（多模型融合）

```python
from langchain.embeddings import OpenAIEmbeddings, HuggingFaceEmbeddings
import numpy as np

class HybridEmbeddings:
    def __init__(self):
        self.openai_emb = OpenAIEmbeddings()
        self.bge_emb = HuggingFaceEmbeddings(model_name="BAAI/bge-large-zh")
    
    def embed_query(self, text: str):
        # 使用两个模型分别向量化
        vec1 = np.array(self.openai_emb.embed_query(text))
        vec2 = np.array(self.bge_emb.embed_query(text))
        
        # 归一化
        vec1 = vec1 / np.linalg.norm(vec1)
        vec2 = vec2 / np.linalg.norm(vec2)
        
        # 拼接
        hybrid_vec = np.concatenate([vec1, vec2])
        
        return hybrid_vec.tolist()
```

#### 3. 缓存Embedding（节省成本）

```python
import hashlib
import json
import redis

class CachedEmbeddings:
    def __init__(self, embeddings, redis_client):
        self.embeddings = embeddings
        self.redis = redis_client
        self.ttl = 3600 * 24 * 30  # 缓存30天
    
    def embed_query(self, text: str):
        # 生成cache key
        cache_key = f"emb:{hashlib.md5(text.encode()).hexdigest()}"
        
        # 检查缓存
        cached = self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # 调用Embedding API
        vector = self.embeddings.embed_query(text)
        
        # 存入缓存
        self.redis.setex(cache_key, self.ttl, json.dumps(vector))
        
        return vector
```

---

## 向量数据库

### 向量数据库对比

| 数据库 | 类型 | 性能 | 适用场景 |
|-------|------|------|---------|
| **Chroma** | 本地/云 | 中 | 开发测试 |
| **Pinecone** | 云托管 | 高 | 生产环境 |
| **Weaviate** | 本地/云 | 高 | 企业级 |
| **Milvus** | 本地/云 | 极高 | 大规模数据 |
| **Qdrant** | 本地/云 | 高 | 高并发 |
| **FAISS** | 本地 | 极高 | 单机大规模 |

### Chroma（推荐用于开发）

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 1. 创建向量库
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(
    collection_name="my_docs",
    embedding_function=embeddings,
    persist_directory="./chroma_db"  # 持久化路径
)

# 2. 添加文档
from langchain.schema import Document

documents = [
    Document(
        page_content="Python是一种编程语言",
        metadata={"source": "doc1.pdf", "page": 1}
    ),
    Document(
        page_content="JavaScript用于Web开发",
        metadata={"source": "doc2.pdf", "page": 5}
    )
]

vectorstore.add_documents(documents)

# 3. 检索
results = vectorstore.similarity_search("编程语言", k=5)

# 4. 带分数检索
results_with_scores = vectorstore.similarity_search_with_score("编程语言", k=5)
for doc, score in results_with_scores:
    print(f"相似度：{score:.4f}")
    print(f"内容：{doc.page_content}")

# 5. 元数据过滤
results = vectorstore.similarity_search(
    "编程语言",
    k=5,
    filter={"source": "doc1.pdf"}  # 只搜索doc1.pdf
)

# 6. 持久化
vectorstore.persist()

# 7. 加载
vectorstore = Chroma(
    collection_name="my_docs",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)
```

### Pinecone（推荐用于生产）

```python
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
import pinecone

# 1. 初始化Pinecone
pinecone.init(
    api_key="your_api_key",
    environment="us-west1-gcp"
)

# 2. 创建索引
index_name = "my-docs"
if index_name not in pinecone.list_indexes():
    pinecone.create_index(
        name=index_name,
        dimension=1536,  # OpenAI embedding维度
        metric="cosine"  # 相似度计算方法
    )

# 3. 创建向量库
embeddings = OpenAIEmbeddings()
vectorstore = Pinecone.from_documents(
    documents,
    embeddings,
    index_name=index_name
)

# 4. 检索
results = vectorstore.similarity_search("编程语言", k=5)

# 5. 带命名空间（多租户）
vectorstore = Pinecone.from_documents(
    documents,
    embeddings,
    index_name=index_name,
    namespace="user_123"  # 为每个用户创建独立命名空间
)
```

### Weaviate（企业级）

```python
from langchain.vectorstores import Weaviate
from langchain.embeddings import OpenAIEmbeddings
import weaviate

# 1. 连接Weaviate
client = weaviate.Client(
    url="http://localhost:8080",
    auth_client_secret=weaviate.AuthApiKey(api_key="your_api_key")
)

# 2. 创建向量库
embeddings = OpenAIEmbeddings()
vectorstore = Weaviate.from_documents(
    documents,
    embeddings,
    client=client,
    index_name="MyDocs"
)

# 3. 混合检索（向量 + 关键词）
results = vectorstore.similarity_search(
    "编程语言",
    k=5,
    alpha=0.75  # 0=纯关键词，1=纯向量，0.75=混合
)

# 4. 复杂过滤
results = vectorstore.similarity_search(
    "编程语言",
    k=5,
    where_filter={
        "path": ["source"],
        "operator": "Equal",
        "valueString": "doc1.pdf"
    }
)
```

### FAISS（单机高性能）

```python
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# 1. 创建向量库
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents, embeddings)

# 2. 保存到本地
vectorstore.save_local("faiss_index")

# 3. 加载
vectorstore = FAISS.load_local("faiss_index", embeddings)

# 4. 增量添加
vectorstore.add_documents(new_documents)

# 5. 合并多个索引
vectorstore1 = FAISS.from_documents(docs1, embeddings)
vectorstore2 = FAISS.from_documents(docs2, embeddings)
vectorstore1.merge_from(vectorstore2)
```

---

## 检索算法

### 1. 相似度计算方法

#### 余弦相似度（最常用）

```python
import numpy as np

def cosine_similarity(vec1, vec2):
    """余弦相似度"""
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# 示例
vec1 = [1, 2, 3]
vec2 = [2, 3, 4]
sim = cosine_similarity(vec1, vec2)
print(f"相似度：{sim:.4f}")  # 0.9926
```

#### 欧氏距离

```python
def euclidean_distance(vec1, vec2):
    """欧氏距离（越小越相似）"""
    return np.linalg.norm(np.array(vec1) - np.array(vec2))
```

#### 点积（Dot Product）

```python
def dot_product(vec1, vec2):
    """点积（越大越相似）"""
    return np.dot(vec1, vec2)
```

### 2. 混合检索（Hybrid Search）

**核心思想**：结合向量检索（语义相似）和关键词检索（精确匹配）

```python
from langchain.retrievers import EnsembleRetriever
from langchain.retrievers import BM25Retriever

class HybridRetriever:
    def __init__(self, vectorstore, documents):
        # 向量检索器
        self.vector_retriever = vectorstore.as_retriever(
            search_kwargs={"k": 20}
        )
        
        # BM25检索器（关键词）
        self.bm25_retriever = BM25Retriever.from_documents(documents)
        self.bm25_retriever.k = 20
        
        # 混合检索器
        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[self.vector_retriever, self.bm25_retriever],
            weights=[0.6, 0.4]  # 向量60%，关键词40%
        )
    
    def retrieve(self, query, k=5):
        """混合检索"""
        results = self.ensemble_retriever.get_relevant_documents(query)
        return results[:k]

# 使用
hybrid_retriever = HybridRetriever(vectorstore, documents)
results = hybrid_retriever.retrieve("Python教程")
```

### 3. 多路召回

**核心思想**：用多种策略召回候选文档，再统一排序

```python
class MultiRecallRetriever:
    def __init__(self, vectorstore, documents):
        self.vectorstore = vectorstore
        self.documents = documents
    
    def retrieve(self, query, k=5):
        """多路召回"""
        all_candidates = []
        
        # 路径1：向量检索（原问题）
        vec_results1 = self.vectorstore.similarity_search(query, k=10)
        all_candidates.extend([(doc, "vector_original") for doc in vec_results1])
        
        # 路径2：向量检索（改写问题）
        rewritten_query = self.rewrite_query(query)
        vec_results2 = self.vectorstore.similarity_search(rewritten_query, k=10)
        all_candidates.extend([(doc, "vector_rewritten") for doc in vec_results2])
        
        # 路径3：关键词检索
        bm25_retriever = BM25Retriever.from_documents(self.documents)
        bm25_results = bm25_retriever.get_relevant_documents(query)[:10]
        all_candidates.extend([(doc, "bm25") for doc in bm25_results])
        
        # 路径4：HyDE（假设文档）
        hyde_results = self.hyde_retrieve(query, k=10)
        all_candidates.extend([(doc, "hyde") for doc in hyde_results])
        
        # 去重
        seen = set()
        unique_candidates = []
        for doc, source in all_candidates:
            doc_id = hash(doc.page_content)
            if doc_id not in seen:
                seen.add(doc_id)
                unique_candidates.append((doc, source))
        
        # 统一排序（重排序）
        ranked_docs = self.rerank(query, unique_candidates)
        
        return ranked_docs[:k]
    
    def rewrite_query(self, query):
        """查询改写"""
        # 用LLM改写查询
        prompt = f"将以下问题改写成更适合搜索的关键词：{query}"
        return llm(prompt)
    
    def hyde_retrieve(self, query, k):
        """HyDE检索"""
        # 先生成假设答案
        prompt = f"请详细回答：{query}"
        hypothetical_doc = llm(prompt)
        
        # 用假设答案检索
        results = self.vectorstore.similarity_search(hypothetical_doc, k=k)
        return results
```

### 4. 父文档检索

**核心思想**：索引小块（精准），返回大块（完整）

```python
from langchain.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore

def create_parent_document_retriever(documents):
    # 文档存储
    docstore = InMemoryStore()
    
    # 小块切分器（用于索引）
    child_splitter = RecursiveCharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=20
    )
    
    # 大块切分器（用于返回）
    parent_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )
    
    # 创建检索器
    retriever = ParentDocumentRetriever(
        vectorstore=vectorstore,
        docstore=docstore,
        child_splitter=child_splitter,
        parent_splitter=parent_splitter
    )
    
    # 添加文档
    retriever.add_documents(documents)
    
    return retriever

# 使用
retriever = create_parent_document_retriever(documents)
results = retriever.get_relevant_documents("Python教程")
# 返回的是1000字符的大块，而不是200字符的小块
```

---

## 重排序技术

### 为什么需要重排序？

初排（向量检索）速度快但不够精准，重排序（Cross-Encoder）更精准但速度慢。

**两阶段检索**：
1. 初排：向量检索，从10万文档中选出Top 50（速度快）
2. 重排：Cross-Encoder，从50个中选出Top 5（精度高）

### 1. Cohere Rerank（最简单）

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank

# 初排检索器
base_retriever = vectorstore.as_retriever(search_kwargs={"k": 50})

# Cohere重排序
compressor = CohereRerank(
    cohere_api_key="your_api_key",
    model="rerank-english-v2.0",
    top_n=5  # 重排后返回Top 5
)

# 组合成检索器
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever
)

# 使用
results = retriever.get_relevant_documents("Python教程")
# 返回5个最相关的文档
```

### 2. Cross-Encoder重排序

```python
from sentence_transformers import CrossEncoder
import numpy as np

class CrossEncoderReranker:
    def __init__(self, model_name="cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.model = CrossEncoder(model_name)
    
    def rerank(self, query, documents, top_k=5):
        """重排序"""
        # 构建query-doc对
        pairs = [(query, doc.page_content) for doc in documents]
        
        # 计算相关性分数
        scores = self.model.predict(pairs)
        
        # 排序
        sorted_indices = np.argsort(scores)[::-1]
        
        # 返回Top K
        reranked_docs = [documents[i] for i in sorted_indices[:top_k]]
        reranked_scores = [scores[i] for i in sorted_indices[:top_k]]
        
        return list(zip(reranked_docs, reranked_scores))

# 使用
reranker = CrossEncoderReranker()

# 初排
candidates = vectorstore.similarity_search("Python教程", k=50)

# 重排
final_results = reranker.rerank("Python教程", candidates, top_k=5)

for doc, score in final_results:
    print(f"分数：{score:.4f}")
    print(f"内容：{doc.page_content[:100]}")
```

### 3. LLM重排序

```python
def llm_rerank(query, documents, top_k=5):
    """用LLM重排序"""
    # 构建Prompt
    docs_text = "\n\n".join([
        f"[{i+1}] {doc.page_content[:200]}"
        for i, doc in enumerate(documents)
    ])
    
    prompt = f"""
    问题：{query}
    
    候选文档：
    {docs_text}
    
    请根据相关性对文档进行排序，只输出文档编号，用逗号分隔。
    例如：3,1,5,2,4
    """
    
    # 调用LLM
    ranking = llm(prompt).strip()
    
    # 解析排序结果
    ranked_indices = [int(i)-1 for i in ranking.split(',')]
    
    # 返回排序后的文档
    return [documents[i] for i in ranked_indices[:top_k]]
```

---

## RAG优化技巧

### 1. 查询改写

```python
def query_rewriting(query):
    """查询改写（提升检索效果）"""
    
    # 方法1：扩展查询
    prompt = f"""
    将以下问题扩展成多个相关查询：
    原问题：{query}
    
    生成3个相关查询（用逗号分隔）：
    """
    expanded = llm(prompt).split(',')
    
    # 方法2：查询分解
    prompt = f"""
    将以下复杂问题分解成多个子问题：
    原问题：{query}
    
    子问题（每行一个）：
    """
    sub_queries = llm(prompt).split('\n')
    
    return expanded, sub_queries
```

### 2. 自查询（Self-Querying）

```python
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain.chains.query_constructor.base import AttributeInfo

# 定义元数据字段
metadata_field_info = [
    AttributeInfo(
        name="source",
        description="文档来源",
        type="string"
    ),
    AttributeInfo(
        name="page",
        description="页码",
        type="integer"
    ),
    AttributeInfo(
        name="category",
        description="文档类别：技术文档、用户手册、FAQ",
        type="string"
    )
]

# 创建自查询检索器
retriever = SelfQueryRetriever.from_llm(
    llm=llm,
    vectorstore=vectorstore,
    document_contents="公司的技术文档和用户手册",
    metadata_field_info=metadata_field_info
)

# 使用（LLM会自动解析过滤条件）
results = retriever.get_relevant_documents(
    "2024年的技术文档中关于Python的内容"
)
# LLM自动解析为：
# query = "Python"
# filter = {"category": "技术文档", "year": 2024}
```

### 3. 引用溯源

```python
def generate_answer_with_citations(query, docs):
    """生成带引用的答案"""
    # 构建Prompt
    context = ""
    for i, doc in enumerate(docs):
        context += f"[{i+1}] {doc.page_content}\n"
        context += f"来源：{doc.metadata['source']}，第{doc.metadata['page']}页\n\n"
    
    prompt = f"""
    根据以下参考资料回答问题，并在回答中用[1]、[2]标注信息来源：
    
    参考资料：
    {context}
    
    问题：{query}
    
    回答（记得标注来源）：
    """
    
    answer = llm(prompt)
    
    # 提取引用
    citations = []
    for i, doc in enumerate(docs):
        if f"[{i+1}]" in answer:
            citations.append({
                "index": i+1,
                "source": doc.metadata['source'],
                "page": doc.metadata['page'],
                "content": doc.page_content[:200]
            })
    
    return {
        "answer": answer,
        "citations": citations
    }

# 使用
results = vectorstore.similarity_search("Python是什么", k=5)
response = generate_answer_with_citations("Python是什么", results)

print(response["answer"])
# "Python是一种编程语言[1]，具有简洁的语法[2]..."

print(response["citations"])
# [{"index": 1, "source": "python_intro.pdf", "page": 3, ...}, ...]
```

### 4. 增量更新

```python
class IncrementalRAG:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.doc_hashes = set()  # 记录已索引的文档
    
    def add_documents(self, documents):
        """增量添加文档（去重）"""
        new_docs = []
        
        for doc in documents:
            # 计算文档哈希
            doc_hash = hashlib.md5(doc.page_content.encode()).hexdigest()
            
            if doc_hash not in self.doc_hashes:
                new_docs.append(doc)
                self.doc_hashes.add(doc_hash)
        
        if new_docs:
            self.vectorstore.add_documents(new_docs)
            print(f"新增 {len(new_docs)} 个文档")
    
    def update_document(self, doc_id, new_content):
        """更新文档"""
        # 删除旧版本
        self.vectorstore.delete([doc_id])
        
        # 添加新版本
        new_doc = Document(page_content=new_content, metadata={"id": doc_id})
        self.vectorstore.add_documents([new_doc])
```

### 5. 多模态RAG

```python
def multimodal_rag(query, pdf_path):
    """多模态RAG（处理图片）"""
    # 1. 提取PDF中的文本和图片
    elements = partition_pdf(pdf_path)
    
    texts = []
    images = []
    
    for element in elements:
        if element.category == "Text":
            texts.append(element.text)
        elif element.category == "Image":
            images.append(element.metadata["image_path"])
    
    # 2. 文本RAG
    text_results = vectorstore.similarity_search(query, k=3)
    
    # 3. 图片识别（用GPT-4V）
    image_descriptions = []
    for img_path in images:
        # 用GPT-4V识别图片
        description = gpt4v_describe_image(img_path, query)
        image_descriptions.append(description)
    
    # 4. 综合生成答案
    context = "\n\n".join([
        "文本信息：" + "\n".join([doc.page_content for doc in text_results]),
        "图片信息：" + "\n".join(image_descriptions)
    ])
    
    prompt = f"""
    根据以下信息回答问题：
    
    {context}
    
    问题：{query}
    
    回答：
    """
    
    return llm(prompt)

def gpt4v_describe_image(image_path, query):
    """用GPT-4V描述图片"""
    import base64
    
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()
    
    response = openai.ChatCompletion.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"描述这张图片，重点关注：{query}"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                ]
            }
        ]
    )
    
    return response.choices[0].message.content
```

---

## 完整RAG系统示例

```python
class ProductionRAG:
    def __init__(self):
        # Embedding模型（本地，节省成本）
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-large-zh-v1.5"
        )
        
        # 向量数据库（Pinecone，生产级）
        self.vectorstore = Pinecone(...)
        
        # 重排序模型
        self.reranker = CrossEncoderReranker()
        
        # LLM
        self.llm = ChatOpenAI(model="gpt-4")
        
        # 缓存
        self.cache = redis.Redis()
    
    def index_documents(self, file_paths):
        """索引文档"""
        all_chunks = []
        
        for file_path in file_paths:
            # 1. 文档解析
            if file_path.endswith('.pdf'):
                docs = extract_with_tables(file_path)
            elif file_path.endswith('.docx'):
                docs = extract_text_docx(file_path)
            
            # 2. 文本分块
            chunks = chunk_by_separator(docs, chunk_size=500, overlap=50)
            
            # 3. 添加元数据
            for chunk in chunks:
                chunk.metadata.update({
                    "source": file_path,
                    "indexed_at": datetime.now().isoformat()
                })
            
            all_chunks.extend(chunks)
        
        # 4. 向量化并存储
        self.vectorstore.add_documents(all_chunks)
        
        print(f"索引完成：{len(all_chunks)} 个文本块")
    
    def query(self, query, k=5):
        """查询"""
        # 检查缓存
        cache_key = f"rag:{hashlib.md5(query.encode()).hexdigest()}"
        cached = self.cache.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # 1. 查询改写
        expanded_queries = self.expand_query(query)
        
        # 2. 多路召回
        all_candidates = []
        for q in [query] + expanded_queries:
            results = self.vectorstore.similarity_search(q, k=20)
            all_candidates.extend(results)
        
        # 去重
        unique_docs = self.deduplicate(all_candidates)
        
        # 3. 重排序
        reranked_docs = self.reranker.rerank(query, unique_docs, top_k=k)
        
        # 4. 生成答案
        answer = self.generate_answer(query, reranked_docs)
        
        # 5. 缓存结果
        self.cache.setex(cache_key, 3600, json.dumps(answer))
        
        return answer
    
    def expand_query(self, query):
        """查询扩展"""
        prompt = f"将以下问题扩展成2个相关查询：{query}"
        expanded = self.llm(prompt).split('\n')
        return expanded[:2]
    
    def deduplicate(self, documents):
        """文档去重"""
        seen = set()
        unique = []
        for doc in documents:
            doc_hash = hashlib.md5(doc.page_content.encode()).hexdigest()
            if doc_hash not in seen:
                seen.add(doc_hash)
                unique.append(doc)
        return unique
    
    def generate_answer(self, query, documents):
        """生成答案"""
        context = "\n\n".join([
            f"[{i+1}] {doc.page_content}\n来源：{doc.metadata['source']}"
            for i, doc in enumerate(documents)
        ])
        
        prompt = f"""
        根据以下参考资料回答问题，并标注信息来源：
        
        参考资料：
        {context}
        
        问题：{query}
        
        回答（用[1]、[2]标注来源）：
        """
        
        answer = self.llm(prompt)
        
        return {
            "answer": answer,
            "sources": [doc.metadata for doc in documents]
        }

# 使用
rag = ProductionRAG()

# 索引文档
rag.index_documents(['doc1.pdf', 'doc2.pdf', 'doc3.pdf'])

# 查询
response = rag.query("Python是什么？")
print(response["answer"])
print(response["sources"])
```

---

## 总结

### RAG系统核心要点

1. **文档解析**：支持多种格式（PDF、Word、Markdown），处理表格和图片
2. **文本分块**：选择合适的分块策略（500-1000字符，重叠50-100）
3. **Embedding**：使用高质量模型（OpenAI、BGE），添加缓存
4. **向量数据库**：开发用Chroma，生产用Pinecone/Weaviate
5. **检索算法**：混合检索（向量+BM25）+ 重排序
6. **优化技巧**：查询改写、多路召回、引用溯源

### 性能优化Checklist

- [ ] Embedding缓存（Redis）
- [ ] 查询结果缓存
- [ ] 异步调用Embedding API
- [ ] 批量向量化（batch_size=100）
- [ ] 向量数据库索引优化
- [ ] 重排序只对Top 50候选

### 进阶方向

1. **GraphRAG**：用知识图谱增强RAG
2. **Self-RAG**：Agent自主决定是否需要检索
3. **RAPTOR**：树形摘要，多层次检索
4. **多模态RAG**：处理图片、表格、图表
