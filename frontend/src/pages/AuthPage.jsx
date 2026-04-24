import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

import { API as BASE_API } from '../utils/api';
const API = `${BASE_API}/auth`;

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin',   label: 'Admin'   },
];

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [tab, setTab] = useState('login');       // 'login' | 'register'
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleRoleChange = (r) => {
    setRole(r);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'register') {
        const res = await fetch(`${API}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        setSuccess('Account created! You can now log in.');
        setTab('login');
        setForm({ name: '', email: form.email, password: '' });
      } else {
        const res = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        login(data);

        // Redirect to the correct dashboard based on role
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'teacher') navigate(`/teacher/${data.id}`);
        else navigate(`/student/${data.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface)',
      padding: '2rem',
      transition: 'background 0.3s ease',
    }}>
      {/* Floating theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark/light mode"
        style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: '1px solid var(--outline-variant)',
          background: 'var(--surface-container-lowest)',
          color: 'var(--on-surface)',
          cursor: 'pointer',
          fontSize: '0.82rem', fontWeight: 600,
          fontFamily: 'var(--font-body)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          transition: 'background 0.2s, transform 0.15s',
          zIndex: 100,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
        {isDark ? 'Dark' : 'Light'}
      </button>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '-120px', left: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-100px', right: '-100px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '2.5rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)', letterSpacing: '-0.03em',
          }}>AA</div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 700, margin: 0, lineHeight: 1.2,
            background: 'linear-gradient(135deg, #c7d2fe, #a5b4fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Academic Architect</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Student Management System
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '4px', marginBottom: '1.8rem',
        }}>
          {['login', 'register'].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
                borderRadius: '9px', fontWeight: 600, fontSize: '0.9rem',
                transition: 'all 0.2s',
                background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--on-surface-variant)',
                boxShadow: tab === t ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              }}
            >{t === 'login' ? 'Sign In' : 'Register'}</button>
          ))}
        </div>

        {/* Role Selector */}
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          {tab === 'login' ? 'Sign in as' : 'Register as'}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.6rem' }}>
          {ROLES.map(({ value, label }) => (
            <button key={value} onClick={() => handleRoleChange(value)}
              style={{
                flex: 1, padding: '0.55rem 0.3rem', border: 'none', cursor: 'pointer',
                borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem',
                transition: 'all 0.2s',
                background: role === value
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))'
                  : 'rgba(255,255,255,0.05)',
                color: role === value ? '#a5b4fc' : 'var(--on-surface-variant)',
                border: role === value ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: role === value ? '0 0 0 1px rgba(99,102,241,0.25)' : 'none',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Full Name</label>
              <input
                id="auth-name" name="name" type="text" required
                value={form.name} onChange={handleChange}
                placeholder="Jane Doe"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Email Address</label>
            <input
              id="auth-email" name="email" type="email" required
              value={form.email} onChange={handleChange}
              placeholder="jane@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Password</label>
            <input
              id="auth-password" name="password" type="password" required
              value={form.password} onChange={handleChange}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '0.85rem',
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#86efac', fontSize: '0.85rem',
            }}>{success}</div>
          )}

          <button id="auth-submit" type="submit" disabled={loading}
            style={{
              padding: '0.85rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
              background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', marginTop: '0.25rem',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(99,102,241,0.35)',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--on-surface-variant)', fontSize: '0.82rem' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
            style={{ color: '#a5b4fc', cursor: 'pointer', fontWeight: 600 }}>
            {tab === 'login' ? 'Register' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: 'var(--on-surface)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
