import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminDashboard from './AdminDashboard';
import './index.css';

const ADMIN_PASSWORD = 'CareConnect2026!';

const s = {
  wrap: { minHeight: '100vh', background: '#060e0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" },
  box: { background: '#0d1f1a', border: '1px solid #1a3a2e', borderRadius: 16, padding: 40, width: '100%', maxWidth: 380, textAlign: 'center' },
  icon: { fontSize: 40, marginBottom: 16 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#4ecba0', marginBottom: 8 },
  sub: { color: '#4a7a6a', fontSize: 13, marginBottom: 28 },
  input: { width: '100%', background: '#071510', border: '1px solid #2a4a3e', borderRadius: 8, padding: '12px 16px', color: '#e8f5f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 },
  btn: { width: '100%', padding: '12px', background: '#4ecba0', border: 'none', borderRadius: 8, color: '#071510', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  error: { color: '#e07070', fontSize: 13, marginTop: 12 },
};

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showing, setShowing] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('cc_admin', 'true');
      onLogin();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.box}>
        <div style={s.icon}>🔒</div>
        <div style={s.title}>Admin Access</div>
        <div style={s.sub}>Enter your password to access the dashboard</div>
        <input
          style={s.input}
          type={showing ? 'text' : 'password'}
          placeholder="Enter password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <div style={{ textAlign: 'left', marginBottom: 16 }}>
          <label style={{ color: '#4a7a6a', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={showing} onChange={() => setShowing(!showing)} />
            Show password
          </label>
        </div>
        <button style={s.btn} onClick={handleLogin}>Sign In →</button>
        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  );
}

function Router() {
  const path = window.location.pathname;
  const [authed, setAuthed] = useState(sessionStorage.getItem('cc_admin') === 'true');

  if (path === '/admin') {
    if (!authed) {
      return <AdminLogin onLogin={() => setAuthed(true)} />;
    }
    return <AdminDashboard onLogout={() => { sessionStorage.removeItem('cc_admin'); setAuthed(false); }} />;
  }

  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
