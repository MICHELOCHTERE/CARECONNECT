import React, { useState, useEffect, useRef } from "react";
import { db, storage } from "./firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CARE_SETTINGS = ["Residential Care Home","Nursing Home","Domiciliary / Home Care","Supported Living","Day Care Centre","Respite Care","Hospital / Clinical Setting","Mental Health Setting","Learning Disabilities Setting","Palliative / End of Life Care","Rehabilitation Unit","Community Care"];
const CLIENT_GROUPS = ["Older Adults (65+)","Adults with Physical Disabilities","Adults with Learning Disabilities","Adults with Mental Health Conditions","Adults with Dementia / Alzheimer's","Children & Young People","Adults with Autism","Adults with Acquired Brain Injury","Adults with Sensory Impairments","Individuals with Substance Misuse Issues","Individuals with Complex Needs","End of Life / Palliative Clients"];
const QUALIFICATIONS = ["QCF/NVQ Level 2 in Health & Social Care","QCF/NVQ Level 3 in Health & Social Care","QCF/NVQ Level 4 in Health & Social Care","QCF/NVQ Level 5 in Health & Social Care (Management)","Care Certificate","First Aid (Basic)","First Aid at Work (3-day)","Paediatric First Aid","Manual Handling","Medication Administration","Safeguarding Adults (Level 1)","Safeguarding Adults (Level 2)","Safeguarding Children","Dementia Awareness","Mental Health Awareness","Autism Awareness","Epilepsy Awareness","Diabetes Awareness","Infection Control","Food Hygiene / Handling","Moving & Handling (People)","Positive Behaviour Support (PBS)","Mental Capacity Act (MCA) Training","Deprivation of Liberty Safeguards (DoLS)","COSHH Awareness","Fire Safety","Health & Safety","GDPR / Data Protection","End of Life Care","Palliative Care","No formal qualifications"];
const RTW_DOCS = ["UK/Irish Passport","UK Birth Certificate + NI Number","BRP (Biometric Residence Permit)","Share Code (Right to Work)","Certificate of Naturalisation","EU Settlement Scheme Status","Other Government-Issued ID"];
const GENDERS = ["Male","Female","Non-binary","Prefer not to say","Other"];
const NATIONALITIES = ["British","Irish","Afghan","Albanian","Algerian","American","Angolan","Argentine","Armenian","Australian","Austrian","Azerbaijani","Bangladeshi","Belgian","Bolivian","Bosnian","Brazilian","Bulgarian","Cambodian","Cameroonian","Canadian","Chilean","Chinese","Colombian","Congolese","Croatian","Cuban","Czech","Danish","Dominican","Dutch","Ecuadorian","Egyptian","Eritrean","Estonian","Ethiopian","Filipino","Finnish","French","Gambian","Georgian","German","Ghanaian","Greek","Guatemalan","Guinean","Haitian","Honduran","Hungarian","Indian","Indonesian","Iraqi","Iranian","Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakh","Kenyan","Korean","Kosovan","Kurdish","Laotian","Latvian","Lebanese","Liberian","Libyan","Lithuanian","Macedonian","Malagasy","Malawian","Malaysian","Malian","Maltese","Mauritanian","Mexican","Moldovan","Moroccan","Mozambican","Namibian","Nepali","New Zealander","Nigerian","Norwegian","Pakistani","Palestinian","Panamanian","Peruvian","Polish","Portuguese","Romanian","Russian","Rwandan","Saudi Arabian","Senegalese","Serbian","Sierra Leonean","Singaporean","Slovak","Slovenian","Somali","South African","South Sudanese","Spanish","Sri Lankan","Sudanese","Swedish","Swiss","Syrian","Taiwanese","Tanzanian","Thai","Togolese","Tunisian","Turkish","Ugandan","Ukrainian","Uruguayan","Uzbek","Venezuelan","Vietnamese","Yemeni","Zambian","Zimbabwean","Other"];
const RELIGIONS = ["Prefer not to say","Christian","Muslim","Hindu","Sikh","Buddhist","Jewish","No religion","Other"];
const RTW_OPTIONS = ["British or Irish Citizen","EU Settled Status","EU Pre-Settled Status","Indefinite Leave to Remain","Limited Leave to Remain (with right to work)","Student Visa (with work permission)","Skilled Worker Visa","Other visa with right to work"];

