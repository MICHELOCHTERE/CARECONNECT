import React, { useState, useEffect } from "react";
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
  slugPreview: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#6C3FC5", marginBottom: 16 },
  link: { color: "#6C3FC5", fontSize: 13, cursor: "pointer", textDecoration: "underline", background: "none", border: "none", padding: 0 },
  footer: { marginTop: 20, textAlign: "center", color: "#9b7fd4", fontSize: 13 },
  paidBadge: { background: "#e8f5eb", border: "1px solid #a3d9b1", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#1a7a3a", fontWeight: 600 },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function PaymentRequired({ onBack }) {
  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ ...s.box, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#1a1a2e", marginBottom: 8 }}>Payment required</div>
        <div style={{ color: "#9b7fd4", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Please choose a plan to get started with Quikcare.</div>
        <button style={{ width: "100%", padding: "14px", background: "#6C3FC5", border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}
          onClick={() => window.location.href = "https://quikcare.co.uk/#pricing"}>View Pricing Plans →</button>
        <button style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid #c5b3e8", borderRadius: 8, color: "#6C3FC5", fontSize: 14, cursor: "pointer" }}
          onClick={onBack}>← Back to home</button>
      </div>
    </div>
  );
}

export default function AgencyRegister({ onAuth, onBack, onLogin }) {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const plan = params.get("plan") || "starter";

  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [verifying, setVerifying] = useState(!!sessionId);

  const slug = slugify(agencyName);

  // Verify the Stripe session on mount
  React.useEffect(() => {
    if (!sessionId) return;
    setVerifying(true);
    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setSessionVerified(true);
          if (data.email) setEmail(data.email);
        }
        setVerifying(false);
      })
      .catch(() => setVerifying(false));
  }, [sessionId]);

  if (verifying) {
    return (
      <div style={s.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ color: "#6C3FC5", fontSize: 16, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22 }}>Verifying payment...</div>
        </div>
      </div>
    );
  }

  if (!sessionId || !sessionVerified) {
    return <PaymentRequired onBack={onBack} />;
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
      const slugDoc = await getDoc(doc(db, "agencySlugs", slug));
      if (slugDoc.exists()) {
        setError("That agency name is already taken. Please choose a different one.");
        setLoading(false);
        return;
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      await setDoc(doc(db, "agencies", uid), {
        agencyName, slug, email, plan, status: "active", createdAt: serverTimestamp(), uid,
      });

      await setDoc(doc(db, "agencySlugs", slug), { uid, agencyName });

      onAuth(result.user, slug);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("An account already exists with this email.");
      else setError("Registration failed. Please try again.");
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
        <div style={s.paidBadge}>✅ Payment confirmed — {plan.charAt(0).toUpperCase() + plan.slice(1)} plan</div>
        <div style={s.title}>Create your agency account</div>
        <div style={s.sub}>Set up your Quikcare recruitment platform</div>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <label style={s.label}>Agency Name</label>
        <input style={s.input} placeholder="e.g. Sunrise Care" value={agencyName} onChange={e => setAgencyName(e.target.value)} />

        {slug.length >= 3 && (
          <div style={s.slugPreview}>🔗 Your apply link: <strong>quikcare.co.uk/apply/{slug}</strong></div>
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
          Already have an account? <button style={s.link} onClick={onLogin}>Log in</button>
        </div>
      </div>
    </div>
  );
}
