import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const s = {
  wrap: { minHeight: "100vh", background: "#f8f5ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" },
  box: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 16, padding: 40, width: "100%", maxWidth: 420 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoIcon: { width: 40, height: 40, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", fontFamily: "serif" },
  logoText: { color: "#6C3FC5", fontSize: 20, fontFamily: "'DM Serif Display', serif" },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#1a1a2e", marginBottom: 6 },
  sub: { color: "#9b7fd4", fontSize: 13, marginBottom: 28 },
  label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  input: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 },
  btn: { width: "100%", padding: "13px", background: "#6C3FC5", border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 },
  error: { color: "#cc0000", fontSize: 13, marginBottom: 12, background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 8, padding: "10px 14px" },
  success: { color: "#1a7a3a", fontSize: 13, marginBottom: 12, background: "#e8f5eb", border: "1px solid #a3d9b1", borderRadius: 8, padding: "10px 14px" },
  link: { color: "#6C3FC5", fontSize: 13, cursor: "pointer", textDecoration: "underline", background: "none", border: "none", padding: 0 },
  footer: { marginTop: 20, textAlign: "center", color: "#9b7fd4", fontSize: 13 },
};

export default function AgencyLogin({ onAuth, onBack, onRegister }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Please enter your email and password.");
    setLoading(true); setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      onAuth(result.user);
    } catch (err) {
      if (err.code === "auth/invalid-credential") setError("Incorrect email or password.");
      else setError("Login failed. Please try again.");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) return setError("Please enter your email address.");
    setLoading(true); setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Could not send reset email. Please check your email address.");
    }
    setLoading(false);
  };

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.box}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#6C3FC5", fontSize: 14, cursor: "pointer", padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: 6 }}>
            ← Back
          </button>
        )}
        <div style={s.logo}>
          <div style={s.logoIcon}>Q</div>
          <span style={s.logoText}>Quikcare</span>
        </div>

        {mode === "login" && (
          <>
            <div style={s.title}>Agency Login</div>
            <div style={s.sub}>Log in to your agency dashboard</div>
            {error && <div style={s.error}>⚠️ {error}</div>}
            <label style={s.label}>Email Address</label>
            <input style={s.input} type="email" placeholder="admin@yourcare.co.uk" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <div style={{ textAlign: "right", marginBottom: 16, marginTop: -8 }}>
              <button style={s.link} onClick={() => { setMode("reset"); setError(""); }}>Forgot password?</button>
            </div>
            <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleLogin}>
              {loading ? "Logging in..." : "Log In →"}
            </button>
            <div style={s.footer}>
              New agency? <button style={s.link} onClick={onRegister}>Create an account</button>
            </div>
          </>
        )}

        {mode === "reset" && (
          <>
            <div style={s.title}>Reset password</div>
            <div style={s.sub}>Enter your email and we'll send you a reset link</div>
            {error && <div style={s.error}>⚠️ {error}</div>}
            {success && <div style={s.success}>✅ {success}</div>}
            <label style={s.label}>Email Address</label>
            <input style={s.input} type="email" placeholder="admin@yourcare.co.uk" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReset()} />
            <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleReset}>
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>
            <div style={s.footer}>
              <button style={s.link} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>← Back to login</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
