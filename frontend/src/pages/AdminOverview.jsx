import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

const ROLE_COLORS = {
  student: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  teacher: { bg: 'rgba(34,197,94,0.12)', text: '#86efac', border: 'rgba(34,197,94,0.3)' },
  admin: { bg: 'rgba(251,191,36,0.12)', text: '#fde68a', border: 'rgba(251,191,36,0.3)' },
};

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.student;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>{role}</span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '450px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--on-surface)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: '1.4rem' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.7rem 1rem', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
  color: 'var(--on-surface)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
};

const btnPrimary = {
  padding: '0.7rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
};

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modal, setModal] = useState(null); // { type: 'add'|'edit'|'delete', role, user? }
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadStats = useCallback(() => {
    fetch(`${API}/admin/stats`).then(r => r.json()).then(setStats);
  }, []);

  const loadStudents = useCallback(() => {
    fetch(`${API}/admin/users?role=student`).then(r => r.json()).then(setStudents);
  }, []);

  const loadTeachers = useCallback(() => {
    fetch(`${API}/admin/users?role=teacher`).then(r => r.json()).then(setTeachers);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === 'students') loadStudents(); }, [tab, loadStudents]);
  useEffect(() => { if (tab === 'teachers') loadTeachers(); }, [tab, loadTeachers]);

  const openAdd = (role) => {
    setForm({ name: '', email: '', password: '', role });
    setFormError('');
    setModal({ type: 'add', role });
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setFormError('');
    setModal({ type: 'edit', user: u });
  };

  const openDelete = (u) => setModal({ type: 'delete', user: u });

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal.type === 'add') {
        const res = await fetch(`${API}/admin/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to create user');
      } else if (modal.type === 'edit') {
        const body = { name: form.name, email: form.email, role: form.role };
        const res = await fetch(`${API}/admin/users/${modal.user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to update user');
      }
      setModal(null);
      loadStats();
      if (form.role === 'student' || tab === 'students') loadStudents();
      if (form.role === 'teacher' || tab === 'teachers') loadTeachers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    await fetch(`${API}/admin/users/${modal.user.id}`, { method: 'DELETE' });
    setSaving(false);
    setModal(null);
    loadStats();
    loadStudents();
    loadTeachers();
  };

  const STAT_CARDS = stats ? [
    { label: 'Total Students', value: stats.students, icon: '🎓', color: '#6366f1' },
    { label: 'Total Teachers', value: stats.teachers, icon: '👨‍🏫', color: '#8b5cf6' },
    { label: 'Courses', value: stats.courses, icon: '📚', color: '#06b6d4' },
    { label: 'Enrollments', value: stats.enrollments, icon: '📋', color: '#10b981' },
    { label: 'Test Attempts', value: stats.test_attempts, icon: '✏️', color: '#f59e0b' },
  ] : [];

  const UserTable = ({ users, role, onAdd }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
          {role === 'student' ? '🎓' : '👨‍🏫'} {role === 'student' ? 'Students' : 'Teachers'} ({users.length})
        </h2>
        <button onClick={onAdd} style={{ ...btnPrimary, fontSize: '0.85rem', padding: '0.55rem 1rem' }}>+ Add {role === 'student' ? 'Student' : 'Teacher'}</button>
      </div>
      {users.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
          No {role}s registered yet.
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['ID', 'Name', 'Email', 'Role', role === 'student' ? 'Enrollments' : 'Assigned Courses', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--on-surface-variant)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--on-surface-variant)' }}>#{u.id}</td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--on-surface)', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--on-surface-variant)' }}>{u.email}</td>
                  <td style={{ padding: '0.8rem 1rem' }}><RoleBadge role={u.role} /></td>
                  <td style={{ padding: '0.8rem 1rem', color: '#a5b4fc', fontWeight: 600 }}>{u.enrollments ?? u.courses_assigned ?? 0}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(u)} style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Edit</button>
                      {u.id !== user.id && (
                        <button onClick={() => openDelete(u)} style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px',
        padding: '1.5rem 2rem', marginBottom: '2rem',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--on-surface)' }}>Admin Control Panel 🛡️</h1>
        <p style={{ margin: '0.3rem 0 0', color: 'var(--on-surface-variant)' }}>Manage all students, teachers, and system data</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STAT_CARDS.map(({ label, value, icon, color }) => (
            <div key={label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.8rem' }}>{icon}</p>
              <p style={{ margin: '0.5rem 0 0.2rem', fontSize: '1.8rem', fontWeight: 800, color }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['overview', '📊 Overview'], ['students', '🎓 Students'], ['teachers', '👨‍🏫 Teachers']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.88rem',
            background: tab === key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
            color: tab === key ? '#fff' : 'var(--on-surface-variant)',
          }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && stats && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', color: 'var(--on-surface)', fontSize: '1rem', fontWeight: 700 }}>System Overview</h2>
          <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
            This system has <strong style={{ color: '#a5b4fc' }}>{stats.students} students</strong> and{' '}
            <strong style={{ color: '#86efac' }}>{stats.teachers} teachers</strong> registered.
            There are <strong style={{ color: '#67e8f9' }}>{stats.courses} courses</strong> with{' '}
            <strong style={{ color: '#6ee7b7' }}>{stats.enrollments} active enrollments</strong> and{' '}
            <strong style={{ color: '#fde68a' }}>{stats.test_attempts} test attempts</strong> recorded.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => setTab('students')} style={{ ...btnPrimary }}>Manage Students →</button>
            <button onClick={() => setTab('teachers')} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>Manage Teachers →</button>
          </div>
        </div>
      )}

      {tab === 'students' && <UserTable users={students} role="student" onAdd={() => openAdd('student')} />}
      {tab === 'teachers' && <UserTable users={teachers} role="teacher" onAdd={() => openAdd('teacher')} />}

      {/* Add / Edit Modal */}
      {modal && (modal.type === 'add' || modal.type === 'edit') && (
        <Modal title={modal.type === 'add' ? `Add New ${form.role === 'student' ? 'Student' : 'Teacher'}` : `Edit ${modal.user.name}`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Full Name</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Email</label>
              <input style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" type="email" />
            </div>
            {modal.type === 'add' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Password</label>
                <input style={inputStyle} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Set password" type="password" />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Role</label>
              <select style={{ ...inputStyle }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formError && <p style={{ color: '#fca5a5', fontSize: '0.85rem', margin: 0 }}>⚠️ {formError}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'var(--on-surface-variant)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {modal?.type === 'delete' && (
        <Modal title="Confirm Delete" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: 0 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--on-surface)' }}>{modal.user.name}</strong>?
            This will also remove all their enrollments and test scores.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'var(--on-surface-variant)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 700, opacity: saving ? 0.6 : 1 }}>{saving ? 'Deleting…' : 'Delete'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
