import React, { useState, useEffect, useRef } from "react";

const STRIPE_LINKS = {
  starter: "https://buy.stripe.com/test_dRm14maDN3O4cObfFP87K05",
  growth: "https://buy.stripe.com/test_00wdR88vFbgw7tRfFP87K06",
  enterprise: "https://buy.stripe.com/test_cNi00idPZdoE3dB65f87K04",
};

const FEATURES = [
  { icon: "📋", title: "Smart Application Forms", sub: "6-step onboarding covering everything from personal details to bank details and references." },
  { icon: "📁", title: "Document Management", sub: "Carers upload CV, proof of address and right to work documents. Download instantly." },
  { icon: "📊", title: "Real-Time Dashboard", sub: "See every application the moment it arrives. Approve, reject and export in one place." },
  { icon: "💾", title: "Auto-Save Progress", sub: "Carers save their application and come back later. No lost data, ever." },
  { icon: "🔒", title: "Secure & Compliant", sub: "Firebase auth, encrypted storage, GDPR-ready and password protected admin." },
  { icon: "📱", title: "Mobile-First Design", sub: "Works perfectly on any device. Carers apply from their phone instantly." },
];

const PLANS = [
  {
    name: "Starter", price: "£49", sub: "per month",
    link: STRIPE_LINKS.starter,
    features: ["Up to 50 applications", "Full onboarding form", "Document uploads", "Admin dashboard", "PDF & CSV export", "Email support"],
    highlight: false,
  },
  {
    name: "Growth", price: "£99", sub: "per month",
    link: STRIPE_LINKS.growth,
    features: ["Unlimited applications", "Everything in Starter", "3 admin users", "Email notifications", "Priority support", "Analytics"],
    highlight: true,
  },
  {
    name: "Enterprise", price: "£199", sub: "per month",
    link: STRIPE_LINKS.enterprise,
    features: ["Everything in Growth", "White label branding", "Custom domain", "Unlimited admins", "Dedicated support", "Custom integrations"],
    highlight: false,
  },
];

const FAQS = [
  { q: "How long does setup take?", a: "Under 5 minutes. Sign up, pay, get your link and start receiving applications immediately." },
  { q: "Do carers need to download an app?", a: "No. The application runs in the browser and works perfectly on any mobile device." },
  { q: "Is there a contract or minimum term?", a: "No contracts. Cancel anytime. We charge monthly." },
  { q: "How many applications can I receive?", a: "Unlimited on Growth and Enterprise. Starter supports up to 50 per month." },
  { q: "Is my data secure?", a: "Yes. All data is encrypted on Google Firebase, GDPR compliant and stored securely." },
  { q: "Can I export applicant data?", a: "Yes. Export all applications to CSV or download individual PDFs from your dashboard." },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimatedSection({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function PricingCard({ plan, index }) {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(60px)",
      transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
    }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: plan.highlight ? "#6C3FC5" : "#ffffff",
          border: `2px solid ${hovered || plan.highlight ? "#6C3FC5" : "#e8e0f5"}`,
          borderRadius: 20,
          padding: 32,
          textAlign: "center",
          position: "relative",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          transform: hovered ? "translateY(-8px)" : plan.highlight ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered ? "0 20px 60px rgba(108,63,197,0.3)" : plan.highlight ? "0 10px 40px rgba(108,63,197,0.2)" : "none",
          cursor: "pointer",
        }}
      >
        {plan.highlight && (
          <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "white", color: "#6C3FC5", padding: "4px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", border: "1px solid #e8e0f5" }}>
            ⭐ Most Popular
          </div>
        )}
        <div style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#6C3FC5", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{plan.name}</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 60, color: plan.highlight ? "white" : "#6C3FC5", lineHeight: 1, marginBottom: 4 }}>{plan.price}</div>
        <div style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#9b7fd4", fontSize: 13, marginBottom: 24 }}>{plan.sub}</div>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${plan.highlight ? "rgba(255,255,255,0.1)" : "#f0ebff"}`, color: plan.highlight ? "white" : "#1a1a2e", fontSize: 14, textAlign: "left" }}>
            <span style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#6C3FC5", fontWeight: 700, fontSize: 16 }}>✓</span> {f}
          </div>
        ))}
        <a href={plan.link} target="_blank" rel="noreferrer" style={{
          display: "block", marginTop: 24, padding: "14px",
          background: hovered && !plan.highlight ? "#6C3FC5" : plan.highlight ? "white" : "#f0ebff",
          borderRadius: 999,
          color: plan.highlight ? "#6C3FC5" : hovered ? "white" : "#6C3FC5",
          fontSize: 15, fontWeight: 700, textDecoration: "none",
          transition: "background 0.3s, color 0.3s",
        }}>
          Get Started →
        </a>
      </div>
    </div>
  );
}

