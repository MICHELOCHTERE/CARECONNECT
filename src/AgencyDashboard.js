import { useState, useEffect, useMemo } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, orderBy, query, where } from "firebase/firestore";

const STATUS_COLORS = {
  pending: { bg: "#f5f0ff", text: "#6C3FC5", border: "#c5b3e8" },
  approved: { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1" },
  rejected: { bg: "#fff0f0", text: "#cc0000", border: "#ffb3b3" },
};
const STATUS_LABELS = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

const s = {
  app: { minHeight: "100vh", background: "#f8f5ff", color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" },
  header: { background: "#ffffff", borderBottom: "1px solid #e8e0f5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: "#6C3FC5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", fontFamily: "serif" },
  logoText: { color: "#6C3FC5", fontSize: 18, fontFamily: "'DM Serif Display', serif" },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  agencyBadge: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6C3FC5", fontWeight: 600 },
  logoutBtn: { background: "none", border: "1px solid #c5b3e8", borderRadius: 6, padding: "4px 12px", color: "#9b7fd4", fontSize: 12, cursor: "pointer" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 },
  statCard: (color) => ({ background: "#ffffff", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${color}` }),
  statNum: (color) => ({ fontSize: 28, fontWeight: 700, color, fontFamily: "'DM Serif Display', serif" }),
  statLabel: { fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 },
  applyLink: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" },
  applyLinkText: { color: "#6C3FC5", fontSize: 14, fontWeight: 600 },
  copyBtn: { padding: "8px 16px", background: "#6C3FC5", border: "none", borderRadius: 8, color: "white", fontSize: 13, cursor: "pointer" },
  toolbar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: 200, background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 8, padding: "10px 16px", color: "#1a1a2e", fontSize: 14, outline: "none" },
  filterBtn: (active) => ({ padding: "9px 14px", borderRadius: 8, border: `1px solid ${active ? "#6C3FC5" : "#e8e0f5"}`, background: active ? "#f0ebff" : "transparent", color: active ? "#6C3FC5" : "#9b7fd4", fontSize: 12, cursor: "pointer", fontWeight: active ? 600 : 400 }),
  exportBtn: { padding: "9px 16px", borderRadius: 8, border: "1px solid #e8e0f5", background: "transparent", color: "#9b7fd4", fontSize: 12, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e8e0f5", fontWeight: 600 },
  td: { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #f0ebff", color: "#1a1a2e" },
  tdSub: { fontSize: 12, color: "#9b7fd4", marginTop: 2 },
  statusPill: (status) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[status]?.bg, color: STATUS_COLORS[status]?.text, border: `1px solid ${STATUS_COLORS[status]?.border}` }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" },
  modalBox: { background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 16, width: "100%", maxWidth: 640, overflow: "hidden", marginBottom: 24 },
  modalHeader: { background: "#f8f5ff", padding: "20px 24px", borderBottom: "1px solid #e8e0f5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1a1a2e" },
  closeBtn: { background: "none", border: "none", color: "#9b7fd4", fontSize: 22, cursor: "pointer" },
  modalBody: { padding: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #e8e0f5" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  detailItem: { background: "#f8f5ff", borderRadius: 8, padding: "10px 14px" },
  detailLabel: { fontSize: 10, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 },
  detailValue: { fontSize: 13, color: "#1a1a2e" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: { padding: "4px 10px", borderRadius: 999, background: "#f0ebff", border: "1px solid #e8e0f5", fontSize: 12, color: "#6C3FC5" },
  actionRow: { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid #e8e0f5", background: "#f8f5ff" },
  approveBtn: { flex: 1, padding: "12px", borderRadius: 8, border: "none", background: "#6C3FC5", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  rejectBtn: { flex: 1, padding: "12px", borderRadius: 8, border: "1px solid #ffb3b3", background: "#fff0f0", color: "#cc0000", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  pdfBtn: { padding: "12px 16px", borderRadius: 8, border: "1px solid #c5b3e8", background: "#f0ebff", color: "#6C3FC5", fontSize: 14, cursor: "pointer" },
  loading: { textAlign: "center", padding: "60px 20px", color: "#9b7fd4", fontSize: 14 },
  empty: { textAlign: "center", padding: "60px 20px", color: "#9b7fd4", fontSize: 14 },
};

function DetailItem({ label, value }) {
  return (
    <div style={s.detailItem}>
      <div style={s.detailLabel}>{label}</div>
      <div style={s.detailValue}>{value || "—"}</div>
    </div>
  );
}

function Modal({ app, agency, onClose, onApprove, onReject }) {
  if (!app) return null;
  const downloadPDF = () => {
    const field = (label, value) => `<div class="field"><div class="label">${label}</div><div class="value">${value || '—'}</div></div>`;
    const section = (title, fields) => `<div class="section"><h2>${title}</h2><div class="grid">${fields}</div></div>`;
    const tags = (arr) => arr?.length ? arr.map(t => `<span class="tag">${t}</span>`).join('') : '—';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${app.firstName} ${app.lastName} — Application</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; color: #1a1a2e; font-size: 13px; line-height: 1.5; }
      .page { padding: 32px 40px; max-width: 900px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6C3FC5; padding-bottom: 16px; margin-bottom: 24px; }
      .header-left h1 { font-size: 24px; color: #6C3FC5; margin-bottom: 4px; }
      .header-left p { color: #9b7fd4; font-size: 12px; }
      .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
      .status-pending { background: #f5f0ff; color: #6C3FC5; border: 1px solid #c5b3e8; }
      .status-approved { background: #e8f5eb; color: #1a7a3a; border: 1px solid #a3d9b1; }
      .status-rejected { background: #fff0f0; color: #cc0000; border: 1px solid #ffb3b3; }
      .logo { font-size: 20px; font-weight: 700; color: #6C3FC5; }
      .section { margin-bottom: 20px; page-break-inside: avoid; }
      h2 { font-size: 11px; color: #6C3FC5; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #e8e0f5; padding-bottom: 6px; margin-bottom: 10px; font-weight: 700; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
      .field { background: #f8f5ff; padding: 8px 12px; border-radius: 6px; }
      .field.full { grid-column: 1 / -1; }
      .label { font-size: 9px; color: #9b7fd4; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
      .value { font-size: 12px; color: #1a1a2e; }
      .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
      .tag { background: #f0ebff; border: 1px solid #e8e0f5; border-radius: 999px; padding: 2px 8px; font-size: 11px; color: #6C3FC5; }
      .docs-section { background: #f8f5ff; border-radius: 8px; padding: 12px 16px; margin-top: 8px; }
      .doc-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid #e8e0f5; font-size: 12px; }
      .doc-row:last-child { border-bottom: none; }
      .doc-link { color: #6C3FC5; font-size: 11px; }
      .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e8e0f5; display: flex; justify-content: space-between; font-size: 10px; color: #9b7fd4; }
      @media print {
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .page { padding: 16px 24px; }
        .section { page-break-inside: avoid; }
      }
    </style></head>
    <body><div class="page">

      <div class="header">
        <div class="header-left">
          <h1>${app.firstName || ''} ${app.lastName || ''}</h1>
          <p>Applied: ${app.appliedAt || '—'} &nbsp;|&nbsp; ${app.email || ''} &nbsp;|&nbsp; ${app.phone || ''}</p>
        </div>
        <div style="text-align:right">
          <div class="logo">${agency?.agencyName || 'Quikcare'}</div>
          <div style="margin-top:8px"><span class="status status-${app.status || 'pending'}">${app.status || 'pending'}</span></div>
        </div>
      </div>

      ${section('👤 Personal Details', `
        ${field('First Name', app.firstName)}
        ${field('Last Name', app.lastName)}
        ${field('Date of Birth', app.dob)}
        ${field('Gender', app.gender)}
        ${field('Nationality', app.nationality)}
        ${field('NI Number', app.niNumber)}
        ${field('Email', app.email)}
        ${field('Phone', app.phone)}
        ${field('Postcode', app.postcode)}
        ${field('Driving Licence', app.driving)}
        ${field('Languages', app.languages?.join(', '))}
        ${field('Emergency Contact', app.emergencyContact)}
      `)}

      ${section('💼 Experience & Qualifications', `
        ${field('Years of Experience', app.years)}
        ${field('Preferred Hours', app.hours?.join(', '))}
        ${field('Care Categories', app.careCategories?.join(', '))}
        <div class="field full"><div class="label">Qualifications</div><div class="tags">${tags(app.quals)}</div></div>
        <div class="field full"><div class="label">Skills</div><div class="tags">${tags(app.skills)}</div></div>
        <div class="field full"><div class="label">Availability</div><div class="value">${app.availability ? JSON.stringify(app.availability) : '—'}</div></div>
      `)}

      ${section('🛡️ DBS & Right to Work', `
        ${field('Has DBS', app.hasDbs)}
        ${field('DBS Update Service', app.updateService)}
        ${field('DBS Certificate Number', app.dbsCertNumber)}
        ${field('Right to Work', app.rightToWork)}
        ${field('RTW Status', app.rtwStatus)}
        <div class="field full"><div class="label">RTW Documents Provided</div><div class="tags">${tags(app.docs)}</div></div>
      `)}

      ${section('🏠 Address & Identity', `
        ${field('Proof of Address 1', app.proofAddress1)}
        ${field('Proof of Address 2', app.proofAddress2)}
        ${field('Employment Gaps', app.employmentGaps)}
        <div class="field full"><div class="label">Gaps Explanation</div><div class="value">${app.gapsExplanation || '—'}</div></div>
      `)}

      ${section('📋 References', `
        ${field('Reference 1 Name', app.ref1Name)}
        ${field('Reference 1 Email', app.ref1Email)}
        ${field('Reference 1 Phone', app.ref1Phone)}
        ${field('Reference 1 Relationship', app.ref1Relation)}
        ${field('Reference 2 Name', app.ref2Name)}
        ${field('Reference 2 Email', app.ref2Email)}
        ${field('Reference 2 Phone', app.ref2Phone)}
        ${field('Reference 2 Relationship', app.ref2Relation)}
      `)}

      <div class="section">
        <h2>📎 Uploaded Documents</h2>
        <div class="docs-section">
          ${app.cvURL ? `<div class="doc-row">📄 CV / Resume &nbsp;<a class="doc-link" href="${app.cvURL}" target="_blank">View Document</a></div>` : '<div class="doc-row" style="color:#9b7fd4">📄 CV — not uploaded</div>'}
          ${app.passportURL ? `<div class="doc-row">🛂 Passport &nbsp;<a class="doc-link" href="${app.passportURL}" target="_blank">View Document</a></div>` : '<div class="doc-row" style="color:#cc0000">🛂 Passport — not uploaded</div>'}
          ${app.rtwDocURL ? `<div class="doc-row">📋 Right to Work Doc &nbsp;<a class="doc-link" href="${app.rtwDocURL}" target="_blank">View Document</a></div>` : '<div class="doc-row" style="color:#cc0000">📋 Right to Work Doc — not uploaded</div>'}
          ${app.poa1URL ? `<div class="doc-row">🏠 Proof of Address 1 &nbsp;<a class="doc-link" href="${app.poa1URL}" target="_blank">View Document</a></div>` : '<div class="doc-row" style="color:#9b7fd4">🏠 Proof of Address 1 — not uploaded</div>'}
          ${app.poa2URL ? `<div class="doc-row">🏠 Proof of Address 2 &nbsp;<a class="doc-link" href="${app.poa2URL}" target="_blank">View Document</a></div>` : '<div class="doc-row" style="color:#9b7fd4">🏠 Proof of Address 2 — not uploaded</div>'}
        </div>
      </div>

      <div class="footer">
        <span>${agency?.agencyName || 'Quikcare'} — Powered by Quikcare</span>
        <span>Generated: ${new Date().toLocaleDateString('en-GB')} &nbsp;|&nbsp; Application ID: ${app.id || '—'}</span>
      </div>

    </div></body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };
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
              <DetailItem label="First Name" value={app.firstName} />
              <DetailItem label="Last Name" value={app.lastName} />
              <DetailItem label="Email" value={app.email} />
              <DetailItem label="Phone" value={app.phone} />
              <DetailItem label="Date of Birth" value={app.dob} />
              <DetailItem label="NI Number" value={app.niNumber} />
              <DetailItem label="Postcode" value={app.postcode} />
              <DetailItem label="Driving Licence" value={app.driving} />
              <DetailItem label="Nationality" value={app.nationality} />
              <DetailItem label="Gender" value={app.gender} />
              <DetailItem label="Religion" value={app.religion} />
              <DetailItem label="Languages" value={app.languages?.join(", ")} />
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>🆘 Emergency Contact</div>
            <div style={s.detailGrid}>
              <DetailItem label="Name" value={app.emergencyName} />
              <DetailItem label="Relationship" value={app.emergencyRelation} />
              <DetailItem label="Phone" value={app.emergencyPhone} />
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>💼 Experience & Skills</div>
            <div style={s.detailGrid}>
              <DetailItem label="Years Experience" value={app.years} />
            </div>
            {app.settings?.length > 0 && <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Care Settings</div><div style={s.tagRow}>{app.settings.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>}
            {app.clients?.length > 0 && <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Client Groups</div><div style={s.tagRow}>{app.clients.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>}
            {app.quals?.length > 0 && <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Qualifications</div><div style={s.tagRow}>{app.quals.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>}
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>🛡️ DBS & Right to Work</div>
            <div style={s.detailGrid}>
              <DetailItem label="Right to Work" value={app.rightToWork} />
              <DetailItem label="RTW Status" value={app.rtwStatus} />
              <DetailItem label="Has DBS" value={app.hasDbs} />
              <DetailItem label="DBS Date" value={app.dbsDate} />
              <DetailItem label="Update Service" value={app.updateService} />
              <DetailItem label="Convictions" value={app.conviction} />
              <DetailItem label="Proof of Address 1" value={app.proofAddress1} />
              <DetailItem label="Proof of Address 2" value={app.proofAddress2} />
              <DetailItem label="Employment Gaps" value={app.employmentGaps} />
            </div>
            {app.gapsExplanation && <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Gaps Explanation</div><div style={{ fontSize: 13, color: "#1a1a2e", background: "#f8f5ff", borderRadius: 8, padding: "10px 14px", marginTop: 4 }}>{app.gapsExplanation}</div></div>}
            {app.docs?.length > 0 && <div style={{ marginTop: 10 }}><div style={s.detailLabel}>RTW Documents Provided</div><div style={s.tagRow}>{app.docs.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>}
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>📁 Uploaded Documents</div>
            <div style={s.tagRow}>
              {app.cvURL ? <a href={app.cvURL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>📄 CV</a> : <span style={{ fontSize: 12, color: "#9b7fd4" }}>📄 CV — not uploaded</span>}
              {app.passportURL ? <a href={app.passportURL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>🛂 Passport</a> : <span style={{ fontSize: 12, color: "#cc0000" }}>🛂 Passport — not uploaded</span>}
              {app.rtwDocURL ? <a href={app.rtwDocURL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>📋 RTW Doc</a> : <span style={{ fontSize: 12, color: "#cc0000" }}>📋 RTW Doc — not uploaded</span>}
              {app.poa1URL ? <a href={app.poa1URL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>🏠 Address 1</a> : <span style={{ fontSize: 12, color: "#9b7fd4" }}>🏠 Address 1 — not uploaded</span>}
              {app.poa2URL ? <a href={app.poa2URL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>🏠 Address 2</a> : <span style={{ fontSize: 12, color: "#9b7fd4" }}>🏠 Address 2 — not uploaded</span>}
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>💰 Bank Details</div>
            <div style={s.detailGrid}>
              <DetailItem label="Account Holder" value={app.bankName} />
              <DetailItem label="Sort Code" value={app.sortCode} />
              <DetailItem label="Account Number" value={app.accountNumber} />
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>⭐ References</div>
            {app.refs?.map((r, i) => (
              <div key={i} style={{ ...s.detailItem, marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600 }}>{r.name || "—"}</div>
                <div style={{ fontSize: 12, color: "#9b7fd4" }}>{r.title}{r.title && r.org ? " · " : ""}{r.org}</div>
                <div style={{ fontSize: 12, color: "#9b7fd4" }}>{r.email}</div>
                <div style={{ fontSize: 12, color: "#9b7fd4" }}>{r.relation}</div>
              </div>
            ))}
          </div>

        </div>
        <div style={s.actionRow}>
          <button style={s.rejectBtn} onClick={() => { onReject(app.id); onClose(); }}>✕ Reject</button>
          <button style={s.pdfBtn} onClick={downloadPDF}>📄 PDF</button>
          <button style={s.approveBtn} onClick={() => { onApprove(app.id); onClose(); }}>✓ Approve</button>
        </div>
      </div>
    </div>
  );
}

function exportCSV(applications) {
  const headers = ["Name", "Email", "Phone", "Postcode", "Applied", "Experience", "DBS", "Status"];
  const rows = applications.map(a => [`${a.firstName} ${a.lastName}`, a.email, a.phone, a.postcode, a.appliedAt, a.years, a.hasDbs, a.status]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "applications.csv"; a.click();
}

export default function AgencyDashboard({ agency, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const applyLink = `quikcare.co.uk/apply/${agency.slug}`;

  useEffect(() => {
    const q = query(collection(db, "applications"), where("agencySlug", "==", agency.slug), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error loading applications:", err);
      setError(err.message || "Failed to load applications");
      setLoading(false);
    });
    return () => unsub();
  }, [agency.slug]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "applications", id), { status });
      // Send email notification if emailjs is available
      if (window.emailjs) {
        const app = applications.find(a => a.id === id);
        if (app) {
          window.emailjs.send('QUIKCARE', 'template_as31vzw', {
            carer_name: `${app.firstName || ''} ${app.lastName || ''}`,
            carer_email: app.email || app.userEmail || '',
            agency_name: agency.agencyName || 'Quikcare',
            status: status === 'approved' ? 'approved' : 'unsuccessful',
            status_message: status === 'approved'
              ? 'Congratulations! Your application has been approved. The agency will be in touch shortly.'
              : 'Thank you for applying. Unfortunately your application was not successful at this time.',
          }, 'LD1-M8qPWz2Go1fM2').catch(e => console.log('Email failed:', e));
        }
      }
    } catch (err) {
      console.log('Update error:', err);
    }
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

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${applyLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>Q</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.agencyBadge}>{agency.agencyName}</span>
          <button style={s.logoutBtn} onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 10, margin: "24px auto", maxWidth: 1100, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#cc0000", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>⚠️ Something went wrong</div>
            <div style={{ color: "#cc0000", fontSize: 13 }}>{error}</div>
            {error.includes("index") && (
              <div style={{ color: "#9b7fd4", fontSize: 12, marginTop: 6 }}>
                💡 A Firestore index may still be building — wait 1–2 minutes and refresh.
              </div>
            )}
          </div>
          <button onClick={() => { setError(null); setLoading(true); }} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ffb3b3", background: "white", color: "#cc0000", fontSize: 13, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      <div style={s.container}>
        <div style={s.applyLink}>
          <div>
            <div style={{ fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Your carer application link</div>
            <div style={s.applyLinkText}>🔗 https://{applyLink}</div>
          </div>
          <button style={s.copyBtn} onClick={copyLink}>{copied ? "Copied! ✓" : "Copy Link"}</button>
        </div>

        <div style={s.statsRow}>
          <div style={s.statCard("#6C3FC5")}><div style={s.statNum("#6C3FC5")}>{stats.total}</div><div style={s.statLabel}>Total Applications</div></div>
          <div style={s.statCard("#f59e0b")}><div style={s.statNum("#f59e0b")}>{stats.pending}</div><div style={s.statLabel}>Pending Review</div></div>
          <div style={s.statCard("#1a7a3a")}><div style={s.statNum("#1a7a3a")}>{stats.approved}</div><div style={s.statLabel}>Approved</div></div>
          <div style={s.statCard("#cc0000")}><div style={s.statNum("#cc0000")}>{stats.rejected}</div><div style={s.statLabel}>Rejected</div></div>
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
          {loading ? <div style={s.loading}>Loading applications...</div> : (
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#f8f5ff" }}>
                  {["Applicant", "Location", "Experience", "DBS", "Applied", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={s.empty}>
                    {applications.length === 0 ? `No applications yet — share your link: https://${applyLink}` : "No applications match your filter"}
                  </td></tr>
                ) : filtered.map(app => (
                  <tr key={app.id} style={{ background: hoveredRow === app.id ? "#f8f5ff" : "transparent", cursor: "pointer", transition: "background 0.15s" }}
                    onClick={() => setSelected(app)} onMouseEnter={() => setHoveredRow(app.id)} onMouseLeave={() => setHoveredRow(null)}>
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
          {!loading && `Showing ${filtered.length} of ${applications.length} applications · Updates in real time`}
        </div>
      </div>

      <Modal app={selected} agency={agency} onClose={() => setSelected(null)} onApprove={(id) => updateStatus(id, "approved")} onReject={(id) => updateStatus(id, "rejected")} />
    </div>
  );
}
