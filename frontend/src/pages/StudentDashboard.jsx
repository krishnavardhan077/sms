import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

import { API } from '../utils/api';

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>—</span>;
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171';
  return (
    <span style={{
      background: `${color}20`, color, border: `1px solid ${color}40`,
      padding: '2px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.82rem',
    }}>{score}%</span>
  );
}

function TestModal({ test, studentId, onClose, onSubmitted }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    fetch(`${API}/tests/${test.id}`)
      .then(r => r.json())
      .then(d => { setQuestions(d.questions || []); setLoadingQ(false); });
  }, [test.id]);

  const submit = async () => {
    const answerList = questions.map((_, i) => answers[i] !== undefined ? answers[i] : -1);
    setLoading(true);
    const res = await fetch(`${API}/tests/${test.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, answers: answerList }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    onSubmitted();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '2rem', maxWidth: '700px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--on-surface)' }}>{test.title}</h2>
            <p style={{ margin: '0.3rem 0 0', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>{test.description}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
        </div>

        {loadingQ ? (
          <p style={{ color: 'var(--on-surface-variant)' }}>Loading questions...</p>
        ) : result ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Result</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: result.percentage >= 80 ? '#4ade80' : result.percentage >= 60 ? '#fbbf24' : '#f87171', margin: 0 }}>{result.percentage}%</p>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>You scored {result.score} out of {result.total}</p>
            <button onClick={onClose} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', fontWeight: 600 }}>Close</button>
          </div>
        ) : (
          <>
            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: answers[i] !== undefined ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>
                  <span style={{ color: '#6366f1', marginRight: '0.5rem' }}>Q{i + 1}.</span>{q.q}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, j) => (
                    <label key={j} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                      padding: '0.5rem 0.75rem', borderRadius: '8px',
                      background: answers[i] === j ? 'rgba(99,102,241,0.15)' : 'transparent',
                      border: answers[i] === j ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" name={`q${i}`} checked={answers[i] === j} onChange={() => setAnswers(a => ({ ...a, [i]: j }))} style={{ accentColor: '#6366f1' }} />
                      <span style={{ color: 'var(--on-surface)' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={submit}
              disabled={loading || Object.keys(answers).length < questions.length}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                cursor: Object.keys(answers).length < questions.length ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                fontWeight: 700, fontSize: '1rem', opacity: Object.keys(answers).length < questions.length ? 0.5 : 1,
                marginTop: '0.5rem',
              }}>
              {loading ? 'Submitting…' : `Submit Test (${Object.keys(answers).length}/${questions.length} answered)`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [dropping, setDropping] = useState(null);
  const [tab, setTab] = useState('enrolled');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/dashboard/student/${user.id}`).then(r => r.json()),
      fetch(`${API}/courses?student_id=${user.id}`).then(r => r.json()),
    ]).then(([dash, courses]) => {
      setDashData(dash);
      setAllCourses(courses);
      setLoading(false);
    });
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const enroll = async (courseId) => {
    setEnrolling(courseId);
    await fetch(`${API}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: user.id, course_id: courseId }),
    });
    setEnrolling(null);
    load();
    setTab('enrolled');
  };

  const drop = async (enrollmentId) => {
    if (!window.confirm('Drop this course? Your test scores will be kept.')) return;
    setDropping(enrollmentId);
    await fetch(`${API}/enroll/${enrollmentId}`, { method: 'DELETE' });
    setDropping(null);
    load();
  };

  if (loading) return <div style={{ padding: '3rem', color: 'var(--on-surface-variant)' }}>Loading…</div>;

  const enrolled = dashData?.enrolled_courses || [];
  const available = allCourses.filter(c => !c.enrolled);
  const totalTests = enrolled.flatMap(c => c.tests).length;
  const attempted = enrolled.flatMap(c => c.tests).filter(t => t.attempted).length;

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
            Welcome back, {user.name}
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--on-surface-variant)' }}>Student Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { label: 'Enrolled', value: enrolled.length },
            { label: 'Tests Done', value: `${attempted}/${totalTests}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#a5b4fc' }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['enrolled', `My Courses (${enrolled.length})`], ['browse', `Browse (${available.length} available)`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.55rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem',
            background: tab === key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
            color: tab === key ? '#fff' : 'var(--on-surface-variant)',
            boxShadow: tab === key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* Enrolled Courses Tab */}
      {tab === 'enrolled' && (
        enrolled.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--on-surface-variant)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>You are not enrolled in any courses yet.</p>
            <button onClick={() => setTab('browse')} style={{ marginTop: '1rem', padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#6366f1', color: '#fff', fontWeight: 600 }}>Browse Courses</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {enrolled.map(course => {
              const doneCount = course.tests.filter(t => t.attempted).length;
              const avg = course.tests.filter(t => t.score !== null).map(t => t.score);
              const avgScore = avg.length ? Math.round(avg.reduce((a, b) => a + b, 0) / avg.length) : null;
              return (
                <div key={course.enrollment_id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(99,102,241,0.06)' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)' }}>{course.title}</h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>{course.description}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Progress</p>
                        <p style={{ margin: 0, fontWeight: 700, color: '#a5b4fc' }}>{doneCount}/{course.tests.length} tests</p>
                      </div>
                      {avgScore !== null && (
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Avg Score</p>
                          <ScoreBadge score={avgScore} />
                        </div>
                      )}
                      <button onClick={() => drop(course.enrollment_id)} disabled={dropping === course.enrollment_id} style={{ padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                        {dropping === course.enrollment_id ? '…' : 'Drop'}
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {course.tests.map(test => (
                      <div key={test.id} style={{ padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--on-surface)' }}>{test.title}</p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{test.question_count} questions</p>
                        </div>
                        {test.attempted ? (
                          <ScoreBadge score={test.score} />
                        ) : (
                          <button onClick={() => setActiveTest(test)} style={{ padding: '0.35rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>
                            Take Test
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Browse Courses Tab */}
      {tab === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {allCourses.map(course => (
            <div key={course.id} style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${course.enrolled ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{course.title}</h3>
                  {course.enrolled && <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Enrolled</span>}
                </div>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--on-surface-variant)', fontSize: '0.85rem', lineHeight: 1.5 }}>{course.description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem' }}>{course.test_count} {course.test_count === 1 ? 'test' : 'tests'}</span>
                {!course.enrolled && (
                  <button onClick={() => enroll(course.id)} disabled={enrolling === course.id} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    {enrolling === course.id ? 'Enrolling…' : 'Enroll'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Modal */}
      {activeTest && (
        <TestModal
          test={activeTest}
          studentId={user.id}
          onClose={() => setActiveTest(null)}
          onSubmitted={() => { setActiveTest(null); load(); }}
        />
      )}
    </div>
  );
}
