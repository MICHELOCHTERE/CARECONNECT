import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

const s = {
  page: { minHeight: "100vh", background: "#f8f5ff", fontFamily: "'DM Sans', Arial, sans-serif", padding: "32px 16px" },
  wrap: { maxWidth: 760, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 32 },
  logo: { width: 52, height: 52, background: "#6C3FC5", borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "white", fontFamily: "serif", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 700, color: "#1a1a2e", fontFamily: "'DM Serif Display', serif", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#9b7fd4" },
  card: { background: "white", borderRadius: 16, border: "1px solid #e8e0f5", padding: "28px 28px", marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#6C3FC5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #e8e0f5" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 },
  field: { marginBottom: 14 },
  label: { display: "block", fontSize: 11, fontWeight: 700, color: "#6C3FC5", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  input: { width: "100%", padding: "11px 14px", border: "1px solid #c5b3e8", borderRadius: 8, fontSize: 14, color: "#1a1a2e", background: "#f8f5ff", outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "11px 14px", border: "1px solid #c5b3e8", borderRadius: 8, fontSize: 14, color: "#1a1a2e", background: "#f8f5ff", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 14px", border: "1px solid #c5b3e8", borderRadius: 8, fontSize: 14, color: "#1a1a2e", background: "#f8f5ff", outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 70 },
  addBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px dashed #c5b3e8", borderRadius: 8, background: "transparent", color: "#6C3FC5", fontSize: 13, cursor: "pointer", marginTop: 8 },
  removeBtn: { background: "none", border: "none", color: "#cc0000", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "0 4px" },
  submitBtn: { width: "100%", padding: "15px", background: "#6C3FC5", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 },
  infoBox: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#6C3FC5", marginBottom: 20, lineHeight: 1.6 },
  successBox: { background: "#e8f5eb", border: "1px solid #a3d9b1", borderRadius: 16, padding: "40px 32px", textAlign: "center" },
  errorBox: { background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#cc0000", marginBottom: 16 },
  checkRow: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  checkLabel: { fontSize: 13, color: "#4a4a6a", lineHeight: 1.5 },
  addrBox: { background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 10, padding: 16, marginBottom: 12 },
};

const emptyAddr = () => ({ from: "", to: "", line1: "", line2: "", town: "", county: "", postcode: "", country: "United Kingdom" });
const emptyName = () => ({ firstName: "", middleName: "", lastName: "", from: "", to: "" });

const Field = ({ label, children }) => (
  <div style={s.field}>{label && <label style={s.label}>{label}</label>}{children}</div>
);

export default function DBSForm({ agencySlug, agencyName: agencyNameProp }) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [agencyName, setAgencyName] = useState(agencyNameProp || "");

  // If agencyName wasn't passed as a prop, look it up from Firestore via slug
  useEffect(() => {
    if (agencyNameProp || !agencySlug) return;
    const fetchAgency = async () => {
      try {
        const slugDoc = await getDoc(doc(db, "agencySlugs", agencySlug));
        if (slugDoc.exists()) {
          const uid = slugDoc.data().uid;
          const agencyDoc = await getDoc(doc(db, "agencies", uid));
          if (agencyDoc.exists()) setAgencyName(agencyDoc.data().agencyName || agencySlug);
        }
      } catch { setAgencyName(agencySlug); }
    };
    fetchAgency();
  }, [agencySlug, agencyNameProp]);

  // Section 1 — Position applied for
  const [position, setPosition] = useState("");
  const [workforce, setWorkforce] = useState("");
  const [checkLevel, setCheckLevel] = useState("Enhanced");

  // Section 2 — Personal details
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState([emptyName()]);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [countryOfBirth, setCountryOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [niNumber, setNiNumber] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportCountry, setPassportCountry] = useState("");
  const [driverLicence, setDriverLicence] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Section 3 — Address history (5 years)
  const [addresses, setAddresses] = useState([emptyAddr()]);

  // Section 4 — ID documents
  const [idDocs, setIdDocs] = useState({ passport: false, driverLicence: false, birthCert: false, niCard: false, utilityBill: false, bankStatement: false, immigrationDoc: false });

  // Section 5 — Declaration
  const [declareSigned, setDeclareSigned] = useState(false);
  const [signature, setSignature] = useState("");
  const [signDate, setSignDate] = useState(new Date().toISOString().slice(0, 10));

  const updateAddr = (i, field, val) => setAddresses(a => a.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  const updateOtherName = (i, field, val) => setOtherNames(n => n.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const handleSubmit = async () => {
    if (!firstName || !lastName || !dob || !niNumber || !email) {
      setError("Please fill in all required fields: First Name, Last Name, Date of Birth, NI Number and Email.");
      return;
    }
    if (!declareSigned || !signature) {
      setError("Please sign the declaration to submit.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const submittedAt = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
      await addDoc(collection(db, "dbsApplications"), {
        agencySlug, agencyName,
        position, workforce, checkLevel,
        title, firstName, middleName, lastName, otherNames,
        dob, gender, placeOfBirth, countryOfBirth, nationality,
        niNumber, passportNumber, passportCountry, driverLicence,
        email, phone, addresses, idDocs,
        signature, signDate,
        status: "received",
        submittedAt: serverTimestamp(),
        submittedAtStr: submittedAt,
      });

      // Notify agency
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "dbsNotification",
          data: { carerName: `${firstName} ${lastName}`, carerEmail: email, agencySlug, submittedAt },
        }),
      }).catch(e => console.error("DBS email failed:", e));

      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setError("Submission failed. Please try again.");
    }
    setSaving(false);
  };

  if (submitted) return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.successBox}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1a7a3a", fontFamily: "'DM Serif Display', serif", marginBottom: 8 }}>DBS Application Submitted</div>
          <div style={{ fontSize: 14, color: "#4a4a6a", lineHeight: 1.7 }}>
            Thank you, <strong>{firstName} {lastName}</strong>. Your DBS application has been received by <strong>{agencyName}</strong>.<br />
            They will be in touch with next steps.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.header}>
          <div style={s.logo}>Q</div>
          <div style={s.title}>DBS Application Form</div>
          <div style={s.subtitle}>{agencyName} · Powered by Quikcare</div>
        </div>

        <div style={s.infoBox}>
          ℹ️ This form collects the information required to process your Disclosure and Barring Service (DBS) check.
          All fields marked with * are required. Your data is handled in accordance with our <a href="/privacy" style={{ color: "#6C3FC5" }}>Privacy Policy</a>.
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {/* Section 1 — Position */}
        <div style={s.card}>
          <div style={s.sectionTitle}>1. Position Applied For</div>
          <div style={s.grid2}>
            <Field label="Position / Role *">
              <input style={s.input} value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Care Assistant" />
            </Field>
            <Field label="DBS Check Level *">
              <select style={s.select} value={checkLevel} onChange={e => setCheckLevel(e.target.value)}>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Enhanced">Enhanced</option>
                <option value="Enhanced with Barred Lists">Enhanced with Barred Lists</option>
              </select>
            </Field>
          </div>
          <Field label="Workforce">
            <select style={s.select} value={workforce} onChange={e => setWorkforce(e.target.value)}>
              <option value="">Select...</option>
              <option value="Adult">Adult Workforce</option>
              <option value="Child">Child Workforce</option>
              <option value="Both">Both Adult and Child Workforce</option>
              <option value="Other">Other Workforce</option>
            </select>
          </Field>
        </div>

        {/* Section 2 — Personal Details */}
        <div style={s.card}>
          <div style={s.sectionTitle}>2. Personal Details</div>
          <div style={s.grid3}>
            <Field label="Title">
              <select style={s.select} value={title} onChange={e => setTitle(e.target.value)}>
                <option value="">Select...</option>
                {["Mr","Mrs","Miss","Ms","Dr","Prof","Rev","Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="First Name *">
              <input style={s.input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
            </Field>
            <Field label="Middle Name(s)">
              <input style={s.input} value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="If applicable" />
            </Field>
          </div>
          <div style={s.grid2}>
            <Field label="Last Name *">
              <input style={s.input} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
            </Field>
            <Field label="Date of Birth *">
              <input style={s.input} type="date" value={dob} onChange={e => setDob(e.target.value)} />
            </Field>
          </div>
          <div style={s.grid2}>
            <Field label="Gender">
              <select style={s.select} value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Place of Birth">
              <input style={s.input} value={placeOfBirth} onChange={e => setPlaceOfBirth(e.target.value)} placeholder="Town/City" />
            </Field>
          </div>
          <div style={s.grid2}>
            <Field label="Country of Birth">
              <input style={s.input} value={countryOfBirth} onChange={e => setCountryOfBirth(e.target.value)} placeholder="Country" />
            </Field>
            <Field label="Nationality">
              <input style={s.input} value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. British" />
            </Field>
          </div>
          <div style={s.grid2}>
            <Field label="National Insurance Number *">
              <input style={s.input} value={niNumber} onChange={e => setNiNumber(e.target.value.toUpperCase())} placeholder="e.g. AB 12 34 56 C" maxLength={13} />
            </Field>
            <Field label="Passport Number">
              <input style={s.input} value={passportNumber} onChange={e => setPassportNumber(e.target.value)} placeholder="If applicable" />
            </Field>
          </div>
          <div style={s.grid2}>
            <Field label="Passport Issuing Country">
              <input style={s.input} value={passportCountry} onChange={e => setPassportCountry(e.target.value)} placeholder="e.g. United Kingdom" />
            </Field>
            <Field label="Driving Licence Number">
              <input style={s.input} value={driverLicence} onChange={e => setDriverLicence(e.target.value)} placeholder="If applicable" />
            </Field>
          </div>
          <div style={s.grid2}>
            <Field label="Email Address *">
              <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </Field>
            <Field label="Phone Number">
              <input style={s.input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07..." />
            </Field>
          </div>

          {/* Other names */}
          <div style={{ marginTop: 8 }}>
            <div style={{ ...s.label, marginBottom: 10 }}>Other Names Ever Used (maiden name, previous names)</div>
            {otherNames.map((n, i) => (
              <div key={i} style={s.addrBox}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6C3FC5" }}>Name {i + 1}</span>
                  {otherNames.length > 1 && <button style={s.removeBtn} onClick={() => setOtherNames(n => n.filter((_, idx) => idx !== i))}>×</button>}
                </div>
                <div style={s.grid3}>
                  {["firstName","middleName","lastName"].map(f => (
                    <Field key={f} label={f === "firstName" ? "First Name" : f === "middleName" ? "Middle Name" : "Last Name"}>
                      <input style={s.input} value={n[f]} onChange={e => updateOtherName(i, f, e.target.value)} />
                    </Field>
                  ))}
                </div>
                <div style={s.grid2}>
                  <Field label="Used From"><input style={s.input} type="date" value={n.from} onChange={e => updateOtherName(i, "from", e.target.value)} /></Field>
                  <Field label="Used To"><input style={s.input} type="date" value={n.to} onChange={e => updateOtherName(i, "to", e.target.value)} /></Field>
                </div>
              </div>
            ))}
            <button style={s.addBtn} onClick={() => setOtherNames(n => [...n, emptyName()])}>+ Add name</button>
          </div>
        </div>

        {/* Section 3 — Address History */}
        <div style={s.card}>
          <div style={s.sectionTitle}>3. Address History (last 5 years)</div>
          <div style={{ fontSize: 13, color: "#9b7fd4", marginBottom: 16 }}>Please provide all addresses where you have lived in the past 5 years, starting with your current address.</div>
          {addresses.map((addr, i) => (
            <div key={i} style={s.addrBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#6C3FC5" }}>{i === 0 ? "Current Address" : `Previous Address ${i}`}</span>
                {addresses.length > 1 && i > 0 && <button style={s.removeBtn} onClick={() => setAddresses(a => a.filter((_, idx) => idx !== i))}>×</button>}
              </div>
              <Field label="Address Line 1 *">
                <input style={s.input} value={addr.line1} onChange={e => updateAddr(i, "line1", e.target.value)} placeholder="House number and street" />
              </Field>
              <Field label="Address Line 2">
                <input style={s.input} value={addr.line2} onChange={e => updateAddr(i, "line2", e.target.value)} placeholder="Flat, apartment, etc." />
              </Field>
              <div style={s.grid3}>
                <Field label="Town/City *"><input style={s.input} value={addr.town} onChange={e => updateAddr(i, "town", e.target.value)} /></Field>
                <Field label="County"><input style={s.input} value={addr.county} onChange={e => updateAddr(i, "county", e.target.value)} /></Field>
                <Field label="Postcode *"><input style={s.input} value={addr.postcode} onChange={e => updateAddr(i, "postcode", e.target.value.toUpperCase())} /></Field>
              </div>
              <div style={s.grid3}>
                <Field label="Country"><input style={s.input} value={addr.country} onChange={e => updateAddr(i, "country", e.target.value)} /></Field>
                <Field label="Lived Here From *"><input style={s.input} type="date" value={addr.from} onChange={e => updateAddr(i, "from", e.target.value)} /></Field>
                <Field label="Lived Here To">{i === 0 ? <input style={{ ...s.input, background: "#ede8fa", color: "#9b7fd4" }} value="Present" disabled /> : <input style={s.input} type="date" value={addr.to} onChange={e => updateAddr(i, "to", e.target.value)} />}</Field>
              </div>
            </div>
          ))}
          <button style={s.addBtn} onClick={() => setAddresses(a => [...a, emptyAddr()])}>+ Add previous address</button>
        </div>

        {/* Section 4 — ID Documents */}
        <div style={s.card}>
          <div style={s.sectionTitle}>4. Identity Documents Available</div>
          <div style={{ fontSize: 13, color: "#9b7fd4", marginBottom: 16 }}>Please tick all documents you can provide to the agency to verify your identity.</div>
          {[
            ["passport", "Valid Passport"],
            ["driverLicence", "UK Driving Licence (photocard)"],
            ["birthCert", "Birth Certificate"],
            ["niCard", "National Insurance Card/Letter"],
            ["utilityBill", "Utility Bill (within 3 months)"],
            ["bankStatement", "Bank Statement (within 3 months)"],
            ["immigrationDoc", "Immigration Status Document"],
          ].map(([key, label]) => (
            <div key={key} style={s.checkRow}>
              <input type="checkbox" id={key} checked={idDocs[key]} onChange={e => setIdDocs(d => ({ ...d, [key]: e.target.checked }))} style={{ marginTop: 2, accentColor: "#6C3FC5" }} />
              <label htmlFor={key} style={s.checkLabel}>{label}</label>
            </div>
          ))}
        </div>

        {/* Section 5 — Declaration */}
        <div style={s.card}>
          <div style={s.sectionTitle}>5. Declaration</div>
          <div style={{ background: "#f0ebff", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#4a4a6a", lineHeight: 1.7, marginBottom: 20 }}>
            I declare that the information I have given on this form is correct and complete to the best of my knowledge. I understand that giving false information is an offence and that my application may be rejected or withdrawn if false or incomplete information is given. I consent to my personal information being processed and shared for the purposes of this DBS check in accordance with the Data Protection Act 2018.
          </div>
          <div style={s.grid2}>
            <Field label="Signature (type your full name) *">
              <input style={s.input} value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name" />
            </Field>
            <Field label="Date *">
              <input style={s.input} type="date" value={signDate} onChange={e => setSignDate(e.target.value)} />
            </Field>
          </div>
          <div style={s.checkRow}>
            <input type="checkbox" id="declare" checked={declareSigned} onChange={e => setDeclareSigned(e.target.checked)} style={{ marginTop: 2, accentColor: "#6C3FC5" }} />
            <label htmlFor="declare" style={s.checkLabel}>I confirm that the above declaration is true and I consent to this DBS application being processed.</label>
          </div>
        </div>

        <button style={{ ...s.submitBtn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={handleSubmit}>
          {saving ? "Submitting..." : "Submit DBS Application →"}
        </button>
        <div style={{ textAlign: "center", fontSize: 11, color: "#9b7fd4", marginTop: 12, paddingBottom: 32 }}>
          Quikcare Ltd · Company No. 17206901 · <a href="/privacy" style={{ color: "#9b7fd4" }}>Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
