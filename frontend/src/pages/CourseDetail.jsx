import React, { useEffect, useState } from 'react';
import { API } from '../utils/api';
import { useParams, Link } from 'react-router-dom';

export default function CourseDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/courses/${id}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, [id]);

  if (!data) return <div style={{ padding: '2rem' }}>Loading Course Details...</div>;

  return (
    <div>
      <Link to={-1} style={{ textDecoration: 'none', color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block', fontWeight: 600 }}>&larr; Back to Dashboard</Link>
      
      <div className="glass-header" style={{ marginBottom: '2rem', borderRadius: '12px' }}>
        <h1 className="display" style={{ fontSize: '2.5rem' }}>{data.title}</h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>Professor {data.teacher.name} • {data.teacher.email}</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="headline-sm" style={{ marginBottom: '1rem' }}>Course Syllabus & Description</h2>
        <p style={{ color: 'var(--on-surface)' }}>{data.description}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn-primary">Enroll Students</button>
        <button className="btn-secondary">Export Roster</button>
      </div>
    </div>
  );
}
