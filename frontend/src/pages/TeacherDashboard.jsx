import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

function ScoreBadge({ score }) {
  if (score === null || score === undefined)
    return <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem' }}>Not attempted</span>;
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171';
  return (
    <span style={{
      background: `${color}20`, color, border: `1px solid ${color}40`,
      padding: '3px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.82rem',
    }}>{score}%</span>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [roster, setRoster] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/dashboard/teacher/${user.id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        if (d.courses?.length > 0) setActiveCourse(d.courses[0].id);
      });
  }, [user.id]);

  useEffect(() => {
    if (!activeCourse) return;
    setRosterLoading(true);
    setRoster(null);
    fetch(`${API}/courses/${activeCourse}/roster`)
      .then(r => r.json())
      .then(d => { setRoster(d); setRosterLoading(false); });
  }, [activeCourse]);

  if (!data) return <div style={{ padding: '3rem', color: 'var(--on-surface-variant)' }}>Loading…</div>;

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px',
        padding: '1.5rem 2rem', marginBottom: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--on-surface)' }}>
            Instructor Center 👨‍🏫
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--on-surface-variant)' }}>Welcome, {user.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { label: 'Courses', value: data.courses.length },
            { label: 'Total Students', value: data.total_students },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#a5b4fc' }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Course List (sidebar) */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            All Courses
          </div>
          {data.courses.map(c => (
            <button key={c.id} onClick={() => setActiveCourse(c.id)} style={{
              width: '100%', padding: '0.9rem 1rem', textAlign: 'left', border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
              background: activeCourse === c.id ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderLeft: activeCourse === c.id ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: activeCourse === c.id ? '#a5b4fc' : 'var(--on-surface)' }}>{c.title}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{c.enrolled_students} students</p>
            </button>
          ))}
        </div>

        {/* Roster Panel */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
          {rosterLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading roster…</div>
          ) : !roster ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Select a course</div>
          ) : (
            <>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{roster.course.title}</h2>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>{roster.students.length} enrolled students</p>
                </div>
              </div>

              {roster.students.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  <p style={{ fontSize: '2rem' }}>🎓</p>
                  <p>No students enrolled in this course yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--on-surface-variant)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--on-surface-variant)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                        {roster.tests.map(t => (
                          <th key={t.id} style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t.title}</th>
                        ))}
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.students.map((s, idx) => {
                        const scores = s.test_scores.filter(t => t.score !== null).map(t => t.score);
                        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
                        return (
                          <tr key={s.student_id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.8rem 1rem', color: 'var(--on-surface)', fontWeight: 600 }}>{s.name}</td>
                            <td style={{ padding: '0.8rem 1rem', color: 'var(--on-surface-variant)' }}>{s.email}</td>
                            {s.test_scores.map(ts => (
                              <td key={ts.test_id} style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                                <ScoreBadge score={ts.score} />
                              </td>
                            ))}
                            <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                              <ScoreBadge score={avg} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
