import { useState, useEffect, useMemo } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from "firebase/firestore";

const STATUS_COLORS = {
  pending: { bg: "#2a3a1a", text: "#a8d060", border: "#4a6a2a" },
  approved: { bg: "#e8e0f5", text: "#6C3FC5", border: "#2a6a4e" },
  rejected: { bg: "#3a1a1a", text: "#e07070", border: "#6a2a2a" },
};
const STATUS_LABELS = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

const s = {
  app: { minHeight: "100vh", background: "#f8f5ff", color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" },
  header: { background: "#ffffff", borderBottom: "1px solid #e8e0f5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 40, height: 40, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", fontFamily: "serif" },
  logoText: { color: "#6C3FC5", fontSize: 18, fontFamily: "'DM Serif Display', serif" },
  adminBadge: { background: "#e8e0f5", border: "1px solid #2a5a3e", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6C3FC5", fontWeight: 600, letterSpacing: "0.05em" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 },
  statCard: (color) => ({ background: "#f8f5ff", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${color}` }),
  statNum: (color) => ({ fontSize: 28, fontWeight: 700, color, fontFamily: "'DM Serif Display', serif" }),
  statLabel: { fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 },
  toolbar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: 200, background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "10px 16px", color: "#1a1a2e", fontSize: 14, outline: "none" },
  filterBtn: (active) => ({ padding: "9px 14px", borderRadius: 8, border: `1px solid ${active ? "#6C3FC5" : "#c5b3e8"}`, background: active ? "#e8e0f5" : "transparent", color: active ? "#6C3FC5" : "#6C3FC5", fontSize: 12, cursor: "pointer", fontWeight: active ? 600 : 400 }),
  exportBtn: { padding: "9px 16px", borderRadius: 8, border: "1px solid #c5b3e8", background: "transparent", color: "#6C3FC5", fontSize: 12, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e8e0f5", fontWeight: 600 },
  td: { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #0f2a20", color: "#1a1a2e" },
  tdSub: { fontSize: 12, color: "#9b7fd4", marginTop: 2 },
  statusPill: (status) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[status]?.bg || "#1a2a1a", color: STATUS_COLORS[status]?.text || "#6C3FC5", border: `1px solid ${STATUS_COLORS[status]?.border || "#2a4a2a"}` }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" },
  modalBox: { background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 16, width: "100%", maxWidth: 640, overflow: "hidden", marginBottom: 24 },
  modalHeader: { background: "#f8f5ff", padding: "20px 24px", borderBottom: "1px solid #e8e0f5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1a1a2e" },
  closeBtn: { background: "none", border: "none", color: "#9b7fd4", fontSize: 22, cursor: "pointer", lineHeight: 1 },
  modalBody: { padding: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #e8e0f5" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  detailItem: { background: "#f8f5ff", borderRadius: 8, padding: "10px 14px" },
  detailLabel: { fontSize: 10, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 },
  detailValue: { fontSize: 13, color: "#1a1a2e" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: { padding: "4px 10px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", fontSize: 12, color: "#6C3FC5" },
  actionRow: { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid #e8e0f5", background: "#f8f5ff" },
  approveBtn: { flex: 1, padding: "12px", borderRadius: 8, border: "none", background: "#6C3FC5", color: "#f8f5ff", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  rejectBtn: { flex: 1, padding: "12px", borderRadius: 8, border: "1px solid #6a2a2a", background: "#2a1010", color: "#e07070", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  loading: { textAlign: "center", padding: "60px 20px", color: "#9b7fd4", fontSize: 14 },
};

function DetailItem({ label, value }) {
  return (
    <div style={s.detailItem}>
      <div style={s.detailLabel}>{label}</div>
      <div style={s.detailValue}>{value || "—"}</div>
    </div>
  );
}

function Modal({ app, onClose, onApprove, onReject }) {
  if (!app) return null;
  return (
    <div style={s.modal} onClick={onClose}>
      <div style={s.modalBox} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div>
            <div style={s.modalTitle}>{app.firstName} {app.lastName}</div>
            <div style={{ fontSize: 12, color: "#9b7fd4", marginTop: 4 }}>Applied {app.appliedAt} · {app.postcode}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={s.statusPill(app.status)}>{STATUS_LABELS[app.status]}</span>
            <button style={s.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={s.modalBody}>
          <div style={s.section}>
            <div style={s.sectionTitle}>👤 Personal Details</div>
            <div style={s.detailGrid}>
              <DetailItem label="Email" value={app.email} />
              <DetailItem label="Phone" value={app.phone} />
              <DetailItem label="Date of Birth" value={app.dob} />
              <DetailItem label="Driving Licence" value={app.driving} />
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💼 Experience</div>
            <div style={s.detailGrid}>
              <DetailItem label="Years Experience" value={app.years} />
              <DetailItem label="Preferred Hours" value={app.hours?.join(", ")} />
            </div>
            <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Care Settings</div><div style={s.tagRow}>{app.settings?.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>
            <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Client Groups</div><div style={s.tagRow}>{app.clients?.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>
            <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Qualifications</div><div style={s.tagRow}>{app.quals?.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📋 Right to Work</div>
            <div style={s.detailGrid}>
              <DetailItem label="Status" value={app.rtwStatus} />
              <DetailItem label="Documents" value={app.docs?.join(", ")} />
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🔒 DBS</div>
            <div style={s.detailGrid}>
              <DetailItem label="DBS Certificate" value={app.hasDbs} />
              <DetailItem label="Update Service" value={app.updateService || "N/A"} />
              <DetailItem label="Convictions Declared" value={app.conviction} />
            </div>
          </div>
          {(app.cvURL || app.poa1URL || app.poa2URL) && (
            <div style={s.section}>
              <div style={s.sectionTitle}>📁 Uploaded Documents</div>
              <div style={s.tagRow}>
                {app.cvURL && <a href={app.cvURL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>📄 Download CV</a>}
                {app.poa1URL && <a href={app.poa1URL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>🏠 Proof of Address 1</a>}
                {app.poa2URL && <a href={app.poa2URL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>🏠 Proof of Address 2</a>}
              </div>
            </div>
          )}
          <div style={s.section}>
            <div style={s.sectionTitle}>⭐ References</div>
            {app.refs?.map((r, i) => (
              <div key={i} style={{ ...s.detailItem, marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "#9b7fd4" }}>{r.title} · {r.org}</div>
                <div style={{ fontSize: 12, color: "#9b7fd4" }}>{r.email}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.actionRow}>
          <button style={s.rejectBtn} onClick={() => { onReject(app.id); onClose(); }}>✕ Reject</button>
          <button style={{ ...s.approveBtn, background: "#9b7fd4", flex: "0 0 auto", padding: "12px 16px" }} onClick={() => downloadPDF(app)}>📄 PDF</button>
          <button style={s.approveBtn} onClick={() => { onApprove(app.id); onClose(); }}>✓ Approve</button>
        </div>
      </div>
    </div>
  );
}


function downloadPDF(app) {
  const html = `
    <html><head><style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; }
      h1 { color: #6C3FC5; font-size: 24px; margin-bottom: 4px; }
      h2 { color: #6C3FC5; font-size: 14px; border-bottom: 1px solid #e8e0f5; padding-bottom: 6px; margin-top: 24px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
      .field { background: #f8f5ff; padding: 10px 14px; border-radius: 6px; }
      .label { font-size: 10px; color: #9b7fd4; text-transform: uppercase; letter-spacing: 0.08em; }
      .value { font-size: 13px; color: #1a1a2e; margin-top: 2px; }
      .tag { display: inline-block; padding: 2px 8px; background: #e8e0f5; border-radius: 999px; font-size: 11px; margin: 2px; }
      .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; background: ${app.status === "approved" ? "#e0f5eb" : app.status === "rejected" ? "#fce8e8" : "#f0ebff"}; color: ${app.status === "approved" ? "#1a7a3a" : app.status === "rejected" ? "#cc0000" : "#6C3FC5"}; }
      .logo { color: #6C3FC5; font-size: 28px; font-weight: bold; margin-bottom: 4px; }
      .sub { color: #9b7fd4; font-size: 12px; margin-bottom: 24px; }
      .footer { margin-top: 40px; font-size: 11px; color: #9b7fd4; border-top: 1px solid #e8e0f5; padding-top: 12px; }
      a { color: #6C3FC5; }
    </style></head><body>
      <div class="logo">Quikcare</div>
      <div class="sub">Carer Application Form — Printed ${new Date().toLocaleDateString("en-GB")}</div>
      <h1>${app.firstName} ${app.lastName}</h1>
      <span class="status">${app.status?.toUpperCase()}</span>

      <h2>👤 Personal Details</h2>
      <div class="grid">
        <div class="field"><div class="label">Email</div><div class="value">${app.email || "—"}</div></div>
        <div class="field"><div class="label">Phone</div><div class="value">${app.phone || "—"}</div></div>
        <div class="field"><div class="label">Date of Birth</div><div class="value">${app.dob || "—"}</div></div>
        <div class="field"><div class="label">Postcode</div><div class="value">${app.postcode || "—"}</div></div>
        <div class="field"><div class="label">NI Number</div><div class="value">${app.niNumber || "—"}</div></div>
        <div class="field"><div class="label">Driving Licence</div><div class="value">${app.driving || "—"}</div></div>
        <div class="field"><div class="label">Gender</div><div class="value">${app.gender || "—"}</div></div>
        <div class="field"><div class="label">Nationality</div><div class="value">${app.nationality || "—"}</div></div>
        <div class="field"><div class="label">Religion</div><div class="value">${app.religion || "—"}</div></div>
        <div class="field"><div class="label">Languages</div><div class="value">${app.languages?.join(", ") || "—"}</div></div>
      </div>

      <h2>🚨 Emergency Contact</h2>
      <div class="grid">
        <div class="field"><div class="label">Name</div><div class="value">${app.emergencyName || "—"}</div></div>
        <div class="field"><div class="label">Relationship</div><div class="value">${app.emergencyRelation || "—"}</div></div>
        <div class="field"><div class="label">Phone</div><div class="value">${app.emergencyPhone || "—"}</div></div>
      </div>

      <h2>💼 Experience</h2>
      <div class="grid">
        <div class="field"><div class="label">Years Experience</div><div class="value">${app.years || "—"}</div></div>
        <div class="field"><div class="label">Preferred Hours</div><div class="value">${app.hours?.join(", ") || "—"}</div></div>
      </div>
      <div style="margin-top:10px"><div class="label">Care Settings</div><div style="margin-top:4px">${app.settings?.map(t => `<span class="tag">${t}</span>`).join("") || "—"}</div></div>
      <div style="margin-top:10px"><div class="label">Client Groups</div><div style="margin-top:4px">${app.clients?.map(t => `<span class="tag">${t}</span>`).join("") || "—"}</div></div>
      <div style="margin-top:10px"><div class="label">Qualifications</div><div style="margin-top:4px">${app.quals?.map(t => `<span class="tag">${t}</span>`).join("") || "—"}</div></div>

      <h2>📋 Right to Work</h2>
      <div class="grid">
        <div class="field"><div class="label">Status</div><div class="value">${app.rtwStatus || "—"}</div></div>
        <div class="field"><div class="label">Documents</div><div class="value">${app.docs?.join(", ") || "—"}</div></div>
        <div class="field"><div class="label">Proof of Address 1</div><div class="value">${app.proofAddress1 || "—"}${app.poa1URL ? ' <a href="' + app.poa1URL + '">View</a>' : ""}</div></div>
        <div class="field"><div class="label">Proof of Address 2</div><div class="value">${app.proofAddress2 || "—"}${app.poa2URL ? ' <a href="' + app.poa2URL + '">View</a>' : ""}</div></div>
        <div class="field"><div class="label">Employment Gaps</div><div class="value">${app.employmentGaps || "—"}</div></div>
        ${app.gapsExplanation ? `<div class="field" style="grid-column:1/-1"><div class="label">Gap Explanation</div><div class="value">${app.gapsExplanation}</div></div>` : ""}
        ${app.cvURL ? `<div class="field"><div class="label">CV</div><div class="value"><a href="${app.cvURL}">Download CV</a></div></div>` : ""}
      </div>

      <h2>🔒 DBS</h2>
      <div class="grid">
        <div class="field"><div class="label">DBS Certificate</div><div class="value">${app.hasDbs || "—"}</div></div>
        <div class="field"><div class="label">Update Service</div><div class="value">${app.updateService || "N/A"}</div></div>
        <div class="field"><div class="label">Convictions</div><div class="value">${app.conviction || "—"}</div></div>
      </div>

      <h2>🏦 Bank Details</h2>
      <div class="grid">
        <div class="field"><div class="label">Account Name</div><div class="value">${app.bankName || "—"}</div></div>
        <div class="field"><div class="label">Sort Code</div><div class="value">${app.sortCode || "—"}</div></div>
        <div class="field"><div class="label">Account Number</div><div class="value">${app.accountNumber || "—"}</div></div>
      </div>

      <h2>⭐ References</h2>
      ${app.refs?.map((r, i) => `
        <div class="grid" style="margin-bottom:8px">
          <div class="field"><div class="label">Reference ${i+1} Name</div><div class="value">${r.name || "—"}</div></div>
          <div class="field"><div class="label">Organisation</div><div class="value">${r.org || "—"}</div></div>
          <div class="field"><div class="label">Email</div><div class="value">${r.email || "—"}</div></div>
          <div class="field"><div class="label">Relationship</div><div class="value">${r.relation || "—"}</div></div>
        </div>`).join("") || "—"}

      <div class="footer">Generated by Quikcare Recruitment System · quikcare.co.uk · ${new Date().toLocaleDateString("en-GB")}</div>
    </body></html>
  `;
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.print();
}

function exportCSV(applications) {
  const headers = ["Name", "Email", "Phone", "Postcode", "Applied", "Experience", "DBS", "Status"];
  const rows = applications.map(a => [`${a.firstName} ${a.lastName}`, a.email, a.phone, a.postcode, a.appliedAt, a.years, a.hasDbs, a.status]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "careconnect-applications.csv"; a.click();
}

export default function AdminDashboard({ onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Live listener — updates instantly when new applications come in
  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "applications", id), { status });
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const matchFilter = filter === "all" || a.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || `${a.firstName} ${a.lastName} ${a.email} ${a.postcode}`.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [applications, filter, search]);

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>Q</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={s.adminBadge}>ADMIN DASHBOARD</span>{onLogout && <button onClick={onLogout} style={{ background: "none", border: "1px solid #c5b3e8", borderRadius: 6, padding: "4px 12px", color: "#9b7fd4", fontSize: 12, cursor: "pointer" }}>Sign Out</button>}</div>
      </div>

      <div style={s.container}>
        <div style={s.statsRow}>
          <div style={s.statCard("#6C3FC5")}><div style={s.statNum("#6C3FC5")}>{stats.total}</div><div style={s.statLabel}>Total Applications</div></div>
          <div style={s.statCard("#a8d060")}><div style={s.statNum("#a8d060")}>{stats.pending}</div><div style={s.statLabel}>Pending Review</div></div>
          <div style={s.statCard("#6C3FC5")}><div style={s.statNum("#6C3FC5")}>{stats.approved}</div><div style={s.statLabel}>Approved</div></div>
          <div style={s.statCard("#e07070")}><div style={s.statNum("#e07070")}>{stats.rejected}</div><div style={s.statLabel}>Rejected</div></div>
        </div>

        <div style={s.toolbar}>
          <input style={s.searchInput} placeholder="🔍  Search by name, email or postcode..." value={search} onChange={e => setSearch(e.target.value)} />
          {["all", "pending", "approved", "rejected"].map(f => (
            <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
          <button style={s.exportBtn} onClick={() => exportCSV(filtered)}>⬇ Export CSV</button>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={s.loading}>Loading applications...</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#f8f5ff" }}>
                  {["Applicant", "Location", "Experience", "DBS", "Applied", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...s.loading, display: "table-cell" }}>
                    {applications.length === 0 ? "No applications yet — share your app link with carers!" : "No applications match your filter"}
                  </td></tr>
                ) : filtered.map(app => (
                  <tr key={app.id}
                    style={{ background: hoveredRow === app.id ? "#f8f5ff" : "transparent", cursor: "pointer", transition: "background 0.15s" }}
                    onClick={() => setSelected(app)}
                    onMouseEnter={() => setHoveredRow(app.id)}
                    onMouseLeave={() => setHoveredRow(null)}>
                    <td style={s.td}><div style={{ fontWeight: 600 }}>{app.firstName} {app.lastName}</div><div style={s.tdSub}>{app.email}</div></td>
                    <td style={s.td}><div>{app.postcode}</div><div style={s.tdSub}>{app.driving === "Yes" ? "🚗 Driver" : "No car"}</div></td>
                    <td style={s.td}><div>{app.years}</div><div style={s.tdSub}>{app.quals?.[0]}</div></td>
                    <td style={s.td}><div>{app.hasDbs}</div><div style={s.tdSub}>{app.updateService === "Yes" ? "Update Service ✓" : ""}</div></td>
                    <td style={s.td}>{app.appliedAt}</td>
                    <td style={s.td}><span style={s.statusPill(app.status)}>{STATUS_LABELS[app.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "#9b7fd4" }}>
          {loading ? "" : `Showing ${filtered.length} of ${applications.length} applications · Updates in real time · Click any row to view details`}
        </div>
      </div>

      <Modal app={selected} onClose={() => setSelected(null)} onApprove={(id) => updateStatus(id, "approved")} onReject={(id) => updateStatus(id, "rejected")} />
    </div>
  );
}
