import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";

const s = {
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  card: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 12, overflow: "hidden", marginBottom: 20 },
  cardHead: { background: "#f8f5ff", borderBottom: "1px solid #e8e0f5", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#1a1a2e" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e8e0f5", fontWeight: 600 },
  td: { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #f0ebff", color: "#1a1a2e", verticalAlign: "middle" },
  pill: (c) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}` }),
  btn: { padding: "7px 14px", borderRadius: 8, border: "none", background: "#6C3FC5", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnSm: { padding: "5px 10px", borderRadius: 6, border: "none", background: "#6C3FC5", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnSmOutline: { padding: "5px 10px", borderRadius: 6, border: "1px solid #c5b3e8", background: "transparent", color: "#6C3FC5", fontSize: 11, cursor: "pointer" },
  empty: { textAlign: "center", padding: "48px 20px", color: "#9b7fd4", fontSize: 14 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
  modalBox: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  modalHead: { background: "#f8f5ff", borderBottom: "1px solid #e8e0f5", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 },
  modalTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a2e" },
  modalBody: { padding: 24, overflowY: "auto" },
  section: { marginBottom: 20 },
  secTitle: { fontSize: 11, fontWeight: 700, color: "#6C3FC5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #e8e0f5" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  item: { background: "#f8f5ff", borderRadius: 8, padding: "10px 14px" },
  itemLabel: { fontSize: 10, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 },
  itemValue: { fontSize: 13, color: "#1a1a2e" },
  linkBox: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#6C3FC5", marginBottom: 16 },
};

const STATUS_COLORS = {
  received:    { bg: "#f0ebff", text: "#6C3FC5", border: "#c5b3e8", label: "📥 Received" },
  inprogress:  { bg: "#fff8e8", text: "#b37a00", border: "#f0c060", label: "⏳ In Progress" },
  completed:   { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1", label: "✅ Completed" },
};

function downloadDBSPdf(app) {
  const field = (label, value) => value ? `<div class="item"><div class="label">${label}</div><div class="value">${value || "—"}</div></div>` : '';
  const idDocs = app.idDocs || {};
  const checkedDocs = Object.entries(idDocs).filter(([,v]) => v).map(([k]) => ({
    passport: "Valid Passport", driverLicence: "UK Driving Licence", birthCert: "Birth Certificate",
    niCard: "NI Card/Letter", utilityBill: "Utility Bill", bankStatement: "Bank Statement", immigrationDoc: "Immigration Document"
  }[k])).filter(Boolean);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DBS Application — ${app.firstName} ${app.lastName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, sans-serif; color: #1a1a2e; font-size: 13px; padding: 32px 40px; }
    h1 { font-size: 22px; color: #6C3FC5; margin-bottom: 4px; }
    .sub { color: #9b7fd4; font-size: 12px; margin-bottom: 28px; }
    .section { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #6C3FC5; border-bottom: 1px solid #e8e0f5; padding-bottom: 6px; margin: 20px 0 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
    .item { background: #f8f5ff; border-radius: 6px; padding: 8px 12px; }
    .label { font-size: 9px; color: #9b7fd4; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px; }
    .value { font-size: 12px; color: #1a1a2e; }
    .addr { background: #f8f5ff; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
    .addr-title { font-size: 10px; font-weight: 700; color: #6C3FC5; margin-bottom: 6px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #f0ebff; color: #6C3FC5; border: 1px solid #c5b3e8; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e8e0f5; font-size: 10px; color: #9b7fd4; display: flex; justify-content: space-between; }
    @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body>
  <h1>DBS Application — ${app.firstName} ${app.lastName}</h1>
  <div class="sub">${app.agencyName} · Submitted: ${app.submittedAtStr || "—"} · Status: ${STATUS_COLORS[app.status]?.label || app.status}</div>

  <div class="section">1. Position</div>
  <div class="grid">
    ${field("Role / Position", app.position)}
    ${field("DBS Check Level", app.checkLevel)}
    ${field("Workforce", app.workforce)}
  </div>

  <div class="section">2. Personal Details</div>
  <div class="grid">
    ${field("Full Name", [app.title, app.firstName, app.middleName, app.lastName].filter(Boolean).join(" "))}
    ${field("Date of Birth", app.dob)}
    ${field("Gender", app.gender)}
    ${field("Place of Birth", app.placeOfBirth)}
    ${field("Country of Birth", app.countryOfBirth)}
    ${field("Nationality", app.nationality)}
    ${field("NI Number", app.niNumber)}
    ${field("Passport Number", app.passportNumber)}
    ${field("Passport Country", app.passportCountry)}
    ${field("Driving Licence", app.driverLicence)}
    ${field("Email", app.email)}
    ${field("Phone", app.phone)}
  </div>
  ${(app.otherNames || []).some(n => n.firstName || n.lastName) ? `
  <div class="section">Other Names Used</div>
  <div class="grid">
    ${(app.otherNames || []).filter(n => n.firstName || n.lastName).map(n =>
      `<div class="item"><div class="label">Name</div><div class="value">${[n.firstName,n.middleName,n.lastName].filter(Boolean).join(" ")} ${n.from ? `(${n.from} – ${n.to || "present"})` : ""}</div></div>`
    ).join("")}
  </div>` : ""}

  <div class="section">3. Address History</div>
  ${(app.addresses || []).map((a, i) => `
    <div class="addr">
      <div class="addr-title">${i === 0 ? "Current Address" : `Previous Address ${i}`}</div>
      <div>${[a.line1, a.line2, a.town, a.county, a.postcode, a.country].filter(Boolean).join(", ")}</div>
      <div style="font-size:11px;color:#9b7fd4;margin-top:4px">${a.from || ""} – ${i === 0 ? "Present" : (a.to || "")}</div>
    </div>
  `).join("")}

  <div class="section">4. Identity Documents</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
    ${checkedDocs.length ? checkedDocs.map(d => `<span class="badge">${d}</span>`).join("") : "<span style='color:#9b7fd4'>None specified</span>"}
  </div>

  <div class="section">5. Declaration</div>
  <div class="grid">
    ${field("Signed By", app.signature)}
    ${field("Date Signed", app.signDate)}
  </div>

  <div class="footer">
    <span>${app.agencyName} · DBS Application</span>
    <span>Generated: ${new Date().toLocaleDateString("en-GB")} · Quikcare Ltd</span>
  </div>
  </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

function DetailModal({ app, onClose, onStatusChange }) {
  if (!app) return null;
  return (
    <div style={s.modal} onClick={onClose}>
      <div style={s.modalBox} onClick={e => e.stopPropagation()}>
        <div style={s.modalHead}>
          <div>
            <div style={s.modalTitle}>{app.firstName} {app.lastName}</div>
            <div style={{ fontSize: 12, color: "#9b7fd4", marginTop: 2 }}>{app.email} · Submitted {app.submittedAtStr}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={{ ...s.btn, fontSize: 11 }} onClick={() => downloadDBSPdf(app)}>⬇ PDF</button>
            <button style={{ background: "none", border: "none", fontSize: 22, color: "#9b7fd4", cursor: "pointer" }} onClick={onClose}>×</button>
          </div>
        </div>
        <div style={s.modalBody}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "#9b7fd4" }}>Status:</span>
            {Object.entries(STATUS_COLORS).map(([key, c]) => (
              <button key={key} onClick={() => onStatusChange(app.id, key)}
                style={{ ...s.btnSm, background: app.status === key ? c.text : "transparent", color: app.status === key ? "white" : c.text, border: `1px solid ${c.border}` }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={s.section}>
            <div style={s.secTitle}>Position</div>
            <div style={s.grid}>
              {[["Role", app.position],["Check Level", app.checkLevel],["Workforce", app.workforce]].map(([l,v]) => (
                <div key={l} style={s.item}><div style={s.itemLabel}>{l}</div><div style={s.itemValue}>{v || "—"}</div></div>
              ))}
            </div>
          </div>

          <div style={s.section}>
            <div style={s.secTitle}>Personal Details</div>
            <div style={s.grid}>
              {[
                ["Full Name", [app.title,app.firstName,app.middleName,app.lastName].filter(Boolean).join(" ")],
                ["Date of Birth", app.dob], ["Gender", app.gender], ["Place of Birth", app.placeOfBirth],
                ["Country of Birth", app.countryOfBirth], ["Nationality", app.nationality],
                ["NI Number", app.niNumber], ["Passport No.", app.passportNumber],
                ["Passport Country", app.passportCountry], ["Driving Licence", app.driverLicence],
                ["Email", app.email], ["Phone", app.phone],
              ].map(([l,v]) => v ? (
                <div key={l} style={s.item}><div style={s.itemLabel}>{l}</div><div style={s.itemValue}>{v}</div></div>
              ) : null)}
            </div>
          </div>

          {(app.addresses || []).length > 0 && (
            <div style={s.section}>
              <div style={s.secTitle}>Address History</div>
              {app.addresses.map((a, i) => (
                <div key={i} style={{ ...s.item, marginBottom: 8 }}>
                  <div style={s.itemLabel}>{i === 0 ? "Current Address" : `Previous Address ${i}`}</div>
                  <div style={s.itemValue}>{[a.line1, a.line2, a.town, a.county, a.postcode, a.country].filter(Boolean).join(", ")}</div>
                  <div style={{ fontSize: 11, color: "#9b7fd4", marginTop: 4 }}>{a.from} – {i === 0 ? "Present" : (a.to || "")}</div>
                </div>
              ))}
            </div>
          )}

          <div style={s.section}>
            <div style={s.secTitle}>ID Documents</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(app.idDocs || {}).filter(([,v]) => v).map(([k]) => (
                <span key={k} style={{ ...s.pill(STATUS_COLORS.received), fontSize: 12 }}>
                  {({ passport:"Passport", driverLicence:"Driving Licence", birthCert:"Birth Cert", niCard:"NI Card", utilityBill:"Utility Bill", bankStatement:"Bank Statement", immigrationDoc:"Immigration Doc" })[k]}
                </span>
              ))}
            </div>
          </div>

          <div style={s.section}>
            <div style={s.secTitle}>Declaration</div>
            <div style={s.grid}>
              <div style={s.item}><div style={s.itemLabel}>Signed By</div><div style={{ ...s.itemValue, fontStyle: "italic" }}>{app.signature}</div></div>
              <div style={s.item}><div style={s.itemLabel}>Date Signed</div><div style={s.itemValue}>{app.signDate}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DBSPanel({ agency }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "dbsApplications"), where("agencySlug", "==", agency.slug));
    const unsub = onSnapshot(q, snap => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0)));
      setLoading(false);
    });
    return () => unsub();
  }, [agency.slug]);

  const handleStatusChange = async (id, status) => {
    await updateDoc(doc(db, "dbsApplications", id), { status });
    setSelected(s => s ? { ...s, status } : s);
  };

  const received = apps.filter(a => a.status === "received").length;
  const inProgress = apps.filter(a => a.status === "inprogress").length;
  const completed = apps.filter(a => a.status === "completed").length;

  // Shareable DBS form link
  const dbsLink = `${window.location.origin}/dbs/${agency.slug}`;

  return (
    <div style={s.container}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[["Received", received, "#6C3FC5"], ["In Progress", inProgress, "#f59e0b"], ["Completed ✅", completed, "#1a7a3a"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${c}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c, fontFamily: "'DM Serif Display', serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Link box */}
      <div style={{ background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#6C3FC5", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span>🔗 Share this link with carers to fill in their DBS application: <strong>{dbsLink}</strong></span>
        <button style={s.btnSm} onClick={() => { navigator.clipboard.writeText(dbsLink); alert("Link copied!"); }}>Copy Link</button>
      </div>

      <div style={s.card}>
        <div style={s.cardHead}>
          <div style={s.cardTitle}>🔒 DBS Applications</div>
        </div>
        {loading ? (
          <div style={s.empty}>Loading...</div>
        ) : apps.length === 0 ? (
          <div style={s.empty}>No DBS applications yet. Share the link above with carers.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={{ background: "#f8f5ff" }}>
                {["Applicant", "Position", "Check Level", "Submitted", "Status", "Actions"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map(app => {
                const sc = STATUS_COLORS[app.status] || STATUS_COLORS.received;
                return (
                  <tr key={app.id}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>{app.firstName} {app.lastName}</div>
                      <div style={{ fontSize: 12, color: "#9b7fd4" }}>{app.email}</div>
                    </td>
                    <td style={s.td}>{app.position || "—"}</td>
                    <td style={s.td}>{app.checkLevel || "—"}</td>
                    <td style={s.td}>{app.submittedAtStr || "—"}</td>
                    <td style={s.td}><span style={s.pill(sc)}>{sc.label}</span></td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={s.btnSm} onClick={() => setSelected(app)}>View</button>
                        <button style={{ ...s.btnSm, background: "#4a7a5a" }} onClick={() => downloadDBSPdf(app)}>⬇ PDF</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <DetailModal app={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
    </div>
  );
}
