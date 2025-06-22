import { useState } from 'react';
import { login, register } from '../services/authService';
import type { AuthResponse } from '../types/User';
import '../styles/AuthPage.css';


export default function AuthPage({ setName, setHasName }: {
  setName: (name: string) => void;
  setHasName: (hasName: boolean) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) return setMessage('請填寫帳號與密碼');
    try {
      const data: AuthResponse = mode === 'login'
        ? await login(username, password)
        : await register(username, password);

      setMessage(data.message);
      localStorage.setItem('username', username);
      if (data.userId) localStorage.setItem('userId', data.userId);
      setName(username);
      setHasName(true);
    } catch (err: any) {
      setMessage(err.response?.data?.error || '發生錯誤');
    }
  };

  return (
    <div className="name-container">
      <h2>{mode === 'login' ? '登入' : '註冊'}</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="帳號" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密碼" />
      <button onClick={handleSubmit}>{mode === 'login' ? '登入' : '註冊'}</button>
      <p style={{ color: 'gray' }}>{message}</p>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ marginTop: 10 }}>
        {mode === 'login' ? '還沒有帳號？註冊' : '已有帳號？登入'}
      </button>
    </div>
  );
}
