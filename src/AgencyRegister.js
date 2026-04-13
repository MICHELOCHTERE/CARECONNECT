import React, { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const s = {
  wrap: { minHeight: "100vh", background: "#f8f5ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" },
  box: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 16, padding: 40, width: "100%", maxWidth: 480 },
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
  slugPreview: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#6C3FC5", marginBottom: 16 },
  link: { color: "#6C3FC5", fontSize: 13, cursor: "pointer", textDecoration: "underline", background: "none", border: "none", padding: 0 },
  footer: { marginTop: 20, textAlign: "center", color: "#9b7fd4", fontSize: 13 },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AgencyRegister({ onAuth, onBack, onLogin }) {
  // Check if coming from Stripe payment
  const params = new URLSearchParams(window.location.search);
  const paid = params.get('paid');
  const plan = params.get('plan') || 'starter';

  // If not paid, redirect to pricing page
  if (!paid) {
    return (
      <div style={s.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={s.box}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6C3FC5', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#6C3FC5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', fontFamily: 'serif', margin: '0 auto 20px' }}>Q</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1a1a2e', marginBottom: 8, textAlign: 'center' }}>Choose a plan first</div>
          <div style={{ color: '#9b7fd4', fontSize: 14, marginBottom: 28, textAlign: 'center', lineHeight: 1.6 }}>To create your agency account you need to subscribe to a Quikcare plan.</div>
          <a href="https://buy.stripe.com/test_dRm14maDN3O4cObfFP87K05" style={{ display: 'block', padding: '14px', background: '#f0ebff', borderRadius: 999, color: '#6C3FC5', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginBottom: 10 }}>Starter — £49/month</a>
          <a href="https://buy.stripe.com/test_00wdR88vFbgw7tRfFP87K06" style={{ display: 'block', padding: '14px', background: '#6C3FC5', borderRadius: 999, color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginBottom: 10 }}>Growth — £99/month ⭐</a>
          <a href="https://buy.stripe.com/test_cNi00idPZdoE3dB65f87K04" style={{ display: 'block', padding: '14px', background: '#f0ebff', borderRadius: 999, color: '#6C3FC5', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>Enterprise — £199/month</a>
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#9b7fd4' }}>Already paid? <button style={s.link} onClick={onLogin}>Log in</button></div>
        </div>
      </div>
    );
  }
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const slug = slugify(agencyName);

  // If not coming from Stripe payment, redirect to pricing
  if (paid !== 'true') {
    return (
      <div style={s.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ ...s.box, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1a1a2e', marginBottom: 8 }}>Payment required</div>
          <div style={{ color: '#9b7fd4', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Please choose a plan to get started with Quikcare.</div>
          <button style={{ width: '100%', padding: '14px', background: '#6C3FC5', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }} onClick={() => window.location.href = 'https://quikcare.co.uk/#pricing'}>View Pricing Plans →</button>
          <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #c5b3e8', borderRadius: 8, color: '#6C3FC5', fontSize: 14, cursor: 'pointer' }} onClick={onBack}>← Back to home</button>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!agencyName.trim()) return setError("Please enter your agency name.");
    if (!email.trim()) return setError("Please enter your email address.");
    if (!password) return setError("Please enter a password.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (slug.length < 3) return setError("Agency name must be at least 3 characters.");

    setLoading(true); setError("");

    try {
      // Check slug is not already taken
      const slugDoc = await getDoc(doc(db, "agencySlugs", slug));
      if (slugDoc.exists()) {
        setError("That agency name is already taken. Please choose a different one.");
        setLoading(false);
        return;
      }

      // Create Firebase auth account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      // Save agency profile
      await setDoc(doc(db, "agencies", uid), {
        agencyName,
        slug,
        email,
        plan: plan,
        status: "active",
        createdAt: serverTimestamp(),
        uid,
      });

      // Reserve the slug
      await setDoc(doc(db, "agencySlugs", slug), { uid, agencyName });

      onAuth(result.user, slug);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("An account already exists with this email.");
      else setError("Registration failed. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  if (paid !== 'true') {
    return (
      <div style={s.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ ...s.box, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1a1a2e', marginBottom: 8 }}>Payment required</div>
          <div style={{ color: '#9b7fd4', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Please choose a plan to get started with Quikcare.</div>
          <button style={{ width: '100%', padding: '14px', background: '#6C3FC5', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }} onClick={() => window.location.href = 'https://quikcare.co.uk/#pricing'}>View Pricing Plans →</button>
          <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #c5b3e8', borderRadius: 8, color: '#6C3FC5', fontSize: 14, cursor: 'pointer' }} onClick={onBack}>← Back to home</button>
        </div>
      </div>
    );
  }

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
        <div style={{ background: '#e8f5eb', border: '1px solid #a3d9b1', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#1a7a3a', marginBottom: 20 }}>
          ✅ Payment confirmed — {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
        </div>
        <div style={{ background: '#f0ebff', border: '1px solid #c5b3e8', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#6C3FC5', fontWeight: 600 }}>
          ✅ Payment confirmed — {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
        </div>
        <div style={s.title}>Create your agency account</div>
        <div style={s.sub}>Set up your Quikcare recruitment platform</div>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <label style={s.label}>Agency Name</label>
        <input style={s.input} placeholder="e.g. Sunrise Care" value={agencyName} onChange={e => setAgencyName(e.target.value)} />

        {slug.length >= 3 && (
          <div style={s.slugPreview}>
            🔗 Your apply link will be: <strong>quikcare.co.uk/apply/{slug}</strong>
          </div>
        )}

        <label style={s.label}>Email Address</label>
        <input style={s.input} type="email" placeholder="admin@yourcare.co.uk" value={email} onChange={e => setEmail(e.target.value)} />

        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} />

        <label style={s.label}>Confirm Password</label>
        <input style={s.input} type="password" placeholder="Repeat your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRegister()} />

        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleRegister}>
          {loading ? "Creating account..." : "Create Agency Account →"}
        </button>

        <div style={s.footer}>
          Already have an account? <button style={s.link} onClick={() => onLogin ? onLogin() : onBack && onBack()}>Log in</button>
        </div>
      </div>
    </div>
  );
}
