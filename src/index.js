import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminDashboard from './AdminDashboard';
import Auth from './Auth';
import LandingPage from './LandingPage';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './index.css';

const ADMIN_PASSWORD = 'Quikcare123';

const s = {
  wrap: { minHeight: '100vh', background: '#f8f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" },
  box: { background: '#ffffff', border: '1px solid #e8e0f5', borderRadius: 16, padding: 40, width: '100%', maxWidth: 380, textAlign: 'center' },
  icon: { fontSize: 40, marginBottom: 16 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#6C3FC5', marginBottom: 8 },
  sub: { color: '#9b7fd4', fontSize: 13, marginBottom: 28 },
  input: { width: '100%', background: '#f8f5ff', border: '1px solid #c5b3e8', borderRadius: 8, padding: '12px 16px', color: '#1a1a2e', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 },
  btn: { width: '100%', padding: '12px', background: '#6C3FC5', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  error: { color: '#cc0000', fontSize: 13, marginTop: 12 },
  showPw: { textAlign: 'left', marginBottom: 16 },
  showPwLabel: { color: '#9b7fd4', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
};

function go(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
}

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
        <input style={s.input} type={showing ? 'text' : 'password'} placeholder="Enter password" value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <div style={s.showPw}>
          <label style={s.showPwLabel}>
            <input type="checkbox" checked={showing} onChange={() => setShowing(!showing)} />
            Show password
          </label>
        </div>
        <button style={s.btn} onClick={handleLogin}>Sign In</button>
        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  );
}

function Router() {
  const [path, setPath] = useState(window.location.pathname);
  const [adminAuthed, setAdminAuthed] = useState(sessionStorage.getItem('cc_admin') === 'true');
  const [carerUser, setCarerUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const handleNav = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    return () => window.removeEventListener('popstate', handleNav);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCarerUser(user);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  if (path === '/admin') {
    if (!adminAuthed) return <AdminLogin onLogin={() => setAdminAuthed(true)} />;
    return <AdminDashboard onLogout={() => { sessionStorage.removeItem('cc_admin'); setAdminAuthed(false); }} />;
  }

  if (!authChecked) return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ color: '#6C3FC5', fontSize: 16 }}>Loading...</div>
    </div>
  );

  if (path === '/login') {
    if (carerUser) { go('/apply'); return null; }
    return <Auth mode="login" onAuth={() => go('/apply')} onBack={() => go('/')} />;
  }

  if (path === '/register') {
    if (carerUser) { go('/apply'); return null; }
    return <Auth mode="register" onAuth={() => go('/apply')} onBack={() => go('/')} />;
  }

  if (path === '/apply') {
    if (!carerUser) { go('/register'); return null; }
    return <App user={carerUser} onLogout={() => { signOut(auth); go('/'); }} />;
  }

  return <LandingPage onGetStarted={() => go('/register')} onLogin={() => go('/login')} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
