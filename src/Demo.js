import React, { useState } from "react";

const STEPS = [
  {
    num: 1,
    icon: "🌐",
    title: "Agency visits quikcare.co.uk",
    desc: "The agency discovers Quikcare through our landing page and browses the features and pricing.",
    color: "#6C3FC5",
  },
  {
    num: 2,
    icon: "💳",
    title: "Agency chooses a plan and pays",
    desc: "They select Starter, Growth or Enterprise and complete payment securely through Stripe.",
    color: "#9b5de5",
  },
  {
    num: 3,
    icon: "🏢",
    title: "Agency creates their account",
    desc: "After payment they register with their agency name. They instantly get a unique apply link e.g. quikcare.co.uk/apply/sunrise-care.",
    color: "#6C3FC5",
  },
  {
    num: 4,
    icon: "🔗",
    title: "Agency shares their apply link",
    desc: "They share the link on job boards, WhatsApp, flyers or email. Carers click it to start applying.",
    color: "#9b5de5",
  },
  {
    num: 5,
    icon: "📝",
    title: "Carers create accounts and apply",
    desc: "Carers register with their email, complete the 6-step onboarding form and upload their documents. Progress saves automatically.",
    color: "#6C3FC5",
  },
  {
    num: 6,
    icon: "📊",
    title: "Agency reviews applications",
    desc: "The agency logs into their dashboard, reviews each application, downloads documents, and approves or rejects candidates.",
    color: "#9b5de5",
  },
];

