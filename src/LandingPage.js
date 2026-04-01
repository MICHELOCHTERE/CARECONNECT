import React, { useState } from "react";

const s = {
  wrap: { fontFamily: "'DM Sans', sans-serif", background: "#ffffff", color: "#1a1a2e", overflowX: "hidden" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #f0ebff", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  navLogoIcon: { width: 36, height: 36, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", fontFamily: "serif" },
  navLogoText: { color: "#6C3FC5", fontSize: 20, fontFamily: "'DM Serif Display', serif" },
  navLinks: { display: "flex", alignItems: "center", gap: 24 },
  navLink: { color: "#6b7280", fontSize: 14, cursor: "pointer", textDecoration: "none", background: "none", border: "none" },
  navCta: { padding: "10px 24px", background: "#6C3FC5", border: "none", borderRadius: 999, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  hero: { padding: "100px 24px 120px", textAlign: "center", position: "relative", overflow: "hidden", background: "#6C3FC5" },
  heroBadge: { display: "inline-block", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "white", marginBottom: 24 },
  heroTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 52, color: "white", marginBottom: 20, lineHeight: 1.2, maxWidth: 700, margin: "0 auto 20px" },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" },
  heroBtns: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  heroBtn1: { padding: "16px 40px", background: "white", border: "none", borderRadius: 999, color: "#6C3FC5", fontSize: 16, fontWeight: 700, cursor: "pointer" },
  heroBtn2: { padding: "16px 32px", background: "transparent", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 999, color: "white", fontSize: 16, fontWeight: 500, cursor: "pointer" },
  statsBar: { background: "#f8f5ff", borderTop: "1px solid #e8e0f5", borderBottom: "1px solid #e8e0f5", padding: "32px 24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, maxWidth: 800, margin: "0 auto", textAlign: "center" },
  statNum: { fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "#6C3FC5", marginBottom: 4 },
  statLabel: { color: "#9b7fd4", fontSize: 13 },
  section: { padding: "80px 24px", maxWidth: 1000, margin: "0 auto" },
  sectionBadge: { display: "inline-block", background: "#f0ebff", border: "1px solid #e8e0f5", borderRadius: 999, padding: "4px 14px", fontSize: 12, color: "#6C3FC5", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 },
  sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "#1a1a2e", marginBottom: 16, lineHeight: 1.3 },
  sectionSub: { color: "#6b7280", fontSize: 16, lineHeight: 1.7, maxWidth: 560, marginBottom: 48 },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 },
  featureCard: { background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 16, padding: 24 },
  featureIcon: { fontSize: 32, marginBottom: 14 },
  featureTitle: { color: "#1a1a2e", fontWeight: 600, fontSize: 16, marginBottom: 8 },
  featureSub: { color: "#6b7280", fontSize: 14, lineHeight: 1.6 },
  pricingWrap: { background: "#f8f5ff", padding: "80px 24px" },
  pricingInner: { maxWidth: 480, margin: "0 auto", textAlign: "center" },
  pricingCard: { background: "white", border: "2px solid #6C3FC5", borderRadius: 20, padding: 40, textAlign: "center", position: "relative" },
  pricingBadge: { position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#6C3FC5", color: "white", padding: "4px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  pricingPrice: { fontFamily: "'DM Serif Display', serif", fontSize: 56, color: "#6C3FC5", lineHeight: 1 },
  pricingPer: { color: "#9b7fd4", fontSize: 14, marginBottom: 24 },
  pricingFeature: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0ebff", color: "#1a1a2e", fontSize: 14, textAlign: "left" },
  pricingBtn: { width: "100%", padding: "16px", background: "#6C3FC5", border: "none", borderRadius: 999, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 24 },
  pricingNote: { color: "#9b7fd4", fontSize: 12, marginTop: 16 },
  faqItem: { borderBottom: "1px solid #e8e0f5", padding: "20px 0" },
  faqQ: { color: "#1a1a2e", fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between" },
  faqA: { color: "#6b7280", fontSize: 14, lineHeight: 1.7 },
  ctaWrap: { background: "#6C3FC5", padding: "80px 24px", textAlign: "center" },
  ctaTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 40, color: "white", marginBottom: 16 },
  ctaSub: { color: "rgba(255,255,255,0.85)", fontSize: 16, marginBottom: 40 },
  ctaBtn: { padding: "18px 48px", background: "white", border: "none", borderRadius: 999, color: "#6C3FC5", fontSize: 18, fontWeight: 700, cursor: "pointer" },
  footer: { background: "#1a1a2e", padding: "40px 24px", textAlign: "center" },
  footerLinks: { display: "flex", gap: 24, justifyContent: "center", marginBottom: 16 },
  footerLink: { color: "#9b7fd4", fontSize: 13, cursor: "pointer", textDecoration: "none" },
  footerText: { color: "#6b7280", fontSize: 13 },
};

const FEATURES = [
  { icon: "📋", title: "Smart Application Forms", sub: "6-step onboarding covering personal details, experience, DBS, right to work, bank details and references." },
  { icon: "📁", title: "Document Management", sub: "Carers upload CV, proof of address and right to work documents. Download instantly from your dashboard." },
  { icon: "📊", title: "Real-Time Dashboard", sub: "See every application the moment it is submitted. Approve, reject and add notes in one place." },
  { icon: "💾", title: "Auto-Save Progress", sub: "Carers can save their application and come back later. No lost data, no frustrated applicants." },
  { icon: "🔒", title: "Secure and Compliant", sub: "Firebase authentication, encrypted storage and password-protected admin access. GDPR-ready." },
  { icon: "📱", title: "Mobile-First Design", sub: "Works perfectly on any device. Carers apply from their phone — no app download required." },
];

const FAQS = [
  { q: "How long does setup take?", a: "Under 5 minutes. Sign up, get your link, and start receiving applications immediately." },
  { q: "Do carers need to download an app?", a: "No. The application runs in the browser and works on any device including mobile phones." },
  { q: "Is there a contract or minimum term?", a: "No contracts. Cancel anytime. We charge monthly and you can stop whenever you like." },
  { q: "How many applications can I receive?", a: "Unlimited applications on all plans. No hidden limits or extra charges per applicant." },
  { q: "Is my data secure?", a: "Yes. All data is stored securely on Google Firebase with encryption at rest and in transit." },
  { q: "Can I export my applicant data?", a: "Yes. Export all applications to CSV at any time from your admin dashboard." },
];

export default function LandingPage({ onGetStarted }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navLogoIcon}>Q</div>
          <span style={s.navLogoText}>Quikcare</span>
        </div>
        <div style={s.navLinks}>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#pricing" style={s.navLink}>Pricing</a>
          <a href="#faq" style={s.navLink}>FAQ</a>
          <button style={s.navCta} onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>

      <div style={s.hero}>
        <div style={s.heroBadge}>Built for UK Care Agencies</div>
        <h1 style={s.heroTitle}>Recruit care workers faster than ever</h1>
        <p style={s.heroSub}>Quikcare handles your entire carer onboarding — from application to compliance checks — in one simple platform.</p>
        <div style={s.heroBtns}>
          <button style={s.heroBtn1} onClick={onGetStarted}>Start Free Trial</button>
          <button style={s.heroBtn2} onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>See Features</button>
        </div>
      </div>

      <div style={s.statsBar}>
        <div style={s.statsGrid}>
          <div><div style={s.statNum}>6</div><div style={s.statLabel}>Step application form</div></div>
          <div><div style={s.statNum}>10m</div><div style={s.statLabel}>Average completion time</div></div>
          <div><div style={s.statNum}>100%</div><div style={s.statLabel}>Mobile friendly</div></div>
          <div><div style={s.statNum}>49</div><div style={s.statLabel}>Pounds per month</div></div>
        </div>
      </div>

      <div id="features" style={s.section}>
        <div style={s.sectionBadge}>Features</div>
        <h2 style={s.sectionTitle}>Everything you need to recruit carers</h2>
        <p style={s.sectionSub}>No more paper forms, email chains or spreadsheets. Quikcare handles it all digitally.</p>
        <div style={s.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureSub}>{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="pricing" style={s.pricingWrap}>
        <div style={s.pricingInner}>
          <div style={s.sectionBadge}>Pricing</div>
          <h2 style={{ ...s.sectionTitle, textAlign: "center" }}>Simple, transparent pricing</h2>
          <p style={{ color: "#6b7280", fontSize: 16, textAlign: "center", marginBottom: 48 }}>One plan, everything included. No hidden fees.</p>
          <div style={s.pricingCard}>
            <div style={s.pricingBadge}>Most Popular</div>
            <div style={s.pricingPrice}>£49</div>
            <div style={s.pricingPer}>per month — cancel anytime</div>
            <div style={{ marginBottom: 8 }}>
              {["Unlimited applications", "Full 6-step onboarding form", "Document upload and storage", "Real-time admin dashboard", "Approve and reject applicants", "PDF and CSV export", "Auto-save for carers", "Carer login accounts", "Password protected admin", "Mobile optimised", "Email support"].map((f, i) => (
                <div key={i} style={s.pricingFeature}>
                  <span style={{ color: "#6C3FC5", fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button style={s.pricingBtn} onClick={onGetStarted}>Start Free 14-Day Trial</button>
            <div style={s.pricingNote}>No credit card required for trial</div>
          </div>
        </div>
      </div>

      <div id="faq" style={s.section}>
        <div style={s.sectionBadge}>FAQ</div>
        <h2 style={s.sectionTitle}>Common questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={s.faqItem}>
            <div style={s.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {faq.q} <span>{openFaq === i ? "−" : "+"}</span>
            </div>
            {openFaq === i && <div style={s.faqA}>{faq.a}</div>}
          </div>
        ))}
      </div>

      <div style={s.ctaWrap}>
        <h2 style={s.ctaTitle}>Ready to transform your recruitment?</h2>
        <p style={s.ctaSub}>Join care agencies across the Midlands using Quikcare to hire faster.</p>
        <button style={s.ctaBtn} onClick={onGetStarted}>Start Your Free Trial</button>
      </div>

      <div style={s.footer}>
        <div style={s.footerLinks}>
          <a href="#features" style={s.footerLink}>Features</a>
          <a href="#pricing" style={s.footerLink}>Pricing</a>
          <a href="#faq" style={s.footerLink}>FAQ</a>
          <a href="mailto:hello@quikcare.co.uk" style={s.footerLink}>Contact</a>
        </div>
        <div style={s.footerText}>2026 Quikcare — Midlands Home Care Recruitment Platform — quikcare.co.uk</div>
      </div>
    </div>
  );
}
