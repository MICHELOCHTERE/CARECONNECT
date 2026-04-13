import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminDashboard from './AdminDashboard';
import AgencyRegister from './AgencyRegister';
import AgencyLogin from './AgencyLogin';
import AgencyDashboard from './AgencyDashboard';
import LandingPage from './LandingPage';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showing, setShowing] = useState(false);
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { sessionStorage.setItem('cc_admin', 'true'); onLogin(); }
    else { setError('Incorrect password.'); setPassword(''); }
  };
  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.box}>
        <div style={s.icon}>🔒</div>
        <div style={s.title}>Admin Access</div>
        <div style={s.sub}>Enter your password to access the dashboard</div>
        <input style={s.input} type={showing ? 'text' : 'password'} placeholder="Enter password" value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <div style={s.showPw}><label style={s.showPwLabel}><input type="checkbox" checked={showing} onChange={() => setShowing(!showing)} /> Show password</label></div>
        <button style={s.btn} onClick={handleLogin}>Sign In</button>
        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ color: '#6C3FC5', fontSize: 16 }}>Loading...</div>
    </div>
  );
}

function Router() {
  const [path, setPath] = useState(window.location.pathname);
  const [adminAuthed, setAdminAuthed] = useState(sessionStorage.getItem('cc_admin') === 'true');
  const [user, setUser] = useState(null);
  const [agencyProfile, setAgencyProfile] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const handleNav = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    return () => window.removeEventListener('popstate', handleNav);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const agencyDoc = await getDoc(doc(db, 'agencies', u.uid));
        if (agencyDoc.exists()) setAgencyProfile(agencyDoc.data());
        else setAgencyProfile(null);
      } else {
        setAgencyProfile(null);
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  // Super admin route
  if (path === '/admin') {
    if (!adminAuthed) return <AdminLogin onLogin={() => setAdminAuthed(true)} />;
    return <AdminDashboard onLogout={() => { sessionStorage.removeItem('cc_admin'); setAdminAuthed(false); }} />;
  }

  if (!authChecked) return <LoadingScreen />;

  // Agency register
  if (path === '/agency/register') {
    if (user && agencyProfile) { go('/agency/dashboard'); return null; }
    return <AgencyRegister onAuth={(u, slug) => { setUser(u); go('/agency/dashboard'); }} onBack={() => go('/')} onLogin={() => go('/agency/login')} />;
  }

  // Agency login
  if (path === '/agency/login') {
    if (user && agencyProfile) { go('/agency/dashboard'); return null; }
    return <AgencyLogin onAuth={(u) => { setUser(u); go('/agency/dashboard'); }} onBack={() => go('/')} onRegister={() => go('/agency/register')} />;
  }

  // Agency dashboard
  if (path === '/agency/dashboard') {
    if (!user) { go('/agency/login'); return null; }
    if (!agencyProfile) { go('/agency/register'); return null; }
    return <AgencyDashboard agency={agencyProfile} onLogout={() => { signOut(auth); setAgencyProfile(null); go('/'); }} />;
  }

  // Carer apply route — /apply/agencyslug
  if (path.startsWith('/apply/')) {
    const slug = path.replace('/apply/', '');
    // If logged in as agency admin, sign them out and show carer welcome
    if (user && agencyProfile) {
      signOut(auth);
      return null;
    }
    if (!user) {
      return (
        <div style={s.wrap}>
          <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
          <div style={{ ...s.box, maxWidth: 440, textAlign: "center" }}>
            <button onClick={() => go('/')} style={{ background: 'none', border: 'none', color: '#6C3FC5', fontSize: 14, cursor: 'pointer', padding: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>← Back to home</button>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "white", fontFamily: "serif", margin: "0 auto 16px" }}>Q</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#1a1a2e", marginBottom: 8 }}>Apply to join the team</div>
            <div style={{ color: "#9b7fd4", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Create a free account to start your application. You can save your progress and come back anytime.</div>
            <button style={{ ...s.btn, marginBottom: 12 }} onClick={() => go(`/register?agency=${slug}`)}>Create Account & Apply →</button>
            <button style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid #c5b3e8", borderRadius: 8, color: "#6C3FC5", fontSize: 14, fontWeight: 600, cursor: "pointer" }} onClick={() => go(`/login?agency=${slug}`)}>Already have an account? Log In</button>
          </div>
        </div>
      );
    }
    return <App user={user} agencySlug={slug} onLogout={() => { signOut(auth); go(`/apply/${slug}`); }} />;
  }

  // Carer register
  if (path === '/register') {
    const params = new URLSearchParams(window.location.search);
    const agency = params.get('agency');
    if (user) { go(agency ? `/apply/${agency}` : '/'); return null; }
    return (
      <div style={s.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={s.box}>
          <button onClick={() => agency ? go(`/apply/${agency}`) : go('/')} style={{ background: 'none', border: 'none', color: '#6C3FC5', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0' }}>← Back</button>
          <div style={{ ...s.icon }}>👤</div>
          <div style={s.title}>Create Account</div>
          <div style={s.sub}>Register to start your application</div>
          <CarerRegisterForm agencySlug={agency} onAuth={(u) => { setUser(u); go(agency ? `/apply/${agency}` : '/'); }} />
        </div>
      </div>
    );
  }

  // Carer login
  if (path === '/login') {
    const loginParams = new URLSearchParams(window.location.search);
    const loginAgency = loginParams.get('agency');
    if (user) { go(loginAgency ? `/apply/${loginAgency}` : '/'); return null; }
    return (
      <div style={s.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={s.box}>
          <button onClick={() => loginAgency ? go(`/apply/${loginAgency}`) : go('/')} style={{ background: 'none', border: 'none', color: '#6C3FC5', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0' }}>← Back</button>
          <div style={s.icon}>🔑</div>
          <div style={s.title}>Welcome back</div>
          <div style={s.sub}>Log in to continue your application</div>
          <CarerLoginForm agencySlug={loginAgency} onAuth={(u) => { setUser(u); go(loginAgency ? `/apply/${loginAgency}` : '/'); }} />
        </div>
      </div>
    );
  }

  // Landing page
  return <LandingPage
    onGetStarted={() => go('/agency/register')}
    onLogin={() => go('/agency/login')}
  />;
}

// Simple inline carer forms
function CarerRegisterForm({ onAuth, agencySlug }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!email || !password) return setError('Please fill in all fields.');
    setLoading(true);
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      onAuth(result.user);
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Account already exists. Please log in.' : 'Registration failed.');
    }
    setLoading(false);
  };
  return (
    <>
      {error && <div style={{ color: '#cc0000', fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <input style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} type="password" placeholder="Choose a password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleSubmit}>{loading ? 'Creating...' : 'Create Account →'}</button>
      <div style={{ marginTop: 16, fontSize: 13, color: '#9b7fd4' }}>Already have an account? <button style={{ color: '#6C3FC5', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }} onClick={() => go(agencySlug ? `/login?agency=${agencySlug}` : '/login')}>Log in</button></div>
    </>
  );
}

function CarerLoginForm({ onAuth, agencySlug }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!email || !password) return setError('Please fill in all fields.');
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);
      onAuth(result.user);
    } catch (err) {
      setError('Incorrect email or password.');
    }
    setLoading(false);
  };
  return (
    <>
      {error && <div style={{ color: '#cc0000', fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <input style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleSubmit}>{loading ? 'Logging in...' : 'Log In →'}</button>
      <div style={{ marginTop: 16, fontSize: 13, color: '#9b7fd4' }}>New here? <button style={{ color: '#6C3FC5', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }} onClick={() => go(agencySlug ? `/register?agency=${agencySlug}` : '/register')}>Create account</button></div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><Router /></React.StrictMode>);
