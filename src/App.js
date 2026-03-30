import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const steps = [
  { id: 1, label: "Personal Details", icon: "👤" },
  { id: 2, label: "Experience", icon: "💼" },
  { id: 3, label: "Right to Work", icon: "📋" },
  { id: 4, label: "DBS Check", icon: "🔒" },
  { id: 5, label: "References", icon: "⭐" },
];

const s = {
  app: { minHeight: "100vh", background: "#071510", color: "#e8f5f0", fontFamily: "'DM Sans', sans-serif" },
  header: { borderBottom: "1px solid #1a3a2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: "50%", background: "#4ecba0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText: { color: "#4ecba0", fontSize: 20, fontFamily: "'DM Serif Display', serif" },
  headerSub: { color: "#4a7a6a", fontSize: 12 },
  container: { maxWidth: 560, margin: "0 auto", padding: "32px 16px 120px" },
  stepRow: { display: "flex", justifyContent: "space-between", marginBottom: 12 },
  stepBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" },
  stepCircleActive: { width: 36, height: 36, borderRadius: "50%", background: "#4ecba0", border: "2px solid #4ecba0", color: "#071510", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold" },
  stepCircleDone: { width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "2px solid #4ecba0", color: "#4ecba0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  stepCircleInactive: { width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "2px solid #2a4a3e", color: "#4a7a6a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  progressBar: { height: 4, background: "#1a3a2e", borderRadius: 4, overflow: "hidden", marginBottom: 32 },
  progressFill: (pct) => ({ height: "100%", background: "#4ecba0", borderRadius: 4, width: `${pct}%`, transition: "width 0.4s ease" }),
  card: { background: "#0d1f1a", border: "1px solid #1a3a2e", borderRadius: 16, padding: 24, marginBottom: 24 },
  cardTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#e8f5f0", marginBottom: 4 },
  cardSub: { color: "#4a7a6a", fontSize: 13, marginBottom: 24 },
  field: { marginBottom: 20 },
  label: { display: "block", color: "#a0c8b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  input: { width: "100%", background: "#071510", border: "1px solid #2a4a3e", borderRadius: 8, padding: "12px 16px", color: "#e8f5f0", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#071510", border: "1px solid #2a4a3e", borderRadius: 8, padding: "12px 16px", color: "#e8f5f0", fontSize: 14, outline: "none", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  pillActive: { padding: "8px 16px", borderRadius: 999, border: "1px solid #4ecba0", background: "#4ecba0", color: "#071510", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  pillInactive: { padding: "8px 16px", borderRadius: 999, border: "1px solid #2a4a3e", background: "transparent", color: "#a0c8b8", fontSize: 13, cursor: "pointer" },
  infoBox: { background: "#0d2a22", border: "1px solid #2a4a3e", borderRadius: 12, padding: 16, fontSize: 13, color: "#a0c8b8", lineHeight: 1.6 },
  infoTitle: { color: "#4ecba0", fontWeight: 600, marginBottom: 4 },
  refBox: { border: "1px solid #2a4a3e", borderRadius: 12, padding: 16, marginBottom: 16 },
  refLabel: { color: "#4ecba0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 },
  navRow: { display: "flex", justifyContent: "space-between", marginTop: 8 },
  btnBack: { padding: "12px 24px", border: "1px solid #2a4a3e", borderRadius: 999, color: "#a0c8b8", background: "none", fontSize: 14, cursor: "pointer" },
  btnNext: { padding: "12px 32px", background: "#4ecba0", border: "none", borderRadius: 999, color: "#071510", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  successWrap: { minHeight: "100vh", background: "#071510", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  successInner: { textAlign: "center", maxWidth: 400 },
  successIcon: { fontSize: 64, marginBottom: 24 },
  successTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#4ecba0", marginBottom: 16 },
  successText: { color: "#a0c8b8", lineHeight: 1.7, marginBottom: 32 },
  successGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 },
  successCard: { background: "#0d1f1a", border: "1px solid #2a4a3e", borderRadius: 12, padding: 12, fontSize: 11, color: "#4ecba0", fontWeight: 600, textTransform: "uppercase" },
  resetBtn: { padding: "10px 24px", border: "1px solid #2a4a3e", borderRadius: 999, color: "#a0c8b8", background: "none", fontSize: 13, cursor: "pointer" },
};

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={s.pillRow}>
      {options.map((opt) => (
        <button key={opt} style={value === opt ? s.pillActive : s.pillInactive} onClick={() => onChange(opt)}>{opt}</button>
      ))}
    </div>
  );
}

function CheckboxGroup({ options, values, onChange }) {
  const toggle = (opt) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };
  return (
    <div style={s.pillRow}>
      {options.map((opt) => (
        <button key={opt} style={values.includes(opt) ? s.pillActive : s.pillInactive} onClick={() => toggle(opt)}>{opt}</button>
      ))}
    </div>
  );
}

function Step1({ data, set }) {
  return (
    <div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>First Name</label><input style={s.input} placeholder="Jane" value={data.firstName} onChange={e => set({ ...data, firstName: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Last Name</label><input style={s.input} placeholder="Smith" value={data.lastName} onChange={e => set({ ...data, lastName: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Email Address</label><input style={s.input} type="email" placeholder="jane@example.com" value={data.email} onChange={e => set({ ...data, email: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Phone Number</label><input style={s.input} type="tel" placeholder="07700 900000" value={data.phone} onChange={e => set({ ...data, phone: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Date of Birth</label><input style={s.input} type="date" value={data.dob} onChange={e => set({ ...data, dob: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Postcode</label><input style={s.input} placeholder="SW1A 1AA" value={data.postcode} onChange={e => set({ ...data, postcode: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Do you hold a valid driving licence?</label><RadioGroup options={["Yes", "No"]} value={data.driving} onChange={v => set({ ...data, driving: v })} /></div>
    </div>
  );
}

function Step2({ data, set }) {
  return (
    <div>
      <div style={s.field}>
        <label style={s.label}>Years of Care Experience</label>
        <select style={s.select} value={data.years} onChange={e => set({ ...data, years: e.target.value })}>
          <option value="">Select...</option>
          <option>None — I'm new to care</option>
          <option>Less than 1 year</option>
          <option>1–2 years</option>
          <option>3–5 years</option>
          <option>5+ years</option>
        </select>
      </div>
      <div style={s.field}><label style={s.label}>Care Settings</label><CheckboxGroup options={["Domiciliary / Home Care", "Residential Care Home", "Supported Living", "Live-in Care", "NHS / Hospital"]} values={data.settings} onChange={v => set({ ...data, settings: v })} /></div>
      <div style={s.field}><label style={s.label}>Client Groups</label><CheckboxGroup options={["Elderly", "Dementia / Alzheimer's", "Physical Disabilities", "Learning Disabilities", "Mental Health", "End of Life"]} values={data.clients} onChange={v => set({ ...data, clients: v })} /></div>
      <div style={s.field}><label style={s.label}>Qualifications</label><CheckboxGroup options={["No formal qualifications", "Care Certificate", "NVQ Level 2", "NVQ Level 3", "First Aid", "Manual Handling"]} values={data.quals} onChange={v => set({ ...data, quals: v })} /></div>
      <div style={s.field}><label style={s.label}>Preferred Hours</label><CheckboxGroup options={["Days", "Evenings", "Nights", "Weekends", "Flexible"]} values={data.hours} onChange={v => set({ ...data, hours: v })} /></div>
    </div>
  );
}

function Step3({ data, set }) {
  return (
    <div>
      <div style={s.field}><label style={s.label}>Do you have the right to work in the UK?</label><RadioGroup options={["Yes", "No", "Not sure"]} value={data.rightToWork} onChange={v => set({ ...data, rightToWork: v })} /></div>
      {data.rightToWork === "Yes" && (
        <div style={s.field}>
          <label style={s.label}>Right to work status</label>
          <select style={s.select} value={data.rtwStatus} onChange={e => set({ ...data, rtwStatus: e.target.value })}>
            <option value="">Select...</option>
            <option>British / Irish Citizen</option>
            <option>EU Settled Status</option>
            <option>EU Pre-Settled Status</option>
            <option>Skilled Worker Visa</option>
            <option>Other valid visa</option>
          </select>
        </div>
      )}
      <div style={s.field}><label style={s.label}>Documents you can provide</label><CheckboxGroup options={["Passport", "Birth Certificate", "National ID Card", "Biometric Residence Permit", "Share Code"]} values={data.docs} onChange={v => set({ ...data, docs: v })} /></div>
      <div style={s.infoBox}><div style={s.infoTitle}>📌 Right to Work Check</div>We are legally required to verify your right to work in the UK before you begin employment.</div>
    </div>
  );
}

function Step4({ data, set }) {
  return (
    <div>
      <div style={s.field}><label style={s.label}>Do you have an existing DBS certificate?</label><RadioGroup options={["Yes — Enhanced", "Yes — Basic", "No"]} value={data.hasDbs} onChange={v => set({ ...data, hasDbs: v })} /></div>
      {data.hasDbs?.startsWith("Yes") && (
        <>
          <div style={s.field}><label style={s.label}>DBS Issue Date</label><input style={s.input} type="date" value={data.dbsDate} onChange={e => set({ ...data, dbsDate: e.target.value })} /></div>
          <div style={s.field}><label style={s.label}>Are you on the DBS Update Service?</label><RadioGroup options={["Yes", "No"]} value={data.updateService} onChange={v => set({ ...data, updateService: v })} /></div>
        </>
      )}
      <div style={s.field}><label style={s.label}>Have you ever been convicted of a criminal offence?</label><RadioGroup options={["No", "Yes — declared"]} value={data.conviction} onChange={v => set({ ...data, conviction: v })} /></div>
      <div style={s.infoBox}><div style={s.infoTitle}>🔒 DBS Requirements</div>Working in home care requires an Enhanced DBS check. If you do not already hold one, we will arrange this for you.</div>
    </div>
  );
}

function Step5({ data, set }) {
  const updateRef = (idx, field, value) => {
    const refs = [...data.refs];
    refs[idx] = { ...refs[idx], [field]: value };
    set({ ...data, refs });
  };
  return (
    <div>
      <p style={{ color: "#a0c8b8", fontSize: 13, marginBottom: 20 }}>We require two professional references. At least one must be from a care or health setting.</p>
      {[0, 1].map((i) => (
        <div key={i} style={s.refBox}>
          <div style={s.refLabel}>Reference {i + 1}</div>
          <div style={s.grid2}>
            <div style={s.field}><label style={s.label}>Full Name</label><input style={s.input} placeholder="John Doe" value={data.refs[i]?.name || ""} onChange={e => updateRef(i, "name", e.target.value)} /></div>
            <div style={s.field}><label style={s.label}>Job Title</label><input style={s.input} placeholder="Care Manager" value={data.refs[i]?.title || ""} onChange={e => updateRef(i, "title", e.target.value)} /></div>
          </div>
          <div style={s.field}><label style={s.label}>Organisation</label><input style={s.input} placeholder="Sunrise Care Ltd" value={data.refs[i]?.org || ""} onChange={e => updateRef(i, "org", e.target.value)} /></div>
          <div style={s.field}><label style={s.label}>Email</label><input style={s.input} type="email" placeholder="john@company.com" value={data.refs[i]?.email || ""} onChange={e => updateRef(i, "email", e.target.value)} /></div>
          <div style={s.field}>
            <label style={s.label}>Relationship</label>
            <select style={s.select} value={data.refs[i]?.relation || ""} onChange={e => updateRef(i, "relation", e.target.value)}>
              <option value="">Select...</option>
              <option>Line Manager</option>
              <option>Senior Colleague</option>
              <option>Mentor / Supervisor</option>
              <option>Professional Contact</option>
            </select>
          </div>
        </div>
      ))}
      <div style={{ ...s.infoBox, border: "1px solid #4ecba0" }}>
        <div style={s.infoTitle}>✅ Almost there!</div>
        By submitting, you confirm all information is accurate and consent to background checks.
      </div>
    </div>
  );
}

export default function App() {
  const [current, setCurrent] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [p1, setP1] = useState({ firstName: "", lastName: "", email: "", phone: "", dob: "", postcode: "", driving: "" });
  const [p2, setP2] = useState({ years: "", settings: [], clients: [], quals: [], hours: [] });
  const [p3, setP3] = useState({ rightToWork: "", rtwStatus: "", docs: [] });
  const [p4, setP4] = useState({ hasDbs: "", dbsDate: "", updateService: "", conviction: "" });
  const [p5, setP5] = useState({ refs: [{}, {}] });

  const progress = ((current - 1) / (steps.length - 1)) * 100;


  const validate = (step) => {
    const errs = [];
    if (step === 1) {
      if (!p1.firstName.trim()) errs.push("First name is required");
      if (!p1.lastName.trim()) errs.push("Last name is required");
      if (!p1.email.trim()) errs.push("Email address is required");
      if (!p1.phone.trim()) errs.push("Phone number is required");
      if (!p1.dob) errs.push("Date of birth is required");
      if (!p1.postcode.trim()) errs.push("Postcode is required");
      if (!p1.driving) errs.push("Please confirm if you hold a driving licence");
    }
    if (step === 2) {
      if (!p2.years) errs.push("Please select your years of experience");
      if (p2.settings.length === 0) errs.push("Please select at least one care setting");
      if (p2.clients.length === 0) errs.push("Please select at least one client group");
      if (p2.quals.length === 0) errs.push("Please select your qualifications");
      if (p2.hours.length === 0) errs.push("Please select your preferred hours");
    }
    if (step === 3) {
      if (!p3.rightToWork) errs.push("Please confirm your right to work status");
      if (p3.docs.length === 0) errs.push("Please select at least one document you can provide");
    }
    if (step === 4) {
      if (!p4.hasDbs) errs.push("Please confirm your DBS certificate status");
      if (!p4.conviction) errs.push("Please answer the convictions question");
    }
    if (step === 5) {
      if (!p5.refs[0]?.name?.trim()) errs.push("Reference 1: Full name is required");
      if (!p5.refs[0]?.email?.trim()) errs.push("Reference 1: Email is required");
      if (!p5.refs[1]?.name?.trim()) errs.push("Reference 2: Full name is required");
      if (!p5.refs[1]?.email?.trim()) errs.push("Reference 2: Email is required");
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validate(current);
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    if (current === steps.length) handleSubmit();
    else setCurrent(current + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        ...p1, ...p2, ...p3, ...p4,
        refs: p5.refs,
        status: "pending",
        appliedAt: new Date().toISOString().split("T")[0],
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div style={s.successWrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={s.successInner}>
          <div style={s.successIcon}>🌿</div>
          <h1 style={s.successTitle}>Application Received</h1>
          <p style={s.successText}>Thank you, {p1.firstName || "there"}! We've received your application and will be in touch within 2 working days.</p>
          <div style={s.successGrid}>
            {["Interview Booked", "DBS Verified", "Start Date Set"].map((label, i) => (
              <div key={i} style={s.successCard}>{label}</div>
            ))}
          </div>
          <button style={s.resetBtn} onClick={() => { setSubmitted(false); setCurrent(1); }}>Start New Application</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🌿</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <span style={s.headerSub}>Carer Onboarding</span>
      </div>

      <div style={s.container}>
        <div style={s.stepRow}>
          {steps.map((step) => (
            <button key={step.id} style={s.stepBtn} onClick={() => step.id < current && setCurrent(step.id)}>
              <div style={step.id === current ? s.stepCircleActive : step.id < current ? s.stepCircleDone : s.stepCircleInactive}>
                {step.id < current ? "✓" : step.icon}
              </div>
            </button>
          ))}
        </div>
        <div style={s.progressBar}><div style={s.progressFill(progress)} /></div>


        {errors.length > 0 && (
          <div style={{ background: "#3a1010", border: "1px solid #6a2a2a", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ color: "#e07070", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>⚠️ Please complete the following:</div>
            {errors.map((e, i) => <div key={i} style={{ color: "#e07070", fontSize: 13, marginTop: 4 }}>• {e}</div>)}
          </div>
        )}
        <div style={s.card}>
          <h2 style={s.cardTitle}>{steps[current - 1].label}</h2>
          <p style={s.cardSub}>Step {current} of {steps.length}</p>
          {current === 1 && <Step1 data={p1} set={setP1} />}
          {current === 2 && <Step2 data={p2} set={setP2} />}
          {current === 3 && <Step3 data={p3} set={setP3} />}
          {current === 4 && <Step4 data={p4} set={setP4} />}
          {current === 5 && <Step5 data={p5} set={setP5} />}
        </div>

        <div style={s.navRow}>
          <button style={{ ...s.btnBack, opacity: current === 1 ? 0.3 : 1 }} disabled={current === 1} onClick={() => setCurrent(current - 1)}>← Back</button>
          <button style={{ ...s.btnNext, opacity: submitting ? 0.6 : 1 }} disabled={submitting}
            onClick={handleNext}>
            {current === steps.length ? (submitting ? "Submitting..." : "Submit Application →") : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
