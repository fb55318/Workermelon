// frontend/src/pages/ChatPage.tsx (完整替換)

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AddFriendModal from '../components/AddFriendModal';
import '../styles/ChatPage.css';
import { getFriends } from '../services/friendService';

// --- MODIFIED: 與後端 payload 保持一致 ---
interface ChatMessage {
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string; // ISO 格式的日期字串
}

interface Friend {
  _id: string;
  username: string;
  nickname: string;
}

const socket: Socket = io('http://localhost:3000');

export default function ChatPage({
  name, // 'name' 這裡其實就是 nickname
  userId,
  onLogout,
}: {
  name: string;
  userId: string;
  onLogout: () => void;
}) {
  const [input, setInput] = useState('');
  
  // --- MODIFIED: 改變儲存訊息的結構 ---
  // 從單一陣列 -> 物件，用好友 ID 當 key 來分類訊息
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  
  // +++ NEW: 新增 state 來管理當前聊天對象 +++
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- MODIFIED: 修改 Socket 事件監聽 ---
  useEffect(() => {
    // 如果 socket 尚未連線，就建立連線和註冊
    if (!socket.connected) {
      socket.on('connect', () => {
        console.log('Socket 連線成功，ID:', socket.id);
        if (userId) {
          socket.emit('registerUser', userId);
        }
      });
    } else {
      // 如果已經連線，仍要確保使用者已註冊 (例如在熱重載後)
      if (userId) {
        socket.emit('registerUser', userId);
      }
    }

    // 監聽新的 'private message' 事件
    const handlePrivateMessage = (msg: ChatMessage) => {
      console.log('收到私人訊息:', msg);
      // 找出這則訊息的對話方是誰
      const chatPartnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;

      // 更新對話方的訊息列表
      setMessages(prev => ({
        ...prev,
        [chatPartnerId]: [...(prev[chatPartnerId] || []), msg],
      }));
    };

    socket.on('private message', handlePrivateMessage);

    // 元件卸載時，清理所有監聽器
    return () => {
      socket.off('connect');
      socket.off('private message', handlePrivateMessage);
    };
  }, [userId]); // 當 userId 變化時，重新設定監聽

  // 取得好友列表
  useEffect(() => {
    async function fetchFriends() {
      try {
        const friendsData = await getFriends(userId);
        setFriends(friendsData);
      } catch (err) {
        console.error('在 ChatPage 取得好友清單失敗', err);
      }
    }
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  // 訊息自動滾動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedFriend]);


  // --- MODIFIED: 修改發送訊息的函式 ---
  const send = () => {
    // 必須選擇了一個好友，且輸入框有內容，才能發送
    if (input.trim() && selectedFriend) {
      const payload = {
        recipientId: selectedFriend._id,
        text: input.trim(),
      };
      socket.emit('private message', payload);
      setInput('');
    }
  };
  
  // +++ NEW: 取得當前聊天視窗要顯示的訊息 +++
  const currentMessages = selectedFriend ? messages[selectedFriend._id] || [] : [];

  return (
    <div className="chat-center-box">
      {/* ... 上方的圖片和工具列不變 ... */}
      <img src="/public/images/outlook_toptool.png" alt="Outlook Toolbar" className="toolbar-image" />
      <div className="chat-toolbar"></div>

      <div className="chat-main-layout">
        {/* 左側聯絡人清單 */}
        <div className="sidebar">
          <h2>聯絡人</h2>
          <ul>
            {friends.map(friend => (
              <li
                key={friend._id}
                // --- MODIFIED: 增加點擊事件和選中樣式 ---
                className={`friend-item ${selectedFriend?._id === friend._id ? 'selected' : ''}`}
                onClick={() => setSelectedFriend(friend)}
              >
                {friend.nickname || friend.username}
              </li>
            ))}
          </ul>
        </div>
        
        {/* 中間聊天視窗 */}
        <div className="chat-wrapper">
          <div className="mail-header">
            <div className="mail-subject">Uber Eats來點涼的訂餐 55 折 + 額外 5 次優惠</div>
            <div className="mail-from">
              <img src="/public/images/fakeuser.jpg" alt="avatar" className="mail-avatar" />
              <div>
                <div className="mail-sender">使用者:{name}</div>
                {/* --- MODIFIED: 動態顯示收件者 --- */}
                <div className="mail-receiver">
                  收件者：{selectedFriend ? (selectedFriend.nickname || selectedFriend.username) : '請從左側選擇好友'}
                </div>
                <div className="mail-warning">📎 若此郵件的顯示有任何問題...</div>
              </div>
            </div>
            <div className="mail-meta">
                <div className="mail-buttons">
                    <button className="reply">↩ 回覆</button>
                    <button className="reply-all" onClick={() => setShowAddFriend(true)} >  ⤺ 搜尋好友</button>
                    {showAddFriend && <AddFriendModal userId={userId} onClose={() => setShowAddFriend(false)} />}
                    <button className="forward"  onClick={onLogout} >→ 登出</button>
                    <button onClick={onLogout} className="logout">⋯⋯</button>
                </div>
                <div className="mail-date">2025/7/18（週五）上午 06:21</div>
            </div>
          </div>

          <div className="chat-box">
            {/* --- MODIFIED: 判斷是否有選擇好友 --- */}
            {selectedFriend ? (
              // 如果有，就顯示與該好友的對話
              currentMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.senderId === userId ? 'self' : ''}`}>
                  {/* 可以顯示暱稱或時間等，這裡先簡化 */}
                  {msg.text}
                </div>
              ))
            ) : (
              // 如果沒有，顯示提示訊息
              <div className="no-chat-selected">
                <p>請從左側的好友列表中選擇一位開始聊天</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-bar">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={selectedFriend ? "輸入訊息..." : "請先選擇聊天對象"}
              // --- MODIFIED: 如果沒選好友，禁用輸入框 ---
              disabled={!selectedFriend}
            />
            <button onClick={send} disabled={!selectedFriend}>送出</button>
          </div>
        </div>
      </div>
    </div>
  );
}