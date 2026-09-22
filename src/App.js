import React, { useState, useEffect, useCallback } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const steps = [
  { id: 1,  label: "Personal Details",    icon: "👤" },
  { id: 2,  label: "Equal Opportunities", icon: "🌍" },
  { id: 3,  label: "Education",           icon: "🎓" },
  { id: 4,  label: "Employment History",  icon: "💼" },
  { id: 5,  label: "Experience",          icon: "⭐" },
  { id: 6,  label: "Health & Interview",  icon: "🏥" },
  { id: 7,  label: "Right to Work",       icon: "📋" },
  { id: 8,  label: "DBS & Criminal",      icon: "🔒" },
  { id: 9,  label: "References",          icon: "👥" },
  { id: 10, label: "Bank Details",        icon: "🏦" },
  { id: 11, label: "Declaration",         icon: "✍️" },
];

const s = {
  app: { minHeight: "100vh", background: "#f8f5ff", color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" },
  header: { borderBottom: "1px solid #e8e0f5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 40, height: 40, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", fontFamily: "serif" },
  logoText: { color: "#6C3FC5", fontSize: 20, fontFamily: "'DM Serif Display', serif" },
  headerSub: { color: "#9b7fd4", fontSize: 12 },
  container: { maxWidth: 620, margin: "0 auto", padding: "24px 16px 120px" },
  stepRow: { display: "flex", overflowX: "auto", gap: 4, marginBottom: 12, paddingBottom: 4 },
  stepBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", flexShrink: 0 },
  stepCircleActive: { width: 32, height: 32, borderRadius: "50%", background: "#6C3FC5", border: "2px solid #6C3FC5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" },
  stepCircleDone: { width: 32, height: 32, borderRadius: "50%", background: "transparent", border: "2px solid #6C3FC5", color: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  stepCircleInactive: { width: 32, height: 32, borderRadius: "50%", background: "transparent", border: "2px solid #c5b3e8", color: "#c5b3e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  stepLabel: { fontSize: 9, color: "#9b7fd4", maxWidth: 50, textAlign: "center", lineHeight: 1.2 },
  card: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 16, padding: 24, marginBottom: 16 },
  cardTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a2e", marginBottom: 4 },
  cardSub: { color: "#9b7fd4", fontSize: 13, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  input: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
  textarea: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", minHeight: 90, resize: "vertical", fontFamily: "'DM Sans', sans-serif" },
  select: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  radioRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  radioBtn: (active) => ({ padding: "8px 14px", borderRadius: 999, border: `1px solid ${active ? "#6C3FC5" : "#c5b3e8"}`, background: active ? "#6C3FC5" : "transparent", color: active ? "white" : "#6C3FC5", fontSize: 13, cursor: "pointer", fontWeight: active ? 600 : 400 }),
  checkGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  checkItem: (active) => ({ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: `1px solid ${active ? "#6C3FC5" : "#e8e0f5"}`, background: active ? "#f0ebff" : "#fafafa", cursor: "pointer", fontSize: 13 }),
  infoBox: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 10, padding: 14, fontSize: 13, color: "#6C3FC5", marginBottom: 16, lineHeight: 1.6 },
  warnBox: { background: "#fff8e8", border: "1px solid #f0c060", borderRadius: 10, padding: 14, fontSize: 13, color: "#7a5000", marginBottom: 16, lineHeight: 1.6 },
  sectionDivider: { borderTop: "1px solid #e8e0f5", margin: "20px 0", paddingTop: 16 },
  sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#6C3FC5", marginBottom: 12 },
  uploadBox: { border: "2px dashed #c5b3e8", borderRadius: 10, padding: "20px 16px", textAlign: "center", cursor: "pointer", background: "#fafafa" },
  errBox: { background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 10, padding: 14, fontSize: 13, color: "#cc0000", marginBottom: 16 },
  navRow: { display: "flex", gap: 12, marginTop: 20 },
  nextBtn: { flex: 1, padding: "14px", background: "#6C3FC5", border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  backBtn: { padding: "14px 20px", background: "transparent", border: "1px solid #c5b3e8", borderRadius: 10, color: "#6C3FC5", fontSize: 15, cursor: "pointer" },
  req: { color: "#cc0000", marginLeft: 2 },
};

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={s.radioRow}>
      {options.map(o => <button key={o} type="button" style={s.radioBtn(value === o)} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  );
}

function CheckboxGroup({ options, values, onChange }) {
  const toggle = (o) => onChange(values.includes(o) ? values.filter(x => x !== o) : [...values, o]);
  return (
    <div style={s.checkGrid}>
      {options.map(o => (
        <div key={o} style={s.checkItem(values.includes(o))} onClick={() => toggle(o)}>
          <span style={{ fontSize: 14 }}>{values.includes(o) ? "✓" : "○"}</span>
          <span>{o}</span>
        </div>
      ))}
    </div>
  );
}

// ─── STEP 1: Personal Details ─────────────────────────────────────────────────
function Step1({ data, set }) {
  return (
    <div>
      <div style={s.infoBox}>Please complete this application form fully. All fields marked <span style={s.req}>*</span> are required.</div>
      <div style={s.field}><label style={s.label}>Position Applied For <span style={s.req}>*</span></label><input style={s.input} type="text" placeholder="e.g. Care Worker, Senior Carer..." value={data.position} onChange={e => set({ ...data, position: e.target.value })} /></div>
      <div style={s.field}>
        <label style={s.label}>Hours Wanted <span style={s.req}>*</span></label>
        <RadioGroup options={["Full Time", "Part Time"]} value={data.hoursType} onChange={v => set({ ...data, hoursType: v })} />
      </div>
      <div style={s.field}>
        <label style={s.label}>Availability <span style={s.req}>*</span></label>
        <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13, color: "#6C3FC5" }}>Weekdays</div>
        <CheckboxGroup options={["Mornings", "Afternoons", "Evenings", "Nights"]} values={data.weekdayAvail || []} onChange={v => set({ ...data, weekdayAvail: v })} />
        <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 600, fontSize: 13, color: "#6C3FC5" }}>Weekends</div>
        <CheckboxGroup options={["Mornings", "Afternoons", "Evenings", "Nights"]} values={data.weekendAvail || []} onChange={v => set({ ...data, weekendAvail: v })} />
      </div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>First Name <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.firstName} onChange={e => set({ ...data, firstName: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Last Name <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.lastName} onChange={e => set({ ...data, lastName: e.target.value })} /></div>
      </div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Date of Birth <span style={s.req}>*</span></label><input style={s.input} type="date" value={data.dob} onChange={e => set({ ...data, dob: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Gender <span style={s.req}>*</span></label>
          <select style={s.select} value={data.gender} onChange={e => set({ ...data, gender: e.target.value })}>
            <option value="">Select...</option>
            <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
          </select>
        </div>
      </div>
      <div style={s.field}><label style={s.label}>Full Address <span style={s.req}>*</span></label><textarea style={s.textarea} placeholder="House number, Street, City" value={data.address} onChange={e => set({ ...data, address: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Postcode <span style={s.req}>*</span></label><input style={s.input} type="text" placeholder="e.g. B16 8SP" value={data.postcode} onChange={e => set({ ...data, postcode: e.target.value })} /></div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Telephone Number</label><input style={s.input} type="tel" value={data.telephone} onChange={e => set({ ...data, telephone: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Mobile Number <span style={s.req}>*</span></label><input style={s.input} type="tel" value={data.phone} onChange={e => set({ ...data, phone: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Email Address <span style={s.req}>*</span></label><input style={s.input} type="email" value={data.email} onChange={e => set({ ...data, email: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>National Insurance Number <span style={s.req}>*</span></label><input style={s.input} type="text" placeholder="e.g. AB123456C" value={data.niNumber} onChange={e => set({ ...data, niNumber: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Do you have a Full Clean Driving Licence? <span style={s.req}>*</span></label><RadioGroup options={["Yes", "No"]} value={data.drivingLicence} onChange={v => set({ ...data, drivingLicence: v })} /></div>
      {data.drivingLicence === "Yes" && (
        <>
          <div style={s.field}><label style={s.label}>Do you have your own transport for business purposes?</label><RadioGroup options={["Yes", "No"]} value={data.ownTransport} onChange={v => set({ ...data, ownTransport: v })} /></div>
          <div style={s.field}><label style={s.label}>How long has your licence been held?</label><input style={s.input} type="text" placeholder="e.g. 5 years" value={data.licenceHeld} onChange={e => set({ ...data, licenceHeld: e.target.value })} /></div>
        </>
      )}
      <div style={s.sectionDivider} />
      <div style={s.sectionTitle}>Next of Kin</div>
      <div style={s.field}><label style={s.label}>Full Name <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.emergencyName} onChange={e => set({ ...data, emergencyName: e.target.value })} /></div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Relationship <span style={s.req}>*</span></label><input style={s.input} type="text" placeholder="e.g. Spouse, Parent" value={data.emergencyRelation} onChange={e => set({ ...data, emergencyRelation: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Phone Number <span style={s.req}>*</span></label><input style={s.input} type="tel" value={data.emergencyPhone} onChange={e => set({ ...data, emergencyPhone: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Address</label><input style={s.input} type="text" value={data.emergencyAddress} onChange={e => set({ ...data, emergencyAddress: e.target.value })} /></div>
    </div>
  );
}

// ─── STEP 2: Equal Opportunities ─────────────────────────────────────────────
function Step2({ data, set }) {
  return (
    <div>
      <div style={s.infoBox}>This information is collected for equal opportunities monitoring only and will not affect your application.</div>
      <div style={s.field}>
        <label style={s.label}>Age Group</label>
        <RadioGroup options={["18-24", "25-30", "31-36", "37-42", "43+"]} value={data.ageGroup} onChange={v => set({ ...data, ageGroup: v })} />
      </div>
      <div style={s.field}>
        <label style={s.label}>Ethnic Origin</label>
        <div style={s.checkGrid}>
          {["White British", "Black British", "Black African", "Black Caribbean", "Asian", "Indian", "Pakistani", "Hispanic", "Irish", "Other"].map(o => (
            <div key={o} style={s.checkItem(data.ethnicity === o)} onClick={() => set({ ...data, ethnicity: o, ethnicityOther: o === "Other" ? data.ethnicityOther : "" })}>
              <span>{data.ethnicity === o ? "✓" : "○"}</span><span>{o}</span>
            </div>
          ))}
        </div>
        {data.ethnicity === "Other" && <input style={{ ...s.input, marginTop: 8 }} type="text" placeholder="Please specify" value={data.ethnicityOther || ""} onChange={e => set({ ...data, ethnicityOther: e.target.value })} />}
      </div>
      <div style={s.field}>
        <label style={s.label}>Religion</label>
        <div style={s.checkGrid}>
          {["Christianity", "Islam", "Hinduism", "Judaism", "Buddhism", "Sikhism", "Other", "Prefer not to say"].map(o => (
            <div key={o} style={s.checkItem(data.religion === o)} onClick={() => set({ ...data, religion: o, religionOther: o === "Other" ? data.religionOther : "" })}>
              <span>{data.religion === o ? "✓" : "○"}</span><span>{o}</span>
            </div>
          ))}
        </div>
        {data.religion === "Other" && <input style={{ ...s.input, marginTop: 8 }} type="text" placeholder="Please specify" value={data.religionOther || ""} onChange={e => set({ ...data, religionOther: e.target.value })} />}
      </div>
    </div>
  );
}

// ─── STEP 3: Education & Training ────────────────────────────────────────────
function EducationRow({ row, onChange, onRemove, index }) {
  return (
    <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 600, color: "#6C3FC5", fontSize: 13 }}>Entry {index + 1}</span>
        <button type="button" onClick={onRemove} style={{ background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 13 }}>Remove</button>
      </div>
      <div style={s.field}><label style={s.label}>School / College / University</label><input style={s.input} type="text" value={row.institution || ""} onChange={e => onChange({ ...row, institution: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Qualifications / Examinations Passed</label><input style={s.input} type="text" placeholder="e.g. GCSE Maths, NVQ Level 2..." value={row.qualifications || ""} onChange={e => onChange({ ...row, qualifications: e.target.value })} /></div>
    </div>
  );
}

function TrainingRow({ row, onChange, onRemove, index }) {
  return (
    <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 600, color: "#6C3FC5", fontSize: 13 }}>Entry {index + 1}</span>
        <button type="button" onClick={onRemove} style={{ background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 13 }}>Remove</button>
      </div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Date / Year</label><input style={s.input} type="text" placeholder="e.g. June 2022" value={row.date || ""} onChange={e => onChange({ ...row, date: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Location / Details</label><input style={s.input} type="text" value={row.location || ""} onChange={e => onChange({ ...row, location: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Notes</label><input style={s.input} type="text" value={row.notes || ""} onChange={e => onChange({ ...row, notes: e.target.value })} /></div>
    </div>
  );
}

function CourseRow({ row, onChange, onRemove, index }) {
  return (
    <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 600, color: "#6C3FC5", fontSize: 13 }}>Course {index + 1}</span>
        <button type="button" onClick={onRemove} style={{ background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 13 }}>Remove</button>
      </div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Subject</label><input style={s.input} type="text" value={row.subject || ""} onChange={e => onChange({ ...row, subject: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Location</label><input style={s.input} type="text" value={row.location || ""} onChange={e => onChange({ ...row, location: e.target.value })} /></div>
      </div>
    </div>
  );
}

function Step3({ data, set }) {
  const addEdu = () => set({ ...data, education: [...(data.education || []), {}] });
  const updateEdu = (i, v) => set({ ...data, education: data.education.map((r, idx) => idx === i ? v : r) });
  const removeEdu = (i) => set({ ...data, education: data.education.filter((_, idx) => idx !== i) });

  const addTraining = () => set({ ...data, training: [...(data.training || []), {}] });
  const updateTraining = (i, v) => set({ ...data, training: data.training.map((r, idx) => idx === i ? v : r) });
  const removeTraining = (i) => set({ ...data, training: data.training.filter((_, idx) => idx !== i) });

  const addCourse = () => set({ ...data, courses: [...(data.courses || []), {}] });
  const updateCourse = (i, v) => set({ ...data, courses: data.courses.map((r, idx) => idx === i ? v : r) });
  const removeCourse = (i) => set({ ...data, courses: data.courses.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div style={s.sectionTitle}>Education</div>
      {(data.education || []).map((row, i) => <EducationRow key={i} row={row} index={i} onChange={v => updateEdu(i, v)} onRemove={() => removeEdu(i)} />)}
      <button type="button" onClick={addEdu} style={{ ...s.backBtn, width: "100%", marginBottom: 20, fontSize: 13 }}>+ Add Education</button>

      <div style={s.sectionDivider} />
      <div style={s.sectionTitle}>Training History / Professional Status</div>
      <div style={{ fontSize: 12, color: "#9b7fd4", marginBottom: 12 }}>Please supply copies of certificates / membership details</div>
      {(data.training || []).map((row, i) => <TrainingRow key={i} row={row} index={i} onChange={v => updateTraining(i, v)} onRemove={() => removeTraining(i)} />)}
      <button type="button" onClick={addTraining} style={{ ...s.backBtn, width: "100%", marginBottom: 20, fontSize: 13 }}>+ Add Training</button>

      <div style={s.sectionDivider} />
      <div style={s.sectionTitle}>Short Courses Attended</div>
      {(data.courses || []).map((row, i) => <CourseRow key={i} row={row} index={i} onChange={v => updateCourse(i, v)} onRemove={() => removeCourse(i)} />)}
      <button type="button" onClick={addCourse} style={{ ...s.backBtn, width: "100%", fontSize: 13 }}>+ Add Short Course</button>
    </div>
  );
}

// ─── STEP 4: Employment History ───────────────────────────────────────────────
function EmployerBlock({ title, data, set }) {
  return (
    <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, color: "#6C3FC5", fontSize: 14, marginBottom: 14 }}>{title}</div>
      <div style={s.field}><label style={s.label}>Name and Address of Employer</label><textarea style={s.textarea} value={data.address || ""} onChange={e => set({ ...data, address: e.target.value })} /></div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Date Employed (From)</label><input style={s.input} type="month" value={data.dateFrom || ""} onChange={e => set({ ...data, dateFrom: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Date Employed (To)</label><input style={s.input} type="month" value={data.dateTo || ""} onChange={e => set({ ...data, dateTo: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Nature of Business</label><input style={s.input} type="text" value={data.nature || ""} onChange={e => set({ ...data, nature: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Position Held</label><input style={s.input} type="text" value={data.position || ""} onChange={e => set({ ...data, position: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Reason for Leaving</label><input style={s.input} type="text" value={data.reasonLeaving || ""} onChange={e => set({ ...data, reasonLeaving: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Salary / Rate</label><input style={s.input} type="text" placeholder="e.g. £12/hr" value={data.salary || ""} onChange={e => set({ ...data, salary: e.target.value })} /></div>
    </div>
  );
}

function Step4({ data, set }) {
  return (
    <div>
      <div style={s.infoBox}>Current or most recent employer first. Information must cover your whole working life. State reasons for any gaps in employment.</div>
      <EmployerBlock title="Current / Most Recent Employer" data={data.employer1 || {}} set={v => set({ ...data, employer1: v })} />
      <EmployerBlock title="Previous Employer" data={data.employer2 || {}} set={v => set({ ...data, employer2: v })} />
      <EmployerBlock title="Employer Prior to Above" data={data.employer3 || {}} set={v => set({ ...data, employer3: v })} />
      <div style={s.field}><label style={s.label}>Other roles / Additional employment history</label><textarea style={{ ...s.textarea, minHeight: 80 }} placeholder="Use this space for any other roles not listed above..." value={data.otherRoles || ""} onChange={e => set({ ...data, otherRoles: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Relevant Experience (voluntary work, charity, personal care etc.)</label><textarea style={s.textarea} placeholder="Please give details of any relevant experience..." value={data.relevantExperience || ""} onChange={e => set({ ...data, relevantExperience: e.target.value })} /></div>
    </div>
  );
}

// ─── STEP 5: Experience & Care Standards ─────────────────────────────────────
function Step5({ data, set }) {
  const carePhilosophy = [
    { key: "phil1", q: "I believe that the purpose of care from a care service is:" },
    { key: "phil2", q: "If I were a Service User I would like:" },
    { key: "phil3", q: "I believe that the Service User's family and relatives would like from the Agency:" },
    { key: "phil4", q: "I believe that I can support a Service User because:" },
    { key: "phil5", q: "As a member of the care team I feel valued when:" },
    { key: "phil6", q: "I believe that a good relationship between me and the Service User depends on:" },
    { key: "phil7", q: "I believe that I learn best when:" },
    { key: "phil8", q: "I believe that a good working team is made by:" },
    { key: "phil9", q: "I believe that my role in relation to the Service User is:" },
    { key: "phil10", q: "My other beliefs and values of relevance to my job are:" },
  ];
  return (
    <div>
      <div style={s.sectionTitle}>Care Settings</div>
      <div style={s.field}>
        <label style={s.label}>Care Settings <span style={s.req}>*</span></label>
        <CheckboxGroup options={["Domiciliary / Home Care", "Residential Care Home", "Supported Living", "Live-in Care", "NHS / Hospital"]} values={data.settings || []} onChange={v => set({ ...data, settings: v })} />
        {(!data.settings || data.settings.length === 0) && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Please select at least one</div>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Client Groups <span style={s.req}>*</span></label>
        <CheckboxGroup options={["Elderly", "Dementia / Alzheimer's", "Physical Disabilities", "Learning Disabilities", "Mental Health", "End of Life"]} values={data.clients || []} onChange={v => set({ ...data, clients: v })} />
        {(!data.clients || data.clients.length === 0) && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Please select at least one</div>}
      </div>
      <div style={s.sectionDivider} />
      <div style={s.sectionTitle}>Personal Philosophy of Care</div>
      <div style={s.infoBox}>Please complete the following statements to indicate your personal philosophy of care.</div>
      {carePhilosophy.map(({ key, q }) => (
        <div key={key} style={s.field}>
          <label style={s.label}>{q}</label>
          <textarea style={{ ...s.textarea, minHeight: 70 }} value={data[key] || ""} onChange={e => set({ ...data, [key]: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

// ─── STEP 6: Health & Interview ───────────────────────────────────────────────
function Step6({ data, set }) {
  return (
    <div>
      <div style={s.sectionTitle}>Assistance with Interview & Assessment</div>
      <div style={s.field}>
        <label style={s.label}>Do you require any special arrangements for the recruitment process? (e.g. large print, additional time) <span style={s.req}>*</span></label>
        <RadioGroup options={["Yes", "No"]} value={data.specialArrangements} onChange={v => set({ ...data, specialArrangements: v })} />
      </div>
      {data.specialArrangements === "Yes" && (
        <div style={s.field}><label style={s.label}>Please give details</label><textarea style={s.textarea} value={data.specialArrangementsDetails || ""} onChange={e => set({ ...data, specialArrangementsDetails: e.target.value })} /></div>
      )}
      <div style={s.field}>
        <label style={s.label}>Do you have any medical issues that may prevent you from doing the job? <span style={s.req}>*</span></label>
        <RadioGroup options={["Yes", "No"]} value={data.medicalIssues} onChange={v => set({ ...data, medicalIssues: v })} />
      </div>
      {data.medicalIssues === "Yes" && (
        <div style={s.field}><label style={s.label}>Please give details</label><textarea style={s.textarea} value={data.medicalDetails || ""} onChange={e => set({ ...data, medicalDetails: e.target.value })} /></div>
      )}
      <div style={{ fontSize: 12, color: "#9b7fd4", marginBottom: 16 }}>Any offer of employment may be made subject to a satisfactory medical report. Your GP will not be contacted without your permission.</div>
      <div style={s.sectionTitle}>GP Details</div>
      <div style={s.field}><label style={s.label}>GP's Name</label><input style={s.input} type="text" value={data.gpName || ""} onChange={e => set({ ...data, gpName: e.target.value })} /></div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>GP's Tel No</label><input style={s.input} type="tel" value={data.gpPhone || ""} onChange={e => set({ ...data, gpPhone: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>GP's Address</label><input style={s.input} type="text" value={data.gpAddress || ""} onChange={e => set({ ...data, gpAddress: e.target.value })} /></div>
      </div>
    </div>
  );
}

// ─── STEP 7: Right to Work ────────────────────────────────────────────────────
function Step7({ data, set, handleFile }) {
  return (
    <div>
      <div style={s.field}>
        <label style={s.label}>Are there any restrictions to your UK residence that might affect your right to work? <span style={s.req}>*</span></label>
        <RadioGroup options={["Yes", "No"]} value={data.ukRestrictions} onChange={v => set({ ...data, ukRestrictions: v })} />
      </div>
      {data.ukRestrictions === "Yes" && (
        <div style={s.field}><label style={s.label}>Please provide details</label><textarea style={s.textarea} value={data.ukRestrictionsDetails || ""} onChange={e => set({ ...data, ukRestrictionsDetails: e.target.value })} /></div>
      )}
      <div style={s.field}>
        <label style={s.label}>Would you require a work permit prior to taking up employment? <span style={s.req}>*</span></label>
        <RadioGroup options={["Yes", "No"]} value={data.workPermit} onChange={v => set({ ...data, workPermit: v })} />
      </div>
      <div style={s.field}>
        <label style={s.label}>NMC PIN Number (Nurses only)</label>
        <input style={s.input} type="text" placeholder="Leave blank if not applicable" value={data.nmcPin || ""} onChange={e => set({ ...data, nmcPin: e.target.value })} />
      </div>
      <div style={s.sectionDivider} />
      <div style={s.sectionTitle}>Upload Documents</div>
      <div style={s.field}>
        <label style={s.label}>Documents you can provide <span style={s.req}>*</span></label>
        <CheckboxGroup options={["Passport", "Birth Certificate", "National ID Card", "Biometric Residence Permit", "Share Code"]} values={data.docs || []} onChange={v => set({ ...data, docs: v })} />
        {(!data.docs || data.docs.length === 0) && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Please select at least one</div>}
      </div>
      {/* CV Upload */}
      <div style={s.field}>
        <label style={s.label}>Upload CV <span style={s.req}>*</span></label>
        <div style={{ ...s.uploadBox, borderColor: data.cvURL ? "#6C3FC5" : "#cc0000" }} onClick={() => document.getElementById('cv-upload').click()}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
          <div style={{ color: data.cvURL ? "#6C3FC5" : "#cc0000", fontWeight: 500, fontSize: 13 }}>{data.cvUploading ? "Uploading..." : data.cvName ? `✓ ${data.cvName}` : "Click to upload CV"}</div>
          <div style={{ color: "#9b7fd4", fontSize: 11, marginTop: 4 }}>PDF, DOC or DOCX</div>
          <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e, "cv")} />
        </div>
        {!data.cvURL && !data.cvUploading && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ CV is required</div>}
      </div>
      {/* Passport Upload */}
      <div style={s.field}>
        <label style={s.label}>Upload Passport <span style={s.req}>*</span></label>
        <div style={{ ...s.uploadBox, borderColor: data.passportURL ? "#6C3FC5" : "#cc0000" }} onClick={() => document.getElementById('passport-upload').click()}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🛂</div>
          <div style={{ color: data.passportURL ? "#6C3FC5" : "#cc0000", fontWeight: 500, fontSize: 13 }}>{data.passportUploading ? "Uploading..." : data.passportName ? `✓ ${data.passportName}` : "Click to upload Passport"}</div>
          <div style={{ color: "#9b7fd4", fontSize: 11, marginTop: 4 }}>PDF, JPG or PNG</div>
          <input id="passport-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "passport")} />
        </div>
        {!data.passportURL && !data.passportUploading && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Passport is required</div>}
      </div>
      {/* RTW Document Upload */}
      <div style={s.field}>
        <label style={s.label}>Upload Right to Work Document <span style={s.req}>*</span></label>
        <div style={{ ...s.uploadBox, borderColor: data.rtwDocURL ? "#6C3FC5" : "#cc0000" }} onClick={() => document.getElementById('rtw-upload').click()}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📋</div>
          <div style={{ color: data.rtwDocURL ? "#6C3FC5" : "#cc0000", fontWeight: 500, fontSize: 13 }}>{data.rtwDocUploading ? "Uploading..." : data.rtwDocName ? `✓ ${data.rtwDocName}` : "Click to upload RTW document"}</div>
          <div style={{ color: "#9b7fd4", fontSize: 11, marginTop: 4 }}>PDF, JPG or PNG</div>
          <input id="rtw-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "rtwDoc")} />
        </div>
        {!data.rtwDocURL && !data.rtwDocUploading && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ RTW document is required</div>}
      </div>
      {/* Proof of Address 1 */}
      <div style={s.field}>
        <label style={s.label}>Proof of Address — Document Type 1 <span style={s.req}>*</span></label>
        <select style={{ ...s.select, borderColor: data.proofAddress1 ? "#c5b3e8" : "#cc0000", marginBottom: 8 }} value={data.proofAddress1 || ""} onChange={e => set({ ...data, proofAddress1: e.target.value })}>
          <option value="">Select document type...</option>
          <option>Bank Statement (last 3 months)</option>
          <option>Utility Bill (last 3 months)</option>
          <option>Council Tax Letter</option>
          <option>HMRC Letter</option>
          <option>GP Letter</option>
        </select>
        <div style={{ ...s.uploadBox, borderColor: data.poa1URL ? "#6C3FC5" : "#cc0000" }} onClick={() => document.getElementById('poa1-upload').click()}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🏠</div>
          <div style={{ color: data.poa1URL ? "#6C3FC5" : "#cc0000", fontWeight: 500, fontSize: 13 }}>{data.poa1Uploading ? "Uploading..." : data.poa1Name ? `✓ ${data.poa1Name}` : "Click to upload Proof of Address 1"}</div>
          <div style={{ color: "#9b7fd4", fontSize: 11, marginTop: 4 }}>PDF, JPG or PNG</div>
          <input id="poa1-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "poa1")} />
        </div>
        {!data.poa1URL && !data.poa1Uploading && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Proof of address 1 is required</div>}
      </div>
      {/* Proof of Address 2 */}
      <div style={s.field}>
        <label style={s.label}>Proof of Address — Document Type 2 <span style={s.req}>*</span></label>
        <select style={{ ...s.select, borderColor: data.proofAddress2 && data.proofAddress2 !== data.proofAddress1 ? "#c5b3e8" : "#cc0000", marginBottom: 8 }} value={data.proofAddress2 || ""} onChange={e => set({ ...data, proofAddress2: e.target.value })}>
          <option value="">Select document type...</option>
          {["Bank Statement (last 3 months)", "Utility Bill (last 3 months)", "Council Tax Letter", "HMRC Letter", "GP Letter"].filter(o => o !== data.proofAddress1).map(o => <option key={o}>{o}</option>)}
        </select>
        <div style={{ ...s.uploadBox, borderColor: data.poa2URL ? "#6C3FC5" : "#cc0000" }} onClick={() => document.getElementById('poa2-upload').click()}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🏠</div>
          <div style={{ color: data.poa2URL ? "#6C3FC5" : "#cc0000", fontWeight: 500, fontSize: 13 }}>{data.poa2Uploading ? "Uploading..." : data.poa2Name ? `✓ ${data.poa2Name}` : "Click to upload Proof of Address 2"}</div>
          <div style={{ color: "#9b7fd4", fontSize: 11, marginTop: 4 }}>PDF, JPG or PNG</div>
          <input id="poa2-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "poa2")} />
        </div>
        {!data.poa2URL && !data.poa2Uploading && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Proof of address 2 is required</div>}
        {data.proofAddress1 && data.proofAddress2 && data.proofAddress1 === data.proofAddress2 && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Document 2 must be a different type to Document 1</div>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Employment Continuity Check <span style={s.req}>*</span></label>
        <div style={s.infoBox}>It is essential to check the continuity of employment across your whole working life. Please provide details of your full employment history including any gaps and what you were doing during those periods.</div>
        <RadioGroup options={["I have gaps in employment", "I have continuous employment"]} value={data.employmentGaps} onChange={v => set({ ...data, employmentGaps: v })} />
        {data.employmentGaps && <textarea style={{ ...s.textarea, marginTop: 12 }} placeholder="Please provide your full employment timeline including any gaps..." value={data.gapsExplanation || ""} onChange={e => set({ ...data, gapsExplanation: e.target.value })} />}
      </div>
    </div>
  );
}

// ─── STEP 8: DBS & Criminal Record ───────────────────────────────────────────
function Step8({ data, set, handleFile }) {
  return (
    <div>
      <div style={s.warnBox}>Workers are subject to the Health and Social Care Act 2008 and will be subject to a Police Record Check through the DBS. You will not be eligible for work in a care setting if you are on the DBS Register.</div>
      <div style={s.field}>
        <label style={s.label}>Do you have an existing DBS certificate? <span style={s.req}>*</span></label>
        <RadioGroup options={["Yes — Enhanced", "Yes — Basic", "No"]} value={data.hasDbs} onChange={v => set({ ...data, hasDbs: v })} />
      </div>
      {data.hasDbs?.startsWith("Yes") && (
        <>
          <div style={s.field}><label style={s.label}>DBS Issue Date</label><input style={s.input} type="date" value={data.dbsDate || ""} onChange={e => set({ ...data, dbsDate: e.target.value })} /></div>
          <div style={s.field}><label style={s.label}>Are you on the DBS Update Service?</label><RadioGroup options={["Yes", "No"]} value={data.updateService} onChange={v => set({ ...data, updateService: v })} /></div>
          <div style={s.field}>
            <label style={s.label}>Upload DBS Certificate <span style={s.req}>*</span></label>
            <div style={{ ...s.uploadBox, borderColor: data.dbsDocURL ? "#6C3FC5" : "#cc0000" }} onClick={() => document.getElementById('dbs-upload').click()}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔒</div>
              <div style={{ color: data.dbsDocURL ? "#6C3FC5" : "#cc0000", fontWeight: 500, fontSize: 13 }}>{data.dbsDocUploading ? "Uploading..." : data.dbsDocName ? `✓ ${data.dbsDocName}` : "Click to upload DBS Certificate"}</div>
              <div style={{ color: "#9b7fd4", fontSize: 11, marginTop: 4 }}>PDF, JPG or PNG</div>
              <input id="dbs-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(e, "dbsDoc")} />
            </div>
            {!data.dbsDocURL && !data.dbsDocUploading && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>⚠️ Please upload your DBS certificate</div>}
          </div>
        </>
      )}
      <div style={s.field}>
        <label style={s.label}>Please declare all criminal convictions, charges, warnings and cautions (whether spent or not) <span style={s.req}>*</span></label>
        <RadioGroup options={["Nothing to declare", "I have something to declare"]} value={data.conviction} onChange={v => set({ ...data, conviction: v })} />
      </div>
      {data.conviction === "I have something to declare" && (
        <div style={s.field}><label style={s.label}>Please provide full details</label><textarea style={s.textarea} value={data.convictionDetails || ""} onChange={e => set({ ...data, convictionDetails: e.target.value })} /></div>
      )}
    </div>
  );
}

// ─── STEP 9: References ───────────────────────────────────────────────────────
function RefBlock({ title, data, set }) {
  return (
    <div style={{ background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, color: "#6C3FC5", fontSize: 14, marginBottom: 14 }}>{title}</div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Name <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.name || ""} onChange={e => set({ ...data, name: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Email <span style={s.req}>*</span></label><input style={s.input} type="email" value={data.email || ""} onChange={e => set({ ...data, email: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Address</label><input style={s.input} type="text" value={data.address || ""} onChange={e => set({ ...data, address: e.target.value })} /></div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Postcode</label><input style={s.input} type="text" value={data.postcode || ""} onChange={e => set({ ...data, postcode: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Tel No</label><input style={s.input} type="tel" value={data.tel || ""} onChange={e => set({ ...data, tel: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Job Title</label><input style={s.input} type="text" value={data.title || ""} onChange={e => set({ ...data, title: e.target.value })} /></div>
      {data._isCharacter && <div style={s.field}><label style={s.label}>Relationship to you</label><input style={s.input} type="text" value={data.relation || ""} onChange={e => set({ ...data, relation: e.target.value })} /></div>}
    </div>
  );
}

function Step9({ data, set }) {
  return (
    <div>
      <div style={s.infoBox}>You must provide references from your two most recent employers plus one character referee. All will be contacted — please inform your referees that you have used their name.</div>
      <RefBlock title="Current / Most Recent Employer" data={data.ref1 || {}} set={v => set({ ...data, ref1: v })} />
      <RefBlock title="Previous Employer" data={data.ref2 || {}} set={v => set({ ...data, ref2: v })} />
      <RefBlock title="Character Reference" data={{ ...(data.ref3 || {}), _isCharacter: true }} set={v => set({ ...data, ref3: v })} />
    </div>
  );
}

// ─── STEP 10: Bank Details ────────────────────────────────────────────────────
function Step10({ data, set }) {
  return (
    <div>
      <div style={s.infoBox}>Please complete this information carefully. Incorrect information will result in a delay in payment. Contact: Tel: 0121 454 4868 | info@touchhearthc.com</div>
      <div style={s.field}><label style={s.label}>Your Full Name <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.bankHolderName || ""} onChange={e => set({ ...data, bankHolderName: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Your Telephone Number</label><input style={s.input} type="tel" value={data.bankPhone || ""} onChange={e => set({ ...data, bankPhone: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Name of Bank or Building Society <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.bankName || ""} onChange={e => set({ ...data, bankName: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Bank / Building Society Address</label><input style={s.input} type="text" value={data.bankAddress || ""} onChange={e => set({ ...data, bankAddress: e.target.value })} /></div>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Sort Code <span style={s.req}>*</span></label><input style={s.input} type="text" placeholder="00-00-00" value={data.sortCode || ""} onChange={e => set({ ...data, sortCode: e.target.value })} /></div>
        <div style={s.field}><label style={s.label}>Account Number <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.accountNumber || ""} onChange={e => set({ ...data, accountNumber: e.target.value })} /></div>
      </div>
      <div style={s.field}><label style={s.label}>Building Society Roll Number (if applicable)</label><input style={s.input} type="text" value={data.rollNumber || ""} onChange={e => set({ ...data, rollNumber: e.target.value })} /></div>
      <div style={s.field}><label style={s.label}>Name of Account Holder <span style={s.req}>*</span></label><input style={s.input} type="text" value={data.accountHolder || ""} onChange={e => set({ ...data, accountHolder: e.target.value })} /></div>
      <div style={{ fontSize: 12, color: "#9b7fd4", lineHeight: 1.6 }}>By providing your bank details, you confirm that this is your own account or you have authorisation to use the above account to receive wages from Touchheart Healthcare Ltd.</div>
    </div>
  );
}

// ─── STEP 11: Declaration ─────────────────────────────────────────────────────
function Step11({ data, set, firstName, lastName, position }) {
  const today = new Date().toLocaleDateString("en-GB");
  return (
    <div>
      <div style={{ background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#6C3FC5", marginBottom: 8 }}>Applicant Declaration</div>
        <p style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.8, margin: 0 }}>
          I declare that to the best of my knowledge and belief the information given by me in this application is true, and I understand that the above information forms the basis of my contract of employment. I understand that if any of the information supplied by me is found to be falsely declared, my contract may have been fundamentally breached and my employment may be terminated immediately.
        </p>
        <p style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.8, marginTop: 12 }}>
          I understand that I cannot be offered a post until a satisfactory response has been received with respect to my DBS Register status, and that should I subsequently be offered a post, that offer will be subject to receipt of two satisfactory references, one of which must be from my previous employer. I understand that until a satisfactory response is received from the DBS, I will be supervised at all times at work, and will not seek or have unsupervised access to vulnerable people.
        </p>
        <p style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.8, marginTop: 12 }}>
          By my signature, I authorise the organisation to request a DBS Register check and a criminal records check from the DBS, on initial employment and at any time during my employment thereafter.
        </p>
      </div>
      <div style={s.warnBox}>⚠️ Providing false information is a serious matter and may result in immediate termination of employment and legal consequences.</div>
      <div style={s.field}><label style={s.label}>Position Applied For</label><input style={s.input} type="text" value={position || ""} readOnly style={{ ...s.input, background: "#f0ebff", color: "#6C3FC5" }} /></div>
      <div style={s.field}>
        <label style={{ ...s.label, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textTransform: "none", fontSize: 13, fontWeight: 400, letterSpacing: 0 }}>
          <input type="checkbox" checked={data.agreed || false} onChange={e => set({ ...data, agreed: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#6C3FC5", flexShrink: 0, cursor: "pointer" }} />
          <span style={{ color: "#1a1a2e", lineHeight: 1.6 }}><strong>I have read and agree</strong> to the declaration above and confirm all information in this application is true and accurate to the best of my knowledge.</span>
        </label>
        {!data.agreed && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6, marginLeft: 26 }}>⚠️ You must agree to the declaration before submitting</div>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Full Name (Typed Signature) <span style={s.req}>*</span></label>
        <input type="text" style={{ ...s.input, fontStyle: "italic", fontSize: 16, borderColor: data.signature ? "#6C3FC5" : "#cc0000" }} placeholder={`${firstName || "Your"} ${lastName || "Name"}`} value={data.signature || ""} onChange={e => set({ ...data, signature: e.target.value })} />
        <div style={{ fontSize: 11, color: "#9b7fd4", marginTop: 6 }}>Type your full legal name as your signature</div>
      </div>
      <div style={s.field}><label style={s.label}>Date</label><input type="text" style={{ ...s.input, background: "#f0ebff", color: "#6C3FC5" }} value={today} readOnly /></div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App({ user, onLogout, agencySlug }) {
  const [current, setCurrent]   = useState(1);
  const [errors,  setErrors]    = useState([]);
  const [saving,  setSaving]    = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [agencyName, setAgencyName] = useState("");

  // Step states
  const [p1,  setP1]  = useState({ position: "", hoursType: "", weekdayAvail: [], weekendAvail: [], firstName: "", lastName: "", dob: "", gender: "", address: "", postcode: "", telephone: "", phone: "", email: "", niNumber: "", drivingLicence: "", ownTransport: "", licenceHeld: "", emergencyName: "", emergencyRelation: "", emergencyPhone: "", emergencyAddress: "" });
  const [p2,  setP2]  = useState({ ageGroup: "", ethnicity: "", ethnicityOther: "", religion: "", religionOther: "" });
  const [p3,  setP3]  = useState({ education: [], training: [], courses: [] });
  const [p4,  setP4]  = useState({ employer1: {}, employer2: {}, employer3: {}, otherRoles: "", relevantExperience: "" });
  const [p5,  setP5]  = useState({ settings: [], clients: [], phil1: "", phil2: "", phil3: "", phil4: "", phil5: "", phil6: "", phil7: "", phil8: "", phil9: "", phil10: "" });
  const [p6,  setP6]  = useState({ specialArrangements: "", specialArrangementsDetails: "", medicalIssues: "", medicalDetails: "", gpName: "", gpPhone: "", gpAddress: "" });
  const [p7,  setP7]  = useState({ ukRestrictions: "", ukRestrictionsDetails: "", workPermit: "", nmcPin: "", docs: [], cvName: "", cvURL: "", passportName: "", passportURL: "", rtwDocName: "", rtwDocURL: "", poa1Name: "", poa1URL: "", poa2Name: "", poa2URL: "", proofAddress1: "", proofAddress2: "", employmentGaps: "", gapsExplanation: "" });
  const [p8,  setP8]  = useState({ hasDbs: "", dbsDate: "", updateService: "", dbsDocName: "", dbsDocURL: "", conviction: "", convictionDetails: "" });
  const [p9,  setP9]  = useState({ ref1: {}, ref2: {}, ref3: {} });
  const [p10, setP10] = useState({ bankHolderName: "", bankPhone: "", bankName: "", bankAddress: "", sortCode: "", accountNumber: "", rollNumber: "", accountHolder: "" });
  const [p11, setP11] = useState({ agreed: false, signature: "" });

  // Load agency name and check existing application
  useEffect(() => {
    const load = async () => {
      try {
        const slugDoc = await getDoc(doc(db, "agencySlugs", agencySlug));
        if (slugDoc.exists()) setAgencyName(slugDoc.data().agencyName || agencySlug);
      } catch (e) {}
      if (user) {
        try {
          const draft = await getDoc(doc(db, "drafts", user.uid));
          if (draft.exists()) {
            const d = draft.data();
            if (d.p1)  setP1(d.p1);
            if (d.p2)  setP2(d.p2);
            if (d.p3)  setP3(d.p3);
            if (d.p4)  setP4(d.p4);
            if (d.p5)  setP5(d.p5);
            if (d.p6)  setP6(d.p6);
            if (d.p7)  setP7(d.p7);
            if (d.p8)  setP8(d.p8);
            if (d.p9)  setP9(d.p9);
            if (d.p10) setP10(d.p10);
            if (d.p11) setP11(d.p11);
            if (d.current) setCurrent(Math.min(d.current, steps.length));
          }
        } catch (e) {}
        try {
          const { getDocs, query, where } = await import("firebase/firestore");
          const q = query(collection(db, "applications"), where("userId", "==", user.uid), where("agencySlug", "==", agencySlug));
          const snap = await getDocs(q);
          if (!snap.empty) setExistingApp({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } catch (e) {}
      }
    };
    load();
  }, [user, agencySlug]);

  const saveProgress = useCallback(async (stepData) => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, "drafts", user.uid), { ...stepData, current, agencySlug, savedAt: serverTimestamp() });
    } catch (e) {}
  }, [user, current, agencySlug]);

  // File upload handler
  const makeFileHandler = (setter, stateData) => async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setter({ ...stateData, [`${field}Name`]: file.name, [`${field}Uploading`]: true });
    try {
      const storageRef = ref(storage, `applications/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setter(prev => ({ ...prev, [`${field}Name`]: file.name, [`${field}URL`]: url, [`${field}Uploading`]: false }));
    } catch (err) {
      setter(prev => ({ ...prev, [`${field}Uploading`]: false }));
    }
  };

  const handleFileP7 = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setP7(prev => ({ ...prev, [`${field}Name`]: file.name, [`${field}Uploading`]: true }));
    try {
      const storageRef = ref(storage, `applications/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setP7(prev => ({ ...prev, [`${field}Name`]: file.name, [`${field}URL`]: url, [`${field}Uploading`]: false }));
    } catch (err) {
      setP7(prev => ({ ...prev, [`${field}Uploading`]: false }));
    }
  };

  const handleFileP8 = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setP8(prev => ({ ...prev, [`${field}Name`]: file.name, [`${field}Uploading`]: true }));
    try {
      const storageRef = ref(storage, `applications/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setP8(prev => ({ ...prev, [`${field}Name`]: file.name, [`${field}URL`]: url, [`${field}Uploading`]: false }));
    } catch (err) {
      setP8(prev => ({ ...prev, [`${field}Uploading`]: false }));
    }
  };

  const validate = (step) => {
    const errs = [];
    if (step === 1) {
      if (!p1.position?.trim()) errs.push("Position applied for is required");
      if (!p1.hoursType) errs.push("Please select full time or part time");
      if (!p1.firstName?.trim()) errs.push("First name is required");
      if (!p1.lastName?.trim()) errs.push("Last name is required");
      if (!p1.dob) errs.push("Date of birth is required");
      if (!p1.gender) errs.push("Gender is required");
      if (!p1.address?.trim()) errs.push("Address is required");
      if (!p1.postcode?.trim()) errs.push("Postcode is required");
      if (!p1.phone?.trim()) errs.push("Mobile number is required");
      if (!p1.email?.trim()) errs.push("Email address is required");
      if (!p1.niNumber?.trim()) errs.push("National Insurance number is required");
      if (!p1.drivingLicence) errs.push("Please answer the driving licence question");
      if (!p1.emergencyName?.trim()) errs.push("Next of kin name is required");
      if (!p1.emergencyRelation?.trim()) errs.push("Next of kin relationship is required");
      if (!p1.emergencyPhone?.trim()) errs.push("Next of kin phone number is required");
    }
    if (step === 5) {
      if (!p5.settings || p5.settings.length === 0) errs.push("Please select at least one care setting");
      if (!p5.clients || p5.clients.length === 0) errs.push("Please select at least one client group");
    }
    if (step === 6) {
      if (!p6.specialArrangements) errs.push("Please answer the special arrangements question");
      if (!p6.medicalIssues) errs.push("Please answer the medical issues question");
    }
    if (step === 7) {
      if (!p7.ukRestrictions) errs.push("Please answer the UK restrictions question");
      if (!p7.workPermit) errs.push("Please answer the work permit question");
      if (!p7.docs || p7.docs.length === 0) errs.push("Please select at least one document you can provide");
      if (!p7.cvURL) errs.push("Please upload your CV (mandatory)");
      if (!p7.passportURL) errs.push("Please upload your passport (mandatory)");
      if (!p7.rtwDocURL) errs.push("Please upload your right to work document (mandatory)");
      if (!p7.poa1URL) errs.push("Please upload your first proof of address (mandatory)");
      if (!p7.poa2URL) errs.push("Please upload your second proof of address (mandatory)");
      if (!p7.proofAddress1) errs.push("Please select your first proof of address document type");
      if (!p7.proofAddress2) errs.push("Please select your second proof of address document type");
      if (p7.proofAddress1 && p7.proofAddress2 && p7.proofAddress1 === p7.proofAddress2) errs.push("Your two proof of address documents must be different types");
      if (!p7.employmentGaps) errs.push("Please complete the employment continuity check");
    }
    if (step === 8) {
      if (!p8.hasDbs) errs.push("Please confirm your DBS status");
      if (p8.hasDbs?.startsWith("Yes") && !p8.dbsDocURL) errs.push("Please upload your DBS certificate");
      if (!p8.conviction) errs.push("Please answer the criminal record declaration");
    }
    if (step === 9) {
      if (!p9.ref1?.name?.trim()) errs.push("Reference 1 name is required");
      if (!p9.ref1?.email?.trim()) errs.push("Reference 1 email is required");
      if (!p9.ref2?.name?.trim()) errs.push("Reference 2 name is required");
      if (!p9.ref2?.email?.trim()) errs.push("Reference 2 email is required");
      if (!p9.ref3?.name?.trim()) errs.push("Character reference name is required");
      if (!p9.ref3?.email?.trim()) errs.push("Character reference email is required");
    }
    if (step === 10) {
      if (!p10.bankName?.trim()) errs.push("Bank name is required");
      if (!p10.sortCode?.trim()) errs.push("Sort code is required");
      if (!p10.accountNumber?.trim()) errs.push("Account number is required");
      if (!p10.accountHolder?.trim()) errs.push("Account holder name is required");
    }
    if (step === 11) {
      if (!p11.agreed) errs.push("You must agree to the declaration before submitting");
      if (!p11.signature?.trim()) errs.push("Please type your full name as your signature");
    }
    return errs;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addDoc(collection(db, "applications"), {
        userId: user.uid, agencySlug,
        status: "pending",
        appliedAt: new Date().toLocaleDateString("en-GB"),
        submittedAt: serverTimestamp(),
        // Step 1
        position: p1.position, hoursType: p1.hoursType, weekdayAvail: p1.weekdayAvail, weekendAvail: p1.weekendAvail,
        firstName: p1.firstName, lastName: p1.lastName, dob: p1.dob, gender: p1.gender,
        address: p1.address, postcode: p1.postcode, telephone: p1.telephone, phone: p1.phone,
        email: p1.email, niNumber: p1.niNumber, drivingLicence: p1.drivingLicence,
        ownTransport: p1.ownTransport, licenceHeld: p1.licenceHeld,
        emergencyName: p1.emergencyName, emergencyRelation: p1.emergencyRelation,
        emergencyPhone: p1.emergencyPhone, emergencyAddress: p1.emergencyAddress,
        // Step 2
        ageGroup: p2.ageGroup, ethnicity: p2.ethnicity, ethnicityOther: p2.ethnicityOther,
        religion: p2.religion, religionOther: p2.religionOther,
        // Step 3
        education: p3.education, training: p3.training, courses: p3.courses,
        // Step 4
        employer1: p4.employer1, employer2: p4.employer2, employer3: p4.employer3,
        otherRoles: p4.otherRoles, relevantExperience: p4.relevantExperience,
        // Step 5
        settings: p5.settings, clients: p5.clients,
        phil1: p5.phil1, phil2: p5.phil2, phil3: p5.phil3, phil4: p5.phil4, phil5: p5.phil5,
        phil6: p5.phil6, phil7: p5.phil7, phil8: p5.phil8, phil9: p5.phil9, phil10: p5.phil10,
        // Step 6
        specialArrangements: p6.specialArrangements, specialArrangementsDetails: p6.specialArrangementsDetails,
        medicalIssues: p6.medicalIssues, medicalDetails: p6.medicalDetails,
        gpName: p6.gpName, gpPhone: p6.gpPhone, gpAddress: p6.gpAddress,
        // Step 7
        ukRestrictions: p7.ukRestrictions, ukRestrictionsDetails: p7.ukRestrictionsDetails,
        workPermit: p7.workPermit, nmcPin: p7.nmcPin, docs: p7.docs,
        cvName: p7.cvName, cvURL: p7.cvURL,
        passportName: p7.passportName, passportURL: p7.passportURL,
        rtwDocName: p7.rtwDocName, rtwDocURL: p7.rtwDocURL,
        poa1Name: p7.poa1Name, poa1URL: p7.poa1URL,
        poa2Name: p7.poa2Name, poa2URL: p7.poa2URL,
        proofAddress1: p7.proofAddress1, proofAddress2: p7.proofAddress2,
        employmentGaps: p7.employmentGaps, gapsExplanation: p7.gapsExplanation,
        // Step 8
        hasDbs: p8.hasDbs, dbsDate: p8.dbsDate, updateService: p8.updateService,
        dbsDocName: p8.dbsDocName, dbsDocURL: p8.dbsDocURL,
        conviction: p8.conviction, convictionDetails: p8.convictionDetails,
        // Step 9
        refs: [p9.ref1, p9.ref2, p9.ref3].filter(r => r?.name),
        ref1: p9.ref1, ref2: p9.ref2, ref3: p9.ref3,
        // Step 10
        bankHolderName: p10.bankHolderName, bankName: p10.bankName, bankAddress: p10.bankAddress,
        sortCode: p10.sortCode, accountNumber: p10.accountNumber,
        rollNumber: p10.rollNumber, accountHolder: p10.accountHolder,
        // Step 11
        declarationAgreed: true, signature: p11.signature,
        signedAt: new Date().toLocaleDateString("en-GB"),
        consentGiven: true, consentAt: new Date().toISOString(),
      });
      await deleteDoc(doc(db, "drafts", user.uid)).catch(() => {});
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setErrors(["Submission failed. Please try again."]);
    }
    setSaving(false);
  };

  const handleNext = async () => {
    const errs = validate(current);
    if (errs.length) { setErrors(errs); window.scrollTo(0, 0); return; }
    setErrors([]);
    setSaving(true);
    await saveProgress({ p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11 });
    setSaving(false);
    if (current === steps.length) { handleSubmit(); return; }
    setCurrent(c => c + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => { setCurrent(c => c - 1); window.scrollTo(0, 0); setErrors([]); };

  // Existing application screen
  if (existingApp) {
    const statusColors = {
      pending:  { bg: "#f5f0ff", color: "#6C3FC5", border: "#c5b3e8", label: "⏳ Pending Review" },
      approved: { bg: "#e8f5eb", color: "#1a7a3a", border: "#a3d9b1", label: "✅ Approved" },
      rejected: { bg: "#fff0f0", color: "#cc0000", border: "#ffb3b3", label: "❌ Unsuccessful" },
    };
    const sc = statusColors[existingApp.status] || statusColors.pending;
    const handleResubmit = async () => {
      if (!window.confirm("This will clear your previous application and let you start a new one. Continue?")) return;
      try {
        await deleteDoc(doc(db, "applications", existingApp.id));
        if (user?.uid) await deleteDoc(doc(db, "drafts", user.uid));
      } catch (e) {}
      setExistingApp(null);
    };
    return (
      <div style={{ minHeight: "100vh", background: "#f8f5ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ background: "white", border: "1px solid #e8e0f5", borderRadius: 16, padding: 40, width: "100%", maxWidth: 480, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", fontFamily: "serif", margin: "0 auto 16px" }}>Q</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#1a1a2e", marginBottom: 8 }}>Application Status</div>
          <div style={{ color: "#9b7fd4", fontSize: 13, marginBottom: 24 }}>You have already applied to <strong>{agencyName || agencySlug}</strong></div>
          <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{existingApp.status === "approved" ? "🎉" : existingApp.status === "rejected" ? "📋" : "⏳"}</div>
            <div style={{ color: sc.color, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{sc.label}</div>
            <div style={{ color: sc.color, fontSize: 13 }}>
              {existingApp.status === "approved" && "Congratulations! The agency will be in touch shortly."}
              {existingApp.status === "rejected" && "Thank you for applying. Unfortunately your application was not successful. You may resubmit below."}
              {existingApp.status === "pending" && "Your application is being reviewed. We'll be in touch."}
            </div>
          </div>
          {existingApp.status === "rejected" && (
            <button onClick={handleResubmit} style={{ width: "100%", padding: 13, background: "#6C3FC5", border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>📝 Resubmit New Application</button>
          )}
          <button onClick={onLogout} style={{ width: "100%", padding: 13, background: "transparent", border: "1px solid #c5b3e8", borderRadius: 8, color: "#9b7fd4", fontSize: 14, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>
    );
  }

  // Submitted screen
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f5ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ background: "white", border: "1px solid #e8e0f5", borderRadius: 16, padding: 40, width: "100%", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a2e", marginBottom: 12 }}>Application Submitted!</div>
          <div style={{ color: "#9b7fd4", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Thank you <strong>{p1.firstName}</strong>! Your application has been received by <strong>{agencyName || agencySlug}</strong>. They will review it and be in touch soon.
          </div>
          <button onClick={onLogout} style={{ width: "100%", padding: 13, background: "transparent", border: "1px solid #c5b3e8", borderRadius: 8, color: "#9b7fd4", fontSize: 14, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>
    );
  }

  const stepTitles = ["Personal Details", "Equal Opportunities", "Education & Training", "Employment History", "Experience & Care Standards", "Health & Interview", "Right to Work", "DBS & Criminal Record", "References", "Bank Details", "Declaration"];

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>Q</div>
          <div>
            <div style={s.logoText}>Quikcare</div>
            <div style={s.headerSub}>{agencyName || agencySlug} — Application</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "1px solid #e8e0f5", borderRadius: 8, padding: "6px 14px", color: "#9b7fd4", fontSize: 12, cursor: "pointer" }}>Sign Out</button>
      </div>

      <div style={s.container}>
        {/* Step indicator */}
        <div style={s.stepRow}>
          {steps.map(step => {
            const done = current > step.id;
            const active = current === step.id;
            return (
              <button key={step.id} style={s.stepBtn} onClick={() => done && setCurrent(step.id)}>
                <div style={active ? s.stepCircleActive : done ? s.stepCircleDone : s.stepCircleInactive}>
                  {done ? "✓" : step.id}
                </div>
                <span style={s.stepLabel}>{step.icon}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: 4, background: "#e8e0f5", borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((current - 1) / (steps.length - 1)) * 100}%`, background: "#6C3FC5", borderRadius: 999, transition: "width 0.3s" }} />
        </div>

        {errors.length > 0 && (
          <div style={s.errBox}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Please fix the following:</div>
            {errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        <div style={s.card}>
          <div style={s.cardTitle}>{steps[current - 1].icon} {stepTitles[current - 1]}</div>
          <div style={s.cardSub}>Step {current} of {steps.length}</div>

          {current === 1  && <Step1  data={p1}  set={setP1} />}
          {current === 2  && <Step2  data={p2}  set={setP2} />}
          {current === 3  && <Step3  data={p3}  set={setP3} />}
          {current === 4  && <Step4  data={p4}  set={setP4} />}
          {current === 5  && <Step5  data={p5}  set={setP5} />}
          {current === 6  && <Step6  data={p6}  set={setP6} />}
          {current === 7  && <Step7  data={p7}  set={setP7} handleFile={handleFileP7} />}
          {current === 8  && <Step8  data={p8}  set={setP8} handleFile={handleFileP8} />}
          {current === 9  && <Step9  data={p9}  set={setP9} />}
          {current === 10 && <Step10 data={p10} set={setP10} />}
          {current === 11 && <Step11 data={p11} set={setP11} firstName={p1.firstName} lastName={p1.lastName} position={p1.position} />}
        </div>

        <div style={s.navRow}>
          {current > 1 && <button style={s.backBtn} onClick={handleBack}>← Back</button>}
          <button style={{ ...s.nextBtn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={handleNext}>
            {saving ? "Saving..." : current === steps.length ? "Submit Application ✓" : "Continue →"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#9b7fd4" }}>
          {saving ? "Saving progress..." : "Progress saved automatically"}
        </div>
      </div>
    </div>
  );
}
