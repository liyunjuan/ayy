import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: 'http://localhost:5173', // Vite 默认端口
  credentials: true
}));
app.use(express.json());

// 初始化 OpenAI（兼容 DeepSeek 等国产大模型，只需配置 baseURL）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Chat Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 聊天接口（流式输出）
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    // 检查 API Key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: '服务器未配置 OPENAI_API_KEY，请在 .env 文件中设置'
      });
    }

    // 设置响应头（流式输出）
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    // 构建消息历史
    const messages = [
      {
        role: 'system',
        content: `你是一个专业的前端工程师助手，名叫 AI 小助手。

你的特点：
- 擅长 React、Vue、TypeScript、Node.js 等前端技术
- 回答简洁明了，有条理
- 提供代码示例时使用 Markdown 代码块
- 对用户友好，耐心解答问题

回答格式：
- 使用 Markdown 格式
- 代码使用代码块包裹，注明语言
- 列表使用 - 或数字
- 重点内容使用加粗

当前时间：${new Date().toLocaleString('zh-CN')}`
      },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log(`[${new Date().toLocaleTimeString()}] 收到消息:`, message);

    // 调用 OpenAI API（流式）
    const stream = await openai.chat.completions.create({
      model: process.env.MODEL || 'deepseek-chat', // 默认使用 DeepSeek
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true, // 开启流式输出
    });

    // 逐块返回给前端
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(content); // 立即发送给前端
      }
    }

    console.log(`[${new Date().toLocaleTimeString()}] 回复完成，长度:`, fullResponse.length);

    res.end();

  } catch (error) {
    console.error('API 调用失败:', error);

    // 如果还没发送响应头，发送错误信息
    if (!res.headersSent) {
      res.status(500).json({
        error: '服务器错误',
        message: error.message,
        details: '请检查 API Key 是否正确，或者余额是否充足'
      });
    } else {
      // 如果已经开始流式输出，发送错误消息
      res.write('\n\n❌ 抱歉，发生了错误。请稍后再试。');
      res.end();
    }
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 AI Chat Backend Started!         ║
╠════════════════════════════════════════╣
║   Server: http://localhost:${PORT}      ║
║   Health: http://localhost:${PORT}/api/health ║
║   Model:  ${process.env.MODEL || 'gpt-3.5-turbo'}           ║
╚════════════════════════════════════════╝
  `);

  // 检查环境变量
  if (!process.env.OPENAI_API_KEY) {
    console.warn(`
⚠️  警告: 未检测到 OPENAI_API_KEY
请创建 .env 文件并设置：
OPENAI_API_KEY=sk-your-api-key-here
    `);
  }
});
