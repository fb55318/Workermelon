import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AddFriendModal from '../components/AddFriendModal';

const socket: Socket = io('http://localhost:3000');

interface ChatMessage {
  sender: string;
  text: string;
}

export default function ChatPage({ name, onLogout }: {
  name: string;
  onLogout: () => void;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    socket.on('chat message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.off('chat message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (input.trim()) {
      socket.emit('chat message', { sender: name, text: input });
      setInput('');
    }
  };

  return (
    <div className="chat-wrapper">
      <h2 className="chat-title">聊天室（你是 {name}）</h2>
      <button onClick={onLogout} style={{ marginBottom: '10px' }}>登出</button>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender === name ? 'self' : ''}`}>
            <strong>{msg.sender}：</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="輸入訊息..."
        />
        <button onClick={send}>送出</button>
      </div>
      <button
        onClick={() => setShowAddFriend(true)}
        style={{ marginBottom: '10px', marginLeft: '10px' }}
      >
        搜尋好友
      </button>
      {showAddFriend && currentUserId && (
        <AddFriendModal
          userId={currentUserId}
          onClose={() => setShowAddFriend(false)}
        />
      )}
    </div>
  );
}
