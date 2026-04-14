import React, { useState, useEffect, useCallback } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const steps = [
  { id: 1, label: "Personal Details", icon: "👤" },
  { id: 2, label: "Experience", icon: "💼" },
  { id: 3, label: "Right to Work", icon: "📋" },
  { id: 4, label: "DBS Check", icon: "🔒" },
  { id: 5, label: "Availability", icon: "📅" },
  { id: 6, label: "References", icon: "⭐" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHIFTS = ["Morning (7am–2pm)", "Afternoon (2pm–7pm)", "Evening (7pm–11pm)", "Night (11pm–7am)"];

const s = {
  app: { minHeight: "100vh", background: "#f8f5ff", color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" },
  header: { borderBottom: "1px solid #e8e0f5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 40, height: 40, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", fontFamily: "serif" },
  logoText: { color: "#6C3FC5", fontSize: 20, fontFamily: "'DM Serif Display', serif" },
  headerSub: { color: "#9b7fd4", fontSize: 12 },
  container: { maxWidth: 560, margin: "0 auto", padding: "32px 16px 120px" },
  stepRow: { display: "flex", justifyContent: "space-between", marginBottom: 12 },
  stepBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" },
  stepCircleActive: { width: 36, height: 36, borderRadius: "50%", background: "#6C3FC5", border: "2px solid #6C3FC5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold" },
  stepCircleDone: { width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "2px solid #6C3FC5", color: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  stepCircleInactive: { width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "2px solid #c5b3e8", color: "#9b7fd4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  progressBar: { height: 4, background: "#e8e0f5", borderRadius: 4, overflow: "hidden", marginBottom: 32 },
  progressFill: (pct) => ({ height: "100%", background: "#6C3FC5", borderRadius: 4, width: `${pct}%`, transition: "width 0.4s ease" }),
  card: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 16, padding: 24, marginBottom: 24 },
  cardTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#1a1a2e", marginBottom: 4 },
  cardSub: { color: "#9b7fd4", fontSize: 13, marginBottom: 24 },
  field: { marginBottom: 20 },
  label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  input: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  pillActive: { padding: "8px 16px", borderRadius: 999, border: "1px solid #6C3FC5", background: "#6C3FC5", color: "white", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  pillInactive: { padding: "8px 16px", borderRadius: 999, border: "1px solid #c5b3e8", background: "transparent", color: "#6C3FC5", fontSize: 13, cursor: "pointer" },
  infoBox: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 12, padding: 16, fontSize: 13, color: "#6C3FC5", lineHeight: 1.6 },
  infoTitle: { color: "#6C3FC5", fontWeight: 600, marginBottom: 4 },
  refBox: { border: "1px solid #e8e0f5", borderRadius: 12, padding: 16, marginBottom: 16 },
  refLabel: { color: "#6C3FC5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 },
  navRow: { display: "flex", justifyContent: "space-between", marginTop: 8 },
  btnBack: { padding: "12px 24px", border: "1px solid #c5b3e8", borderRadius: 999, color: "#9b7fd4", background: "none", fontSize: 14, cursor: "pointer" },
  btnNext: { padding: "12px 32px", background: "#6C3FC5", border: "none", borderRadius: 999, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  successWrap: { minHeight: "100vh", background: "#f8f5ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  successInner: { textAlign: "center", maxWidth: 400 },
  successIcon: { fontSize: 64, marginBottom: 24 },
  successTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#6C3FC5", marginBottom: 16 },
  successText: { color: "#9b7fd4", lineHeight: 1.7, marginBottom: 32 },
  successGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 },
  successCard: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 12, padding: 12, fontSize: 11, color: "#6C3FC5", fontWeight: 600, textTransform: "uppercase" },
  resetBtn: { padding: "10px 24px", border: "1px solid #c5b3e8", borderRadius: 999, color: "#9b7fd4", background: "none", fontSize: 13, cursor: "pointer" },
  availGrid: { display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr 1fr", gap: 6, fontSize: 12 },
  availHeader: { padding: "6px 4px", color: "#6C3FC5", fontWeight: 600, fontSize: 11, textAlign: "center" },
  availDay: { padding: "8px 4px", color: "#1a1a2e", fontWeight: 500, display: "flex", alignItems: "center" },
  availCell: (checked) => ({ width: "100%", padding: "8px 4px", borderRadius: 6, border: `1px solid ${checked ? "#6C3FC5" : "#e8e0f5"}`, background: checked ? "#6C3FC5" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }),
  uploadBox: { border: "2px dashed #c5b3e8", borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", background: "#f8f5ff" },
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
      <div style={s.field}><label style={s.label}>National Insurance Number</label><input style={s.input} placeholder="AB 12 34 56 C" value={data.niNumber} onChange={e => set({ ...data, niNumber: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Do you hold a valid driving licence?</label><RadioGroup options={["Yes", "No"]} value={data.driving} onChange={v => set({ ...data, driving: v })} /></div>
      
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Gender</label>
          <select style={s.select} value={data.gender} onChange={e => set({ ...data, gender: e.target.value })}>
            <option value="">Select...</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Nationality</label>
          <input style={s.input} placeholder="e.g. British" value={data.nationality} onChange={e => set({ ...data, nationality: e.target.value })} />
        </div>
      </div>
      <div style={s.field}>
        <label style={s.label}>Religion (optional)</label>
        <select style={s.select} value={data.religion} onChange={e => set({ ...data, religion: e.target.value })}>
          <option value="">Prefer not to say</option>
          <option>Christian</option>
          <option>Muslim</option>
          <option>Hindu</option>
          <option>Sikh</option>
          <option>Jewish</option>
          <option>Buddhist</option>
          <option>No religion</option>
          <option>Other</option>
        </select>
      </div>
      <div style={s.field}><label style={s.label}>Languages Spoken</label><CheckboxGroup options={["English", "Welsh", "Punjabi", "Urdu", "Polish", "Romanian", "Arabic", "Other"]} values={data.languages} onChange={v => set({ ...data, languages: v })} /></div>
      <div style={{ ...s.field, borderTop: "1px solid #e8e0f5", paddingTop: 20, marginTop: 4 }}>
        <div style={{ color: "#6C3FC5", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Emergency Contact</div>
        <div style={s.grid2}>
          <div style={s.field}><label style={s.label}>Full Name</label><input style={s.input} placeholder="John Smith" value={data.emergencyName} onChange={e => set({ ...data, emergencyName: e.target.value })} /></div>
          <div style={s.field}><label style={s.label}>Relationship</label><input style={s.input} placeholder="Spouse, Parent..." value={data.emergencyRelation} onChange={e => set({ ...data, emergencyRelation: e.target.value })} /></div>
        </div>
        <div style={s.field}><label style={s.label}>Phone Number</label><input style={s.input} type="tel" placeholder="07700 900000" value={data.emergencyPhone} onChange={e => set({ ...data, emergencyPhone: e.target.value })} /></div>
      </div>
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
    </div>
  );
}

function Step3({ data, set }) {
  const handleFile = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    set({ ...data, [`${field}Name`]: file.name, [`${field}Uploading`]: true });
    try {
      const storageRef = ref(storage, `applications/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      set({ ...data, [`${field}Name`]: file.name, [`${field}URL`]: url, [`${field}Uploading`]: false });
    } catch (err) {
      console.error(err);
      set({ ...data, [`${field}Uploading`]: false });
    }
  };
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
      <div style={s.field}>
        <label style={s.label}>Upload CV (optional)</label>
        <div style={s.uploadBox} onClick={() => document.getElementById('cv-upload').click()}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
          <div style={{ color: "#6C3FC5", fontWeight: 500, fontSize: 14 }}>
            {data.cvUploading ? "Uploading..." : data.cvName ? `✓ ${data.cvName}` : "Click to upload your CV"}
          </div>
          <div style={{ color: "#9b7fd4", fontSize: 12, marginTop: 4 }}>PDF, DOC or DOCX — max 5MB</div>
          <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e, "cv")} />
        </div>
      </div>
      <div style={s.field}>
        <label style={s.label}>Upload Proof of Address 1</label>
        <div style={s.uploadBox} onClick={() => document.getElementById('poa1-upload').click()}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏠</div>
          <div style={{ color: "#6C3FC5", fontWeight: 500, fontSize: 14 }}>
            {data.poa1Uploading ? "Uploading..." : data.poa1Name ? `✓ ${data.poa1Name}` : "Click to upload proof of address 1"}
          </div>
          <div style={{ color: "#9b7fd4", fontSize: 12, marginTop: 4 }}>PDF, JPG or PNG — max 5MB</div>
          <input id="poa1-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "poa1")} />
        </div>
      </div>
      <div style={s.field}>
        <label style={s.label}>Upload Proof of Address 2</label>
        <div style={s.uploadBox} onClick={() => document.getElementById('poa2-upload').click()}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏠</div>
          <div style={{ color: "#6C3FC5", fontWeight: 500, fontSize: 14 }}>
            {data.poa2Uploading ? "Uploading..." : data.poa2Name ? `✓ ${data.poa2Name}` : "Click to upload proof of address 2"}
          </div>
          <div style={{ color: "#9b7fd4", fontSize: 12, marginTop: 4 }}>PDF, JPG or PNG — max 5MB</div>
          <input id="poa2-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "poa2")} />
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Proof of Address — Document 1</label>
        <select style={s.select} value={data.proofAddress1} onChange={e => set({ ...data, proofAddress1: e.target.value })}>
          <option value="">Select document type...</option>
          <option>Bank Statement (last 3 months)</option>
          <option>Utility Bill (last 3 months)</option>
          <option>Council Tax Letter</option>
          <option>HMRC Letter</option>
          <option>GP Letter</option>
        </select>
      </div>
      <div style={s.field}>
        <label style={s.label}>Proof of Address — Document 2</label>
        <select style={s.select} value={data.proofAddress2} onChange={e => set({ ...data, proofAddress2: e.target.value })}>
          <option value="">Select document type...</option>
          <option>Bank Statement (last 3 months)</option>
          <option>Utility Bill (last 3 months)</option>
          <option>Council Tax Letter</option>
          <option>HMRC Letter</option>
          <option>GP Letter</option>
        </select>
      </div>
      <div style={s.field}>
        <label style={s.label}>Employment Continuity Check</label>
        <p style={{ color: "#9b7fd4", fontSize: 12, marginBottom: 10 }}>Please account for any gaps in employment over the last 5 years</p>
        <RadioGroup options={["No gaps", "I have gaps to explain"]} value={data.employmentGaps} onChange={v => set({ ...data, employmentGaps: v })} />
        {data.employmentGaps === "I have gaps to explain" && (
          <textarea
            style={{ ...s.input, marginTop: 10, minHeight: 80, resize: "vertical" }}
            placeholder="Please explain any gaps in your employment history..."
            value={data.gapsExplanation}
            onChange={e => set({ ...data, gapsExplanation: e.target.value })}
          />
        )}
      </div>
      <div style={s.field}>
        <label style={s.label}>Upload Right to Work Document</label>
        <div style={s.uploadBox} onClick={() => document.getElementById('rtw-upload').click()}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ color: "#6C3FC5", fontWeight: 500, fontSize: 14 }}>
            {data.rtwDocUploading ? "Uploading..." : data.rtwDocName ? `✓ ${data.rtwDocName}` : "Click to upload right to work document"}
          </div>
          <div style={{ color: "#9b7fd4", fontSize: 12, marginTop: 4 }}>Passport, BRP, Share Code letter — PDF, JPG or PNG</div>
          <input id="rtw-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "rtwDoc")} />
        </div>
      </div>
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
  const toggleShift = (day, shift) => {
    const key = `${day}__${shift}`;
    const current = data.availability || [];
    if (current.includes(key)) set({ ...data, availability: current.filter(k => k !== key) });
    else set({ ...data, availability: [...current, key] });
  };
  const isChecked = (day, shift) => (data.availability || []).includes(`${day}__${shift}`);

  return (
    <div>
      <div style={s.field}>
        <label style={s.label}>Weekly Availability</label>
        <p style={{ color: "#9b7fd4", fontSize: 12, marginBottom: 12 }}>Tap the shifts you are available to work</p>
        <div style={{ overflowX: "auto" }}>
          <div style={s.availGrid}>
            <div style={s.availHeader}></div>
            {["AM", "PM", "Eve", "Night"].map(h => <div key={h} style={s.availHeader}>{h}</div>)}
            {DAYS.map(day => (
              <React.Fragment key={day}>
                <div style={s.availDay}>{day.slice(0, 3)}</div>
                {SHIFTS.map(shift => (
                  <div key={shift} style={{ padding: "3px" }}>
                    <div style={s.availCell(isChecked(day, shift))} onClick={() => toggleShift(day, shift)}>
                      {isChecked(day, shift) && <span style={{ color: "white", fontSize: 14 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e8e0f5", paddingTop: 20, marginTop: 4 }}>
        <div style={{ color: "#6C3FC5", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Bank Details for Payroll</div>
        <div style={s.infoBox} >
          <div style={s.infoTitle}>🔒 Secure & Confidential</div>
          Your bank details are stored securely and only used for payroll purposes.
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={s.field}><label style={s.label}>Account Holder Name</label><input style={s.input} placeholder="Jane Smith" value={data.bankName} onChange={e => set({ ...data, bankName: e.target.value })} /></div>
          <div style={s.grid2}>
            <div style={s.field}><label style={s.label}>Sort Code</label><input style={s.input} placeholder="00-00-00" value={data.sortCode} onChange={e => set({ ...data, sortCode: e.target.value })} /></div>
            <div style={s.field}><label style={s.label}>Account Number</label><input style={s.input} placeholder="12345678" value={data.accountNumber} onChange={e => set({ ...data, accountNumber: e.target.value })} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step6({ data, set }) {
  const updateRef = (idx, field, value) => {
    const refs = [...data.refs];
    refs[idx] = { ...refs[idx], [field]: value };
    set({ ...data, refs });
  };
  return (
    <div>
      <p style={{ color: "#9b7fd4", fontSize: 13, marginBottom: 20 }}>We require two professional references. At least one must be from a care or health setting.</p>
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
      <div style={{ ...s.infoBox, border: "1px solid #6C3FC5" }}>
        <div style={s.infoTitle}>✅ Almost there!</div>
        By submitting, you confirm all information is accurate and consent to background checks.
      </div>
    </div>
  );
}

export default function App({ user, onLogout, agencySlug }) {
  const [current, setCurrent] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [p1, setP1] = useState({ firstName: "", lastName: "", email: "", phone: "", dob: "", postcode: "", niNumber: "", driving: "", languages: [], emergencyName: "", emergencyRelation: "", emergencyPhone: "", gender: "", nationality: "", religion: "" });
  const [p2, setP2] = useState({ years: "", settings: [], clients: [], quals: [] });
  const [p3, setP3] = useState({ rightToWork: "", rtwStatus: "", docs: [], cvName: "", cvURL: "", poa1Name: "", poa1URL: "", poa2Name: "", poa2URL: "", rtwDocName: "", rtwDocURL: "", proofAddress1: "", proofAddress2: "", employmentGaps: "", gapsExplanation: "" });
  const [p4, setP4] = useState({ hasDbs: "", dbsDate: "", updateService: "", conviction: "" });
  const [p5, setP5] = useState({ availability: [], bankName: "", sortCode: "", accountNumber: "" });
  const [p6, setP6] = useState({ refs: [{}, {}] });

  const [saveStatus, setSaveStatus] = useState("");

  // Load saved progress when app opens
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, "drafts", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.p1) setP1(data.p1);
          if (data.p2) setP2(data.p2);
          if (data.p3) setP3(data.p3);
          if (data.p4) setP4(data.p4);
          if (data.p5) setP5(data.p5);
          if (data.p6) setP6(data.p6);
          if (data.current) setCurrent(data.current);
          setSaveStatus("Progress loaded ✓");
          setTimeout(() => setSaveStatus(""), 3000);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };
    loadProgress();
  }, [user]);

  // Auto-save progress to Firebase
  const saveProgress = useCallback(async (stepData) => {
    if (!user?.uid) return;
    try {
      setSaveStatus("Saving...");
      await setDoc(doc(db, "drafts", user.uid), {
        ...stepData,
        current,
        savedAt: serverTimestamp()
      });
      setSaveStatus("Progress saved ✓");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaveStatus("");
    }
  }, [user, current]);

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
      if (!p1.niNumber.trim()) errs.push("National Insurance number is required");
      if (!p1.driving) errs.push("Please confirm if you hold a driving licence");
      if (p1.languages.length === 0) errs.push("Please select at least one language");
      if (!p1.emergencyName.trim()) errs.push("Emergency contact name is required");
      if (!p1.emergencyPhone.trim()) errs.push("Emergency contact phone is required");
      if (!p1.gender) errs.push("Please select your gender");
      if (!p1.nationality.trim()) errs.push("Nationality is required");
    }
    if (step === 2) {
      if (!p2.years) errs.push("Please select your years of experience");
      if (p2.settings.length === 0) errs.push("Please select at least one care setting");
      if (p2.clients.length === 0) errs.push("Please select at least one client group");
      if (p2.quals.length === 0) errs.push("Please select your qualifications");
    }
    if (step === 3) {
      if (!p3.rightToWork) errs.push("Please confirm your right to work status");
      if (p3.docs.length === 0) errs.push("Please select at least one document you can provide");
      if (!p3.proofAddress1) errs.push("Please select your first proof of address document");
      if (!p3.proofAddress2) errs.push("Please select your second proof of address document");
      if (!p3.employmentGaps) errs.push("Please complete the employment continuity check");
    }
    if (step === 4) {
      if (!p4.hasDbs) errs.push("Please confirm your DBS certificate status");
      if (!p4.conviction) errs.push("Please answer the convictions question");
    }
    if (step === 5) {
      if ((p5.availability || []).length === 0) errs.push("Please select at least one available shift");
      if (!p5.bankName.trim()) errs.push("Account holder name is required");
      if (!p5.sortCode.trim()) errs.push("Sort code is required");
      if (!p5.accountNumber.trim()) errs.push("Account number is required");
    }
    if (step === 6) {
      if (!p6.refs[0]?.name?.trim()) errs.push("Reference 1: Full name is required");
      if (!p6.refs[0]?.email?.trim()) errs.push("Reference 1: Email is required");
      if (!p6.refs[1]?.name?.trim()) errs.push("Reference 2: Full name is required");
      if (!p6.refs[1]?.email?.trim()) errs.push("Reference 2: Email is required");
    }
    return errs;
  };

  const handleNext = async () => {
    const errs = validate(current);
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    await saveProgress({ p1, p2, p3, p4, p5, p6 });
    if (current === steps.length) handleSubmit();
    else setCurrent(current + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        ...p1, ...p2, ...p3, ...p4, ...p5,
        refs: p6.refs,
        status: "pending",
        userId: user?.uid,
        userEmail: user?.email,
        agencySlug: agencySlug || "quikcare",
        appliedAt: new Date().toISOString().split("T")[0],
        createdAt: serverTimestamp()
      });
      // Send email notifications
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        // Get agency email
        let agencyEmail = null;
        let agencyName = agencySlug || 'Quikcare';
        if (agencySlug) {
          const slugDoc = await getDoc(doc(db, 'agencySlugs', agencySlug));
          if (slugDoc.exists()) {
            const agencyDoc = await getDoc(doc(db, 'agencies', slugDoc.data().uid));
            if (agencyDoc.exists()) {
              agencyEmail = agencyDoc.data().email;
              agencyName = agencyDoc.data().agencyName;
            }
          }
        }

        const emailParams = {
          carer_name: `${formData.firstName} ${formData.lastName}`,
          carer_email: formData.email || user?.email,
          agency_name: agencyName,
          applied_at: new Date().toLocaleDateString('en-GB'),
        };

        // Notify you (super admin)
        emailjs.send('QUIKCARE', 'template_60u7ckv', {
          ...emailParams,
          to_email: 'michaelokyere8092@gmail.com',
        }, 'LD1-M8qPWz2Go1fM2');

        // Notify agency if we have their email
        if (agencyEmail) {
          emailjs.send('QUIKCARE', 'template_60u7ckv', {
            ...emailParams,
            to_email: agencyEmail,
          }, 'LD1-M8qPWz2Go1fM2');
        }
      } catch (emailErr) {
        console.log('Email notification failed:', emailErr);
      }
      setSubmitted(true);
      try {
        await setDoc(doc(db, "drafts", user.uid), { completed: true });
      } catch (e) {}
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
          <div style={s.successIcon}>🎉</div>
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
          <div style={s.logoIcon}>Q</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveStatus && <span style={{ color: "#6C3FC5", fontSize: 12 }}>{saveStatus}</span>}
          <span style={s.headerSub}>{user?.email}</span>
          <button onClick={onLogout} style={{ background: "none", border: "1px solid #c5b3e8", borderRadius: 6, padding: "4px 12px", color: "#9b7fd4", fontSize: 12, cursor: "pointer" }}>Sign Out</button>
        </div>
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
          <div style={{ background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ color: "#cc0000", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>⚠️ Please complete the following:</div>
            {errors.map((e, i) => <div key={i} style={{ color: "#cc0000", fontSize: 13, marginTop: 4 }}>• {e}</div>)}
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
          {current === 6 && <Step6 data={p6} set={setP6} />}
        </div>

        <div style={s.navRow}>
          <button style={{ ...s.btnBack, opacity: current === 1 ? 0.3 : 1 }} disabled={current === 1} onClick={() => { setErrors([]); setCurrent(current - 1); }}>← Back</button>
          <button style={{ ...s.btnNext, opacity: submitting ? 0.6 : 1 }} disabled={submitting} onClick={handleNext}>
            {current === steps.length ? (submitting ? "Submitting..." : "Submit Application →") : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
