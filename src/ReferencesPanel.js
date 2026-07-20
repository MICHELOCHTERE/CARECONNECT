import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";

const s = {
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  card: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 12, overflow: "hidden", marginBottom: 20 },
  cardHead: { background: "#f8f5ff", borderBottom: "1px solid #e8e0f5", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#1a1a2e" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e8e0f5", fontWeight: 600 },
  td: { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #f0ebff", color: "#1a1a2e", verticalAlign: "middle" },
  tdSub: { fontSize: 12, color: "#9b7fd4", marginTop: 2 },
  pill: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: color.bg, color: color.text, border: `1px solid ${color.border}` }),
  btn: { padding: "8px 14px", borderRadius: 8, border: "none", background: "#6C3FC5", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnOutline: { padding: "8px 14px", borderRadius: 8, border: "1px solid #c5b3e8", background: "transparent", color: "#6C3FC5", fontSize: 12, cursor: "pointer" },
  btnSm: { padding: "5px 10px", borderRadius: 6, border: "none", background: "#6C3FC5", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnSmOutline: { padding: "5px 10px", borderRadius: 6, border: "1px solid #c5b3e8", background: "transparent", color: "#6C3FC5", fontSize: 11, cursor: "pointer" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" },
  modalBox: { background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  modalHead: { background: "#f8f5ff", borderBottom: "1px solid #e8e0f5", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 },
  modalTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a2e" },
  modalBody: { padding: 24, overflowY: "auto" },
  label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  input: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box" },
  infoBox: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 10, padding: 14, fontSize: 13, color: "#6C3FC5", marginBottom: 16, lineHeight: 1.6 },
  successBox: { background: "#e8f5eb", border: "1px solid #a3d9b1", borderRadius: 10, padding: 14, fontSize: 13, color: "#1a7a3a", marginBottom: 12, lineHeight: 1.6 },
  refBox: { background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 10, padding: 16, marginBottom: 16 },
  refBoxTitle: { fontSize: 12, fontWeight: 700, color: "#6C3FC5", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  empty: { textAlign: "center", padding: "48px 20px", color: "#9b7fd4", fontSize: 14 },
  detailSection: { marginBottom: 16 },
  detailTitle: { fontSize: 11, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #e8e0f5" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  detailItem: { background: "#f8f5ff", borderRadius: 8, padding: "10px 14px" },
  detailLabel: { fontSize: 10, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 },
  detailValue: { fontSize: 13, color: "#1a1a2e" },
  ratingBadge: (val) => {
    const colors = {
      "Excellent":   { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1" },
      "Very Good":   { bg: "#f0ebff", text: "#6C3FC5", border: "#c5b3e8" },
      "Good":        { bg: "#e8f0ff", text: "#2251cc", border: "#a3b9f5" },
      "Satisfactory":{ bg: "#fff8e8", text: "#b37a00", border: "#f0c060" },
      "Poor":        { bg: "#fff0f0", text: "#cc0000", border: "#ffb3b3" },
    };
    const c = colors[val] || { bg: "#f8f5ff", text: "#9b7fd4", border: "#e8e0f5" };
    return { display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}` };
  },
};

const STATUS_COLORS = {
  pending:   { bg: "#fff8e8", text: "#b37a00", border: "#f0c060", label: "⏳ Pending" },
  completed: { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1", label: "✅ Completed" },
};

const CARER_STATUS = {
  none:     { bg: "#f8f5ff", text: "#9b7fd4", border: "#e8e0f5", label: "No references" },
  partial:  { bg: "#fff8e8", text: "#b37a00", border: "#f0c060", label: "⏳ In Progress" },
  complete: { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1", label: "✅ Fully Referenced" },
};

function uid() { return Math.random().toString(36).slice(2, 11) + Date.now().toString(36); }

function downloadReferencePDF(r) {
  const RATINGS_ORDER = ["Excellent", "Very Good", "Good", "Satisfactory", "Poor"];
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reference — ${r.carerName}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;padding:32px}h1{font-size:22px;color:#6C3FC5;margin-bottom:4px}.sub{color:#9b7fd4;font-size:12px;margin-bottom:24px}.section{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6C3FC5;border-bottom:1px solid #e8e0f5;padding-bottom:6px;margin:20px 0 12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}.item{background:#f8f5ff;border-radius:6px;padding:8px 12px}.item-label{font-size:9px;color:#9b7fd4;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px}.item-value{font-size:12px;color:#1a1a2e}.full{background:#f8f5ff;border-radius:6px;padding:8px 12px;margin-bottom:8px}table{width:100%;border-collapse:collapse;margin-bottom:8px}th{background:#f8f5ff;padding:7px 8px;font-size:10px;color:#9b7fd4;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e8e0f5;text-align:center}th:first-child{text-align:left}td{padding:7px 8px;border-bottom:1px solid #f0ebff;font-size:12px;text-align:center}td:first-child{text-align:left}.tick{color:#6C3FC5;font-weight:700}.sig{font-style:italic;font-size:15px}.footer{margin-top:32px;padding-top:12px;border-top:1px solid #e8e0f5;font-size:10px;color:#9b7fd4;text-align:center}</style>
    </head><body>
    <h1>Professional Reference</h1>
    <div class="sub">Applicant: <strong>${r.carerName}</strong> &nbsp;·&nbsp; Agency: <strong>${r.agencyName}</strong> &nbsp;·&nbsp; Completed: ${r.refDate || new Date().toLocaleDateString("en-GB")}</div>
    <div class="section">⭐ Personal Attributes</div>
    <table><thead><tr><th>Attribute</th>${RATINGS_ORDER.map(rt => `<th>${rt}</th>`).join("")}</tr></thead>
    <tbody>${r.ratings ? Object.entries(r.ratings).map(([attr, val]) => `<tr><td>${attr}</td>${RATINGS_ORDER.map(rt => `<td>${val === rt ? '<span class="tick">✓</span>' : ""}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="6">No ratings</td></tr>`}</tbody></table>
    <div class="section">📋 Additional Information</div>
    <div class="grid">
      <div class="item"><div class="item-label">Known How Long</div><div class="item-value">${r.knownHowLong || "—"}</div></div>
      <div class="item"><div class="item-label">Known Capacity</div><div class="item-value">${r.knownCapacity || "—"}</div></div>
      <div class="item"><div class="item-label">Sick Days (2 yrs)</div><div class="item-value">${r.sickDays || "—"}</div></div>
      <div class="item"><div class="item-label">Would Re-employ</div><div class="item-value">${r.reemploy || "—"}</div></div>
      <div class="item"><div class="item-label">Criminal Convictions</div><div class="item-value">${r.criminalConvictions || "—"}</div></div>
    </div>
    ${r.criminalDetails ? `<div class="full"><div class="item-label">Conviction Details</div><div class="item-value">${r.criminalDetails}</div></div>` : ""}
    ${r.reemployReason ? `<div class="full"><div class="item-label">Re-employ Reason</div><div class="item-value">${r.reemployReason}</div></div>` : ""}
    ${r.additionalComments ? `<div class="full"><div class="item-label">Additional Comments</div><div class="item-value">${r.additionalComments}</div></div>` : ""}
    <div class="section">✍️ Referee Details</div>
    <div class="grid">
      <div class="item"><div class="item-label">Name</div><div class="item-value">${r.refName || "—"}</div></div>
      <div class="item"><div class="item-label">Position</div><div class="item-value">${r.refPosition || "—"}</div></div>
      <div class="item"><div class="item-label">Company</div><div class="item-value">${r.refCompany || "—"}</div></div>
      <div class="item"><div class="item-label">Contact</div><div class="item-value">${r.refContact || "—"}</div></div>
    </div>
    <div class="full"><div class="item-label">Signature</div><div class="sig">${r.refSignature || "—"}</div></div>
    <div class="footer">Generated by Quikcare · quikcare.co.uk · ${new Date().toLocaleDateString("en-GB")}</div>
  </body></html>`;
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

function DetailModal({ req, onClose }) {
  if (!req) return null;
  const r = req;
  return (
    <div style={s.modal} onClick={onClose}>
      <div style={s.modalBox} onClick={e => e.stopPropagation()}>
        <div style={s.modalHead}>
          <div style={s.modalTitle}>{r.refereeName}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {r.status === "completed" && <button style={{ ...s.btn, fontSize: 11 }} onClick={() => downloadReferencePDF(r)}>⬇ Download PDF</button>}
            <button style={{ background: "none", border: "none", fontSize: 20, color: "#9b7fd4", cursor: "pointer" }} onClick={onClose}>×</button>
          </div>
        </div>
        <div style={s.modalBody}>
          {r.status === "pending" ? (
            <>
              <div style={s.infoBox}>Reference link sent to <strong>{r.refereeEmail}</strong>. Waiting for response.</div>
              <div style={s.label}>Reference Link</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6C3FC5", wordBreak: "break-all" }}>{window.location.origin}/reference/{r.token}</div>
                <button style={s.btn} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/reference/${r.token}`)}>Copy</button>
              </div>
            </>
          ) : (
            <>
              <div style={s.detailSection}>
                <div style={s.detailTitle}>⭐ Personal Attributes</div>
                <div style={s.detailGrid}>
                  {r.ratings && Object.entries(r.ratings).map(([attr, val]) => (
                    <div key={attr} style={s.detailItem}><div style={s.detailLabel}>{attr}</div><div style={s.detailValue}><span style={s.ratingBadge(val)}>{val}</span></div></div>
                  ))}
                </div>
              </div>
              <div style={s.detailSection}>
                <div style={s.detailTitle}>📋 Additional Information</div>
                <div style={s.detailGrid}>
                  {[["Known How Long", r.knownHowLong], ["Known Capacity", r.knownCapacity], ["Sick Days (2 yrs)", r.sickDays], ["Criminal Convictions", r.criminalConvictions], ["Would Re-employ", r.reemploy]].map(([l, v]) => (
                    <div key={l} style={s.detailItem}><div style={s.detailLabel}>{l}</div><div style={s.detailValue}>{v || "—"}</div></div>
                  ))}
                </div>
                {r.criminalDetails && <div style={{ ...s.detailItem, marginTop: 8 }}><div style={s.detailLabel}>Conviction Details</div><div style={s.detailValue}>{r.criminalDetails}</div></div>}
                {r.reemployReason && <div style={{ ...s.detailItem, marginTop: 8 }}><div style={s.detailLabel}>Re-employ Reason</div><div style={s.detailValue}>{r.reemployReason}</div></div>}
                {r.additionalComments && <div style={{ ...s.detailItem, marginTop: 8 }}><div style={s.detailLabel}>Additional Comments</div><div style={s.detailValue}>{r.additionalComments}</div></div>}
              </div>
              <div style={s.detailSection}>
                <div style={s.detailTitle}>✍️ Referee Details</div>
                <div style={s.detailGrid}>
                  {[["Name", r.refName], ["Position", r.refPosition], ["Company", r.refCompany], ["Contact", r.refContact], ["Signature", r.refSignature], ["Date Signed", r.refDate]].map(([l, v]) => (
                    <div key={l} style={s.detailItem}><div style={s.detailLabel}>{l}</div><div style={s.detailValue}>{v || "—"}</div></div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CarerReferenceRow({ carerName, refs, onViewRef }) {
  const [expanded, setExpanded] = useState(false);
  const completed = refs.filter(r => r.status === "completed").length;
  const total = refs.length;
  const statusKey = total === 0 ? "none" : completed >= 2 ? "complete" : "partial";
  const sc = CARER_STATUS[statusKey];
  return (
    <>
      <tr style={{ cursor: "pointer", background: expanded ? "#faf8ff" : "transparent" }} onClick={() => setExpanded(e => !e)}>
        <td style={s.td}><div style={{ fontWeight: 600 }}>{carerName}</div><div style={s.tdSub}>{total} sent</div></td>
        <td style={s.td}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, maxWidth: 100, height: 6, background: "#e8e0f5", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((completed / 2) * 100, 100)}%`, height: "100%", background: completed >= 2 ? "#1a7a3a" : "#d4a24e", borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 12, color: "#9b7fd4" }}>{completed}/2</span>
          </div>
        </td>
        <td style={s.td}><span style={s.pill(sc)}>{sc.label}</span></td>
        <td style={s.td}><span style={{ color: "#9b7fd4", fontSize: 12 }}>{expanded ? "▲ Hide" : "▼ Show"}</span></td>
      </tr>
      {expanded && refs.map(ref => (
        <tr key={ref.id} style={{ background: "#faf8ff" }}>
          <td style={{ ...s.td, paddingLeft: 32 }}><div style={{ fontSize: 13 }}>{ref.refereeName}</div><div style={{ fontSize: 11, color: "#9b7fd4" }}>{ref.refereeEmail}</div></td>
          <td style={s.td}><div style={{ fontSize: 12, color: "#9b7fd4" }}>{ref.refereeOrg || "—"}</div></td>
          <td style={s.td}><span style={s.pill(STATUS_COLORS[ref.status] || STATUS_COLORS.pending)}>{(STATUS_COLORS[ref.status] || STATUS_COLORS.pending).label}</span></td>
          <td style={s.td}>
            <div style={{ display: "flex", gap: 6 }}>
              {ref.status === "completed" ? (
                <>
                  <button style={s.btnSm} onClick={() => onViewRef(ref)}>View</button>
                  <button style={{ ...s.btnSm, background: "#4a7a5a" }} onClick={() => downloadReferencePDF(ref)}>⬇ PDF</button>
                </>
              ) : (
                <button style={s.btnSmOutline} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/reference/${ref.token}`)}>Copy Link</button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Empty referee form ───────────────────────────────────────────────
const emptyRef = () => ({ name: "", email: "", org: "" });

export default function ReferencesPanel({ agency, applications }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [sendMode, setSendMode] = useState("carer");
  // From application mode
  const [selectedApp, setSelectedApp] = useState("");
  // Manual mode — two referees
  const [manualCarerName, setManualCarerName] = useState("");
  const [referee1, setReferee1] = useState(emptyRef());
  const [referee2, setReferee2] = useState(emptyRef());
  const [sending, setSending] = useState(false);
  const [viewReq, setViewReq] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "referenceRequests"), where("agencySlug", "==", agency.slug));
    const unsub = onSnapshot(q, snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    });
    return () => unsub();
  }, [agency.slug]);

  const grouped = requests.reduce((acc, req) => {
    if (!acc[req.carerName]) acc[req.carerName] = [];
    acc[req.carerName].push(req);
    return acc;
  }, {});

  const approvedApps = applications.filter(a => a.status === "approved");
  const chosenApp = approvedApps.find(a => a.id === selectedApp);
  // Pull both referees from application
  const appRefs = chosenApp?.refs || [];

  const totalCarers = Object.keys(grouped).length;
  const fullyReferenced = Object.values(grouped).filter(refs => refs.filter(r => r.status === "completed").length >= 2).length;
  const pendingCount = requests.filter(r => r.status === "pending").length;

  const sendEmail = async (refereeName, refereeEmail, carerName, link) => {
    try {
      await fetch("/api/send-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refereeName, refereeEmail, carerName, agencyName: agency.agencyName, referenceLink: link }),
      });
    } catch (e) { console.error("Email failed:", e); }
  };

  const createRequest = async (carerName, refereeName, refereeEmail, refereeOrg, applicationId = "") => {
    const token = uid();
    await addDoc(collection(db, "referenceRequests"), {
      token, agencySlug: agency.slug, agencyName: agency.agencyName,
      applicationId, carerName, refereeName, refereeEmail, refereeOrg,
      status: "pending", createdAt: serverTimestamp(),
    });
    const link = `${window.location.origin}/reference/${token}`;
    await sendEmail(refereeName, refereeEmail, carerName, link);
    return link;
  };

  const resetModal = () => {
    setSelectedApp("");
    setManualCarerName("");
    setReferee1(emptyRef());
    setReferee2(emptyRef());
    setSendMode("carer");
    setShowSend(false);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      if (sendMode === "carer") {
        // From application — send to ALL referees on file (up to 2)
        if (!chosenApp) { alert("Please select a carer."); setSending(false); return; }
        if (appRefs.length === 0) { alert("This carer has no referee details on file. Use Manual Entry."); setSending(false); return; }
        const carerName = `${chosenApp.firstName} ${chosenApp.lastName}`;
        const toSend = appRefs.slice(0, 2); // max 2
        for (const ref of toSend) {
          if (!ref.email) continue;
          await createRequest(carerName, ref.name || "Referee", ref.email, ref.org || "", chosenApp.id);
        }
        alert(`✅ Reference requests sent to ${toSend.length} referee(s) for ${carerName}!`);
      } else {
        // Manual — validate at least referee 1
        if (!manualCarerName.trim()) { alert("Please enter the applicant name."); setSending(false); return; }
        if (!referee1.name.trim() || !referee1.email.trim()) { alert("Please fill in Referee 1 name and email."); setSending(false); return; }
        await createRequest(manualCarerName.trim(), referee1.name.trim(), referee1.email.trim(), referee1.org.trim());
        // Send referee 2 if filled in
        if (referee2.name.trim() && referee2.email.trim()) {
          await createRequest(manualCarerName.trim(), referee2.name.trim(), referee2.email.trim(), referee2.org.trim());
          alert(`✅ Reference requests sent to both referees for ${manualCarerName.trim()}!`);
        } else {
          alert(`✅ Reference request sent to ${referee1.name.trim()}!\n\nReferee 2 was left blank — you can send it later.`);
        }
      }
      resetModal();
    } catch (e) {
      console.error(e);
      alert("Failed to send. Please try again.");
    }
    setSending(false);
  };

  const RefInput = ({ label, value, onChange, type = "text", placeholder }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={s.label}>{label}</label>
      <input type={type} style={s.input} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );

  return (
    <div style={s.container}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[["Carers in Progress", totalCarers, "#6C3FC5"], ["Awaiting Response", pendingCount, "#f59e0b"], ["Fully Referenced ✅", fullyReferenced, "#1a7a3a"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#ffffff", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${c}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c, fontFamily: "'DM Serif Display', serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#6C3FC5", marginBottom: 16 }}>
        ℹ️ A carer is <strong>Fully Referenced</strong> only when both referees have completed and submitted their forms.
      </div>

      <div style={s.card}>
        <div style={s.cardHead}>
          <div style={s.cardTitle}>📬 Reference Requests</div>
          <button style={s.btn} onClick={() => setShowSend(true)}>+ Send Request</button>
        </div>
        {loading ? (
          <div style={s.empty}>Loading...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div style={s.empty}>No reference requests sent yet. Click "+ Send Request" to get started.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={{ background: "#f8f5ff" }}>
                {["Applicant", "Progress", "Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([carerName, refs]) => (
                <CarerReferenceRow key={carerName} carerName={carerName} refs={refs} onViewRef={setViewReq} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Send modal */}
      {showSend && (
        <div style={s.modal} onClick={resetModal}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHead}>
              <div style={s.modalTitle}>Send Reference Requests</div>
              <button style={{ background: "none", border: "none", fontSize: 20, color: "#9b7fd4", cursor: "pointer" }} onClick={resetModal}>×</button>
            </div>
            <div style={s.modalBody}>
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#f8f5ff", borderRadius: 10, padding: 4 }}>
                {[["carer", "📁 From Application"], ["manual", "✏️ Manual Entry"]].map(([mode, label]) => (
                  <button key={mode} type="button"
                    style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: sendMode === mode ? "#6C3FC5" : "transparent", color: sendMode === mode ? "white" : "#9b7fd4", fontSize: 13, fontWeight: sendMode === mode ? 700 : 400, cursor: "pointer" }}
                    onClick={() => setSendMode(mode)}>{label}</button>
                ))}
              </div>

              {sendMode === "carer" ? (
                <>
                  <div style={s.infoBox}>
                    Select an approved carer — requests will automatically be sent to <strong>both referees</strong> they listed in their application.
                  </div>
                  {approvedApps.length === 0 ? (
                    <div style={{ color: "#cc0000", fontSize: 13 }}>No approved carers yet. Use Manual Entry instead.</div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={s.label}>Select Carer</label>
                        <select style={s.select} value={selectedApp} onChange={e => setSelectedApp(e.target.value)}>
                          <option value="">Choose carer...</option>
                          {approvedApps.map(a => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                        </select>
                      </div>
                      {chosenApp && appRefs.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={s.label}>Referees on file</div>
                          {appRefs.slice(0, 2).map((ref, i) => (
                            <div key={i} style={{ ...s.refBox, marginBottom: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Referee {i + 1}: {ref.name || "—"}</div>
                              <div style={{ fontSize: 12, color: "#9b7fd4", marginTop: 2 }}>{ref.email} {ref.org ? `· ${ref.org}` : ""}</div>
                            </div>
                          ))}
                          {appRefs.length === 0 && <div style={{ color: "#cc0000", fontSize: 13 }}>No referee details on file. Use Manual Entry.</div>}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div style={s.infoBox}>Fill in both referees and send in one click. Referee 2 is optional — you can send it later.</div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={s.label}>Applicant Name (who the reference is for)</label>
                    <input type="text" style={s.input} placeholder="e.g. John Smith" value={manualCarerName} onChange={e => setManualCarerName(e.target.value)} />
                  </div>

                  <div style={s.refBox}>
                    <div style={s.refBoxTitle}>👤 Referee 1 (required)</div>
                    <div style={s.grid2}>
                      <RefInput label="Name" value={referee1.name} onChange={v => setReferee1(r => ({ ...r, name: v }))} placeholder="Full name" />
                      <RefInput label="Email" type="email" value={referee1.email} onChange={v => setReferee1(r => ({ ...r, email: v }))} placeholder="email@example.com" />
                    </div>
                    <RefInput label="Organisation (optional)" value={referee1.org} onChange={v => setReferee1(r => ({ ...r, org: v }))} placeholder="e.g. NHS, Sunrise Care Home..." />
                  </div>

                  <div style={s.refBox}>
                    <div style={s.refBoxTitle}>👤 Referee 2 <span style={{ color: "#9b7fd4", fontWeight: 400, textTransform: "none", fontSize: 11 }}>(optional — can be sent later)</span></div>
                    <div style={s.grid2}>
                      <RefInput label="Name" value={referee2.name} onChange={v => setReferee2(r => ({ ...r, name: v }))} placeholder="Full name" />
                      <RefInput label="Email" type="email" value={referee2.email} onChange={v => setReferee2(r => ({ ...r, email: v }))} placeholder="email@example.com" />
                    </div>
                    <RefInput label="Organisation (optional)" value={referee2.org} onChange={v => setReferee2(r => ({ ...r, org: v }))} placeholder="e.g. NHS, Sunrise Care Home..." />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={{ ...s.btn, flex: 1, padding: 12, opacity: sending ? 0.5 : 1 }} disabled={sending} onClick={handleSend}>
                  {sending ? "Sending..." : "Send Reference Request(s) →"}
                </button>
                <button style={{ ...s.btnOutline, padding: 12 }} onClick={resetModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DetailModal req={viewReq} onClose={() => setViewReq(null)} />
    </div>
  );
}
