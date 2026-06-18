import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // 添加用户消息
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // 调用后端 API（流式输出）
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error('API 调用失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let aiReply = '';

      // 先添加一个空的 AI 消息
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsLoading(false);

      // 逐块读取并更新
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiReply += chunk;

        // 更新最后一条消息（AI 的回复）
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = aiReply;
          return newMessages;
        });
      }

    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);

      // 添加错误消息
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误。请检查后端服务是否启动，或者 API Key 是否配置正确。'
      }]);
    }
  };

  // 清空对话
  const handleClear = () => {
    if (confirm('确定要清空所有对话吗？')) {
      setMessages([]);
    }
  };

  return (
    <div className="app">
      {/* 头部 */}
      <header className="header">
        <h1 className="title">🤖 AI 智能助手</h1>
        <button
          onClick={handleClear}
          className="clear-btn"
          disabled={messages.length === 0}
        >
          清空对话
        </button>
      </header>

      {/* 消息列表 */}
      <main className="chat-container">
        {messages.length === 0 ? (
          <div className="welcome">
            <h2>👋 你好！我是 AI 助手</h2>
            <p>我可以帮你：</p>
            <ul>
              <li>💻 编写代码</li>
              <li>📝 撰写文章</li>
              <li>🤔 解答问题</li>
              <li>💡 提供创意</li>
            </ul>
            <p className="tip">试着问我一些问题吧！</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 输入框 */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}

export default App;
