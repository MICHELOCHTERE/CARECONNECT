import React from "react";

const s = {
  wrap: { minHeight: "100vh", background: "#f8f5ff", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" },
  hero: { background: "#6C3FC5", padding: "60px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" },
  heroCircle1: { position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -100, right: -80 },
  heroCircle2: { position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: -60, left: -40 },
  logoRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 },
  logoIcon: { width: 52, height: 52, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#6C3FC5", fontFamily: "serif" },
  logoText: { color: "white", fontSize: 28, fontFamily: "'DM Serif Display', serif" },
  heroTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "white", marginBottom: 16, lineHeight: 1.3 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.7, maxWidth: 360, margin: "0 auto 32px" },
  btnStart: { display: "inline-block", padding: "16px 40px", background: "white", borderRadius: 999, color: "#6C3FC5", fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
  btnLogin: { display: "inline-block", padding: "14px 32px", background: "transparent", borderRadius: 999, color: "white", fontSize: 15, fontWeight: 500, cursor: "pointer", border: "2px solid rgba(255,255,255,0.5)", marginLeft: 12 },
  body: { padding: "40px 24px", maxWidth: 560, margin: "0 auto", width: "100%" },
  sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1a1a2e", marginBottom: 20, textAlign: "center" },
  steps: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 },
  step: { display: "flex", alignItems: "flex-start", gap: 16, background: "white", border: "1px solid #e8e0f5", borderRadius: 12, padding: 16 },
  stepNum: { width: 36, height: 36, borderRadius: "50%", background: "#6C3FC5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  stepText: { flex: 1 },
  stepTitle: { color: "#1a1a2e", fontWeight: 600, fontSize: 14, marginBottom: 4 },
  stepSub: { color: "#9b7fd4", fontSize: 13, lineHeight: 1.5 },
  badges: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 40 },
  badge: { padding: "8px 16px", background: "white", border: "1px solid #e8e0f5", borderRadius: 999, fontSize: 13, color: "#6C3FC5", fontWeight: 500 },
  cta: { background: "#6C3FC5", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 40 },
  ctaTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "white", marginBottom: 8 },
  ctaSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 20 },
  ctaBtn: { padding: "14px 36px", background: "white", border: "none", borderRadius: 999, color: "#6C3FC5", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  footer: { textAlign: "center", color: "#9b7fd4", fontSize: 12, paddingBottom: 40 },
};

const STEPS = [
  { num: 1, icon: "👤", title: "Create your account", sub: "Register with your email and password — takes 30 seconds" },
  { num: 2, icon: "📝", title: "Complete your application", sub: "Fill in your personal details, experience, qualifications and availability" },
  { num: 3, icon: "📄", title: "Upload your documents", sub: "CV, proof of address and right to work documents" },
  { num: 4, icon: "✅", title: "Submit and we'll be in touch", sub: "Our team reviews your application within 2 working days" },
];

const BADGES = ["🚗 Drivers welcome", "🕐 Flexible hours", "💷 Weekly pay", "🎓 Training provided", "📍 Midlands based", "❤️ Make a difference"];

export default function Welcome({ onStart, onLogin }) {
  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroCircle1} />
        <div style={s.heroCircle2} />
        <div style={s.logoRow}>
          <div style={s.logoIcon}>Q</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <h1 style={s.heroTitle}>Start your career in home care today</h1>
        <p style={s.heroSub}>Join our team of dedicated carers making a real difference in the Midlands. Flexible hours, competitive pay and full training provided.</p>
        <button style={s.btnStart} onClick={onStart}>Apply Now →</button>
        <button style={s.btnLogin} onClick={onLogin}>Log In</button>
      </div>

      <div style={s.body}>

        {/* Badges */}
        <div style={s.badges}>
          {BADGES.map((b, i) => <span key={i} style={s.badge}>{b}</span>)}
        </div>

        {/* How it works */}
        <div style={s.sectionTitle}>How it works</div>
        <div style={s.steps}>
          {STEPS.map((step) => (
            <div key={step.num} style={s.step}>
              <div style={s.stepNum}>{step.num}</div>
              <div style={s.stepText}>
                <div style={s.stepTitle}>{step.icon} {step.title}</div>
                <div style={s.stepSub}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={s.cta}>
          <div style={s.ctaTitle}>Ready to join the team?</div>
          <div style={s.ctaSub}>Applications take around 10 minutes to complete</div>
          <button style={s.ctaBtn} onClick={onStart}>Start My Application →</button>
        </div>

        <div style={s.footer}>
          © {new Date().getFullYear()} Quikcare · Midlands Home Care Recruitment · quikcare.co.uk
        </div>
      </div>
    </div>
  );
}
