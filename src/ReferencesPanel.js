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
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" },
  modalBox: { background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 560, overflow: "hidden" },
  modalHead: { background: "#f8f5ff", borderBottom: "1px solid #e8e0f5", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a2e" },
  modalBody: { padding: 24 },
  label: { display: "block", color: "#6C3FC5", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  select: { width: "100%", background: "#f8f5ff", border: "1px solid #c5b3e8", borderRadius: 8, padding: "12px 16px", color: "#1a1a2e", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 },
  infoBox: { background: "#f0ebff", border: "1px solid #c5b3e8", borderRadius: 10, padding: 14, fontSize: 13, color: "#6C3FC5", marginBottom: 16, lineHeight: 1.6 },
  empty: { textAlign: "center", padding: "48px 20px", color: "#9b7fd4", fontSize: 14 },
  detailSection: { marginBottom: 16 },
  detailTitle: { fontSize: 11, color: "#6C3FC5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #e8e0f5" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  detailItem: { background: "#f8f5ff", borderRadius: 8, padding: "10px 14px" },
  detailLabel: { fontSize: 10, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 },
  detailValue: { fontSize: 13, color: "#1a1a2e" },
  ratingBadge: (val) => {
    const colors = { Excellent: { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1" }, Good: { bg: "#f0ebff", text: "#6C3FC5", border: "#c5b3e8" }, Satisfactory: { bg: "#fff8e8", text: "#b37a00", border: "#f0c060" }, Poor: { bg: "#fff0f0", text: "#cc0000", border: "#ffb3b3" } };
    const c = colors[val] || { bg: "#f8f5ff", text: "#9b7fd4", border: "#e8e0f5" };
    return { display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}` };
  },
};

const STATUS = {
  pending:   { bg: "#fff8e8", text: "#b37a00", border: "#f0c060", label: "⏳ Pending" },
  completed: { bg: "#e8f5eb", text: "#1a7a3a", border: "#a3d9b1", label: "✅ Completed" },
};

function uid() { return Math.random().toString(36).slice(2, 11) + Date.now().toString(36); }

function DetailModal({ req, onClose }) {
  if (!req) return null;
  const r = req;
  const copyLink = () => { navigator.clipboard.writeText(`${window.location.origin}/reference/${r.token}`); };
  return (
    <div style={s.modal} onClick={onClose}>
      <div style={s.modalBox} onClick={e => e.stopPropagation()}>
        <div style={s.modalHead}>
          <div style={s.modalTitle}>{r.carerName} — {r.refereeName}</div>
          <button style={{ background: "none", border: "none", fontSize: 20, color: "#9b7fd4", cursor: "pointer" }} onClick={onClose}>×</button>
        </div>
        <div style={s.modalBody}>
          {r.status === "pending" ? (
            <>
              <div style={s.infoBox}>
                Reference link sent to <strong>{r.refereeEmail}</strong>. Waiting for response.
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={s.label}>Reference Link</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, background: "#f8f5ff", border: "1px solid #e8e0f5", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6C3FC5", wordBreak: "break-all" }}>
                    {window.location.origin}/reference/{r.token}
                  </div>
                  <button style={s.btn} onClick={copyLink}>Copy</button>
                </div>
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
                <div style={s.detailTitle}>✍️ Referee</div>
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

export default function ReferencesPanel({ agency, applications }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [sendMode, setSendMode] = useState("carer"); // "carer" | "manual"
  const [selectedApp, setSelectedApp] = useState("");
  const [selectedRef, setSelectedRef] = useState("");
  const [manualCarerName, setManualCarerName] = useState("");
  const [manualRefName, setManualRefName] = useState("");
  const [manualRefEmail, setManualRefEmail] = useState("");
  const [manualRefOrg, setManualRefOrg] = useState("");
  const [sending, setSending] = useState(false);
  const [viewReq, setViewReq] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "referenceRequests"), where("agencySlug", "==", agency.slug));
    const unsub = onSnapshot(q, snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    });
    return () => unsub();
  }, [agency.slug]);

  const approvedApps = applications.filter(a => a.status === "approved");
  const chosenApp = approvedApps.find(a => a.id === selectedApp);
  const refs = chosenApp?.refs || [];

  const sendRequest = async () => {
    setSending(true);
    try {
      const token = uid();
      let payload = {
        token,
        agencySlug: agency.slug,
        agencyName: agency.agencyName,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      if (sendMode === "carer") {
        if (!chosenApp || selectedRef === "") { setSending(false); return; }
        const referee = refs[parseInt(selectedRef)];
        if (!referee?.email) { alert("This referee has no email address on file."); setSending(false); return; }
        payload = { ...payload, applicationId: chosenApp.id, carerName: `${chosenApp.firstName} ${chosenApp.lastName}`, refereeName: referee.name || "Referee", refereeEmail: referee.email, refereeOrg: referee.org || "", refereeTitle: referee.title || "" };
      } else {
        if (!manualCarerName.trim() || !manualRefName.trim() || !manualRefEmail.trim()) {
          alert("Please fill in the applicant name, referee name and referee email.");
          setSending(false); return;
        }
        payload = { ...payload, applicationId: "", carerName: manualCarerName.trim(), refereeName: manualRefName.trim(), refereeEmail: manualRefEmail.trim(), refereeOrg: manualRefOrg.trim(), refereeTitle: "" };
      }

      await addDoc(collection(db, "referenceRequests"), payload);
      const link = `${window.location.origin}/reference/${token}`;
      setShowSend(false);
      setSelectedApp(""); setSelectedRef("");
      setManualCarerName(""); setManualRefName(""); setManualRefEmail(""); setManualRefOrg("");
      setSendMode("carer");
      alert(`Reference request created!\n\nSend this link to ${payload.refereeName}:\n\n${link}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create request. Please try again.");
    }
    setSending(false);
  };

  const copyLink = (token, id) => {
    navigator.clipboard.writeText(`${window.location.origin}/reference/${token}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const stats = { total: requests.length, pending: requests.filter(r => r.status === "pending").length, completed: requests.filter(r => r.status === "completed").length };

  return (
    <div style={s.container}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[["Total Sent", stats.total, "#6C3FC5"], ["Pending", stats.pending, "#f59e0b"], ["Completed", stats.completed, "#1a7a3a"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#ffffff", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${c}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c, fontFamily: "'DM Serif Display', serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#9b7fd4", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.cardHead}>
          <div style={s.cardTitle}>📬 Reference Requests</div>
          <button style={s.btn} onClick={() => setShowSend(true)}>+ Send Request</button>
        </div>

        {loading ? (
          <div style={s.empty}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={s.empty}>No reference requests sent yet. Click "+ Send Request" to get started.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={{ background: "#f8f5ff" }}>
                {["Carer", "Referee", "Organisation", "Sent", "Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ cursor: "pointer" }} onClick={() => setViewReq(req)}>
                  <td style={s.td}><div style={{ fontWeight: 600 }}>{req.carerName}</div></td>
                  <td style={s.td}><div>{req.refereeName}</div><div style={s.tdSub}>{req.refereeEmail}</div></td>
                  <td style={s.td}>{req.refereeOrg || "—"}</td>
                  <td style={s.td}>{req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString("en-GB") : "—"}</td>
                  <td style={s.td}><span style={s.pill(STATUS[req.status] || STATUS.pending)}>{(STATUS[req.status] || STATUS.pending).label}</span></td>
                  <td style={s.td} onClick={e => e.stopPropagation()}>
                    {req.status === "pending" && (
                      <button style={s.btnOutline} onClick={() => copyLink(req.token, req.id)}>
                        {copied === req.id ? "✓ Copied!" : "Copy Link"}
                      </button>
                    )}
                    {req.status === "completed" && (
                      <button style={s.btn} onClick={() => setViewReq(req)}>View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Send modal */}
      {showSend && (
        <div style={s.modal} onClick={() => setShowSend(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHead}>
              <div style={s.modalTitle}>Send Reference Request</div>
              <button style={{ background: "none", border: "none", fontSize: 20, color: "#9b7fd4", cursor: "pointer" }} onClick={() => setShowSend(false)}>×</button>
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
                  <div style={s.infoBox}>Select an approved carer and which referee to contact. A unique link will be generated for the referee to complete their reference online.</div>
                  {approvedApps.length === 0 ? (
                    <div style={{ color: "#cc0000", fontSize: 13, marginBottom: 16 }}>No approved carers yet. Approve an application first, or use Manual Entry instead.</div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={s.label}>Select Carer (approved only)</label>
                        <select style={s.select} value={selectedApp} onChange={e => { setSelectedApp(e.target.value); setSelectedRef(""); }}>
                          <option value="">Choose carer...</option>
                          {approvedApps.map(a => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                        </select>
                      </div>
                      {chosenApp && (
                        <div style={{ marginBottom: 20 }}>
                          <label style={s.label}>Select Referee</label>
                          {refs.length === 0 ? (
                            <div style={{ color: "#cc0000", fontSize: 13 }}>This carer has no referee details on file. Use Manual Entry instead.</div>
                          ) : (
                            <select style={s.select} value={selectedRef} onChange={e => setSelectedRef(e.target.value)}>
                              <option value="">Choose referee...</option>
                              {refs.map((r, i) => <option key={i} value={i}>{r.name || "Referee " + (i + 1)} — {r.org || r.email || ""}</option>)}
                            </select>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div style={s.infoBox}>Send a reference request to anyone — no account needed. Fill in the applicant and referee details manually.</div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Applicant Name (who the reference is for)</label>
                    <input type="text" style={{ ...s.select, marginBottom: 0 }} placeholder="e.g. John Smith" value={manualCarerName} onChange={e => setManualCarerName(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Referee Name</label>
                    <input type="text" style={{ ...s.select, marginBottom: 0 }} placeholder="e.g. Jane Doe" value={manualRefName} onChange={e => setManualRefName(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Referee Email</label>
                    <input type="email" style={{ ...s.select, marginBottom: 0 }} placeholder="referee@example.com" value={manualRefEmail} onChange={e => setManualRefEmail(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={s.label}>Referee Organisation (optional)</label>
                    <input type="text" style={{ ...s.select, marginBottom: 0 }} placeholder="e.g. NHS, Sunrise Care Home..." value={manualRefOrg} onChange={e => setManualRefOrg(e.target.value)} />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={{ ...s.btn, flex: 1, padding: 12, opacity: sending ? 0.5 : 1 }} disabled={sending} onClick={sendRequest}>
                  {sending ? "Creating..." : "Create Reference Link →"}
                </button>
                <button style={{ ...s.btnOutline, padding: 12 }} onClick={() => setShowSend(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DetailModal req={viewReq} onClose={() => setViewReq(null)} />
    </div>
  );
}
