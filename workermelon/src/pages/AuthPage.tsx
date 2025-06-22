import { useState } from 'react';
import { login, register } from '../services/authService';
import type { AuthResponse } from '../types/User';
import '../styles/AuthPage.css';


export default function AuthPage({ setName, setHasName }: {
  setName: (name: string) => void;
  setHasName: (hasName: boolean) => void;
}) {
  // 欄位的狀態管理
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [job, setJob] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');

 // 模式狀態：登入 or 註冊
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // 訊息狀態（錯誤或提示訊息）
  const [message, setMessage] = useState('');

  // 當使用者按下「送出」按鈕時觸發
  const handleSubmit = async () => {
    if (!username || !password) return setMessage('請填寫帳號與密碼');

    try {
      let data: AuthResponse;

      if (mode === 'login') {
        // 執行登入請求
        data = await login(username, password);
      } else {
        // 執行註冊請求（包含所有新增欄位）
        data = await register({
          username,
          password,
          nickname,
          job,
          gender,
          birthday,
        });
      }

      // 顯示回傳訊息
      setMessage(data.message);

      // 將使用者資訊存在 localStorage（供主畫面使用）
      localStorage.setItem('username', username);
      if (data.userId) localStorage.setItem('userId', data.userId);

      // 通知 App.tsx 登入成功
      setName(username);
      setHasName(true);
    } catch (err: any) {
      // 若請求錯誤，顯示錯誤訊息
      setMessage(err.response?.data?.error || '發生錯誤');
    }
  };
  return (
    <div className="name-container">
      <h2>{mode === 'login' ? '登入' : '註冊'}</h2>

      {/* 基本欄位：帳號與密碼 */}
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="帳號" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密碼" />

      {/* 若是註冊模式，顯示更多欄位 */}
      {mode === 'register' && (
        <>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="暱稱（可輸入中文）" />
          <input value={job} onChange={(e) => setJob(e.target.value)} placeholder="職業" />
          
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">選擇性別</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>

          <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="生日" />
        </>
      )}

      {/* 主送出按鈕 */}
      <button onClick={handleSubmit}>
        {mode === 'login' ? '登入' : '註冊'}
      </button>

      {/* 錯誤或提示訊息 */}
      <p style={{ color: 'gray' }}>{message}</p>

      {/* 切換登入/註冊模式 */}
      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        style={{ marginTop: 10 }}
      >
        {mode === 'login' ? '還沒有帳號？註冊' : '已有帳號？登入'}
      </button>
    </div>
  );
}