const s = {
  wrap: { minHeight: "100vh", background: "#f8f5ff", fontFamily: "'DM Sans', sans-serif" },
  header: { background: "#fff", borderBottom: "1px solid #e8e0f5", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", fontFamily: "serif" },
  logoText: { color: "#6C3FC5", fontSize: 18, fontFamily: "'DM Serif Display', serif" },
  progress: { padding: "20px 24px 0" },
  bar: { height: 6, background: "#e8e0f5", borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", background: "linear-gradient(90deg, #6C3FC5, #9b7fd4)", borderRadius: 3, transition: "width 0.4s" },
  stepLabel: { fontSize: 12, color: "#9b7fd4", marginBottom: 8 },
  form: { maxWidth: 720, margin: "24px auto 60px", padding: "0 24px" },
  card: { background: "#fff", border: "1px solid #e8e0f5", borderRadius: 16, padding: "32px 36px", marginBottom: 16 },
  sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1a1a2e", marginBottom: 4 },
  sectionSub: { color: "#9b7fd4", fontSize: 13, marginBottom: 28 },
  field: { marginBottom: 18 },
  label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 },
  input: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "11px 14px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "11px 14px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", appearance: "none" },
  textarea: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "11px 14px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 80 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  tagGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 },
  tag: { padding: "6px 14px", borderRadius: 20, border: "1px solid #c5b3e8", background: "#f8f5ff", color: "#6C3FC5", fontSize: 13, cursor: "pointer", userSelect: "none" },
  tagActive: { padding: "6px 14px", borderRadius: 20, border: "1px solid #6C3FC5", background: "#6C3FC5", color: "#fff", fontSize: 13, cursor: "pointer", userSelect: "none" },
  btn: { padding: "13px 32px", background: "#6C3FC5", border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnOut: { padding: "13px 32px", background: "transparent", border: "1px solid #c5b3e8", borderRadius: 8, color: "#6C3FC5", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  error: { color: "#cc0000", fontSize: 13, background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 8, padding: "10px 14px", marginBottom: 16 },
  success: { color: "#1a7a3a", fontSize: 13, background: "#e8f5eb", border: "1px solid #a3d9b1", borderRadius: 8, padding: "12px 16px", marginBottom: 16 },
  uploadBox: { border: "2px dashed #c5b3e8", borderRadius: 10, padding: "20px", textAlign: "center", background: "#f8f5ff", cursor: "pointer", marginTop: 6 },
  uploadDone: { border: "2px solid #a3d9b1", borderRadius: 10, padding: "12px 16px", background: "#e8f5eb", display: "flex", alignItems: "center", gap: 10, marginTop: 6 },
  radio: { display: "flex", gap: 24, marginTop: 6, flexWrap: "wrap" },
  radioLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#1a1a2e", cursor: "pointer" },
  divider: { borderTop: "1px solid #f0ebff", margin: "24px 0" },
  empBlock: { background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 10, padding: 20, marginBottom: 12 },
  addBtn: { display: "flex", alignItems: "center", gap: 8, color: "#6C3FC5", background: "none", border: "1px dashed #c5b3e8", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", width: "100%", justifyContent: "center", marginTop: 8 },
};

function TagSelect({ options, value, onChange, max }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else if (!max || value.length < max) onChange([...value, opt]);
  };
  return (
    <div style={s.tagGrid}>
      {options.map(opt => (
        <span key={opt} style={value.includes(opt) ? s.tagActive : s.tag} onClick={() => toggle(opt)}>{opt}</span>
      ))}
    </div>
  );
}

function UploadField({ label, required, file, url, onFile, accept = "image/*,.pdf,.doc,.docx", hint }) {
  const inputRef = useRef();
  return (
    <div style={s.field}>
      <label style={s.label}>{label}{required && <span style={{ color: "#cc0000" }}> *</span>}</label>
      {hint && <div style={{ fontSize: 12, color: "#9b7fd4", marginBottom: 4 }}>{hint}</div>}
      {url || file ? (
        <div style={s.uploadDone}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ fontSize: 13, color: "#1a7a3a" }}>{file ? file.name : "Uploaded"}</span>
          <button onClick={() => { onFile(null); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 12 }}>Remove</button>
        </div>
      ) : (
        <div style={s.uploadBox} onClick={() => inputRef.current.click()}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 13, color: "#6C3FC5", fontWeight: 600 }}>Click to upload</div>
          <div style={{ fontSize: 11, color: "#9b7fd4", marginTop: 4 }}>PDF, Word, Image accepted</div>
          <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => onFile(e.target.files[0] || null)} />
        </div>
      )}
    </div>
  );
}

function EmpBlock({ emp, idx, onChange, onRemove }) {
  const u = (field, val) => onChange({ ...emp, [field]: val });
  return (
    <div style={s.empBlock}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 600, color: "#6C3FC5", fontSize: 14 }}>Employment {idx + 1}</span>
        {idx > 0 && <button onClick={onRemove} style={{ background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 12 }}>Remove</button>}
      </div>
      <div style={s.row}>
        <div style={s.field}><label style={s.label}>Employer Name</label><input style={s.input} value={emp.employer || ""} onChange={e => u("employer", e.target.value)} placeholder="Company / organisation name" /></div>
        <div style={s.field}><label style={s.label}>Job Title</label><input style={s.input} value={emp.jobTitle || ""} onChange={e => u("jobTitle", e.target.value)} placeholder="Your role" /></div>
      </div>
      <div style={s.row}>
        <div style={s.field}><label style={s.label}>Date From</label><input style={s.input} type="month" value={emp.from || ""} onChange={e => u("from", e.target.value)} /></div>
        <div style={s.field}><label style={s.label}>Date To</label><input style={s.input} type="month" value={emp.to || ""} onChange={e => u("to", e.target.value)} placeholder="Leave blank if current" /></div>
      </div>
      <div style={s.field}><label style={s.label}>Reason for Leaving</label><input style={s.input} value={emp.leaving || ""} onChange={e => u("leaving", e.target.value)} placeholder="Redundancy / Career change / etc." /></div>
      <div style={s.field}><label style={s.label}>Duties & Responsibilities</label><textarea style={s.textarea} value={emp.duties || ""} onChange={e => u("duties", e.target.value)} placeholder="Brief description of duties" /></div>
      <div style={s.field}>
        <label style={s.label}>Any gaps in employment since leaving? If yes, explain</label>
        <textarea style={s.textarea} value={emp.gaps || ""} onChange={e => u("gaps", e.target.value)} rows={2} />
      </div>
    </div>
  );
}

function RefBlock({ ref: refData, idx, onChange, onRemove }) {
  const u = (field, val) => onChange({ ...refData, [field]: val });
  return (
    <div style={s.empBlock}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 600, color: "#6C3FC5", fontSize: 14 }}>Reference {idx + 1}{idx === 0 ? " (Most Recent Employer)" : ""}</span>
        {idx > 1 && <button onClick={onRemove} style={{ background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 12 }}>Remove</button>}
      </div>
      <div style={s.row}>
        <div style={s.field}><label style={s.label}>Referee Full Name</label><input style={s.input} value={refData.name || ""} onChange={e => u("name", e.target.value)} /></div>
        <div style={s.field}><label style={s.label}>Position / Job Title</label><input style={s.input} value={refData.position || ""} onChange={e => u("position", e.target.value)} /></div>
      </div>
      <div style={s.row}>
        <div style={s.field}><label style={s.label}>Organisation</label><input style={s.input} value={refData.org || ""} onChange={e => u("org", e.target.value)} /></div>
        <div style={s.field}><label style={s.label}>Relationship to You</label><input style={s.input} value={refData.relationship || ""} onChange={e => u("relationship", e.target.value)} placeholder="e.g. Line Manager" /></div>
      </div>
      <div style={s.row}>
        <div style={s.field}><label style={s.label}>Email Address</label><input style={s.input} type="email" value={refData.email || ""} onChange={e => u("email", e.target.value)} /></div>
        <div style={s.field}><label style={s.label}>Phone Number</label><input style={s.input} type="tel" value={refData.phone || ""} onChange={e => u("phone", e.target.value)} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Address</label><textarea style={{ ...s.textarea, minHeight: 56 }} value={refData.address || ""} onChange={e => u("address", e.target.value)} rows={2} /></div>
    </div>
  );
}

