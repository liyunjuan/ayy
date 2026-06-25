# 后端 AI 面试指南（Java/Spring Boot）

> 后端工程师必备的 AI 技术知识与实战应用 - 系统架构、API 集成、性能优化

---

## 📋 目录

- [01. AI 基础概念](#01-ai-基础概念)
- [02. LLM API 集成](#02-llm-api-集成)
- [03. Spring Boot AI 开发](#03-spring-boot-ai-开发)
- [04. 向量数据库与 RAG](#04-向量数据库与-rag)
- [05. Prompt Engineering](#05-prompt-engineering)
- [06. 流式响应](#06-流式响应)
- [07. Function Calling](#07-function-calling)
- [08. AI 系统架构设计](#08-ai-系统架构设计)
- [09. 性能优化](#09-性能优化)
- [10. 安全与合规](#10-安全与合规)
- [11. 实战场景题](#11-实战场景题)
- [12. 面试高频问答](#12-面试高频问答)

---

## 01. AI 基础概念

### 1.1 大语言模型（LLM）

#### Q: 什么是 LLM？

**定义**：
- Large Language Model（大语言模型）
- 基于 Transformer 架构的深度学习模型
- 通过海量文本数据预训练
- 能理解和生成自然语言

**主流模型对比（2026）**

| 模型 | 公司 | 上下文 | 特点 | API 价格 |
|------|------|--------|------|---------|
| **GPT-4 Turbo** | OpenAI | 128K | 性能强，生态好 | $10/1M tokens |
| **Claude 3.5 Sonnet** | Anthropic | 200K | 长文本，安全性高 | $3/1M tokens |
| **Gemini 1.5 Pro** | Google | 1M | 超长上下文 | $7/1M tokens |
| **文心一言 4.0** | 百度 | 128K | 中文优化 | ¥0.12/千tokens |
| **通义千问 Max** | 阿里 | 128K | 中文优化 | ¥0.12/千tokens |

#### Q: Token 是什么？

```java
// Token：模型处理文本的基本单位
// 英文：1 token ≈ 0.75 个单词
// 中文：1 token ≈ 0.5 个汉字

"Hello World" // 约 2-3 tokens
"你好世界"     // 约 6-8 tokens

// 成本计算示例
public BigDecimal calculateCost(int inputTokens, int outputTokens) {
    // GPT-4 Turbo 价格（2026）
    BigDecimal inputCost = new BigDecimal("0.01");  // $0.01/1K tokens
    BigDecimal outputCost = new BigDecimal("0.03"); // $0.03/1K tokens
    
    BigDecimal cost = inputCost.multiply(new BigDecimal(inputTokens))
                                .divide(new BigDecimal("1000"))
                      .add(outputCost.multiply(new BigDecimal(outputTokens))
                                     .divide(new BigDecimal("1000")));
    return cost;
}

// 输入 1000 tokens，输出 500 tokens
// 成本 = 1000/1000 * $0.01 + 500/1000 * $0.03 = $0.025
```

---

### 1.2 AI 在后端的应用场景

**1. 智能客服与对话系统**
- 客服机器人
- 问答系统
- 工单自动分类

**2. 内容生成与处理**
- 文章生成、摘要
- 报告自动生成
- 数据清洗与标注

**3. 数据分析与决策**
- 日志分析
- 异常检测
- 智能推荐

**4. 开发辅助**
- 代码生成与审查
- SQL 生成
- API 文档生成

**5. 业务智能化**
- 合同审核
- 风险评估
- 知识库问答

---

## 02. LLM API 集成

### 2.1 OpenAI API（Java）

#### Maven 依赖
```xml
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>service</artifactId>
    <version>0.18.2</version>
</dependency>

<!-- 或使用 Spring AI -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.0.0-M1</version>
</dependency>
```

#### 基础调用
```java
import com.theokanning.openai.service.OpenAiService;
import com.theokanning.openai.completion.chat.*;

@Service
public class OpenAIService {
    
    private final OpenAiService openAiService;
    
    public OpenAIService(@Value("${openai.api-key}") String apiKey) {
        this.openAiService = new OpenAiService(apiKey);
    }
    
    public String chat(String userMessage) {
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-4-turbo")
            .messages(Arrays.asList(
                new ChatMessage("system", "你是一个专业的技术助手"),
                new ChatMessage("user", userMessage)
            ))
            .temperature(0.7)
            .maxTokens(1000)
            .build();
        
        ChatCompletionResult result = openAiService.createChatCompletion(request);
        return result.getChoices().get(0).getMessage().getContent();
    }
}
```

---

### 2.2 国内大模型 API

#### 百度文心一言
```java
import com.baidubce.qianfan.Qianfan;
import com.baidubce.qianfan.model.chat.ChatResponse;

@Service
public class QianfanService {
    
    private final Qianfan qianfan;
    
    public QianfanService(
        @Value("${qianfan.access-key}") String accessKey,
        @Value("${qianfan.secret-key}") String secretKey
    ) {
        this.qianfan = new Qianfan(accessKey, secretKey);
    }
    
    public String chat(String message) {
        ChatResponse response = qianfan.chatCompletion()
            .model("ERNIE-4.0-8K")
            .addMessage("user", message)
            .temperature(0.7)
            .execute();
        
        return response.getResult();
    }
}
```

#### 阿里通义千问
```java
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;

@Service
public class DashScopeService {
    
    private final Generation generation;
    
    public DashScopeService(@Value("${dashscope.api-key}") String apiKey) {
        this.generation = new Generation();
        // 设置 API Key
        System.setProperty("dashscope.api-key", apiKey);
    }
    
    public String chat(String message) throws Exception {
        GenerationParam param = GenerationParam.builder()
            .model("qwen-max")
            .prompt(message)
            .temperature(0.7f)
            .topP(0.9f)
            .build();
        
        GenerationResult result = generation.call(param);
        return result.getOutput().getText();
    }
}
```

---

### 2.3 统一 API 封装

#### 定义接口
```java
public interface LLMService {
    String chat(String message);
    String chat(List<ChatMessage> messages);
    Stream<String> chatStream(String message);
}

@Data
@AllArgsConstructor
public class ChatMessage {
    private String role; // system, user, assistant
    private String content;
}
```

#### 实现适配器模式
```java
@Service
public class OpenAIAdapter implements LLMService {
    
    private final OpenAiService openAiService;
    
    @Override
    public String chat(String message) {
        return chat(Arrays.asList(
            new ChatMessage("user", message)
        ));
    }
    
    @Override
    public String chat(List<ChatMessage> messages) {
        List<com.theokanning.openai.completion.chat.ChatMessage> apiMessages = 
            messages.stream()
                .map(m -> new com.theokanning.openai.completion.chat.ChatMessage(
                    m.getRole(), m.getContent()))
                .collect(Collectors.toList());
        
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-4-turbo")
            .messages(apiMessages)
            .build();
        
        return openAiService.createChatCompletion(request)
            .getChoices().get(0).getMessage().getContent();
    }
    
    @Override
    public Stream<String> chatStream(String message) {
        // 流式响应实现（见后文）
        return null;
    }
}
```

#### 工厂模式切换模型
```java
@Component
public class LLMFactory {
    
    private final Map<String, LLMService> serviceMap;
    
    public LLMFactory(List<LLMService> services) {
        this.serviceMap = services.stream()
            .collect(Collectors.toMap(
                s -> s.getClass().getSimpleName(),
                s -> s
            ));
    }
    
    public LLMService getService(String provider) {
        return serviceMap.getOrDefault(provider + "Adapter", 
            serviceMap.values().iterator().next());
    }
}

// 使用
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    @Autowired
    private LLMFactory llmFactory;
    
    @PostMapping
    public String chat(
        @RequestParam(defaultValue = "OpenAI") String provider,
        @RequestBody String message
    ) {
        LLMService service = llmFactory.getService(provider);
        return service.chat(message);
    }
}
```

---

## 03. Spring Boot AI 开发

### 3.1 Spring AI 框架

#### 配置
```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4-turbo
          temperature: 0.7
          max-tokens: 1000
```

#### 使用
```java
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;

@Service
public class SpringAIService {
    
    private final ChatClient chatClient;
    
    public SpringAIService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }
    
    public String chat(String message) {
        return chatClient.call(message);
    }
    
    public String chatWithPrompt(String userInput) {
        Prompt prompt = new Prompt(new UserMessage(userInput));
        return chatClient.call(prompt).getResult().getOutput().getContent();
    }
}
```

---

### 3.2 对话历史管理

#### 实现 Session 级别对话
```java
@Data
public class ConversationSession {
    private String sessionId;
    private List<ChatMessage> messages;
    private LocalDateTime createdAt;
    private LocalDateTime lastAccessTime;
    
    public ConversationSession(String sessionId) {
        this.sessionId = sessionId;
        this.messages = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.lastAccessTime = LocalDateTime.now();
    }
    
    public void addMessage(String role, String content) {
        messages.add(new ChatMessage(role, content));
        lastAccessTime = LocalDateTime.now();
    }
}

@Service
public class ConversationManager {
    
    private final ConcurrentHashMap<String, ConversationSession> sessions = 
        new ConcurrentHashMap<>();
    
    private final LLMService llmService;
    
    public String chat(String sessionId, String userMessage) {
        ConversationSession session = sessions.computeIfAbsent(
            sessionId, 
            k -> new ConversationSession(k)
        );
        
        // 添加用户消息
        session.addMessage("user", userMessage);
        
        // 调用 LLM
        String response = llmService.chat(session.getMessages());
        
        // 保存助手回复
        session.addMessage("assistant", response);
        
        return response;
    }
    
    public void clearSession(String sessionId) {
        sessions.remove(sessionId);
    }
    
    // 定时清理过期会话
    @Scheduled(fixedDelay = 3600000) // 1 小时
    public void cleanExpiredSessions() {
        LocalDateTime expireTime = LocalDateTime.now().minusHours(24);
        sessions.entrySet().removeIf(
            entry -> entry.getValue().getLastAccessTime().isBefore(expireTime)
        );
    }
}
```

#### 持久化到 Redis
```java
@Service
public class RedisConversationManager {
    
    @Autowired
    private RedisTemplate<String, ConversationSession> redisTemplate;
    
    private static final String SESSION_PREFIX = "conversation:";
    private static final Duration SESSION_TTL = Duration.ofHours(24);
    
    public String chat(String sessionId, String userMessage) {
        String key = SESSION_PREFIX + sessionId;
        
        // 获取或创建会话
        ConversationSession session = redisTemplate.opsForValue().get(key);
        if (session == null) {
            session = new ConversationSession(sessionId);
        }
        
        session.addMessage("user", userMessage);
        
        // 调用 LLM
        String response = llmService.chat(session.getMessages());
        session.addMessage("assistant", response);
        
        // 保存到 Redis
        redisTemplate.opsForValue().set(key, session, SESSION_TTL);
        
        return response;
    }
}
```

---

### 3.3 Token 计数与成本控制

#### Token 计数
```java
import com.knuddels.jtokkit.Encodings;
import com.knuddels.jtokkit.api.Encoding;
import com.knuddels.jtokkit.api.EncodingType;

@Service
public class TokenCounter {
    
    private final Encoding encoding;
    
    public TokenCounter() {
        this.encoding = Encodings.newDefaultEncodingRegistry()
            .getEncoding(EncodingType.CL100K_BASE); // GPT-4 编码
    }
    
    public int countTokens(String text) {
        return encoding.encode(text).size();
    }
    
    public int countTokens(List<ChatMessage> messages) {
        int total = 0;
        for (ChatMessage msg : messages) {
            total += countTokens(msg.getContent());
            total += 4; // 每条消息的额外开销
        }
        total += 2; // 对话开始和结束标记
        return total;
    }
}
```

#### 成本控制
```java
@Service
public class CostControlService {
    
    @Autowired
    private TokenCounter tokenCounter;
    
    @Value("${ai.max-tokens-per-request:4000}")
    private int maxTokensPerRequest;
    
    @Value("${ai.daily-cost-limit:100.0}")
    private BigDecimal dailyCostLimit;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public void checkLimit(String userId, List<ChatMessage> messages) {
        // 1. 检查单次请求 token 限制
        int tokens = tokenCounter.countTokens(messages);
        if (tokens > maxTokensPerRequest) {
            throw new BusinessException("请求 token 数超限: " + tokens);
        }
        
        // 2. 检查每日成本限制
        String key = "user:cost:" + userId + ":" + LocalDate.now();
        String costStr = redisTemplate.opsForValue().get(key);
        BigDecimal todayCost = costStr != null ? 
            new BigDecimal(costStr) : BigDecimal.ZERO;
        
        if (todayCost.compareTo(dailyCostLimit) >= 0) {
            throw new BusinessException("今日成本已达上限");
        }
    }
    
    public void recordCost(String userId, int inputTokens, int outputTokens) {
        // 计算成本（GPT-4 Turbo 价格）
        BigDecimal cost = new BigDecimal(inputTokens)
            .multiply(new BigDecimal("0.00001")) // $0.01/1K
            .add(new BigDecimal(outputTokens)
            .multiply(new BigDecimal("0.00003"))); // $0.03/1K
        
        // 累加到 Redis
        String key = "user:cost:" + userId + ":" + LocalDate.now();
        redisTemplate.opsForValue().increment(key, cost.doubleValue());
        redisTemplate.expire(key, Duration.ofDays(1));
    }
}
```

---

## 04. 向量数据库与 RAG

### 4.1 向量数据库基础

#### Q: 什么是向量数据库？

**向量（Embedding）**：
- 将文本转换为高维数值向量
- 语义相似的文本距离更近
- 用于相似度搜索

```java
// 文本 → 向量示例
"Hello World" → [0.1, 0.5, -0.3, ..., 0.8] // 1536 维（OpenAI）

// 相似度计算（余弦相似度）
public double cosineSimilarity(double[] vec1, double[] vec2) {
    double dotProduct = 0.0;
    double norm1 = 0.0;
    double norm2 = 0.0;
    
    for (int i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += Math.pow(vec1[i], 2);
        norm2 += Math.pow(vec2[i], 2);
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
```

**主流向量数据库**：

| 数据库 | 类型 | 特点 |
|--------|------|------|
| **Milvus** | 专用 | 开源，分布式，性能好 |
| **Pinecone** | 云服务 | 易用，按量付费 |
| **Weaviate** | 专用 | 多模态，GraphQL |
| **pgvector** | 插件 | PostgreSQL 扩展 |
| **Elasticsearch** | 通用 | 向量搜索插件 |

---

### 4.2 RAG（检索增强生成）

#### Q: 什么是 RAG？

**流程**：
```
用户提问
  ↓
1. 文本向量化
  ↓
2. 向量数据库检索（Top-K 相似文档）
  ↓
3. 构建 Prompt（问题 + 检索结果）
  ↓
4. LLM 生成答案
  ↓
返回结果
```

**优势**：
- 减少幻觉（基于真实数据）
- 实时更新知识（无需重新训练）
- 可追溯来源

---

### 4.3 Milvus 实战

#### Maven 依赖
```xml
<dependency>
    <groupId>io.milvus</groupId>
    <artifactId>milvus-sdk-java</artifactId>
    <version>2.3.4</version>
</dependency>
```

#### 连接与集合创建
```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.*;
import io.milvus.param.collection.*;
import io.milvus.param.index.*;

@Configuration
public class MilvusConfig {
    
    @Bean
    public MilvusServiceClient milvusClient(
        @Value("${milvus.host:localhost}") String host,
        @Value("${milvus.port:19530}") int port
    ) {
        return new MilvusServiceClient(
            ConnectParam.newBuilder()
                .withHost(host)
                .withPort(port)
                .build()
        );
    }
}

@Service
public class MilvusService {
    
    @Autowired
    private MilvusServiceClient milvusClient;
    
    private static final String COLLECTION_NAME = "knowledge_base";
    private static final int DIMENSION = 1536; // OpenAI embedding 维度
    
    public void createCollection() {
        // 定义字段
        FieldType id = FieldType.newBuilder()
            .withName("id")
            .withDataType(DataType.Int64)
            .withPrimaryKey(true)
            .withAutoID(true)
            .build();
        
        FieldType content = FieldType.newBuilder()
            .withName("content")
            .withDataType(DataType.VarChar)
            .withMaxLength(65535)
            .build();
        
        FieldType vector = FieldType.newBuilder()
            .withName("vector")
            .withDataType(DataType.FloatVector)
            .withDimension(DIMENSION)
            .build();
        
        // 创建集合
        CreateCollectionParam param = CreateCollectionParam.newBuilder()
            .withCollectionName(COLLECTION_NAME)
            .addFieldType(id)
            .addFieldType(content)
            .addFieldType(vector)
            .build();
        
        milvusClient.createCollection(param);
        
        // 创建索引
        CreateIndexParam indexParam = CreateIndexParam.newBuilder()
            .withCollectionName(COLLECTION_NAME)
            .withFieldName("vector")
            .withIndexType(IndexType.IVF_FLAT)
            .withMetricType(MetricType.L2)
            .withExtraParam("{\"nlist\":128}")
            .build();
        
        milvusClient.createIndex(indexParam);
    }
}
```

#### 插入数据
```java
@Service
public class KnowledgeBaseService {
    
    @Autowired
    private MilvusServiceClient milvusClient;
    
    @Autowired
    private EmbeddingService embeddingService; // 见下文
    
    public void addDocument(String content) {
        // 1. 生成向量
        float[] vector = embeddingService.embed(content);
        
        // 2. 插入 Milvus
        List<InsertParam.Field> fields = Arrays.asList(
            new InsertParam.Field("content", Arrays.asList(content)),
            new InsertParam.Field("vector", Arrays.asList(vector))
        );
        
        InsertParam param = InsertParam.newBuilder()
            .withCollectionName(COLLECTION_NAME)
            .withFields(fields)
            .build();
        
        milvusClient.insert(param);
    }
    
    public List<String> search(String query, int topK) {
        // 1. 查询向量化
        float[] queryVector = embeddingService.embed(query);
        
        // 2. 向量搜索
        SearchParam param = SearchParam.newBuilder()
            .withCollectionName(COLLECTION_NAME)
            .withMetricType(MetricType.L2)
            .withTopK(topK)
            .withVectors(Arrays.asList(queryVector))
            .withVectorFieldName("vector")
            .withOutFields(Arrays.asList("content"))
            .build();
        
        SearchResults results = milvusClient.search(param);
        
        // 3. 提取结果
        return results.getResults().getFieldsDataList().stream()
            .map(field -> field.getContent().toString())
            .collect(Collectors.toList());
    }
}
```

#### Embedding 服务
```java
@Service
public class EmbeddingService {
    
    private final OpenAiService openAiService;
    
    public float[] embed(String text) {
        EmbeddingRequest request = EmbeddingRequest.builder()
            .model("text-embedding-3-small")
            .input(Arrays.asList(text))
            .build();
        
        EmbeddingResult result = openAiService.createEmbeddings(request);
        List<Double> embedding = result.getData().get(0).getEmbedding();
        
        // Double[] → float[]
        float[] vector = new float[embedding.size()];
        for (int i = 0; i < embedding.size(); i++) {
            vector[i] = embedding.get(i).floatValue();
        }
        return vector;
    }
}
```

---

### 4.4 完整 RAG 实现

```java
@Service
public class RAGService {
    
    @Autowired
    private KnowledgeBaseService knowledgeBaseService;
    
    @Autowired
    private LLMService llmService;
    
    public String answer(String question) {
        // 1. 检索相关文档
        List<String> docs = knowledgeBaseService.search(question, 3);
        
        // 2. 构建 Prompt
        String context = String.join("\n\n", docs);
        String prompt = String.format(
            "根据以下参考资料回答问题。如果资料中没有相关信息，请说明无法回答。\n\n" +
            "参考资料：\n%s\n\n" +
            "问题：%s\n\n" +
            "答案：",
            context, question
        );
        
        // 3. LLM 生成答案
        return llmService.chat(prompt);
    }
}

@RestController
@RequestMapping("/api/rag")
public class RAGController {
    
    @Autowired
    private RAGService ragService;
    
    @PostMapping("/ask")
    public String ask(@RequestBody String question) {
        return ragService.answer(question);
    }
}
```

---

## 05. Prompt Engineering

### 5.1 Prompt 设计原则

#### 1. 清晰指令
```java
// ❌ 不好
String prompt = "处理这个文本：" + text;

// ✅ 好
String prompt = String.format(
    "请分析以下客户反馈，提取以下信息：\n" +
    "1. 情感倾向（正面/中性/负面）\n" +
    "2. 主要问题\n" +
    "3. 建议改进点\n\n" +
    "客户反馈：%s\n\n" +
    "请以 JSON 格式返回结果。",
    text
);
```

#### 2. 提供示例（Few-Shot）
```java
String prompt = String.format(
    "将以下用户输入转换为结构化数据。\n\n" +
    "示例 1：\n" +
    "输入：明天上午10点提醒我开会\n" +
    "输出：{\"type\":\"reminder\",\"time\":\"明天10:00\",\"event\":\"开会\"}\n\n" +
    "示例 2：\n" +
    "输入：帮我查询北京的天气\n" +
    "输出：{\"type\":\"query\",\"city\":\"北京\",\"info\":\"天气\"}\n\n" +
    "现在处理：\n" +
    "输入：%s\n" +
    "输出：",
    userInput
);
```

#### 3. 角色设定
```java
List<ChatMessage> messages = Arrays.asList(
    new ChatMessage("system", 
        "你是一个专业的 SQL 专家，擅长将自然语言转换为 SQL 查询。" +
        "你总是生成标准的 SQL 语句，并添加必要的注释。"),
    new ChatMessage("user", 
        "查询销售额前 10 的商品")
);
```

---

### 5.2 Prompt 模板管理

#### 模板定义
```java
@Data
public class PromptTemplate {
    private String name;
    private String template;
    private List<String> variables;
    
    public String render(Map<String, String> values) {
        String result = template;
        for (String var : variables) {
            String placeholder = "{" + var + "}";
            result = result.replace(placeholder, values.getOrDefault(var, ""));
        }
        return result;
    }
}
```

#### 模板存储
```java
@Service
public class PromptService {
    
    private final Map<String, PromptTemplate> templates = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() {
        // SQL 生成模板
        templates.put("sql-generation", new PromptTemplate(
            "sql-generation",
            "你是一个 SQL 专家。数据库表结构如下：\n" +
            "{schema}\n\n" +
            "用户需求：{requirement}\n\n" +
            "请生成对应的 SQL 查询语句。",
            Arrays.asList("schema", "requirement")
        ));
        
        // 代码审查模板
        templates.put("code-review", new PromptTemplate(
            "code-review",
            "请审查以下 {language} 代码，指出潜在问题和改进建议：\n\n" +
            "```{language}\n{code}\n```\n\n" +
            "重点关注：{focus}",
            Arrays.asList("language", "code", "focus")
        ));
    }
    
    public String getPrompt(String templateName, Map<String, String> values) {
        PromptTemplate template = templates.get(templateName);
        if (template == null) {
            throw new IllegalArgumentException("模板不存在: " + templateName);
        }
        return template.render(values);
    }
}
```

---

### 5.3 结构化输出

#### 方式一：Prompt 约束
```java
public JSONObject extractStructuredInfo(String text) {
    String prompt = String.format(
        "从以下文本中提取信息，以 JSON 格式返回。\n\n" +
        "必须包含字段：\n" +
        "- name（字符串）\n" +
        "- age（整数）\n" +
        "- email（字符串）\n\n" +
        "文本：%s\n\n" +
        "JSON：",
        text
    );
    
    String response = llmService.chat(prompt);
    return JSONObject.parseObject(response);
}
```

#### 方式二：Function Calling（见后文）

---

## 06. 流式响应

### 6.1 SSE（Server-Sent Events）

#### Spring Boot 实现
```java
@RestController
@RequestMapping("/api/chat")
public class StreamChatController {
    
    @Autowired
    private OpenAiService openAiService;
    
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(@RequestParam String message) {
        SseEmitter emitter = new SseEmitter(60000L); // 60s 超时
        
        CompletableFuture.runAsync(() -> {
            try {
                ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model("gpt-4-turbo")
                    .messages(Arrays.asList(
                        new ChatMessage("user", message)
                    ))
                    .stream(true) // 启用流式
                    .build();
                
                openAiService.streamChatCompletion(request)
                    .doOnNext(chunk -> {
                        try {
                            String content = chunk.getChoices().get(0)
                                .getDelta().getContent();
                            if (content != null) {
                                emitter.send(SseEmitter.event()
                                    .data(content));
                            }
                        } catch (IOException e) {
                            emitter.completeWithError(e);
                        }
                    })
                    .doOnComplete(emitter::complete)
                    .doOnError(emitter::completeWithError)
                    .subscribe();
                
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
}
```

#### 客户端调用
```javascript
const eventSource = new EventSource('/api/chat/stream?message=你好');

eventSource.onmessage = (event) => {
  console.log(event.data); // 逐字输出
};

eventSource.onerror = () => {
  eventSource.close();
};
```

---

### 6.2 WebSocket 实现

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler(), "/ws/chat")
            .setAllowedOrigins("*");
    }
    
    @Bean
    public WebSocketHandler chatWebSocketHandler() {
        return new ChatWebSocketHandler();
    }
}

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {
    
    @Autowired
    private OpenAiService openAiService;
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String userMessage = message.getPayload();
        
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-4-turbo")
            .messages(Arrays.asList(new ChatMessage("user", userMessage)))
            .stream(true)
            .build();
        
        openAiService.streamChatCompletion(request)
            .doOnNext(chunk -> {
                String content = chunk.getChoices().get(0).getDelta().getContent();
                if (content != null) {
                    try {
                        session.sendMessage(new TextMessage(content));
                    } catch (IOException e) {
                        log.error("发送消息失败", e);
                    }
                }
            })
            .doOnComplete(() -> {
                try {
                    session.sendMessage(new TextMessage("[DONE]"));
                } catch (IOException e) {
                    log.error("发送完成标记失败", e);
                }
            })
            .subscribe();
    }
}
```

---

## 07. Function Calling

### 7.1 基础概念

**Function Calling**：让 LLM 调用外部函数/API

**流程**：
```
用户："北京明天天气怎么样？"
  ↓
LLM 分析：需要调用 get_weather 函数
  ↓
返回 Function Call：
{
  "name": "get_weather",
  "arguments": {
    "city": "北京",
    "date": "明天"
  }
}
  ↓
应用执行函数，获取结果
  ↓
将结果发送回 LLM
  ↓
LLM 生成最终回复："北京明天晴，15-25℃"
```

---

### 7.2 定义函数

```java
@Data
public class FunctionDefinition {
    private String name;
    private String description;
    private JSONObject parameters;
}

public class WeatherFunction {
    
    public static FunctionDefinition getDefinition() {
        JSONObject parameters = new JSONObject();
        parameters.put("type", "object");
        parameters.put("properties", new JSONObject()
            .fluentPut("city", new JSONObject()
                .fluentPut("type", "string")
                .fluentPut("description", "城市名称，如：北京"))
            .fluentPut("date", new JSONObject()
                .fluentPut("type", "string")
                .fluentPut("description", "日期，如：今天、明天")));
        parameters.put("required", Arrays.asList("city"));
        
        FunctionDefinition def = new FunctionDefinition();
        def.setName("get_weather");
        def.setDescription("查询指定城市的天气信息");
        def.setParameters(parameters);
        return def;
    }
    
    public static String execute(String city, String date) {
        // 实际调用天气 API
        // 这里模拟返回
        return String.format("%s %s 晴，温度 15-25℃", city, date);
    }
}
```

---

### 7.3 调用流程

```java
@Service
public class FunctionCallingService {
    
    @Autowired
    private OpenAiService openAiService;
    
    public String chatWithFunctions(String userMessage) {
        // 1. 定义可用函数
        List<ChatFunction> functions = Arrays.asList(
            ChatFunction.builder()
                .name("get_weather")
                .description("查询天气")
                .parameters(WeatherFunction.getDefinition().getParameters())
                .build()
        );
        
        // 2. 第一次调用
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-4-turbo")
            .messages(Arrays.asList(
                new ChatMessage("user", userMessage)
            ))
            .functions(functions)
            .build();
        
        ChatCompletionResult result = openAiService.createChatCompletion(request);
        ChatMessage responseMessage = result.getChoices().get(0).getMessage();
        
        // 3. 检查是否需要调用函数
        if (responseMessage.getFunctionCall() != null) {
            FunctionCall functionCall = responseMessage.getFunctionCall();
            String functionName = functionCall.getName();
            JSONObject arguments = JSONObject.parseObject(
                functionCall.getArguments().toString()
            );
            
            // 4. 执行函数
            String functionResult = executeFunctionestoreMessage(functionName, arguments);
            
            // 5. 第二次调用，带上函数结果
            List<ChatMessage> messages = Arrays.asList(
                new ChatMessage("user", userMessage),
                responseMessage, // LLM 的函数调用请求
                ChatMessage.ofFunction(functionResult, functionName) // 函数执行结果
            );
            
            ChatCompletionRequest secondRequest = ChatCompletionRequest.builder()
                .model("gpt-4-turbo")
                .messages(messages)
                .build();
            
            ChatCompletionResult secondResult = 
                openAiService.createChatCompletion(secondRequest);
            
            return secondResult.getChoices().get(0).getMessage().getContent();
        }
        
        return responseMessage.getContent();
    }
    
    private String executeFunction(String name, JSONObject args) {
        switch (name) {
            case "get_weather":
                return WeatherFunction.execute(
                    args.getString("city"),
                    args.getString("date")
                );
            // 其他函数...
            default:
                throw new IllegalArgumentException("未知函数: " + name);
        }
    }
}
```

---

### 7.4 多函数协作

```java
// 订单查询函数
public class OrderFunction {
    public static FunctionDefinition getDefinition() {
        // 定义参数 schema
        JSONObject parameters = new JSONObject();
        // ...省略详细定义
        
        FunctionDefinition def = new FunctionDefinition();
        def.setName("query_order");
        def.setDescription("查询订单信息");
        def.setParameters(parameters);
        return def;
    }
    
    public static String execute(String orderId) {
        // 查询数据库
        Order order = orderService.getById(orderId);
        return JSONObject.toJSONString(order);
    }
}

// 物流查询函数
public class LogisticsFunction {
    public static FunctionDefinition getDefinition() {
        // ...
    }
    
    public static String execute(String trackingNumber) {
        // 调用物流 API
        return logisticsService.track(trackingNumber);
    }
}

// AI 客服
@Service
public class AICustomerService {
    
    public String answer(String question) {
        List<ChatFunction> functions = Arrays.asList(
            toChatFunction(OrderFunction.getDefinition()),
            toChatFunction(LogisticsFunction.getDefinition())
        );
        
        // LLM 会根据问题自动选择合适的函数调用
        // "我的订单 12345 在哪里了？" → 先调用 query_order，再调用 query_logistics
        return chatWithFunctions(question, functions);
    }
}
```

---

## 08. AI 系统架构设计

### 8.1 基础架构

```
┌─────────────┐
│   用户端    │
└──────┬──────┘
       │ HTTP/WebSocket
┌──────▼──────────────────────┐
│      API Gateway            │
│  - 鉴权                     │
│  - 限流                     │
│  - 路由                     │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│   AI 服务层（Spring Boot）  │
│  - Conversation Manager     │
│  - Prompt Builder           │
│  - Function Dispatcher      │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│      LLM 适配层             │
│  - OpenAI Adapter           │
│  - Claude Adapter           │
│  - 本地模型 Adapter         │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│      数据层                  │
│  - Redis（会话/缓存）       │
│  - MySQL（用户/订单）       │
│  - Milvus（向量检索）       │
└─────────────────────────────┘
```

---

### 8.2 高可用设计

#### 1. 超时与重试
```java
@Service
public class ResilientLLMService {
    
    @Autowired
    private LLMService llmService;
    
    @Retryable(
        value = {TimeoutException.class, IOException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    @CircuitBreaker(name = "llm", fallbackMethod = "fallback")
    public String chat(String message) {
        // 设置超时（30s）
        CompletableFuture<String> future = CompletableFuture.supplyAsync(
            () -> llmService.chat(message)
        );
        
        try {
            return future.get(30, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw e;
        }
    }
    
    public String fallback(String message, Exception e) {
        log.error("LLM 调用失败，启用降级", e);
        return "抱歉，服务繁忙，请稍后再试。";
    }
}
```

#### 2. 熔断降级（Resilience4j）
```yaml
resilience4j:
  circuitbreaker:
    instances:
      llm:
        register-health-indicator: true
        sliding-window-size: 10          # 滑动窗口大小
        minimum-number-of-calls: 5       # 最小调用次数
        failure-rate-threshold: 50       # 失败率阈值（50%）
        wait-duration-in-open-state: 10s # 熔断器打开后等待时间
        permitted-number-of-calls-in-half-open-state: 3
```

#### 3. 限流
```java
@Service
public class RateLimitService {
    
    private final LoadingCache<String, AtomicInteger> requestCache;
    
    public RateLimitService() {
        this.requestCache = CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build(new CacheLoader<String, AtomicInteger>() {
                @Override
                public AtomicInteger load(String key) {
                    return new AtomicInteger(0);
                }
            });
    }
    
    public boolean tryAcquire(String userId, int limit) {
        try {
            AtomicInteger counter = requestCache.get(userId);
            return counter.incrementAndGet() <= limit;
        } catch (ExecutionException e) {
            return false;
        }
    }
}

@RestController
public class ChatController {
    
    @PostMapping("/chat")
    public String chat(@RequestHeader("User-Id") String userId, @RequestBody String message) {
        // 限流：每分钟 10 次
        if (!rateLimitService.tryAcquire(userId, 10)) {
            throw new BusinessException("请求过于频繁");
        }
        
        return llmService.chat(message);
    }
}
```

---

### 8.3 异步处理架构

```java
// 任务模型
@Data
public class AITask {
    private String taskId;
    private String userId;
    private String prompt;
    private TaskStatus status; // PENDING, PROCESSING, COMPLETED, FAILED
    private String result;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

// 任务服务
@Service
public class AITaskService {
    
    @Autowired
    private RedisTemplate<String, AITask> redisTemplate;
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public String submitTask(String userId, String prompt) {
        // 1. 创建任务
        AITask task = new AITask();
        task.setTaskId(UUID.randomUUID().toString());
        task.setUserId(userId);
        task.setPrompt(prompt);
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        
        // 2. 保存到 Redis
        redisTemplate.opsForValue().set(
            "task:" + task.getTaskId(), 
            task, 
            Duration.ofHours(24)
        );
        
        // 3. 发送到 MQ
        rabbitTemplate.convertAndSend("ai.task.queue", task);
        
        return task.getTaskId();
    }
    
    public AITask getTask(String taskId) {
        return redisTemplate.opsForValue().get("task:" + taskId);
    }
}

// 任务消费者
@Component
public class AITaskConsumer {
    
    @Autowired
    private LLMService llmService;
    
    @Autowired
    private RedisTemplate<String, AITask> redisTemplate;
    
    @RabbitListener(queues = "ai.task.queue", concurrency = "5-10")
    public void processTask(AITask task) {
        try {
            // 更新状态为处理中
            task.setStatus(TaskStatus.PROCESSING);
            redisTemplate.opsForValue().set("task:" + task.getTaskId(), task);
            
            // 调用 LLM
            String result = llmService.chat(task.getPrompt());
            
            // 更新结果
            task.setStatus(TaskStatus.COMPLETED);
            task.setResult(result);
            task.setCompletedAt(LocalDateTime.now());
            redisTemplate.opsForValue().set("task:" + task.getTaskId(), task);
            
        } catch (Exception e) {
            log.error("任务处理失败: " + task.getTaskId(), e);
            task.setStatus(TaskStatus.FAILED);
            task.setResult("处理失败: " + e.getMessage());
            redisTemplate.opsForValue().set("task:" + task.getTaskId(), task);
        }
    }
}

// 控制器
@RestController
@RequestMapping("/api/task")
public class TaskController {
    
    @PostMapping("/submit")
    public String submit(@RequestBody AITaskRequest request) {
        return aiTaskService.submitTask(request.getUserId(), request.getPrompt());
    }
    
    @GetMapping("/{taskId}")
    public AITask getStatus(@PathVariable String taskId) {
        return aiTaskService.getTask(taskId);
    }
}
```

---

## 09. 性能优化

### 9.1 缓存策略

#### 1. 相同问题缓存
```java
@Service
public class CachedLLMService {
    
    @Autowired
    private LLMService llmService;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public String chat(String message) {
        // 1. 生成缓存 key（消息的 MD5）
        String cacheKey = "llm:cache:" + DigestUtils.md5Hex(message);
        
        // 2. 查询缓存
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }
        
        // 3. 调用 LLM
        String result = llmService.chat(message);
        
        // 4. 写入缓存（1 小时）
        redisTemplate.opsForValue().set(cacheKey, result, Duration.ofHours(1));
        
        return result;
    }
}
```

#### 2. Embedding 缓存
```java
@Service
public class CachedEmbeddingService {
    
    @Autowired
    private EmbeddingService embeddingService;
    
    @Autowired
    private RedisTemplate<String, float[]> redisTemplate;
    
    public float[] embed(String text) {
        String key = "embedding:" + DigestUtils.md5Hex(text);
        
        float[] cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return cached;
        }
        
        float[] vector = embeddingService.embed(text);
        redisTemplate.opsForValue().set(key, vector, Duration.ofDays(7));
        
        return vector;
    }
}
```

---

### 9.2 批量处理

#### Embedding 批量化
```java
@Service
public class BatchEmbeddingService {
    
    public List<float[]> batchEmbed(List<String> texts) {
        // OpenAI Embedding API 支持批量
        EmbeddingRequest request = EmbeddingRequest.builder()
            .model("text-embedding-3-small")
            .input(texts) // 一次最多 2048 条
            .build();
        
        EmbeddingResult result = openAiService.createEmbeddings(request);
        
        return result.getData().stream()
            .map(data -> toFloatArray(data.getEmbedding()))
            .collect(Collectors.toList());
    }
}
```

---

### 9.3 连接池优化

```java
@Configuration
public class HttpClientConfig {
    
    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .connectionPool(new ConnectionPool(
                10,                    // 最大空闲连接数
                5, TimeUnit.MINUTES    // 连接存活时间
            ))
            .addInterceptor(chain -> {
                Request request = chain.request().newBuilder()
                    .addHeader("Connection", "keep-alive")
                    .build();
                return chain.proceed(request);
            })
            .build();
    }
}
```

---

## 10. 安全与合规

### 10.1 敏感信息过滤

```java
@Component
public class SensitiveFilter {
    
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("1[3-9]\\d{9}");
    
    private static final Pattern ID_CARD_PATTERN = 
        Pattern.compile("\\d{17}[\\dXx]");
    
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("[\\w.-]+@[\\w.-]+\\.\\w+");
    
    public String filter(String text) {
        text = PHONE_PATTERN.matcher(text)
            .replaceAll("***********");
        text = ID_CARD_PATTERN.matcher(text)
            .replaceAll("******************");
        text = EMAIL_PATTERN.matcher(text)
            .replaceAll("***@***.***");
        return text;
    }
    
    public boolean containsSensitive(String text) {
        return PHONE_PATTERN.matcher(text).find() ||
               ID_CARD_PATTERN.matcher(text).find() ||
               EMAIL_PATTERN.matcher(text).find();
    }
}

@RestController
public class SafeChatController {
    
    @Autowired
    private SensitiveFilter sensitiveFilter;
    
    @PostMapping("/chat")
    public String chat(@RequestBody String message) {
        // 检查敏感信息
        if (sensitiveFilter.containsSensitive(message)) {
            throw new BusinessException("输入包含敏感信息，已拒绝处理");
        }
        
        // 过滤后再发送
        String filteredMessage = sensitiveFilter.filter(message);
        return llmService.chat(filteredMessage);
    }
}
```

---

### 10.2 内容审核

```java
@Service
public class ContentModerationService {
    
    // 使用 OpenAI Moderation API
    public boolean isContentSafe(String text) {
        ModerationRequest request = ModerationRequest.builder()
            .input(text)
            .build();
        
        ModerationResult result = openAiService.createModeration(request);
        return !result.getResults().get(0).isFlagged();
    }
    
    // 或使用国内服务（阿里云内容安全）
    public boolean moderateWithAliyun(String text) {
        // 调用阿里云 API
        return true;
    }
}

@RestController
public class ModeratedChatController {
    
    @PostMapping("/chat")
    public String chat(@RequestBody String message) {
        // 输入审核
        if (!moderationService.isContentSafe(message)) {
            throw new BusinessException("输入内容违规");
        }
        
        String response = llmService.chat(message);
        
        // 输出审核
        if (!moderationService.isContentSafe(response)) {
            log.warn("LLM 输出违规: " + response);
            return "抱歉，无法回答该问题。";
        }
        
        return response;
    }
}
```

---

### 10.3 用户权限控制

```java
@Service
public class UserQuotaService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 每日调用次数限制
    public boolean checkDailyQuota(String userId, int limit) {
        String key = "quota:" + userId + ":" + LocalDate.now();
        Long count = redisTemplate.opsForValue().increment(key);
        
        if (count == 1) {
            redisTemplate.expire(key, Duration.ofDays(1));
        }
        
        return count <= limit;
    }
    
    // Token 消耗限制
    public boolean checkTokenQuota(String userId, int tokens, int dailyLimit) {
        String key = "token:quota:" + userId + ":" + LocalDate.now();
        Long total = redisTemplate.opsForValue().increment(key, tokens);
        
        if (total == tokens) {
            redisTemplate.expire(key, Duration.ofDays(1));
        }
        
        return total <= dailyLimit;
    }
}
```

---

## 11. 实战场景题

### 11.1 如何设计一个智能客服系统？

**需求**：
- 7x24 小时在线
- 处理常见问题（FAQ）
- 无法回答时转人工
- 支持订单查询、物流查询等

**架构设计**：

```
用户消息
  ↓
1. 意图识别（LLM 分类）
  ├─ FAQ 类 → RAG 检索知识库
  ├─ 订单查询 → Function Calling
  ├─ 物流查询 → Function Calling
  └─ 其他 → 通用对话
  ↓
2. 生成回复
  ↓
3. 置信度判断
  ├─ 高置信度 → 直接返回
  └─ 低置信度 → 转人工
```

**核心代码**：

```java
@Service
public class CustomerServiceAI {
    
    @Autowired
    private LLMService llmService;
    
    @Autowired
    private KnowledgeBaseService knowledgeBaseService;
    
    public CustomerServiceResponse handle(String sessionId, String message) {
        // 1. 意图识别
        Intent intent = recognizeIntent(message);
        
        String response;
        double confidence;
        
        switch (intent.getType()) {
            case FAQ:
                // RAG 检索
                List<String> docs = knowledgeBaseService.search(message, 3);
                response = generateAnswerWithContext(message, docs);
                confidence = intent.getConfidence();
                break;
                
            case ORDER_QUERY:
                // Function Calling
                response = queryOrderWithAI(message);
                confidence = 0.9;
                break;
                
            case GENERAL:
                response = llmService.chat(message);
                confidence = 0.6;
                break;
                
            default:
                response = "抱歉，我不太理解您的问题。";
                confidence = 0.3;
        }
        
        // 2. 置信度判断
        if (confidence < 0.7) {
            return CustomerServiceResponse.builder()
                .response(response)
                .needHuman(true)
                .message("为了更好地帮助您，是否需要转接人工客服？")
                .build();
        }
        
        return CustomerServiceResponse.builder()
            .response(response)
            .needHuman(false)
            .build();
    }
    
    private Intent recognizeIntent(String message) {
        String prompt = String.format(
            "分析以下用户消息的意图，返回 JSON 格式：\n" +
            "{\"type\": \"FAQ/ORDER_QUERY/LOGISTICS_QUERY/GENERAL\", " +
            " \"confidence\": 0.0-1.0}\n\n" +
            "用户消息：%s",
            message
        );
        
        String result = llmService.chat(prompt);
        return JSONObject.parseObject(result, Intent.class);
    }
}
```

---

### 11.2 如何设计一个代码生成服务？

**需求**：
- 自然语言生成代码
- 支持多种语言（Java、Python、SQL）
- 代码审查与优化建议
- 单元测试生成

**实现**：

```java
@Service
public class CodeGenerationService {
    
    @Autowired
    private LLMService llmService;
    
    public CodeGenerationResult generate(CodeRequest request) {
        // 1. 生成代码
        String code = generateCode(request);
        
        // 2. 代码审查
        List<String> issues = reviewCode(code, request.getLanguage());
        
        // 3. 生成测试
        String testCode = generateTest(code, request.getLanguage());
        
        return CodeGenerationResult.builder()
            .code(code)
            .issues(issues)
            .testCode(testCode)
            .build();
    }
    
    private String generateCode(CodeRequest request) {
        String prompt = String.format(
            "作为一个 %s 专家，根据需求生成代码。\n\n" +
            "需求：%s\n\n" +
            "要求：\n" +
            "1. 代码规范，有注释\n" +
            "2. 处理异常\n" +
            "3. 性能优化\n\n" +
            "请生成代码：",
            request.getLanguage(),
            request.getRequirement()
        );
        
        return llmService.chat(prompt);
    }
    
    private List<String> reviewCode(String code, String language) {
        String prompt = String.format(
            "审查以下 %s 代码，指出潜在问题：\n\n" +
            "```%s\n%s\n```\n\n" +
            "请以 JSON 数组格式返回问题列表。",
            language, language, code
        );
        
        String result = llmService.chat(prompt);
        return JSONObject.parseArray(result, String.class);
    }
    
    private String generateTest(String code, String language) {
        String prompt = String.format(
            "为以下 %s 代码生成单元测试：\n\n" +
            "```%s\n%s\n```\n\n" +
            "使用 JUnit 5 框架。",
            language, language, code
        );
        
        return llmService.chat(prompt);
    }
}
```

---

### 11.3 如何设计一个文档问答系统？

**需求**：
- 上传 PDF/Word 文档
- 基于文档内容回答问题
- 引用来源
- 多文档联合问答

**架构**：

```
文档上传
  ↓
1. 文档解析（PDF → 文本）
  ↓
2. 文本分块（Chunk）
  ↓
3. 向量化
  ↓
4. 存入 Milvus
  ↓
用户提问
  ↓
5. 问题向量化
  ↓
6. 向量检索（Top-K）
  ↓
7. RAG 生成答案
  ↓
8. 返回答案 + 来源
```

**实现**：

```java
@Service
public class DocumentQAService {
    
    @Autowired
    private KnowledgeBaseService knowledgeBaseService;
    
    @Autowired
    private LLMService llmService;
    
    public void uploadDocument(MultipartFile file) throws IOException {
        // 1. 解析文档
        String content = parseDocument(file);
        
        // 2. 分块
        List<String> chunks = chunkText(content, 500); // 每块 500 字
        
        // 3. 向量化并存储
        for (String chunk : chunks) {
            knowledgeBaseService.addDocument(chunk);
        }
    }
    
    public QAResult answer(String question) {
        // 1. 检索相关文档
        List<DocumentChunk> docs = knowledgeBaseService.searchWithMetadata(
            question, 5
        );
        
        // 2. 构建 Prompt
        String context = docs.stream()
            .map(doc -> String.format("[文档%d] %s", doc.getId(), doc.getContent()))
            .collect(Collectors.joining("\n\n"));
        
        String prompt = String.format(
            "根据以下文档内容回答问题。请在答案中标注引用的文档编号。\n\n" +
            "文档内容：\n%s\n\n" +
            "问题：%s\n\n" +
            "答案：",
            context, question
        );
        
        // 3. 生成答案
        String answer = llmService.chat(prompt);
        
        // 4. 提取引用
        List<Integer> references = extractReferences(answer);
        
        return QAResult.builder()
            .answer(answer)
            .references(docs.stream()
                .filter(doc -> references.contains(doc.getId()))
                .collect(Collectors.toList()))
            .build();
    }
    
    private String parseDocument(MultipartFile file) throws IOException {
        // 使用 Apache Tika 或 Apache POI
        // 这里简化处理
        return new String(file.getBytes(), StandardCharsets.UTF_8);
    }
    
    private List<String> chunkText(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            chunks.add(text.substring(start, end));
            start = end;
        }
        return chunks;
    }
}
```

---

## 12. 面试高频问答

### Q1: LLM 的温度参数（temperature）是什么？

**答案**：
- **定义**：控制输出随机性的参数，范围 0-2
- **值越低**（如 0.1）：输出更确定、一致，适合客观任务（翻译、分类）
- **值越高**（如 0.9）：输出更随机、创造性，适合创作任务（写作、头脑风暴）
- **默认值**：通常 0.7

```java
ChatCompletionRequest.builder()
    .temperature(0.1) // 确定性输出
    .build();
```

---

### Q2: 如何防止 LLM 幻觉（Hallucination）？

**答案**：
1. **使用 RAG**：基于真实数据生成答案
2. **明确指令**：要求"如果不知道，请说'不知道'"
3. **设置温度**：降低 temperature（如 0.2）
4. **后处理验证**：检查答案中的事实
5. **引用来源**：要求 LLM 引用参考资料

```java
String prompt = String.format(
    "根据以下参考资料回答问题。如果资料中没有相关信息，请明确说明'无法回答'。\n\n" +
    "参考资料：%s\n\n" +
    "问题：%s",
    context, question
);
```

---

### Q3: Token 限制如何处理长文本？

**答案**：
1. **截断**：保留开头和结尾
2. **分块处理**：滑动窗口
3. **摘要压缩**：先用 LLM 总结
4. **MapReduce**：分块处理后汇总

```java
public String processLongText(String text, int maxTokens) {
    int tokens = tokenCounter.countTokens(text);
    
    if (tokens <= maxTokens) {
        return llmService.chat(text);
    }
    
    // 分块处理
    List<String> chunks = chunkText(text, maxTokens / 2);
    List<String> summaries = chunks.stream()
        .map(chunk -> llmService.chat("总结：" + chunk))
        .collect(Collectors.toList());
    
    // 汇总
    String finalSummary = String.join("\n", summaries);
    return llmService.chat("综合以下摘要：" + finalSummary);
}
```

---

### Q4: 如何评估 LLM 输出质量？

**答案**：
1. **人工评估**：准确性、流畅性、相关性
2. **自动指标**：
   - **BLEU**：翻译质量
   - **ROUGE**：摘要质量
   - **Perplexity**：语言模型困惑度
3. **A/B 测试**：对比不同模型/Prompt
4. **LLM 作为评判**：让 LLM 给输出打分

```java
public double evaluateWithLLM(String question, String answer) {
    String prompt = String.format(
        "评估以下回答的质量（0-10 分）：\n\n" +
        "问题：%s\n" +
        "回答：%s\n\n" +
        "请只返回数字分数。",
        question, answer
    );
    
    String result = llmService.chat(prompt);
    return Double.parseDouble(result.trim());
}
```

---

### Q5: 如何降低 LLM 调用成本？

**答案**：
1. **缓存**：相同问题复用结果
2. **Prompt 优化**：减少输入 token
3. **选择合适模型**：简单任务用小模型
4. **批量处理**：Embedding 批量化
5. **流式传输**：提前终止无用输出
6. **本地部署**：高频场景自建模型

```java
// 根据任务复杂度选择模型
public String chat(String message, TaskComplexity complexity) {
    String model = switch (complexity) {
        case SIMPLE -> "gpt-3.5-turbo";      // $0.5/1M tokens
        case MEDIUM -> "gpt-4-turbo";        // $10/1M tokens
        case COMPLEX -> "gpt-4";             // $30/1M tokens
    };
    
    return llmService.chat(message, model);
}
```

---

### Q6: Function Calling 与直接解析 JSON 响应的区别？

**答案**：

| 特性 | Function Calling | JSON 解析 |
|------|------------------|-----------|
| 格式保证 | LLM 保证函数调用格式 | 需手动约束 Prompt |
| 类型安全 | 有 schema 验证 | 需手动验证 |
| 多轮对话 | 自动处理 | 需手动管理 |
| 错误处理 | 框架级支持 | 自行处理 |

**推荐**：优先使用 Function Calling

---

## 📚 学习路线

### Week 1: 基础入门
- [ ] LLM 概念与 API 调用
- [ ] Spring Boot 集成 OpenAI/国内模型
- [ ] 对话历史管理
- [ ] Token 计数与成本控制

### Week 2: 进阶技术
- [ ] Prompt Engineering
- [ ] 流式响应（SSE/WebSocket）
- [ ] Function Calling
- [ ] 结构化输出

### Week 3: 高级应用
- [ ] 向量数据库（Milvus）
- [ ] RAG 实现
- [ ] Embedding 服务
- [ ] 多模态处理

### Week 4: 系统设计
- [ ] 智能客服架构
- [ ] 异步处理（MQ）
- [ ] 性能优化（缓存、批量）
- [ ] 安全与合规

---

## 🎯 面试准备清单

### 必掌握（90%）
- [ ] LLM 基础概念（Token、Temperature、上下文长度）
- [ ] OpenAI/国内模型 API 调用
- [ ] Prompt 设计原则
- [ ] RAG 原理与实现
- [ ] 向量数据库基础

### 常考（70%）
- [ ] 流式响应实现
- [ ] Function Calling
- [ ] 对话历史管理
- [ ] 成本优化策略
- [ ] 内容审核与安全

### 加分项（50%）
- [ ] 多模态 AI（图像、语音）
- [ ] 模型微调（Fine-tuning）
- [ ] Agent 框架（LangChain、Semantic Kernel）
- [ ] 本地模型部署（Ollama、vLLM）
- [ ] AI 系统监控与可观测性

---

## 📌 备注

- **适用人群**：5年 Java 后端开发经验
- **难度定位**：中高级（P6-P7）
- **最后更新**：2026-06-23

**重点**：
1. 理解 LLM 工作原理，不只是调 API
2. 掌握 Prompt Engineering，这是核心竞争力
3. RAG 是当前最实用的技术，必须深入理解
4. 关注成本与性能，AI 应用的核心挑战

---

祝面试成功！🚀
