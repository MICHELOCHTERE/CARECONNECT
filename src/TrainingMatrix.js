import { useState, useEffect, useRef } from "react";

const TEMPLATE_COURSES = [
  ['Communication, Handling Information and Confidentiality', 24],
  ['Personal Development', 24],
  ['Duty of Care', 24],
  ['Equality and Diversity', 24],
  ['Work in a Person Centred Way', 24],
  ['Privacy and Dignity', 24],
  ['Role of the Care Worker & Org. Policies & Procedures', 24],
  ['Safe Handling of Medicines Awareness', 24],
  ['Mental Health Awareness, Dementia and Learning Disability', 24],
  ['Safeguarding Adults', 24],
  ['Safeguarding Children', 24],
  ['Personal Care and Continence Awareness', 24],
  ['Pressure Sore Awareness', 24],
  ['Promoting Independence and Reflective Practice', 24],
  ['Health and Safety', 24],
  ['Infection Prevention and Control', 24],
  ['Food Hygiene', 24],
  ['Basic Life Support', 12],
  ['Moving and Handling of People', 12],
];

function uid() { return Math.random().toString(36).slice(2, 9); }

function computeStatus(course) {
  if (!course.nextDue) return 'none';
  const due = new Date(course.nextDue);
  const now = new Date();
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'expired';
  if (diff <= 60) return 'expiring';
  return 'valid';
}

const STATUS_LABEL = { valid: 'Valid', expiring: 'Due Soon', expired: 'Overdue', none: 'No record' };
const STATUS_COLOR = {
  valid:    { bg: 'rgba(76,154,106,0.14)',  border: '#4c9a6a',  color: '#4c9a6a' },
  expiring: { bg: 'rgba(212,162,78,0.14)',  border: '#d4a24e',  color: '#d4a24e' },
  expired:  { bg: 'rgba(194,66,66,0.14)',   border: '#c24242',  color: '#c24242' },
  none:     { bg: 'rgba(74,84,104,0.10)',   border: '#4a5468',  color: '#8b95a5' },
};

