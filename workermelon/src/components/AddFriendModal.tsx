import { useState, useEffect } from 'react';
import { searchUser, addFriend } from '../services/friendService';
import '../styles/Modal.css';

interface AddFriendModalProps {
  userId: string;
  onClose: () => void;
}

export default function AddFriendModal({ userId, onClose }: AddFriendModalProps) {
  const [username, setUsername] = useState('');
  const [searchResult, setSearchResult] = useState<'not_found' | 'found' | ''>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 每次輸入 username 時，重設搜尋狀態與提示訊息
    setSearchResult('');
    setMessage('');
  }, [username]);

  const handleSearch = async () => {
    try {
      const data = await searchUser(username);
      if (data.userId) {
        setSearchResult('found');
      }
    } catch {
      setSearchResult('not_found');
    }
  };

  const handleAdd = async () => {
    try {
      const data = await addFriend(userId, username);
      setMessage(data.message);
      setTimeout(() => {
        setMessage('');
        onClose(); // 一秒後關閉視窗
      }, 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.error || '發生錯誤');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>搜尋好友</h3>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="輸入帳號名稱"
        />
        <button onClick={handleSearch}>確認</button>

        {searchResult === 'not_found' && <p style={{ color: 'red' }}>帳號不存在</p>}

        {searchResult === 'found' && (
          <>
            <p>找到帳號：{username}</p>
            <button onClick={handleAdd}>加好友</button>
            <button onClick={onClose}>取消</button>
          </>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
