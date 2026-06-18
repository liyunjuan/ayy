import { useState, KeyboardEvent } from 'react';

interface Props {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

function ChatInput({ onSendMessage, disabled = false }: Props) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter 发送
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        className="chat-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="输入消息... (Ctrl+Enter 发送)"
        disabled={disabled}
        rows={3}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
      >
        {disabled ? '发送中...' : '发送 ➤'}
      </button>
    </div>
  );
}

export default ChatInput;
