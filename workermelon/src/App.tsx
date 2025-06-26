import { useState } from 'react';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import type { User } from './types/User';

function App() {
  const [user, setUser] = useState<User | null>(null); // ⬅️ 改為完整 user 狀態

  const logout = () => {
    setUser(null); // ⬅️ 清空使用者資訊（不再用 localStorage）
  };

  return user ? (
    <ChatPage
      name={user.nickname || user.username} // 顯示暱稱或帳號
      userId={user._id}                     // ⬅️ 傳入給加好友模組
      onLogout={logout}
    />
  ) : (
    <AuthPage setUser={setUser} /> // 登入/註冊後設置完整 user
  );
}

export default App;
