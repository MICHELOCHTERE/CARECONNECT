import { useState, useEffect, useMemo } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, orderBy, query, where } from "firebase/firestore";

const STATUS_COLORS = {
  pending: { bg: "#f5f0ff", text: "#6C3FC5", border: "#c5b3e8" },
  approved: { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1" },
  rejected: { bg: "#fff0f0", text: "#cc0000", border: "#ffb3b3" },
};
const STATUS_LABELS = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

const PLAN_LIMITS = {
  starter:    { maxApplications: 50,  analytics: false, multiAdmin: false, whiteLabel: false },
  growth:     { maxApplications: -1,  analytics: true,  multiAdmin: true,  whiteLabel: false },
  enterprise: { maxApplications: -1,  analytics: true,  multiAdmin: true,  whiteLabel: true  },
  none:       { maxApplications: 0,   analytics: false, multiAdmin: false, whiteLabel: false },
};

const PLAN_LABELS = { starter: "Starter", growth: "Growth", enterprise: "Enterprise", none: "No Plan" };
const PLAN_COLORS = { starter: "#f59e0b", growth: "#6C3FC5", enterprise: "#1a7a3a", none: "#cc0000" };

function PlanBanner({ agency, applicationCount }) {
  const plan = agency.plan || "none";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.none;
  const isStarter = plan === "starter";
  const atLimit = isStarter && applicationCount >= limits.maxApplications;
  const nearLimit = isStarter && applicationCount >= limits.maxApplications * 0.8;

  return (
    <div style={{ background: "#ffffff", border: "1px solid #e8e0f5", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ background: PLAN_COLORS[plan], borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {PLAN_LABELS[plan]}
        </div>
        {isStarter && (
          <div style={{ fontSize: 13, color: atLimit ? "#cc0000" : nearLimit ? "#f59e0b" : "#9b7fd4" }}>
            {applicationCount} / {limits.maxApplications} applications used
            {atLimit && " — limit reached!"}
            {!atLimit && nearLimit && " — nearing limit"}
          </div>
        )}
        {!isStarter && plan !== "none" && (
          <div style={{ fontSize: 13, color: "#1a7a3a" }}>Unlimited applications</div>
        )}
      </div>
      {(atLimit || nearLimit || plan === "none") && (
        <a href="https://quikcare.co.uk/#pricing" style={{ padding: "8px 16px", background: "#6C3FC5", border: "none", borderRadius: 8, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
          ⬆ Upgrade Plan
        </a>
      )}
    </div>
  );
}

function ApplicationLimitWall({ agency }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1a1a2e", marginBottom: 8 }}>Application limit reached</div>
      <div style={{ color: "#9b7fd4", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Your Starter plan allows up to 50 applications.<br />Upgrade to Growth for unlimited applications and more features.
      </div>
      <a href="https://quikcare.co.uk/#pricing" style={{ display: "inline-block", padding: "14px 28px", background: "#6C3FC5", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
        Upgrade to Growth →
      </a>
    </div>
  );
}

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

function Modal({ app, onClose, onApprove, onReject }) {
  if (!app) return null;
  const downloadPDF = () => {
    const html = `<html><head><style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a2e}h1{color:#6C3FC5}h2{color:#6C3FC5;font-size:14px;border-bottom:1px solid #e8e0f5;padding-bottom:6px;margin-top:24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.field{background:#f8f5ff;padding:10px 14px;border-radius:6px}.label{font-size:10px;color:#9b7fd4;text-transform:uppercase}.value{font-size:13px;color:#1a1a2e;margin-top:2px}</style></head><body><h1>${app.firstName} ${app.lastName}</h1><p>Applied: ${app.appliedAt} | Status: ${app.status}</p><h2>Personal Details</h2><div class="grid"><div class="field"><div class="label">Email</div><div class="value">${app.email||'—'}</div></div><div class="field"><div class="label">Phone</div><div class="value">${app.phone||'—'}</div></div><div class="field"><div class="label">NI Number</div><div class="value">${app.niNumber||'—'}</div></div><div class="field"><div class="label">Driving</div><div class="value">${app.driving||'—'}</div></div></div><h2>Experience</h2><div class="grid"><div class="field"><div class="label">Years</div><div class="value">${app.years||'—'}</div></div><div class="field"><div class="label">Qualifications</div><div class="value">${app.quals?.join(', ')||'—'}</div></div></div><p style="margin-top:40px;font-size:11px;color:#9b7fd4">Quikcare Recruitment — quikcare.co.uk</p></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
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
              <DetailItem label="Email" value={app.email} />
              <DetailItem label="Phone" value={app.phone} />
              <DetailItem label="Date of Birth" value={app.dob} />
              <DetailItem label="NI Number" value={app.niNumber} />
              <DetailItem label="Driving Licence" value={app.driving} />
              <DetailItem label="Nationality" value={app.nationality} />
              <DetailItem label="Gender" value={app.gender} />
              <DetailItem label="Languages" value={app.languages?.join(", ")} />
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💼 Experience</div>
            <div style={s.detailGrid}>
              <DetailItem label="Years Experience" value={app.years} />
              <DetailItem label="Preferred Hours" value={app.hours?.join(", ")} />
            </div>
            <div style={{ marginTop: 10 }}><div style={s.detailLabel}>Qualifications</div><div style={s.tagRow}>{app.quals?.map(t => <span key={t} style={s.tag}>{t}</span>)}</div></div>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📋 Right to Work</div>
            <div style={s.detailGrid}>
              <DetailItem label="Status" value={app.rtwStatus} />
              <DetailItem label="Documents" value={app.docs?.join(", ")} />
            </div>
          </div>
          {(app.cvURL || app.poa1URL || app.poa2URL || app.rtwDocURL) && (
            <div style={s.section}>
              <div style={s.sectionTitle}>📁 Uploaded Documents</div>
              <div style={s.tagRow}>
                {app.cvURL && <a href={app.cvURL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>📄 CV</a>}
                {app.poa1URL && <a href={app.poa1URL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>🏠 Address 1</a>}
                {app.poa2URL && <a href={app.poa2URL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>🏠 Address 2</a>}
                {app.rtwDocURL && <a href={app.rtwDocURL} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 999, background: "#f0ebff", border: "1px solid #c5b3e8", color: "#6C3FC5", fontSize: 13, textDecoration: "none" }}>📋 Right to Work</a>}
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
        <PlanBanner agency={agency} applicationCount={applications.length} />
        {(() => {
          const plan = agency.plan || "none";
          const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.none;
          if (limits.maxApplications === 0) {
            return (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1a1a2e", marginBottom: 8 }}>No active plan</div>
                <div style={{ color: "#9b7fd4", fontSize: 14, marginBottom: 24 }}>Please purchase a plan to access your dashboard.</div>
                <a href="https://quikcare.co.uk/#pricing" style={{ display: "inline-block", padding: "14px 28px", background: "#6C3FC5", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>View Plans →</a>
              </div>
            );
          }
          return null;
        })()}
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
          {(agency.plan === "growth" || agency.plan === "enterprise") && (
            <div style={{ padding: "9px 14px", borderRadius: 8, background: "#e8f5eb", border: "1px solid #a3d9b1", color: "#1a7a3a", fontSize: 12, fontWeight: 600 }}>
              📊 Analytics: ON
            </div>
          )}
          {(!agency.plan || agency.plan === "starter" || agency.plan === "none") && (
            <a href="https://quikcare.co.uk/#pricing" style={{ padding: "9px 14px", borderRadius: 8, background: "#f8f5ff", border: "1px solid #c5b3e8", color: "#9b7fd4", fontSize: 12, textDecoration: "none" }}>
              🔒 Analytics (Upgrade)
            </a>
          )}
        </div>

        {(() => {
          const plan = agency.plan || "none";
          const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.none;
          if (limits.maxApplications > 0 && applications.length >= limits.maxApplications) {
            return <ApplicationLimitWall agency={agency} />;
          }
          return null;
        })()}
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

      <Modal app={selected} onClose={() => setSelected(null)} onApprove={(id) => updateStatus(id, "approved")} onReject={(id) => updateStatus(id, "rejected")} />
    </div>
  );
}