export default function App({ user, agencySlug, onLogout }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [, setExistingApp] = useState(null);
  const [agencyName, setAgencyName] = useState("");
  const [postcodeQuery, setPostcodeQuery] = useState("");
  const [addressList, setAddressList] = useState([]);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeError, setPostcodeError] = useState("");

  // Step 1 - Personal Details
  const [p1, setP1] = useState({ firstName: "", middleName: "", lastName: "", dob: "", gender: "", nationality: "", religion: "", email: "", phone: "", address1: "", address2: "", city: "", county: "", postcode: "", emergency1Name: "", emergency1Rel: "", emergency1Phone: "", emergency2Name: "", emergency2Rel: "", emergency2Phone: "" });
  // Step 2 - Equal Opportunities
  const [p2, setP2] = useState({ ethnicity: "", disability: "", disabilityDetails: "" });
  // Step 3 - Education & Training
  const [p3, setP3] = useState({ qualifications: [], courses: "", firstAidExpiry: "", memberships: "" });
  // Step 4 - Employment History
  const [p4, setP4] = useState([{ employer: "", jobTitle: "", from: "", to: "", leaving: "", duties: "", gaps: "" }]);
  // Step 5 - Experience & Care Standards
  const [p5, setP5] = useState({ careSettings: [], clientGroups: [], experience: "", whyCare: "", strengths: "", challenging: "", safeguarding: "" });
  // Step 6 - Health & Interview
  const [p6, setP6] = useState({ healthConditions: "", adjustments: "", transport: "", availableStart: "", interviewAvail: "" });
  // Step 7 - Right to Work & Documents
  const [p7, setP7] = useState({ rtwStatus: "", rtwDocs: [], shareCode: "", visaExpiry: "", niNumber: "" });
  const [f7cv, setF7cv] = useState(null);
  const [f7passport, setF7passport] = useState(null);
  const [f7rtw, setF7rtw] = useState(null);
  const [f7poa1, setF7poa1] = useState(null);
  const [f7poa2, setF7poa2] = useState(null);
  const [f7poa1Type, setF7poa1Type] = useState("");
  const [f7poa2Type, setF7poa2Type] = useState("");
  // Step 8 - DBS & Criminal
  const [p8, setP8] = useState({ dbsType: "", dbsNumber: "", dbsDate: "", dbsUpdateService: "", updateServiceNumber: "", convictions: "", convictionDetails: "" });
  const [f8dbs, setF8dbs] = useState(null);
  // Step 9 - References
  const [p9, setP9] = useState([{ name: "", position: "", org: "", relationship: "", email: "", phone: "", address: "" }, { name: "", position: "", org: "", relationship: "", email: "", phone: "", address: "" }]);
  // Step 10 - Bank Details
  const [p10, setP10] = useState({ bankName: "", accountName: "", sortCode: "", accountNumber: "" });
  // Step 11 - Declaration
  const [p11, setP11] = useState({ agreed: false, signature: "", signDate: "" });

  // Uploaded URLs (from previous partial saves)
  const [urls, setUrls] = useState({});

  const TOTAL_STEPS = 11;

  useEffect(() => {
    if (!agencySlug) return;
    (async () => {
      try {
        const agDoc = await getDoc(doc(db, "agencies", agencySlug));
        if (!agDoc.exists()) {
          // try by slug field
        }
        const snap = await getDoc(doc(db, "agencies", agencySlug));
        if (snap.exists()) setAgencyName(snap.data().agencyName || snap.data().name || "");
      } catch (e) {}
    })();
  }, [agencySlug]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const appDoc = await getDoc(doc(db, "applications", user.uid + "_" + agencySlug));
        if (appDoc.exists()) {
          const d = appDoc.data();
          if (d.status === "submitted" || d.status === "approved") {
            setSubmitted(true);
            setExistingApp(d);
          } else {
            // Restore draft
            if (d.p1) setP1(d.p1);
            if (d.p2) setP2(d.p2);
            if (d.p3) setP3(d.p3);
            if (d.p4) setP4(d.p4);
            if (d.p5) setP5(d.p5);
            if (d.p6) setP6(d.p6);
            if (d.p7) setP7(d.p7);
            if (d.p8) setP8(d.p8);
            if (d.p9) setP9(d.p9);
            if (d.p10) setP10(d.p10);
            if (d.urls) setUrls(d.urls);
            if (d.step) setStep(d.step);
            setExistingApp(d);
          }
        }
      } catch (e) {}
    })();
  }, [user, agencySlug]);

  const saveDraft = async (stepData = {}) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "applications", user.uid + "_" + agencySlug), {
        userId: user.uid,
        agencySlug,
        status: "draft",
        step,
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
        urls,
        updatedAt: serverTimestamp(),
        ...stepData,
      }, { merge: true });
    } catch (e) {}
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const r = ref(storage, path);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  };

  const handleFileP8 = (file) => setF8dbs(file);

  const u1 = (f, v) => setP1(prev => ({ ...prev, [f]: v }));
  const u2 = (f, v) => setP2(prev => ({ ...prev, [f]: v }));
  const u3 = (f, v) => setP3(prev => ({ ...prev, [f]: v }));
  const u5 = (f, v) => setP5(prev => ({ ...prev, [f]: v }));
  const u6 = (f, v) => setP6(prev => ({ ...prev, [f]: v }));
  const u7 = (f, v) => setP7(prev => ({ ...prev, [f]: v }));
  const u8 = (f, v) => setP8(prev => ({ ...prev, [f]: v }));
  const u10 = (f, v) => setP10(prev => ({ ...prev, [f]: v }));
  const u11 = (f, v) => setP11(prev => ({ ...prev, [f]: v }));

  const lookupPostcode = async () => {
    const raw = postcodeQuery.trim().toUpperCase().replace(/\s+/g, "");
    const pc = raw.length > 3 ? raw.slice(0, raw.length - 3) + " " + raw.slice(-3) : raw;
    if (!pc) return;
    setPostcodeLoading(true);
    setPostcodeError("");
    setAddressList([]);
    try {
      const url = `/api/postcode?postcode=${encodeURIComponent(pc)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) setPostcodeError("Postcode not found. Please check and try again.");
        else setPostcodeError("Lookup failed. Please enter your address manually.");
        setPostcodeLoading(false);
        return;
      }
      const data = await res.json();
      u1("city", data.city || data.district || "");
      u1("county", data.county || "");
      u1("postcode", data.postcode || pc);
      setPostcodeQuery(data.postcode || pc);
      setPostcodeError("");
    } catch (e) {
      setPostcodeError("Lookup failed. Please enter your address manually.");
    }
    setPostcodeLoading(false);
  };

  const selectAddress = (addr) => {
    u1("address1", addr.line1 || "");
    u1("address2", addr.line2 || "");
    u1("city", addr.city || "");
    u1("county", addr.county || "");
    u1("postcode", addr.postcode || "");
    setAddressList([]);
    setPostcodeQuery(addr.postcode || "");
  };

  const err = (msg) => { setError(msg); return false; };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!p1.firstName || !p1.lastName || !p1.dob || !p1.gender || !p1.nationality || !p1.email || !p1.phone || !p1.address1 || !p1.city || !p1.postcode)
        return err("Please complete all required fields.");
      if (!p1.emergency1Name || !p1.emergency1Phone)
        return err("Please provide at least one emergency contact.");
    }
    if (step === 3) {
      if (p3.qualifications.length === 0)
        return err("Please select at least one qualification (or 'No formal qualifications').");
    }
    if (step === 4) {
      if (!p4[0].employer || !p4[0].jobTitle || !p4[0].from)
        return err("Please complete at least your most recent employment.");
    }
    if (step === 5) {
      if (p5.careSettings.length === 0) return err("Please select at least one care setting.");
      if (p5.clientGroups.length === 0) return err("Please select at least one client group.");
      if (!p5.experience) return err("Please describe your experience.");
    }
    if (step === 7) {
      if (!p7.rtwStatus) return err("Please select your right to work status.");
      if (p7.rtwDocs.length === 0) return err("Please select at least one right to work document type.");
      if (!p7.niNumber) return err("Please enter your National Insurance number.");
      const hasCV = f7cv || urls.cv;
      const hasPassport = f7passport || urls.passport;
      const hasRTW = f7rtw || urls.rtw;
      const hasPOA1 = f7poa1 || urls.poa1;
      const hasPOA2 = f7poa2 || urls.poa2;
      if (!hasCV) return err("Please upload your CV.");
      if (!hasPassport) return err("Please upload your passport photo page.");
      if (!hasRTW) return err("Please upload your right to work document.");
      if (!hasPOA1) return err("Please upload your first proof of address document.");
      if (!hasPOA2) return err("Please upload your second proof of address document.");
      if (!f7poa1Type && !urls.poa1) return err("Please select the type for your first proof of address.");
      if (!f7poa2Type && !urls.poa2) return err("Please select the type for your second proof of address.");
      if (f7poa1Type && f7poa2Type && f7poa1Type === f7poa2Type)
        return err("Please upload two different types of proof of address documents.");
    }
    if (step === 8) {
      if (!p8.dbsType) return err("Please select your DBS certificate type.");
      if (!p8.convictions) return err("Please answer the criminal conviction question.");
      const hasDBS = f8dbs || urls.dbs;
      if (!hasDBS) return err("Please upload your DBS certificate.");
    }
    if (step === 9) {
      if (!p9[0].name || !p9[0].email || !p9[0].org)
        return err("Please complete details for at least your first referee.");
      if (!p9[1].name || !p9[1].email || !p9[1].org)
        return err("Please complete details for your second referee.");
    }
    if (step === 11) {
      if (!p11.agreed) return err("You must agree to the declaration to submit.");
      if (!p11.signature) return err("Please enter your full name as a signature.");
      if (!p11.signDate) return err("Please enter today's date.");
    }
    return true;
  };

  const next = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      // Upload files when leaving step 7
      if (step === 7) {
        const uid = user.uid;
        const base = `applications/${uid}_${agencySlug}`;
        const newUrls = { ...urls };
        if (f7cv) newUrls.cv = await uploadFile(f7cv, `${base}/cv`);
        if (f7passport) newUrls.passport = await uploadFile(f7passport, `${base}/passport`);
        if (f7rtw) newUrls.rtw = await uploadFile(f7rtw, `${base}/rtw`);
        if (f7poa1) { newUrls.poa1 = await uploadFile(f7poa1, `${base}/poa1`); newUrls.poa1Type = f7poa1Type; }
        if (f7poa2) { newUrls.poa2 = await uploadFile(f7poa2, `${base}/poa2`); newUrls.poa2Type = f7poa2Type; }
        setUrls(newUrls);
        await saveDraft({ urls: newUrls });
      }
      // Upload DBS when leaving step 8
      if (step === 8) {
        const newUrls = { ...urls };
        if (f8dbs) newUrls.dbs = await uploadFile(f8dbs, `applications/${user.uid}_${agencySlug}/dbs`);
        setUrls(newUrls);
        await saveDraft({ urls: newUrls });
      }
      if (step < TOTAL_STEPS) {
        await saveDraft({ step: step + 1 });
        setStep(s => s + 1);
        window.scrollTo(0, 0);
      }
    } catch (e) {
      setError("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  const back = () => { setStep(s => Math.max(1, s - 1)); window.scrollTo(0, 0); setError(""); };

  const submit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "applications", user.uid + "_" + agencySlug), {
        userId: user.uid,
        agencySlug,
        status: "submitted",
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11,
        urls,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSubmitted(true);
    } catch (e) {
      setError("Submission failed. Please try again.");
    }
    setSaving(false);
  };

  if (submitted) {
    return (
      <div style={s.wrap}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#1a1a2e", marginBottom: 12 }}>Application Submitted!</h1>
          <p style={{ color: "#9b7fd4", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Thank you, {p1.firstName || ""}! Your application has been submitted to the agency. You'll be contacted shortly about next steps.
          </p>
          <button onClick={onLogout} style={s.btnOut}>Sign Out</button>
        </div>
      </div>
    );
  }

  const POA_TYPES = ["Bank Statement","Utility Bill","Council Tax Letter","HMRC Letter","NHS Letter","Tenancy Agreement","Mortgage Statement","Benefits Letter","Insurance Document","Other Official Letter"];

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>Q</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: "#9b7fd4", fontSize: 13, cursor: "pointer" }}>Sign Out</button>
      </div>

      {/* Progress */}
      <div style={s.progress}>
        <div style={s.stepLabel}>Step {step} of {TOTAL_STEPS}</div>
        <div style={s.bar}><div style={{ ...s.barFill, width: `${(step / TOTAL_STEPS) * 100}%` }} /></div>
      </div>

      <div style={s.form}>
        {error && <div style={s.error}>⚠️ {error}</div>}

        {/* STEP 1 - Personal Details */}
        {step === 1 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Personal Details</div>
            <div style={s.sectionSub}>Please complete all fields accurately as they appear on your official documents.</div>
            <div style={s.row3}>
              <div style={s.field}><label style={s.label}>First Name <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} value={p1.firstName} onChange={e => u1("firstName", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Middle Name(s)</label><input style={s.input} value={p1.middleName} onChange={e => u1("middleName", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Last Name <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} value={p1.lastName} onChange={e => u1("lastName", e.target.value)} /></div>
            </div>
            <div style={s.row}>
              <div style={s.field}><label style={s.label}>Date of Birth <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} type="date" value={p1.dob} onChange={e => u1("dob", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Gender <span style={{ color: "#cc0000" }}>*</span></label>
                <select style={s.select} value={p1.gender} onChange={e => u1("gender", e.target.value)}>
                  <option value="">Select…</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div style={s.field}><label style={s.label}>Nationality <span style={{ color: "#cc0000" }}>*</span></label>
                <select style={s.select} value={p1.nationality} onChange={e => u1("nationality", e.target.value)}>
                  <option value="">Select…</option>
                  {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div style={s.field}><label style={s.label}>Religion (optional)</label>
                <select style={s.select} value={p1.religion} onChange={e => u1("religion", e.target.value)}>
                  <option value="">Prefer not to say</option>
                  {RELIGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={s.divider} />
            <div style={{ fontWeight: 600, color: "#6C3FC5", fontSize: 13, marginBottom: 14 }}>Contact Information</div>
            <div style={s.row}>
              <div style={s.field}><label style={s.label}>Email Address <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} type="email" value={p1.email} onChange={e => u1("email", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Phone Number <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} type="tel" value={p1.phone} onChange={e => u1("phone", e.target.value)} /></div>
            </div>
            {/* Postcode Lookup */}
            <div style={s.field}>
              <label style={s.label}>Postcode Lookup</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...s.input, flex: 1 }}
                  value={postcodeQuery}
                  onChange={e => { setPostcodeQuery(e.target.value); setAddressList([]); setPostcodeError(""); }}
                  onKeyDown={e => e.key === "Enter" && lookupPostcode()}
                  placeholder="e.g. SW1A 1AA"
                />
                <button
                  type="button"
                  onClick={lookupPostcode}
                  disabled={postcodeLoading}
                  style={{ ...s.btn, padding: "11px 20px", whiteSpace: "nowrap", opacity: postcodeLoading ? 0.6 : 1 }}
                >
                  {postcodeLoading ? "Searching…" : "Find Address"}
                </button>
              </div>
              {postcodeError && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 4 }}>{postcodeError}</div>}
            {!postcodeError && !postcodeLoading && p1.city && (
  <div style={{ color: "#1a7a3a", fontSize: 12, marginTop: 4 }}>✓ City, county and postcode filled in — please enter your street address below.</div>
)}
            </div>
            <div style={s.field}><label style={s.label}>Address Line 1 <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} value={p1.address1} onChange={e => u1("address1", e.target.value)} placeholder="House number and street" /></div>
            <div style={s.field}><label style={s.label}>Address Line 2</label><input style={s.input} value={p1.address2} onChange={e => u1("address2", e.target.value)} /></div>
            <div style={s.row3}>
              <div style={s.field}><label style={s.label}>City <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} value={p1.city} onChange={e => u1("city", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>County</label><input style={s.input} value={p1.county} onChange={e => u1("county", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Postcode <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} value={p1.postcode} onChange={e => u1("postcode", e.target.value)} /></div>
            </div>
            <div style={s.divider} />
            <div style={{ fontWeight: 600, color: "#6C3FC5", fontSize: 13, marginBottom: 14 }}>Emergency Contacts</div>
            <div style={s.row3}>
              <div style={s.field}><label style={s.label}>Full Name <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} value={p1.emergency1Name} onChange={e => u1("emergency1Name", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Relationship</label><input style={s.input} value={p1.emergency1Rel} onChange={e => u1("emergency1Rel", e.target.value)} placeholder="e.g. Spouse" /></div>
              <div style={s.field}><label style={s.label}>Phone <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} type="tel" value={p1.emergency1Phone} onChange={e => u1("emergency1Phone", e.target.value)} /></div>
            </div>
            <div style={s.row3}>
              <div style={s.field}><label style={s.label}>Full Name (2nd)</label><input style={s.input} value={p1.emergency2Name} onChange={e => u1("emergency2Name", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Relationship</label><input style={s.input} value={p1.emergency2Rel} onChange={e => u1("emergency2Rel", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Phone</label><input style={s.input} type="tel" value={p1.emergency2Phone} onChange={e => u1("emergency2Phone", e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* STEP 2 - Equal Opportunities */}
        {step === 2 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Equal Opportunities</div>
            <div style={s.sectionSub}>This information is collected for monitoring purposes only and will not affect your application.</div>
            <div style={s.field}>
              <label style={s.label}>Ethnic Origin</label>
              <select style={s.select} value={p2.ethnicity} onChange={e => u2("ethnicity", e.target.value)}>
                <option value="">Prefer not to say</option>
                <option>White – British</option>
                <option>White – Irish</option>
                <option>White – Other</option>
                <option>Mixed – White and Black Caribbean</option>
                <option>Mixed – White and Black African</option>
                <option>Mixed – White and Asian</option>
                <option>Mixed – Other</option>
                <option>Asian or Asian British – Indian</option>
                <option>Asian or Asian British – Pakistani</option>
                <option>Asian or Asian British – Bangladeshi</option>
                <option>Asian or Asian British – Other</option>
                <option>Black or Black British – Caribbean</option>
                <option>Black or Black British – African</option>
                <option>Black or Black British – Other</option>
                <option>Chinese</option>
                <option>Other ethnic group</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Do you consider yourself to have a disability?</label>
              <div style={s.radio}>
                {["Yes", "No", "Prefer not to say"].map(opt => (
                  <label key={opt} style={s.radioLabel}><input type="radio" name="disability" checked={p2.disability === opt} onChange={() => u2("disability", opt)} /> {opt}</label>
                ))}
              </div>
            </div>
            {p2.disability === "Yes" && (
              <div style={s.field}><label style={s.label}>Please provide details (optional)</label><textarea style={s.textarea} value={p2.disabilityDetails} onChange={e => u2("disabilityDetails", e.target.value)} rows={3} /></div>
            )}
          </div>
        )}

        {/* STEP 3 - Education & Training */}
        {step === 3 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Education & Training</div>
            <div style={s.sectionSub}>Select all qualifications and training you hold. Please be accurate — these may be verified.</div>
            <div style={s.field}>
              <label style={s.label}>Qualifications & Certifications <span style={{ color: "#cc0000" }}>*</span></label>
              <TagSelect options={QUALIFICATIONS} value={p3.qualifications} onChange={v => u3("qualifications", v)} />
            </div>
            <div style={s.field}><label style={s.label}>Other Courses / Training not listed above</label><textarea style={s.textarea} value={p3.courses} onChange={e => u3("courses", e.target.value)} placeholder="List any additional relevant training…" rows={3} /></div>
            <div style={s.row}>
              <div style={s.field}><label style={s.label}>First Aid Certificate Expiry Date</label><input style={s.input} type="month" value={p3.firstAidExpiry} onChange={e => u3("firstAidExpiry", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Professional Memberships / Registrations</label><input style={s.input} value={p3.memberships} onChange={e => u3("memberships", e.target.value)} placeholder="e.g. NMC Pin, HCPC" /></div>
            </div>
          </div>
        )}

        {/* STEP 4 - Employment History */}
        {step === 4 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Employment History</div>
            <div style={s.sectionSub}>Please provide a continuous 10-year employment history, starting with your most recent position. Account for any gaps.</div>
            {p4.map((emp, i) => (
              <EmpBlock key={i} emp={emp} idx={i}
                onChange={updated => setP4(prev => prev.map((e, j) => j === i ? updated : e))}
                onRemove={() => setP4(prev => prev.filter((_, j) => j !== i))} />
            ))}
            <button style={s.addBtn} onClick={() => setP4(prev => [...prev, { employer: "", jobTitle: "", from: "", to: "", leaving: "", duties: "", gaps: "" }])}>
              + Add Another Employment
            </button>
          </div>
        )}

        {/* STEP 5 - Experience & Care Standards */}
        {step === 5 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Experience & Care Standards</div>
            <div style={s.sectionSub}>Tell us about your care experience and approach.</div>
            <div style={s.field}>
              <label style={s.label}>Care Settings <span style={{ color: "#cc0000" }}>*</span></label>
              <TagSelect options={CARE_SETTINGS} value={p5.careSettings} onChange={v => u5("careSettings", v)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Client Groups <span style={{ color: "#cc0000" }}>*</span></label>
              <TagSelect options={CLIENT_GROUPS} value={p5.clientGroups} onChange={v => u5("clientGroups", v)} />
            </div>
            <div style={s.field}><label style={s.label}>Describe your care experience <span style={{ color: "#cc0000" }}>*</span></label><textarea style={s.textarea} value={p5.experience} onChange={e => u5("experience", e.target.value)} rows={4} placeholder="Summarise your overall care experience…" /></div>
            <div style={s.field}><label style={s.label}>Why do you want to work in care?</label><textarea style={s.textarea} value={p5.whyCare} onChange={e => u5("whyCare", e.target.value)} rows={3} /></div>
            <div style={s.field}><label style={s.label}>What are your key strengths as a carer?</label><textarea style={s.textarea} value={p5.strengths} onChange={e => u5("strengths", e.target.value)} rows={3} /></div>
            <div style={s.field}><label style={s.label}>Describe a challenging situation and how you handled it</label><textarea style={s.textarea} value={p5.challenging} onChange={e => u5("challenging", e.target.value)} rows={3} /></div>
            <div style={s.field}><label style={s.label}>Describe your understanding of safeguarding</label><textarea style={s.textarea} value={p5.safeguarding} onChange={e => u5("safeguarding", e.target.value)} rows={3} /></div>
          </div>
        )}

        {/* STEP 6 - Health & Interview */}
        {step === 6 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Health & Availability</div>
            <div style={s.sectionSub}>Please answer the following questions honestly.</div>
            <div style={s.field}><label style={s.label}>Do you have any health conditions or disabilities that may affect your ability to work?</label><textarea style={s.textarea} value={p6.healthConditions} onChange={e => u6("healthConditions", e.target.value)} placeholder="If no, write 'None'" rows={3} /></div>
            <div style={s.field}><label style={s.label}>Do you require any reasonable adjustments?</label><textarea style={s.textarea} value={p6.adjustments} onChange={e => u6("adjustments", e.target.value)} placeholder="If no, write 'None'" rows={2} /></div>
            <div style={s.divider} />
            <div style={s.field}>
              <label style={s.label}>Do you have your own transport?</label>
              <div style={s.radio}>
                {["Yes – own vehicle", "Yes – motorcycle/scooter", "Public transport only", "No"].map(opt => (
                  <label key={opt} style={s.radioLabel}><input type="radio" name="transport" checked={p6.transport === opt} onChange={() => u6("transport", opt)} /> {opt}</label>
                ))}
              </div>
            </div>
            <div style={s.row}>
              <div style={s.field}><label style={s.label}>Available to Start</label><input style={s.input} type="date" value={p6.availableStart} onChange={e => u6("availableStart", e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Interview Availability</label><input style={s.input} value={p6.interviewAvail} onChange={e => u6("interviewAvail", e.target.value)} placeholder="e.g. Weekday mornings" /></div>
            </div>
          </div>
        )}

        {/* STEP 7 - Right to Work & Documents */}
        {step === 7 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Right to Work & Documents</div>
            <div style={s.sectionSub}>All documents must be uploaded. Originals will be verified before employment commences.</div>
            <div style={s.field}>
              <label style={s.label}>Right to Work Status <span style={{ color: "#cc0000" }}>*</span></label>
              <select style={s.select} value={p7.rtwStatus} onChange={e => u7("rtwStatus", e.target.value)}>
                <option value="">Select…</option>
                {RTW_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Right to Work Documents Held <span style={{ color: "#cc0000" }}>*</span></label>
              <TagSelect options={RTW_DOCS} value={p7.rtwDocs} onChange={v => u7("rtwDocs", v)} />
            </div>
            {(p7.rtwStatus || "").toLowerCase().includes("share code") && (
              <div style={s.field}><label style={s.label}>Share Code</label><input style={s.input} value={p7.shareCode} onChange={e => u7("shareCode", e.target.value)} /></div>
            )}
            {(p7.rtwStatus || "").toLowerCase().includes("visa") && (
              <div style={s.field}><label style={s.label}>Visa Expiry Date</label><input style={s.input} type="date" value={p7.visaExpiry} onChange={e => u7("visaExpiry", e.target.value)} /></div>
            )}
            <div style={s.field}><label style={s.label}>National Insurance Number <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} value={p7.niNumber} onChange={e => u7("niNumber", e.target.value)} placeholder="e.g. AB123456C" /></div>
            <div style={s.divider} />
            <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14, marginBottom: 16 }}>Document Uploads</div>
            <UploadField label="CV / Resume" required file={f7cv} url={urls.cv} onFile={f => setF7cv(f)} hint="Upload your most recent CV" />
            <UploadField label="Passport (photo page)" required file={f7passport} url={urls.passport} onFile={f => setF7passport(f)} hint="Clear scan or photo of your passport ID page" />
            <UploadField label="Right to Work Document" required file={f7rtw} url={urls.rtw} onFile={f => setF7rtw(f)} hint="BRP, share code confirmation, or other RTW evidence" />
            <div style={s.field}>
              <label style={s.label}>Proof of Address 1 (Type) <span style={{ color: "#cc0000" }}>*</span></label>
              <select style={s.select} value={f7poa1Type} onChange={e => setF7poa1Type(e.target.value)}>
                <option value="">Select document type…</option>
                {POA_TYPES.filter(t => t !== f7poa2Type).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <UploadField label="Proof of Address 1" required file={f7poa1} url={urls.poa1} onFile={f => setF7poa1(f)} hint="Dated within the last 3 months" />
            <div style={s.field}>
              <label style={s.label}>Proof of Address 2 (Different Type) <span style={{ color: "#cc0000" }}>*</span></label>
              <select style={s.select} value={f7poa2Type} onChange={e => setF7poa2Type(e.target.value)}>
                <option value="">Select document type…</option>
                {POA_TYPES.filter(t => t !== f7poa1Type).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <UploadField label="Proof of Address 2" required file={f7poa2} url={urls.poa2} onFile={f => setF7poa2(f)} hint="Must be a different document type to Proof of Address 1" />
          </div>
        )}

        {/* STEP 8 - DBS & Criminal */}
        {step === 8 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>DBS & Criminal Record</div>
            <div style={s.sectionSub}>All care roles require an enhanced DBS check. Please complete this section fully.</div>
            <div style={s.field}>
              <label style={s.label}>DBS Certificate Type <span style={{ color: "#cc0000" }}>*</span></label>
              <select style={s.select} value={p8.dbsType} onChange={e => u8("dbsType", e.target.value)}>
                <option value="">Select…</option>
                <option>Enhanced DBS (Adult Workforce)</option>
                <option>Enhanced DBS (Child Workforce)</option>
                <option>Enhanced DBS (Adult + Child Workforce)</option>
                <option>Basic DBS</option>
                <option>Standard DBS</option>
                <option>I do not have a DBS certificate</option>
              </select>
            </div>
            {p8.dbsType && p8.dbsType !== "I do not have a DBS certificate" && (
              <>
                <div style={s.row}>
                  <div style={s.field}><label style={s.label}>DBS Certificate Number</label><input style={s.input} value={p8.dbsNumber} onChange={e => u8("dbsNumber", e.target.value)} /></div>
                  <div style={s.field}><label style={s.label}>Issue Date</label><input style={s.input} type="date" value={p8.dbsDate} onChange={e => u8("dbsDate", e.target.value)} /></div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Are you on the DBS Update Service?</label>
                  <div style={s.radio}>
                    {["Yes", "No"].map(opt => (
                      <label key={opt} style={s.radioLabel}><input type="radio" name="dbs_update" checked={p8.dbsUpdateService === opt} onChange={() => u8("dbsUpdateService", opt)} /> {opt}</label>
                    ))}
                  </div>
                </div>
                {p8.dbsUpdateService === "Yes" && (
                  <div style={s.field}><label style={s.label}>Update Service Subscription Number</label><input style={s.input} value={p8.updateServiceNumber} onChange={e => u8("updateServiceNumber", e.target.value)} /></div>
                )}
                <UploadField label="DBS Certificate" required file={f8dbs} url={urls.dbs} onFile={handleFileP8} hint="Upload a clear scan or photo of your DBS certificate" />
              </>
            )}
            <div style={s.divider} />
            <div style={s.field}>
              <label style={s.label}>Do you have any criminal convictions, cautions, reprimands or warnings not protected under the Rehabilitation of Offenders Act 1974? <span style={{ color: "#cc0000" }}>*</span></label>
              <div style={s.radio}>
                {["Yes", "No"].map(opt => (
                  <label key={opt} style={s.radioLabel}><input type="radio" name="convictions" checked={p8.convictions === opt} onChange={() => u8("convictions", opt)} /> {opt}</label>
                ))}
              </div>
            </div>
            {p8.convictions === "Yes" && (
              <div style={s.field}><label style={s.label}>Please provide details</label><textarea style={s.textarea} value={p8.convictionDetails} onChange={e => u8("convictionDetails", e.target.value)} rows={4} placeholder="Please describe the nature, date and outcome of any conviction(s)…" /></div>
            )}
          </div>
        )}

        {/* STEP 9 - References */}
        {step === 9 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>References</div>
            <div style={s.sectionSub}>Please provide two professional references. References from family members are not accepted. Your most recent employer must be your first referee.</div>
            {p9.map((ref, i) => (
              <RefBlock key={i} ref={ref} idx={i}
                onChange={updated => setP9(prev => prev.map((r, j) => j === i ? updated : r))}
                onRemove={() => setP9(prev => prev.filter((_, j) => j !== i))} />
            ))}
            {p9.length < 3 && (
              <button style={s.addBtn} onClick={() => setP9(prev => [...prev, { name: "", position: "", org: "", relationship: "", email: "", phone: "", address: "" }])}>
                + Add Third Referee
              </button>
            )}
          </div>
        )}

        {/* STEP 10 - Bank Details */}
        {step === 10 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Bank Details</div>
            <div style={s.sectionSub}>Your bank details are required for payroll. This information is kept securely and used only for payment purposes.</div>
            <div style={s.field}><label style={s.label}>Bank / Building Society Name</label><input style={s.input} value={p10.bankName} onChange={e => u10("bankName", e.target.value)} placeholder="e.g. Barclays" /></div>
            <div style={s.field}><label style={s.label}>Account Holder Name</label><input style={s.input} value={p10.accountName} onChange={e => u10("accountName", e.target.value)} /></div>
            <div style={s.row}>
              <div style={s.field}><label style={s.label}>Sort Code</label><input style={s.input} value={p10.sortCode} onChange={e => u10("sortCode", e.target.value)} placeholder="00-00-00" /></div>
              <div style={s.field}><label style={s.label}>Account Number</label><input style={s.input} value={p10.accountNumber} onChange={e => u10("accountNumber", e.target.value)} placeholder="8 digits" /></div>
            </div>
            <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#9b7fd4", marginTop: 8 }}>
              🔒 Your bank details are encrypted and stored securely. They are only accessible to payroll staff after your application is approved.
            </div>
          </div>
        )}

        {/* STEP 11 - Declaration */}
        {step === 11 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Declaration & Signature</div>
            <div style={s.sectionSub}>Please read the declaration carefully before signing.</div>
            <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 10, padding: "20px 24px", fontSize: 13, color: "#4a4a6a", lineHeight: 1.8, marginBottom: 24 }}>
              <p style={{ marginBottom: 12 }}>I declare that the information given in this application form is complete and accurate. I understand that any false or misleading information, or any omission of relevant information, may result in the termination of any offer of employment or, if discovered after employment commences, may result in disciplinary action or dismissal.</p>
              <p style={{ marginBottom: 12 }}>I consent to the organisation obtaining references in relation to my application and to any pre-employment checks (including DBS checks) which the organisation considers necessary in connection with a potential offer of employment.</p>
              <p style={{ marginBottom: 12 }}>I confirm that I have read and understood the Privacy Policy and consent to my personal data being processed by Quikcare Ltd for the purposes of this application and recruitment.</p>
              <p>I understand that the information I provide may be shared with the recruiting care agency and relevant authorities where required by law.</p>
            </div>
            <div style={s.field}>
              <label style={s.label}>I agree to the above declaration <span style={{ color: "#cc0000" }}>*</span></label>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "14px 18px", border: `2px solid ${p11.agreed ? "#6C3FC5" : "#c5b3e8"}`, borderRadius: 10, background: p11.agreed ? "#f0ebff" : "#fff" }}>
                <input type="checkbox" checked={p11.agreed} onChange={e => u11("agreed", e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 14, color: "#1a1a2e", fontWeight: 500 }}>I confirm that all information provided is accurate and I agree to the declaration above</span>
              </label>
            </div>
            <div style={s.row}>
              <div style={s.field}><label style={s.label}>Full Name (as signature) <span style={{ color: "#cc0000" }}>*</span></label><input style={{ ...s.input, fontStyle: "italic" }} value={p11.signature} onChange={e => u11("signature", e.target.value)} placeholder="Type your full legal name" /></div>
              <div style={s.field}><label style={s.label}>Date <span style={{ color: "#cc0000" }}>*</span></label><input style={s.input} type="date" value={p11.signDate} onChange={e => u11("signDate", e.target.value)} /></div>
            </div>
            <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 8, padding: "14px 18px", marginTop: 8 }}>
              <div style={{ fontSize: 13, color: "#6C3FC5", fontWeight: 600, marginBottom: 4 }}>Position Applied For</div>
              <div style={{ fontSize: 14, color: "#1a1a2e" }}>Care Worker — {agencyName || agencySlug}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {step > 1 ? (
            <button style={s.btnOut} onClick={back}>← Back</button>
          ) : (
            <div />
          )}
          {step < TOTAL_STEPS ? (
            <button style={{ ...s.btn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={next}>
              {saving ? "Saving…" : `Continue →`}
            </button>
          ) : (
            <button style={{ ...s.btn, background: "#1a7a3a", opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={submit}>
              {saving ? "Submitting…" : "Submit Application ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
