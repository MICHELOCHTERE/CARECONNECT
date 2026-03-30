import { useState, useEffect, useMemo } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from "firebase/firestore";

const STATUS_COLORS = {
  pending: { bg: "#2a3a1a", text: "#a8d060", border: "#4a6a2a" },
  approved: { bg: "#1a3a2e", text: "#4ecba0", border: "#2a6a4e" },
  rejected: { bg: "#3a1a1a", text: "#e07070", border: "#6a2a2a" },
};
const STATUS_LABELS = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

const s = {
  app: { minHeight: "100vh", background: "#060e0a", color: "#e8f5f0", fontFamily: "'DM Sans', sans-serif" },
  header: { background: "#0a1a12", borderBottom: "1px solid #1a3a2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: "50%", background: "#4ecba0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText: { color: "#4ecba0", fontSize: 18, fontFamily: "'DM Serif Display', serif" },
  adminBadge: { background: "#1a3a2e", border: "1px solid #2a5a3e", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#4ecba0", fontWeight: 600, letterSpacing: "0.05em" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 },
  statCard: (color) => ({ background: "#0d1f1a", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${color}` }),
  statNum: (color) => ({ fontSize: 28, fontWeight: 700, color, fontFamily: "'DM Serif Display', serif" }),
  statLabel: { fontSize: 11, color: "#4a7a6a", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 },
  toolbar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: 200, background: "#0d1f1a", border: "1px solid #2a4a3e", borderRadius: 8, padding: "10px 16px", color: "#e8f5f0", fontSize: 14, outline: "none" },
  filterBtn: (active) => ({ padding: "9px 14px", borderRadius: 8, border: `1px solid ${active ? "#4ecba0" : "#2a4a3e"}`, background: active ? "#1a3a2e" : "transparent", color: active ? "#4ecba0" : "#a0c8b8", fontSize: 12, cursor: "pointer", fontWeight: active ? 600 : 400 }),
  exportBtn: { padding: "9px 16px", borderRadius: 8, border: "1px solid #2a4a3e", background: "transparent", color: "#a0c8b8", fontSize: 12, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#4a7a6a", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #1a3a2e", fontWeight: 600 },
  td: { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #0f2a20", color: "#e8f5f0" },
  tdSub: { fontSize: 12, color: "#4a7a6a", marginTop: 2 },
  statusPill: (status) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[status]?.bg || "#1a2a1a", color: STATUS_COLORS[status]?.text || "#4ecba0", border: `1px solid ${STATUS_COLORS[status]?.border || "#2a4a2a"}` }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" },
  modalBox: { background: "#0d1f1a", border: "1px solid #1a3a2e", borderRadius: 16, width: "100%", maxWidth: 640, overflow: "hidden", marginBottom: 24 },
  modalHeader: { background: "#071510", padding: "20px 24px", borderBottom: "1px solid #1a3a2e", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#e8f5f0" },
  closeBtn: { background: "none", border: "none", color: "#4a7a6a", fontSize: 22, cursor: "pointer", lineHeight: 1 },
  modalBody: { padding: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, color: "#4ecba0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #1a3a2e" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  detailItem: { background: "#071510", borderRadius: 8, padding: "10px 14px" },
  detailLabel: { fontSize: 10, color: "#4a7a6a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 },
  detailValue: { fontSize: 13, color: "#e8f5f0" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: { padding: "4px 10px", borderRadius: 999, background: "#0a2a1e", border: "1px solid #2a4a3e", fontSize: 12, color: "#a0c8b8" },
  actionRow: { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid #1a3a2e", background: "#071510" },
  approveBtn: { flex: 1, padding: "12px", borderRadius: 8, border: "none", background: "#4ecba0", color: "#071510", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  rejectBtn: { flex: 1, padding: "12px", borderRadius: 8, border: "1px solid #6a2a2a", background: "#2a1010", color: "#e07070", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  loading: { textAlign: "center", padding: "60px 20px", color: "#4a7a6a", fontSize: 14 },
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
            <div style={{ fontSize: 12, color: "#4a7a6a", marginTop: 4 }}>Applied {app.appliedAt} · {app.postcode}</div>
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
          <div style={s.section}>
            <div style={s.sectionTitle}>⭐ References</div>
            {app.refs?.map((r, i) => (
              <div key={i} style={{ ...s.detailItem, marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: "#e8f5f0", fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "#4a7a6a" }}>{r.title} · {r.org}</div>
                <div style={{ fontSize: 12, color: "#4a7a6a" }}>{r.email}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.actionRow}>
          <button style={s.rejectBtn} onClick={() => { onReject(app.id); onClose(); }}>✕ Reject</button>
          <button style={s.approveBtn} onClick={() => { onApprove(app.id); onClose(); }}>✓ Approve Application</button>
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
          <div style={s.logoIcon}>🌿</div>
          <span style={s.logoText}>Quikcare</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={s.adminBadge}>ADMIN DASHBOARD</span>{onLogout && <button onClick={onLogout} style={{ background: "none", border: "1px solid #2a4a3e", borderRadius: 6, padding: "4px 12px", color: "#4a7a6a", fontSize: 12, cursor: "pointer" }}>Sign Out</button>}</div>
      </div>

      <div style={s.container}>
        <div style={s.statsRow}>
          <div style={s.statCard("#4ecba0")}><div style={s.statNum("#4ecba0")}>{stats.total}</div><div style={s.statLabel}>Total Applications</div></div>
          <div style={s.statCard("#a8d060")}><div style={s.statNum("#a8d060")}>{stats.pending}</div><div style={s.statLabel}>Pending Review</div></div>
          <div style={s.statCard("#4ecba0")}><div style={s.statNum("#4ecba0")}>{stats.approved}</div><div style={s.statLabel}>Approved</div></div>
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

        <div style={{ background: "#0a1a12", border: "1px solid #1a3a2e", borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={s.loading}>Loading applications...</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#071510" }}>
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
                    style={{ background: hoveredRow === app.id ? "#0d1f1a" : "transparent", cursor: "pointer", transition: "background 0.15s" }}
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
        <div style={{ marginTop: 10, fontSize: 12, color: "#4a7a6a" }}>
          {loading ? "" : `Showing ${filtered.length} of ${applications.length} applications · Updates in real time · Click any row to view details`}
        </div>
      </div>

      <Modal app={selected} onClose={() => setSelected(null)} onApprove={(id) => updateStatus(id, "approved")} onReject={(id) => updateStatus(id, "rejected")} />
    </div>
  );
}