export default function LandingPage({ onGetStarted, onLogin }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const handleLogin = () => {
    window.history.pushState({}, '', '/agency/login');
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  };

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf9ff", color: "#1a1a2e", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .nav-link:hover { color: #6C3FC5 !important; }
        .feature-card:hover { transform: translateY(-6px) !important; box-shadow: 0 16px 48px rgba(108,63,197,0.15) !important; }
        .faq-item:hover { background: #f0ebff !important; }
      `}</style>

      {/* Sticky Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid #e8e0f5" : "none",
        padding: "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white", fontFamily: "serif" }}>Q</div>
          <span style={{ color: "#6C3FC5", fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Quikcare</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "Pricing", "FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link" style={{ color: scrolled ? "#6b7280" : "rgba(255,255,255,0.8)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}>{item}</a>
          ))}
          <button onClick={handleLogin} style={{ color: scrolled ? "#6C3FC5" : "white", background: "none", border: `1px solid ${scrolled ? "#c5b3e8" : "rgba(255,255,255,0.4)"}`, borderRadius: 8, padding: "8px 18px", fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>Log In</button>
          <button onClick={() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: "#6C3FC5", border: "none", borderRadius: 8, padding: "10px 22px", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(108,63,197,0.4)", transition: "transform 0.2s, box-shadow 0.2s" }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #4a1fa8 0%, #6C3FC5 50%, #9b5de5 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
        {/* Animated background circles */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "rgba(255,255,255,0.03)", top: -200, right: -200, animation: "float 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: -100, left: -100, animation: "float 6s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", top: "30%", left: "10%", animation: "pulse 4s ease-in-out infinite" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 999, padding: "8px 20px", fontSize: 13, color: "white", marginBottom: 32,
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease 0.1s",
          }}>
            🚀 Built for UK Care Agencies
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 7vw, 72px)",
            color: "white", lineHeight: 1.1, marginBottom: 24, fontWeight: 900,
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.2s",
          }}>
            Recruit care workers<br /><span style={{ color: "#d4b8ff" }}>faster than ever</span>
          </h1>
          <p style={{
            fontSize: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 48px",
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.35s",
          }}>
            Quikcare handles your entire carer onboarding — from application to compliance checks — in one beautifully simple platform.
          </p>
          <div style={{
            display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.5s",
          }}>
            <button onClick={() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              style={{ padding: "18px 44px", background: "white", border: "none", borderRadius: 999, color: "#6C3FC5", fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.2)", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 30px rgba(0,0,0,0.2)"; }}>
              View Pricing →
            </button>
            <button onClick={handleLogin}
              style={{ padding: "18px 36px", background: "transparent", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 999, color: "white", fontSize: 17, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.borderColor = "white"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(255,255,255,0.5)"; }}>
              Log In
            </button>
          </div>

          {/* Video mockup */}
          <div style={{
            marginTop: 64, position: "relative", maxWidth: 700, margin: "64px auto 0",
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease 0.7s",
          }}>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
              {/* Browser bar */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,0.6)", marginLeft: 8 }}>quikcare.co.uk/apply/sunrise-care</div>
              </div>
              {/* Video placeholder */}
              <div onClick={() => setShowVideo(true)} style={{ padding: "60px 24px", cursor: "pointer", textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(108,63,197,0.3), rgba(155,93,229,0.3))" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div onClick={() => setShowVideo(true)} style={{
                    width: 72, height: 72, borderRadius: "50%", background: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px", cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    animation: "pulse 2s ease-in-out infinite",
                  }}>
                    <span style={{ fontSize: 28, marginLeft: 4 }}>▶</span>
                  </div>
                  <div style={{ color: "white", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Watch how Quikcare works</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>2 minute walkthrough</div>
                </div>
                {/* Fake app preview */}
                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, opacity: 0.6 }}>
                  {["Sarah Johnson ✅", "James Okafor ⏳", "Amina Hassan ⏳"].map(name => (
                    <div key={name} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "white", textAlign: "left" }}>{name}</div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div style={{ position: "absolute", inset: -2, borderRadius: 22, background: "linear-gradient(135deg, #6C3FC5, #9b5de5)", zIndex: -1, filter: "blur(20px)", opacity: 0.4 }} />
          </div>

        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div onClick={() => setShowVideo(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a2e", borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 800, position: "relative" }}>
            <div style={{ background: "#0d0d1a", padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a4e" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ flex: 1, background: "#2a2a4e", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#9b7fd4", marginLeft: 8 }}>quikcare.co.uk</div>
            </div>
            <div style={{ padding: 40, textAlign: "center", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "white", marginBottom: 12 }}>Demo Video Coming Soon</div>
              <div style={{ color: "#9b7fd4", fontSize: 15, lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>
                Our full walkthrough video showing how agencies sign up, share their apply link and manage applications will be available soon.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: 500 }}>
                {[["1️⃣", "Agency signs up & pays"], ["2️⃣", "Gets unique apply link"], ["3️⃣", "Carers apply online"], ["4️⃣", "Agency reviews dashboard"]].map(([num, text]) => (
                  <div key={text} style={{ background: "#2a2a4e", borderRadius: 12, padding: "14px 16px", textAlign: "left" }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{num}</div>
                    <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>{text}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowVideo(false)} style={{ marginTop: 32, padding: "10px 24px", background: "#6C3FC5", border: "none", borderRadius: 999, color: "white", fontSize: 14, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ background: "white", borderTop: "1px solid #e8e0f5", borderBottom: "1px solid #e8e0f5", padding: "40px 24px" }}>
        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            {[["6", "Step application"], ["10m", "Avg completion"], ["100%", "Mobile friendly"], ["£49", "Starting price"]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: "#6C3FC5", fontWeight: 700 }}>{num}</div>
                <div style={{ color: "#9b7fd4", fontSize: 13 }}>{label}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Features */}
      <div id="features" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "#f0ebff", borderRadius: 999, padding: "6px 18px", fontSize: 12, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Features</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, color: "#1a1a2e", marginBottom: 16 }}>Everything you need</h2>
            <p style={{ color: "#6b7280", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>No more paper forms or email chains. Quikcare handles it all.</p>
          </div>
        </AnimatedSection>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {FEATURES.map((f, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="feature-card" style={{ background: "white", border: "1px solid #e8e0f5", borderRadius: 20, padding: 32, transition: "transform 0.3s ease, box-shadow 0.3s ease", cursor: "default" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#1a1a2e", marginBottom: 10 }}>{f.title}</div>
                <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>{f.sub}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ background: "#f8f5ff", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", background: "#e8e0f5", borderRadius: 999, padding: "6px 18px", fontSize: 12, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Pricing</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, color: "#1a1a2e", marginBottom: 16 }}>Simple, honest pricing</h2>
              <p style={{ color: "#6b7280", fontSize: 17 }}>No contracts. Cancel anytime.</p>
            </div>
          </AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {PLANS.map((plan, i) => <PricingCard key={i} plan={plan} index={i} />)}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{ padding: "100px 24px", maxWidth: 720, margin: "0 auto" }}>
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "#f0ebff", borderRadius: 999, padding: "6px 18px", fontSize: 12, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>FAQ</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, color: "#1a1a2e" }}>Common questions</h2>
          </div>
        </AnimatedSection>
        {FAQS.map((faq, i) => (
          <AnimatedSection key={i} delay={i * 0.05}>
            <div className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ borderBottom: "1px solid #e8e0f5", padding: "20px 16px", cursor: "pointer", borderRadius: 8, transition: "background 0.2s", marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600, fontSize: 16, color: "#1a1a2e" }}>
                {faq.q}
                <span style={{ color: "#6C3FC5", fontSize: 22, transition: "transform 0.3s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </div>
              <div style={{ overflow: "hidden", maxHeight: openFaq === i ? 200 : 0, transition: "max-height 0.4s ease", color: "#6b7280", fontSize: 14, lineHeight: 1.7, marginTop: openFaq === i ? 12 : 0 }}>
                {faq.a}
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #4a1fa8 0%, #6C3FC5 100%)", padding: "100px 24px", textAlign: "center" }}>
        <AnimatedSection>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, color: "white", marginBottom: 16 }}>Ready to get started?</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, marginBottom: 40 }}>Join care agencies across the Midlands using Quikcare.</p>
          <button onClick={() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ padding: "20px 56px", background: "white", border: "none", borderRadius: 999, color: "#6C3FC5", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.2)", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 30px rgba(0,0,0,0.2)"; }}>
            Get Started Today →
          </button>
        </AnimatedSection>
      </div>

      {/* Footer */}
      <div style={{ background: "#1a1a2e", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 16 }}>
          {["Features", "Pricing", "FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: "#9b7fd4", fontSize: 14, textDecoration: "none" }}>{item}</a>
          ))}
          <a href="mailto:hello@quikcare.co.uk" style={{ color: "#9b7fd4", fontSize: 14, textDecoration: "none" }}>Contact</a>
        </div>
        <div style={{ color: "#4b5563", fontSize: 13 }}>© {new Date().getFullYear()} Quikcare · Midlands Home Care Recruitment · quikcare.co.uk</div>
      </div>
    </div>
  );
}
