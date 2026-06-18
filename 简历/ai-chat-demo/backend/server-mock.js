import express from 'express';
import cors from 'cors';

/**
 * Mock 版本 - 无需 API Key，用于快速演示
 *
 * 使用方法：
 * node server-mock.js
 */

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Mock 响应库
const mockResponses = {
  greeting: [
    '你好！我是 AI 助手，很高兴为你服务。有什么我可以帮助你的吗？',
    '嗨！很高兴见到你！我可以帮你解答问题、编写代码、撰写文章等。',
    '你好呀！我是你的 AI 小助手，随时为你提供帮助。'
  ],

  code: `当然可以！这是一个简单的 React 计数器组件：

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h2>计数器：{count}</h2>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
      <button onClick={() => setCount(count - 1)}>
        减少
      </button>
      <button onClick={() => setCount(0)}>
        重置
      </button>
    </div>
  );
}

export default Counter;
\`\`\`

这个组件使用了 React Hooks 中的 \`useState\` 来管理状态。你可以：
1. 点击"增加"按钮让计数 +1
2. 点击"减少"按钮让计数 -1
3. 点击"重置"按钮将计数归零

需要我解释其他部分吗？`,

  react: `React Hooks 是 React 16.8 引入的新特性，让你在不编写 class 的情况下使用 state 和其他 React 特性。

**常用的 Hooks：**

1. **useState** - 状态管理
   \`\`\`jsx
   const [count, setCount] = useState(0);
   \`\`\`

2. **useEffect** - 副作用处理
   \`\`\`jsx
   useEffect(() => {
     // 组件挂载/更新时执行
     document.title = \`点击了 \${count} 次\`;
   }, [count]);
   \`\`\`

3. **useContext** - 跨组件传递数据
   \`\`\`jsx
   const theme = useContext(ThemeContext);
   \`\`\`

4. **useRef** - 访问 DOM 元素
   \`\`\`jsx
   const inputRef = useRef(null);
   inputRef.current.focus();
   \`\`\`

5. **useMemo** - 性能优化（缓存计算结果）
6. **useCallback** - 性能优化（缓存函数）
7. **useReducer** - 复杂状态管理

需要我详细讲解某个 Hook 吗？`,

  database: `好的，我来帮你设计一个用户管理系统的数据库表结构。

**核心表设计：**

1. **users（用户表）**
\`\`\`sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  status TINYINT DEFAULT 1, -- 1:正常 0:禁用
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_username (username)
);
\`\`\`

2. **roles（角色表）**
\`\`\`sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

3. **user_roles（用户角色关联表）**
\`\`\`sql
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
\`\`\`

4. **permissions（权限表）**
\`\`\`sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  resource VARCHAR(50), -- 资源名称
  action VARCHAR(20)    -- 操作类型: create/read/update/delete
);
\`\`\`

5. **role_permissions（角色权限关联表）**
\`\`\`sql
CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
\`\`\`

**设计要点：**
- ✅ 用户密码使用 hash 存储，不存明文
- ✅ 使用 RBAC（基于角色的访问控制）模型
- ✅ 添加索引优化查询性能
- ✅ 使用外键约束保证数据完整性
- ✅ 记录创建/更新时间便于审计

需要我补充其他表吗？比如用户登录日志、操作日志等。`,

  default: [
    '这是一个很好的问题！让我仔细思考一下...',
    '根据你的描述，我理解你想了解的是...',
    '这个问题涉及到多个方面，让我逐一为你分析：',
    '我可以从以下几个角度来回答你的问题：',
  ]
};

// 智能匹配响应
function getResponse(message) {
  const lowerMessage = message.toLowerCase();

  // 问候
  if (lowerMessage.match(/你好|hi|hello|嗨/)) {
    return mockResponses.greeting[Math.floor(Math.random() * mockResponses.greeting.length)];
  }

  // 代码相关
  if (lowerMessage.match(/代码|组件|component|function|写一个|帮我写/)) {
    return mockResponses.code;
  }

  // React Hooks
  if (lowerMessage.match(/react.*hook|hook.*react|useState|useEffect/)) {
    return mockResponses.react;
  }

  // 数据库
  if (lowerMessage.match(/数据库|表结构|sql|mysql|设计.*表/)) {
    return mockResponses.database;
  }

  // 默认响应
  return mockResponses.default[Math.floor(Math.random() * mockResponses.default.length)] +
         '\n\n由于这是 Mock 模式，我只能提供预设的回答。要获得真实的 AI 对话体验，请配置 OpenAI API Key 并使用 `server.js`。';
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'mock',
    message: 'Mock Backend is running (无需 API Key)',
    timestamp: new Date().toISOString()
  });
});

// 聊天接口（流式输出）
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    console.log(`[${new Date().toLocaleTimeString()}] 收到消息:`, message);

    // 设置响应头（流式输出）
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    // 获取匹配的响应
    const response = getResponse(message);

    // 模拟打字机效果
    for (const char of response) {
      res.write(char);
      // 随机延迟 20-50ms，模拟真实输出速度
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
    }

    console.log(`[${new Date().toLocaleTimeString()}] 回复完成`);

    res.end();

  } catch (error) {
    console.error('处理失败:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: '服务器错误',
        message: error.message
      });
    } else {
      res.write('\n\n❌ 抱歉，发生了错误。');
      res.end();
    }
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Mock Backend Started!            ║
╠════════════════════════════════════════╣
║   Server: http://localhost:${PORT}      ║
║   Mode:   Mock (无需 API Key)         ║
╠════════════════════════════════════════╣
║   💡 提示：                            ║
║   这是演示模式，使用预设回答          ║
║   要使用真实 AI，请运行:              ║
║   node server.js                      ║
╚════════════════════════════════════════╝
  `);
});
