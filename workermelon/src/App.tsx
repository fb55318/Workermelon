import { useState } from 'react';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

function App() {
  const [name, setName] = useState(localStorage.getItem('username') || '');
  const [hasName, setHasName] = useState(!!localStorage.getItem('username'));

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setName('');
    setHasName(false);
  };

  return hasName ? (
    <ChatPage name={name} onLogout={logout} />
  ) : (
    <AuthPage setName={setName} setHasName={setHasName} />
  );
}

export default App;







