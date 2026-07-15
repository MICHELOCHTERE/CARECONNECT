import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const s = {
  wrap: { minHeight: "100vh", background: "#f8f5ff", fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e" },
  header: { background: "#ffffff", borderBottom: "1px solid #e8e0f5", padding: "16px 24px", display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", fontFamily: "serif" },
  logoText: { color: "#6C3FC5", fontSize: 18, fontFamily: "'DM Serif Display', serif" },
  container: { maxWidth: 640, margin: "0 auto", padding: "32px 16px 80px" },
  card: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 16, padding: 28, marginBottom: 20 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#1a1a2e", marginBottom: 6 },
  sub: { color: "#9b7fd4", fontSize: 13, lineHeight: 1.6 },
  section: { fontSize: 11, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #e8e0f5" },
  field: { marginBottom: 18 },
  label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  input: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", minHeight: 90, resize: "vertical", fontFamily: "'DM Sans', sans-serif" },
  infoBox: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 12, padding: 16, fontSize: 13, color: "#6C3FC5", lineHeight: 1.7, marginBottom: 20 },
  warningBox: { background: "#fff8e8", border: "1px solid #f0c060", borderRadius: 12, padding: 16, fontSize: 12, color: "#7a5000", lineHeight: 1.7, marginBottom: 20 },
  submitBtn: { width: "100%", padding: "14px", background: "#6C3FC5", border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 12, padding: 16, marginBottom: 20 },
  // Rating table
  ratingTable: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  ratingTh: { padding: "10px 8px", textAlign: "center", fontSize: 11, color: "#9b7fd4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #e8e0f5", background: "#f8f5ff" },
  ratingTd: { padding: "10px 8px", borderBottom: "1px solid #f0ebff", color: "#1a1a2e", verticalAlign: "middle" },
  ratingCell: { textAlign: "center", padding: "10px 4px", borderBottom: "1px solid #f0ebff" },
};

const ATTRIBUTES = [
  "Honesty & Integrity",
  "Reliability",
  "Attendance",
  "Ability to work with others",
  "Ability to work unsupervised",
  "Empathy and understanding",
  "Communication Skills",
  "Ability to complete written reports",
  "Adherence to company policies and practices",
  "Applicant's suitability for position applied",
];

const RATINGS = ["Excellent", "Very Good", "Good", "Satisfactory", "Poor"];

function RatingTable({ ratings, onChange }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={s.ratingTable}>
        <thead>
          <tr>
            <th style={{ ...s.ratingTh, textAlign: "left", minWidth: 200 }}>Personal Attribute</th>
            {RATINGS.map(r => <th key={r} style={s.ratingTh}>{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTES.map(attr => (
            <tr key={attr} style={{ background: ratings[attr] ? "#f8f5ff" : "transparent" }}>
              <td style={s.ratingTd}>{attr}</td>
              {RATINGS.map(rating => (
                <td key={rating} style={s.ratingCell}>
                  <input
                    type="radio"
                    name={attr}
                    value={rating}
                    checked={ratings[attr] === rating}
                    onChange={() => onChange(attr, rating)}
                    style={{ accentColor: "#6C3FC5", width: 16, height: 16, cursor: "pointer" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReferenceForm() {
  const token = window.location.pathname.replace("/reference/", "");
  const [docId, setDocId] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  const [ratings, setRatings] = useState({});
  const [form, setForm] = useState({
    criminalConvictions: "",
    criminalDetails: "",
    knownHowLong: "",
    knownCapacity: "",
    sickDays: "",
    reemploy: "",
    reemployReason: "",
    additionalComments: "",
    refName: "",
    refPosition: "",
    refCompany: "",
    refSignature: "",
    refDate: "",
    refContact: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setRating = (attr, val) => setRatings(r => ({ ...r, [attr]: val }));

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "referenceRequests"), where("token", "==", token));
        const snap = await getDocs(q);
        if (snap.empty) { setLoading(false); return; }
        const docSnap = snap.docs[0];
        setDocId(docSnap.id);
        const data = docSnap.data();
        setRequest(data);
        if (data.status === "completed") setSubmitted(true);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [token]);

  const validate = () => {
    const errs = [];
    const unrated = ATTRIBUTES.filter(a => !ratings[a]);
    if (unrated.length > 0) errs.push(`Please rate all personal attributes (${unrated.length} remaining)`);
    if (!form.criminalConvictions) errs.push("Please answer the criminal convictions question");
    if (!form.knownHowLong) errs.push("Please state how long you have known the applicant");
    if (!form.knownCapacity) errs.push("Please state in what capacity you know the applicant");
    if (!form.reemploy) errs.push("Please answer the re-employment question");
    if (!form.refName) errs.push("Your name is required");
    if (!form.refSignature) errs.push("Your signature is required");
    if (!form.refDate) errs.push("Date is required");
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); window.scrollTo(0, 0); return; }
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "referenceRequests", docId), {
        ratings,
        ...form,
        status: "completed",
        completedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setErrors(["Something went wrong. Please try again."]);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#9b7fd4" }}>Loading...</div>
    </div>
  );

  if (!request) return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#1a1a2e", marginBottom: 8 }}>Invalid Link</div>
        <div style={{ color: "#9b7fd4", fontSize: 14 }}>This reference request link is invalid or has expired.</div>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#1a1a2e", marginBottom: 8 }}>Thank you!</div>
        <div style={{ color: "#9b7fd4", fontSize: 14, maxWidth: 420, margin: "0 auto", lineHeight: 1.7 }}>
          Your reference for <strong>{request.carerName}</strong> has been submitted successfully to <strong>{request.agencyName}</strong>.
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logoIcon}>Q</div>
        <span style={s.logoText}>Quikcare</span>
      </div>

      <div style={s.container}>
        <div style={s.card}>
          <div style={s.title}>Reference Request Form</div>
          <div style={s.sub}>
            You have been asked to provide a professional reference for <strong>{request.carerName}</strong>,
            who has applied to work with <strong>{request.agencyName}</strong>.
          </div>
        </div>

        {errors.length > 0 && (
          <div style={s.errorBox}>
            <div style={{ color: "#cc0000", fontWeight: 700, marginBottom: 8 }}>Please fix the following:</div>
            {errors.map((e, i) => <div key={i} style={{ color: "#cc0000", fontSize: 13, marginTop: 4 }}>• {e}</div>)}
          </div>
        )}

        <div style={s.infoBox}>
          ℹ️ All information will be kept strictly confidential and used only for recruitment purposes. Please complete all sections as accurately as possible.
        </div>

        {/* Ratings Table */}
        <div style={s.card}>
          <div style={s.section}>⭐ Personal Attributes</div>
          <RatingTable ratings={ratings} onChange={setRating} />
        </div>

        {/* Rehabilitation of Offenders Act */}
        <div style={s.card}>
          <div style={s.section}>⚖️ The Rehabilitation of Offenders Act 1974</div>
          <div style={s.warningBox}>
            In order to protect the public, the post applied for is exempt from the Rehabilitation of Offenders Act 1974. It is not contrary to the Act to reveal information concerning convictions which may be considered 'spent' in relation to this application and which you consider relevant to the applicant's suitability for employment. Any such information will be treated in the strictest confidence and will not necessarily debar the applicant from employment.
          </div>
          <div style={s.field}>
            <label style={s.label}>Are you aware of any criminal convictions?</label>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              {["Yes", "No"].map(o => (
                <button key={o} type="button"
                  style={{ padding: "9px 22px", borderRadius: 999, border: `1px solid ${form.criminalConvictions === o ? "#6C3FC5" : "#c5b3e8"}`, background: form.criminalConvictions === o ? "#6C3FC5" : "transparent", color: form.criminalConvictions === o ? "white" : "#6C3FC5", fontSize: 14, cursor: "pointer", fontWeight: form.criminalConvictions === o ? 600 : 400 }}
                  onClick={() => set("criminalConvictions", o)}>{o}</button>
              ))}
            </div>
            {form.criminalConvictions === "Yes" && (
              <div style={s.field}>
                <label style={s.label}>Please give details</label>
                <textarea style={s.textarea} value={form.criminalDetails} onChange={e => set("criminalDetails", e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* Additional Questions */}
        <div style={s.card}>
          <div style={s.section}>📋 Additional Information</div>
          <div style={s.field}>
            <label style={s.label}>How long have you known the applicant?</label>
            <input type="text" style={s.input} placeholder="e.g. 3 years" value={form.knownHowLong} onChange={e => set("knownHowLong", e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>In what capacity?</label>
            <input type="text" style={s.input} placeholder="e.g. Line Manager, Colleague..." value={form.knownCapacity} onChange={e => set("knownCapacity", e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>How many sick days has the applicant had in the past two years?</label>
            <input type="text" style={s.input} placeholder="e.g. 5 days" value={form.sickDays} onChange={e => set("sickDays", e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Would you re-employ this person?</label>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              {["Yes", "No"].map(o => (
                <button key={o} type="button"
                  style={{ padding: "9px 22px", borderRadius: 999, border: `1px solid ${form.reemploy === o ? "#6C3FC5" : "#c5b3e8"}`, background: form.reemploy === o ? "#6C3FC5" : "transparent", color: form.reemploy === o ? "white" : "#6C3FC5", fontSize: 14, cursor: "pointer", fontWeight: form.reemploy === o ? 600 : 400 }}
                  onClick={() => set("reemploy", o)}>{o}</button>
              ))}
            </div>
            {form.reemploy === "No" && (
              <div style={s.field}>
                <label style={s.label}>If no, why not?</label>
                <textarea style={s.textarea} value={form.reemployReason} onChange={e => set("reemployReason", e.target.value)} />
              </div>
            )}
          </div>
          <div style={s.field}>
            <label style={s.label}>Additional Comments</label>
            <textarea style={s.textarea} placeholder="Any other relevant information..." value={form.additionalComments} onChange={e => set("additionalComments", e.target.value)} />
          </div>
        </div>

        {/* Referee Details */}
        <div style={s.card}>
          <div style={s.section}>✍️ Referee Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={s.field}><label style={s.label}>Name</label><input type="text" style={s.input} value={form.refName} onChange={e => set("refName", e.target.value)} /></div>
            <div style={s.field}><label style={s.label}>Position</label><input type="text" style={s.input} value={form.refPosition} onChange={e => set("refPosition", e.target.value)} /></div>
          </div>
          <div style={s.field}><label style={s.label}>Company / Organisation</label><input type="text" style={s.input} value={form.refCompany} onChange={e => set("refCompany", e.target.value)} /></div>
          <div style={s.field}><label style={s.label}>Contact Details (phone or email)</label><input type="text" style={s.input} value={form.refContact} onChange={e => set("refContact", e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={s.field}><label style={s.label}>Signature (type full name)</label><input type="text" style={{ ...s.input, fontStyle: "italic" }} placeholder="Type your full name" value={form.refSignature} onChange={e => set("refSignature", e.target.value)} /></div>
            <div style={s.field}><label style={s.label}>Date</label><input type="date" style={s.input} value={form.refDate} onChange={e => set("refDate", e.target.value)} /></div>
          </div>
        </div>

        <button style={{ ...s.submitBtn, opacity: submitting ? 0.6 : 1 }} disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting..." : "Submit Reference ✓"}
        </button>
      </div>
    </div>
  );
}