const s = {
  wrap:   { minHeight: '100vh', background: '#12161d', color: '#e8e6dd', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14 },
  topBar: { background: '#1a212c', borderBottom: '1px solid #2c3746', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  brand:  { display: 'flex', alignItems: 'center', gap: 14 },
  stamp:  { width: 40, height: 40, border: '2px solid #d4a24e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4a24e', fontSize: 20, fontWeight: 700, transform: 'rotate(-8deg)' },
  h1:     { fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, color: '#e8e6dd', margin: 0 },
  sub:    { fontFamily: 'monospace', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8a713a', marginTop: 2 },
  toolbar:{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  btn:    { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, fontWeight: 500, background: '#202836', color: '#e8e6dd', border: '1px solid #384357', borderRadius: 5, padding: '7px 13px', cursor: 'pointer' },
  btnPrimary: { background: '#d4a24e', color: '#1a1408', border: '1px solid #d4a24e', fontWeight: 700 },
  btnBack:{ background: 'none', color: '#8b95a5', border: '1px solid #2c3746', borderRadius: 5, padding: '7px 13px', fontSize: 12, cursor: 'pointer' },
  layout: { display: 'flex', gap: 20, padding: '24px', alignItems: 'flex-start' },
  sidebar:{ width: 220, flexShrink: 0, background: '#1a212c', border: '1px solid #2c3746', borderRadius: 8, overflow: 'hidden' },
  sidebarHead: { padding: '10px 14px', borderBottom: '1px solid #2c3746', fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8b95a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  staffList: { listStyle: 'none', margin: 0, padding: 6, maxHeight: '65vh', overflowY: 'auto' },
  main:   { flex: 1, minWidth: 0 },
  matrixWrap: { overflowX: 'auto', border: '1px solid #2c3746', borderRadius: 8, background: '#1a212c', maxHeight: '65vh', overflowY: 'auto' },
  th:     { position: 'sticky', top: 0, background: '#202836', borderBottom: '1px solid #384357', borderLeft: '1px solid #2c3746', padding: '10px 12px', textAlign: 'left', fontFamily: 'monospace', fontSize: 10, color: '#d4a24e', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap', zIndex: 2 },
  td:     { borderBottom: '1px solid #2c3746', borderLeft: '1px solid #2c3746', padding: '8px 10px', verticalAlign: 'middle' },
  input:  { background: '#12161d', border: '1px solid #384357', borderRadius: 5, padding: '5px 7px', color: '#e8e6dd', fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", width: '100%', minWidth: 110, outline: 'none', boxSizing: 'border-box' },
};

function StatusChip({ status }) {
  const c = STATUS_COLOR[status];
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 20, fontFamily: 'monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', border: `1px solid ${c.border}`, background: c.bg, color: c.color }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function TrainingMatrix({ agency, onBack }) {
  const [employees, setEmployees] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const csvRef = useRef();

  // Load from localStorage keyed by agency
  const storageKey = `training-matrix-${agency?.slug || 'default'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        setEmployees(data.employees || []);
        setActiveId(data.activeId || null);
      }
    } catch (e) {}
  }, [storageKey]);

  const save = (emps, aid) => {
    setEmployees(emps);
    setActiveId(aid);
    localStorage.setItem(storageKey, JSON.stringify({ employees: emps, activeId: aid }));
    setStatusMsg('Saved ✓');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const addEmployee = () => {
    const name = prompt('Staff member name:');
    if (!name?.trim()) return;
    const role = prompt('Job role (e.g. Care Worker):') || '';
    const id = uid();
    const courses = TEMPLATE_COURSES.map(([name, validityMonths]) => ({ id: uid(), name, validityMonths, trainingDate: '', nextDue: '', competencyDate: '', employeeSignature: '', managerSignature: '' }));
    const updated = [...employees, { id, name: name.trim(), role, courses }];
    save(updated, id);
  };

  const removeEmployee = (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    const updated = employees.filter(e => e.id !== id);
    save(updated, updated.length ? updated[0].id : null);
  };

  const addCourse = () => {
    const emp = employees.find(e => e.id === activeId);
    if (!emp) { alert('Select a staff member first.'); return; }
    const name = prompt('Course name:');
    if (!name?.trim()) return;
    const months = parseInt(prompt('Renewal period (months):', '24')) || 24;
    const course = { id: uid(), name: name.trim(), validityMonths: months, trainingDate: '', nextDue: '', competencyDate: '', employeeSignature: '', managerSignature: '' };
    const updated = employees.map(e => e.id === activeId ? { ...e, courses: [...e.courses, course] } : e);
    save(updated, activeId);
  };

  const removeCourse = (courseId) => {
    const updated = employees.map(e => e.id === activeId ? { ...e, courses: e.courses.filter(c => c.id !== courseId) } : e);
    save(updated, activeId);
  };

  const updateField = (courseId, field, value) => {
    const updated = employees.map(e => e.id === activeId ? {
      ...e, courses: e.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c)
    } : e);
    save(updated, activeId);
  };

  const exportCSV = () => {
    const emp = employees.find(e => e.id === activeId);
    if (!emp) return;
    const rows = [['Course', 'Training Date', 'Next Due', 'Competency Date', 'Status', 'Employee Sig', 'Manager Sig']];
    emp.courses.forEach(c => rows.push([c.name, c.trainingDate, c.nextDue, c.competencyDate, STATUS_LABEL[computeStatus(c)], c.employeeSignature, c.managerSignature]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${emp.name.replace(/ /g,'_')}_training_matrix.csv`;
    a.click();
  };

  const employeeSummary = (emp) => {
    const expired = emp.courses.filter(c => computeStatus(c) === 'expired').length;
    const expiring = emp.courses.filter(c => computeStatus(c) === 'expiring').length;
    const valid = emp.courses.filter(c => computeStatus(c) === 'valid').length;
    return { expired, expiring, valid };
  };

  const activeEmp = employees.find(e => e.id === activeId);

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={s.topBar}>
        <div style={s.brand}>
          <div style={s.stamp}>✓</div>
          <div>
            <div style={s.h1}>Training Matrix</div>
            <div style={s.sub}>Staff Training & Induction Tracker · {agency?.agencyName}</div>
          </div>
        </div>
        <div style={s.toolbar}>
          <button style={s.btn} onClick={addCourse}>+ Course</button>
          <button style={s.btn} onClick={exportCSV}>Export CSV</button>
          <button style={{ ...s.btn, color: '#c24242' }} onClick={() => { if (window.confirm('Erase all staff and matrices?')) save([], null); }}>Reset</button>
          <button style={s.btnBack} onClick={onBack}>← Back to Dashboard</button>
        </div>
      </div>

      <div style={s.layout}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sidebarHead}>
            <span>Staff ({employees.length})</span>
            <button style={{ ...s.btn, padding: '4px 9px', fontSize: 11 }} onClick={addEmployee}>+ Add</button>
          </div>
          {employees.length === 0 ? (
            <div style={{ padding: '20px 14px', color: '#8b95a5', fontSize: 12, fontFamily: 'monospace' }}>No staff yet. Click "+ Add".</div>
          ) : (
            <ul style={s.staffList}>
              {employees.map(emp => {
                const sm = employeeSummary(emp);
                const isActive = emp.id === activeId;
                return (
                  <li key={emp.id}
                    onClick={() => setActiveId(emp.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2, background: isActive ? 'rgba(76,154,106,0.14)' : 'transparent' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{emp.name}</div>
                      {emp.role && <div style={{ fontSize: 11, color: '#8b95a5' }}>{emp.role}</div>}
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8b95a5', marginTop: 2 }}>
                        {sm.expired ? `${sm.expired} overdue · ` : ''}{sm.expiring ? `${sm.expiring} due soon · ` : ''}{sm.valid} valid
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeEmployee(emp.id); }}
                      style={{ background: 'none', border: 'none', color: '#8b95a5', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>✕</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Main */}
        <div style={s.main}>
          {!activeEmp ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b95a5', fontFamily: 'monospace', fontSize: 13 }}>
              Select or add a staff member to view their training matrix.
            </div>
          ) : activeEmp.courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b95a5', fontFamily: 'monospace', fontSize: 13 }}>
              No courses yet for {activeEmp.name}. Click "+ Course" to add one.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20 }}>{activeEmp.name} {activeEmp.role && <span style={{ color: '#8b95a5', fontSize: 13, marginLeft: 8 }}>{activeEmp.role}</span>}</div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8b95a5', marginBottom: 10 }}>{activeEmp.courses.length} course(s)</div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 18, marginBottom: 12, fontFamily: 'monospace', fontSize: 11, color: '#8b95a5', flexWrap: 'wrap' }}>
                {['valid','expiring','expired','none'].map(st => (
                  <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[st].border }} />
                    {STATUS_LABEL[st]}
                  </div>
                ))}
              </div>

              <div style={s.matrixWrap}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      {['Course Name','Date of Training','Next Update Due','Competency Achieved','Status','Employee Signature','Manager Signature'].map(h => (
                        <th key={h} style={h === 'Course Name' ? { ...s.th, position: 'sticky', left: 0, top: 0, zIndex: 3, minWidth: 220 } : s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeEmp.courses.map((course, i) => {
                      const status = computeStatus(course);
                      return (
                        <tr key={course.id} style={{ background: i % 2 === 1 ? '#182028' : 'transparent' }}>
                          <td style={{ ...s.td, position: 'sticky', left: 0, background: i % 2 === 1 ? '#182028' : '#1a212c', fontWeight: 500, zIndex: 1, minWidth: 220 }}>
                            <button onClick={() => removeCourse(course.id)} style={{ float: 'right', background: 'none', border: 'none', color: '#8b95a5', cursor: 'pointer', marginLeft: 8, fontSize: 13 }}>✕</button>
                            {course.name}
                            <div style={{ fontSize: 10, color: '#8b95a5', marginTop: 2 }}>renews every {course.validityMonths} mo</div>
                          </td>
                          <td style={s.td}><input type="date" style={s.input} value={course.trainingDate || ''} onChange={e => updateField(course.id, 'trainingDate', e.target.value)} /></td>
                          <td style={s.td}><input type="date" style={s.input} value={course.nextDue || ''} onChange={e => updateField(course.id, 'nextDue', e.target.value)} /></td>
                          <td style={s.td}><input type="date" style={s.input} value={course.competencyDate || ''} onChange={e => updateField(course.id, 'competencyDate', e.target.value)} /></td>
                          <td style={s.td}><StatusChip status={status} /></td>
                          <td style={s.td}><input type="text" style={{ ...s.input, minWidth: 130 }} placeholder="Type to sign" value={course.employeeSignature || ''} onChange={e => updateField(course.id, 'employeeSignature', e.target.value)} /></td>
                          <td style={s.td}><input type="text" style={{ ...s.input, minWidth: 130 }} placeholder="Type to sign" value={course.managerSignature || ''} onChange={e => updateField(course.id, 'managerSignature', e.target.value)} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {statusMsg && <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8b95a5', marginTop: 12 }}>{statusMsg}</div>}
        </div>
      </div>
    </div>
  );
}