const SCREEN_PREVIEWS = [
  {
    title: "Landing Page",
    desc: "Agencies discover Quikcare",
    content: (
      <div style={{ padding: 16 }}>
        <div style={{ background: "#6C3FC5", borderRadius: 8, padding: "20px 16px", textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: "white", fontSize: 16, marginBottom: 6 }}>Recruit care workers faster</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 12 }}>Built for UK care agencies</div>
          <div style={{ background: "white", borderRadius: 999, padding: "6px 16px", display: "inline-block", color: "#6C3FC5", fontSize: 11, fontWeight: 700 }}>View Pricing →</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["📋 Smart Forms", "📁 Documents", "📊 Dashboard", "📱 Mobile"].map(f => (
            <div key={f} style={{ background: "#f0ebff", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#6C3FC5", fontWeight: 500 }}>{f}</div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Agency Dashboard",
    desc: "Real-time application management",
    content: (
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[["5", "Total"], ["3", "Pending"], ["2", "Approved"], ["0", "Rejected"]].map(([n, l]) => (
            <div key={l} style={{ background: "#f0ebff", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "#6C3FC5", fontSize: 18 }}>{n}</div>
              <div style={{ color: "#9b7fd4", fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
        {["Sarah Johnson", "James Okafor", "Amina Hassan"].map((name, i) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e8e0f5" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#1a1a2e" }}>{name}</div>
            <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: i === 0 ? "#e8f5eb" : "#f0ebff", color: i === 0 ? "#1a7a3a" : "#6C3FC5" }}>{i === 0 ? "✅ Approved" : "⏳ Pending"}</div>
          </div>
        ))}
      </div>
    )
  },
  {
    title: "Carer Application",
    desc: "6-step onboarding form",
    content: (
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} style={{ width: 28, height: 28, borderRadius: "50%", background: n <= 2 ? "#6C3FC5" : "#e8e0f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: n <= 2 ? "white" : "#9b7fd4", fontWeight: 600 }}>{n <= 1 ? "✓" : n}</div>
          ))}
        </div>
        <div style={{ height: 4, background: "#e8e0f5", borderRadius: 4, marginBottom: 16 }}>
          <div style={{ width: "33%", height: "100%", background: "#6C3FC5", borderRadius: 4 }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>Personal Details</div>
        {["First Name", "Last Name", "Email Address"].map(field => (
          <div key={field} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{field}</div>
            <div style={{ background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#9b7fd4" }}>Enter {field.toLowerCase()}...</div>
          </div>
        ))}
      </div>
    )
  },
];

export default function Demo() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeScreen, setActiveScreen] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9ff", fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4a1fa8, #6C3FC5)", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#6C3FC5", fontFamily: "serif" }}>Q</div>
          <span style={{ color: "white", fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Quikcare</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginLeft: 8 }}>— How it works</span>
        </div>
        <a href="https://quikcare.co.uk" target="_blank" rel="noreferrer" style={{ padding: "10px 22px", background: "white", border: "none", borderRadius: 999, color: "#6C3FC5", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          Get Started →
        </a>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #4a1fa8, #6C3FC5)", padding: "60px 40px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "6px 18px", fontSize: 12, color: "white", marginBottom: 20 }}>🎬 Interactive Demo</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, color: "white", marginBottom: 16 }}>See Quikcare in action</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>Walk through the complete journey from agency signup to carer approval in 6 simple steps.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>

        {/* Step walkthrough */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 80 }}>
          {/* Steps list */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 32 }}>The complete journey</h2>
            {STEPS.map((step, i) => (
              <div key={i} onClick={() => setActiveStep(i)}
                style={{ display: "flex", gap: 16, padding: "16px", borderRadius: 12, marginBottom: 8, cursor: "pointer", background: activeStep === i ? "#f0ebff" : "transparent", border: `1px solid ${activeStep === i ? "#c5b3e8" : "transparent"}`, transition: "all 0.2s" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: activeStep === i ? "#6C3FC5" : "#e8e0f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, transition: "all 0.2s" }}>
                  {activeStep === i ? step.icon : step.num}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a2e", marginBottom: 4 }}>{step.title}</div>
                  {activeStep === i && <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>{step.desc}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Active step detail */}
          <div style={{ position: "sticky", top: 24, alignSelf: "start" }}>
            <div style={{ background: "white", border: "1px solid #e8e0f5", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(108,63,197,0.1)" }}>
              <div style={{ background: "linear-gradient(135deg, #4a1fa8, #6C3FC5)", padding: "32px 32px 40px", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{STEPS[activeStep].icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "white", marginBottom: 8 }}>Step {STEPS[activeStep].num}</div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, fontWeight: 500 }}>{STEPS[activeStep].title}</div>
              </div>
              <div style={{ padding: 32 }}>
                <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>{STEPS[activeStep].desc}</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}
                    style={{ flex: 1, padding: "12px", border: "1px solid #e8e0f5", borderRadius: 8, background: "transparent", color: "#6b7280", fontSize: 14, cursor: activeStep === 0 ? "not-allowed" : "pointer", opacity: activeStep === 0 ? 0.4 : 1 }}>
                    ← Previous
                  </button>
                  <button onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))} disabled={activeStep === STEPS.length - 1}
                    style={{ flex: 1, padding: "12px", border: "none", borderRadius: 8, background: "#6C3FC5", color: "white", fontSize: 14, fontWeight: 600, cursor: activeStep === STEPS.length - 1 ? "not-allowed" : "pointer", opacity: activeStep === STEPS.length - 1 ? 0.4 : 1 }}>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screen previews */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, textAlign: "center", marginBottom: 16 }}>See the screens</h2>
          <p style={{ color: "#6b7280", fontSize: 16, textAlign: "center", marginBottom: 40 }}>Click each tab to preview the key screens</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
            {SCREEN_PREVIEWS.map((s, i) => (
              <button key={i} onClick={() => setActiveScreen(i)}
                style={{ padding: "10px 20px", borderRadius: 999, border: `1px solid ${activeScreen === i ? "#6C3FC5" : "#e8e0f5"}`, background: activeScreen === i ? "#6C3FC5" : "white", color: activeScreen === i ? "white" : "#6b7280", fontSize: 14, cursor: "pointer", fontWeight: activeScreen === i ? 600 : 400, transition: "all 0.2s" }}>
                {s.title}
              </button>
            ))}
          </div>
          <div style={{ background: "white", border: "1px solid #e8e0f5", borderRadius: 20, overflow: "hidden", maxWidth: 480, margin: "0 auto", boxShadow: "0 8px 40px rgba(108,63,197,0.1)" }}>
            <div style={{ background: "#1a1a2e", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ flex: 1, background: "#2a2a4e", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#9b7fd4", marginLeft: 8 }}>quikcare.co.uk</div>
            </div>
            <div>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8e0f5" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{SCREEN_PREVIEWS[activeScreen].title}</div>
                <div style={{ color: "#9b7fd4", fontSize: 12 }}>{SCREEN_PREVIEWS[activeScreen].desc}</div>
              </div>
              {SCREEN_PREVIEWS[activeScreen].content}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, #4a1fa8, #6C3FC5)", borderRadius: 24, padding: "60px 40px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: "white", marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 }}>Join care agencies across the Midlands using Quikcare to hire faster.</p>
          <a href="https://quikcare.co.uk/#pricing" target="_blank" rel="noreferrer"
            style={{ display: "inline-block", padding: "18px 48px", background: "white", borderRadius: 999, color: "#6C3FC5", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
            View Pricing & Sign Up →
          </a>
        </div>
      </div>
    </div>
  );
}
