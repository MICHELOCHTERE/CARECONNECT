import React, { useState } from "react";

function go(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
}

const sections = [
  {
    id: "who",
    icon: "🏢",
    title: "Who We Are",
    content: `Quikcare is a care sector recruitment platform operated by Quikcare Ltd, registered in England and Wales. We connect care agencies with care workers seeking employment.

Contact us about data protection:
• Email: privacy@quikcare.co.uk
• Website: quikcare.co.uk
• Address: United Kingdom

We are registered with the Information Commissioner's Office (ICO) as a data controller.`
  },
  {
    id: "collect",
    icon: "📋",
    title: "What Data We Collect",
    content: `When you submit a care worker application through Quikcare, we collect:

Personal Information
• Full name, date of birth, gender, nationality, religion (optional)
• Contact details: email address, phone number, postcode
• National Insurance number
• Emergency contact details

Employment & Qualification Information
• Years of experience, care settings, client groups
• Qualifications and certifications
• Employment continuity history (10-year record)
• References (names, contact details, organisations)

Right to Work & Compliance
• Right to work status and documentation
• DBS certificate details and update service status
• Criminal conviction declarations
• Proof of address documents

Uploaded Documents
• CV / Resume
• Passport (photo page)
• Right to work documents
• Proof of address documents

Availability & Bank Details
• Availability schedule
• Bank account details (for payroll purposes, collected after successful hire only)

Technical Data
• Account email address
• Application submission date and time
• Consent timestamp`
  },
  {
    id: "why",
    icon: "🎯",
    title: "Why We Collect It",
    content: `We process your personal data for the following purposes:

Recruitment Assessment (Legitimate Interest / Contract)
To assess your suitability for care worker roles and match you with appropriate care agencies.

Legal Compliance (Legal Obligation)
To verify your right to work in the UK, conduct DBS checks, and meet safeguarding requirements under the Care Act 2014 and related legislation.

Payroll Administration (Contract)
Bank details are used solely for processing payroll payments once you are employed.

Communication (Legitimate Interest)
To send you updates about your application status and important notices.

Platform Security (Legitimate Interest)
To maintain the security and integrity of our platform.

We do NOT use your data for marketing without your explicit consent, and we do NOT sell your data to third parties.`
  },
  {
    id: "share",
    icon: "🤝",
    title: "Who We Share It With",
    content: `Your application data is shared with:

Recruiting Agency
The care agency you applied to through Quikcare will have access to your full application, including all documents you uploaded.

Firebase (Google)
We use Google Firebase to securely store your data. Firebase is GDPR-compliant and data is stored in the EU/UK. See Google's privacy policy at policies.google.com.

Stripe
If you are a paying agency customer, payment information is processed by Stripe Inc. Stripe is PCI-DSS compliant. We do not store card details.

EmailJS
Used to send application confirmation and status update emails. Only your name and email are shared.

We do NOT share your data with:
• Marketing companies
• Other recruitment agencies not involved in your application
• Any third party for commercial purposes`
  },
  {
    id: "retention",
    icon: "🕐",
    title: "How Long We Keep It",
    content: `We retain your data for the following periods:

Successful Applicants
Your data is retained for the duration of your employment plus 6 years, in accordance with employment law requirements.

Unsuccessful Applicants
Applications are retained for 6 months from the date of the decision, after which they are permanently deleted.

Incomplete Applications (Drafts)
Draft applications are retained for 30 days of inactivity, then automatically deleted.

Account Data
Your login account remains active until you request deletion.

After these periods, all personal data is permanently deleted from our systems unless we are legally required to retain it for longer.`
  },
  {
    id: "rights",
    icon: "⚖️",
    title: "Your Rights",
    content: `Under UK GDPR, you have the following rights:

Right to Access
You can request a copy of all personal data we hold about you.

Right to Erasure (Right to be Forgotten)
You can request that we delete your personal data. We will action this within 30 days. Note: we may need to retain some data to comply with legal obligations.

Right to Rectification
You can request that we correct any inaccurate data we hold about you.

Right to Restriction
You can ask us to stop processing your data in certain circumstances.

Right to Portability
You can request your data in a machine-readable format.

Right to Object
You can object to processing based on legitimate interests.

Right to Withdraw Consent
Where processing is based on consent, you can withdraw it at any time.

To exercise any of these rights, contact us at privacy@quikcare.co.uk. We will respond within 30 days. If you are not satisfied with our response, you have the right to complain to the ICO at ico.org.uk.`
  },
  {
    id: "security",
    icon: "🔒",
    title: "Security",
    content: `We take data security seriously and implement the following measures:

• All data is encrypted in transit using TLS/HTTPS
• Data is stored in Google Firebase with encryption at rest
• Access to application data is restricted to the specific agency you applied to
• Passwords are hashed and never stored in plain text
• Firebase Authentication is used for secure account management
• Regular security reviews of our platform

In the event of a data breach that affects your rights and freedoms, we will notify the ICO within 72 hours and inform affected individuals without undue delay.`
  },
  {
    id: "cookies",
    icon: "🍪",
    title: "Cookies",
    content: `Quikcare uses minimal cookies:

Essential Cookies (Always Active)
• Firebase Authentication session cookies — required for you to stay logged in
• These cannot be disabled as they are essential for the platform to function

We do NOT use:
• Marketing or advertising cookies
• Third-party tracking cookies
• Analytics cookies that identify you personally

We do not display cookie banners because we only use essential cookies that do not require consent under UK GDPR.`
  },
  {
    id: "contact",
    icon: "✉️",
    title: "Contact & Complaints",
    content: `For any data protection queries or to exercise your rights:

Email: privacy@quikcare.co.uk
Website: quikcare.co.uk

If you are not satisfied with how we handle your data or your request, you have the right to lodge a complaint with the Information Commissioner's Office (ICO):

ICO Website: ico.org.uk
ICO Helpline: 0303 123 1113
Address: Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF

This Privacy Policy was last updated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
  }
];

export default function PrivacyPolicy() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f5ff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e8e0f5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", fontFamily: "serif" }}>Q</div>
          <span style={{ color: "#6C3FC5", fontSize: 18, fontFamily: "'DM Serif Display', serif" }}>Quikcare</span>
        </div>
        <button onClick={() => go('/')} style={{ background: "none", border: "1px solid #c5b3e8", borderRadius: 8, padding: "8px 16px", color: "#6C3FC5", fontSize: 13, cursor: "pointer" }}>← Back to Home</button>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #6C3FC5 0%, #4a2a8a 100%)", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "white", marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          We are committed to protecting your personal data and being transparent about how we use it.
        </p>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 20px", marginTop: 20, color: "white", fontSize: 13 }}>
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* ICO Notice */}
      <div style={{ maxWidth: 800, margin: "32px auto 0", padding: "0 24px" }}>
        <div style={{ background: "#e8f5eb", border: "1px solid #a3d9b1", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>✅</div>
          <div>
            <div style={{ fontWeight: 700, color: "#1a7a3a", fontSize: 14, marginBottom: 4 }}>ICO Registered Data Controller</div>
            <div style={{ color: "#1a7a3a", fontSize: 13, lineHeight: 1.6 }}>Quikcare is registered with the Information Commissioner's Office (ICO) as a data controller under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 800, margin: "32px auto 60px", padding: "0 24px" }}>
        {sections.map((section) => (
          <div key={section.id} style={{ background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <button
              onClick={() => setActive(active === section.id ? null : section.id)}
              style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 24 }}>{section.icon}</span>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#1a1a2e" }}>{section.title}</span>
              </div>
              <span style={{ color: "#6C3FC5", fontSize: 20, fontWeight: 300, transform: active === section.id ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
            </button>
            {active === section.id && (
              <div style={{ padding: "0 24px 24px 62px", borderTop: "1px solid #f0ebff" }}>
                {section.content.split('\n\n').map((para, i) => (
                  <div key={i} style={{ marginTop: 16 }}>
                    {para.split('\n').map((line, j) => (
                      <div key={j} style={{
                        fontSize: 14,
                        color: line.startsWith('•') ? "#1a1a2e" : line.match(/^[A-Z].*[^•]$/) && !line.startsWith('•') && line.length < 60 ? "#6C3FC5" : "#4a4a6a",
                        fontWeight: line.match(/^[A-Z].*[^•]$/) && !line.startsWith('•') && line.length < 60 && j > 0 ? 600 : 400,
                        marginTop: j === 0 ? 0 : 4,
                        lineHeight: 1.7,
                        paddingLeft: line.startsWith('•') ? 8 : 0,
                      }}>
                        {line}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 40, padding: "24px", background: "#ffffff", borderRadius: 12, border: "1px solid #e8e0f5" }}>
          <div style={{ fontSize: 13, color: "#9b7fd4", lineHeight: 1.8 }}>
            Questions about this policy? Contact us at{" "}
            <a href="mailto:privacy@quikcare.co.uk" style={{ color: "#6C3FC5" }}>privacy@quikcare.co.uk</a>
            <br />
            To make a complaint to the ICO: <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{ color: "#6C3FC5" }}>ico.org.uk</a>
          </div>
        </div>
      </div>
    </div>
  );
}
