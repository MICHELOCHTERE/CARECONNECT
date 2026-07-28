import React, { useState } from "react";

function go(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try emailing us directly.");
      }
    } catch (e) {
      setError("Something went wrong. Please try emailing us directly.");
    }
    setSending(false);
  };

  const s = {
    wrap: { minHeight: "100vh", background: "#f8f5ff", fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e" },
    header: { background: "#ffffff", borderBottom: "1px solid #e8e0f5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
    logoWrap: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: { width: 36, height: 36, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", fontFamily: "serif" },
    logoText: { color: "#6C3FC5", fontSize: 18, fontFamily: "'DM Serif Display', serif" },
    backBtn: { background: "none", border: "1px solid #c5b3e8", borderRadius: 8, padding: "8px 16px", color: "#6C3FC5", fontSize: 13, cursor: "pointer" },
    hero: { background: "linear-gradient(135deg, #6C3FC5 0%, #4a2a8a 100%)", padding: "60px 24px", textAlign: "center" },
    heroTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "white", marginBottom: 12 },
    heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 },
    container: { maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, alignItems: "flex-start" },
    card: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 16, padding: 28 },
    sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a2e", marginBottom: 20 },
    detailRow: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 },
    detailIcon: { width: 40, height: 40, borderRadius: 10, background: "#f0ebff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
    detailLabel: { fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3, fontWeight: 600 },
    detailValue: { fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 },
    detailLink: { color: "#6C3FC5", textDecoration: "none", fontSize: 14 },
    label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
    input: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
    textarea: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", minHeight: 140, resize: "vertical", fontFamily: "'DM Sans', sans-serif" },
    field: { marginBottom: 16 },
    btn: { width: "100%", padding: "13px", background: "#6C3FC5", border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 },
    error: { color: "#cc0000", fontSize: 13, marginBottom: 12, background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 8, padding: "10px 14px" },
    divider: { borderTop: "1px solid #e8e0f5", margin: "24px 0" },
    hoursRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4a4a6a", padding: "6px 0", borderBottom: "1px solid #f0ebff" },
  };

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={s.header}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>Q</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <button onClick={() => go('/')} style={s.backBtn}>← Back to Home</button>
      </div>

      <div style={s.hero}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <h1 style={s.heroTitle}>Get in Touch</h1>
        <p style={s.heroSub}>Have a question about Quikcare? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.</p>
      </div>

      <div style={s.container}>
        <div style={s.grid}>

          {/* Contact Details */}
          <div>
            <div style={s.card}>
              <div style={s.sectionTitle}>Contact Details</div>

              <div style={s.detailRow}>
                <div style={s.detailIcon}>📧</div>
                <div>
                  <div style={s.detailLabel}>Email</div>
                  <a href="mailto:hello@quikcare.co.uk" style={s.detailLink}>hello@quikcare.co.uk</a>
                </div>
              </div>

              <div style={s.detailRow}>
                <div style={s.detailIcon}>📞</div>
                <div>
                  <div style={s.detailLabel}>Phone</div>
                  <a href="tel:07513666174" style={s.detailLink}>07513 666 174</a>
                </div>
              </div>

              <div style={s.detailRow}>
                <div style={s.detailIcon}>📍</div>
                <div>
                  <div style={s.detailLabel}>Address</div>
                  <div style={s.detailValue}>
                    40 Mill Lane<br />
                    Oldbury<br />
                    Birmingham<br />
                    B69 4DF
                  </div>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.sectionTitle}>Office Hours</div>
              {[["Monday – Friday", "9:00am – 5:30pm"], ["Saturday", "10:00am – 2:00pm"], ["Sunday", "Closed"]].map(([day, hours]) => (
                <div key={day} style={s.hoursRow}>
                  <span>{day}</span>
                  <span style={{ fontWeight: hours === "Closed" ? 400 : 600, color: hours === "Closed" ? "#9b7fd4" : "#1a1a2e" }}>{hours}</span>
                </div>
              ))}

              <div style={s.divider} />

              <div style={{ background: "#f0ebff", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: "#6C3FC5", fontWeight: 600, marginBottom: 4 }}>For Agencies</div>
                <div style={{ fontSize: 13, color: "#4a4a6a", lineHeight: 1.6 }}>
                  Interested in listing your agency on Quikcare? <button onClick={() => go('/agency/register')} style={{ color: "#6C3FC5", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: 13, padding: 0 }}>Register here →</button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={s.card}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#1a1a2e", marginBottom: 8 }}>Message Sent!</div>
                <div style={{ color: "#9b7fd4", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                  Thank you for getting in touch. We'll get back to you at <strong>{form.email}</strong> as soon as possible.
                </div>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} style={{ ...s.btn, width: "auto", padding: "10px 24px" }}>Send Another Message</button>
              </div>
            ) : (
              <>
                <div style={s.sectionTitle}>Send Us a Message</div>
                {error && <div style={s.error}>⚠️ {error}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={s.field}>
                    <label style={s.label}>Your Name <span style={{ color: "#cc0000" }}>*</span></label>
                    <input type="text" style={s.input} placeholder="John Smith" value={form.name} onChange={e => set("name", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Email Address <span style={{ color: "#cc0000" }}>*</span></label>
                    <input type="email" style={s.input} placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Subject</label>
                  <input type="text" style={s.input} placeholder="e.g. Agency enquiry, General question..." value={form.subject} onChange={e => set("subject", e.target.value)} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Message <span style={{ color: "#cc0000" }}>*</span></label>
                  <textarea style={s.textarea} placeholder="How can we help you?" value={form.message} onChange={e => set("message", e.target.value)} />
                </div>
                <button style={{ ...s.btn, opacity: sending ? 0.6 : 1 }} disabled={sending} onClick={handleSubmit}>
                  {sending ? "Sending..." : "Send Message →"}
                </button>
                <div style={{ fontSize: 12, color: "#9b7fd4", marginTop: 12, textAlign: "center" }}>
                  We typically respond within 1 business day.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
