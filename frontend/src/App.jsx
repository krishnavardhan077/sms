import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Home, Users, BookOpen, LogOut, Sun, Moon } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminOverview from './pages/AdminOverview';
import CourseDetail from './pages/CourseDetail';
import AuthPage from './pages/AuthPage';

// Wrapper that redirects unauthenticated users to /login
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build sidebar links based on logged-in user's role
  const navLinks = [];
  if (user) {
    if (user.role === 'admin') {
      navLinks.push({ to: '/admin', icon: <Home size={18} />, label: 'Admin Overview' });
    }
    if (user.role === 'teacher') {
      navLinks.push({ to: `/teacher/${user.id}`, icon: <Users size={18} />, label: 'My Dashboard' });
    }
    if (user.role === 'student') {
      navLinks.push({ to: `/student/${user.id}`, icon: <BookOpen size={18} />, label: 'My Dashboard' });
    }
  }

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <h2 className="display" style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.1rem' }}>
          Academic Architect
        </h2>

        {user && (
          <div style={{
            marginBottom: '2rem', padding: '0.75rem',
            background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.1rem' }}>{user.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
          {navLinks.map(({ to, icon, label }) => (
            <Link key={to} to={to} style={{
              textDecoration: 'none', color: 'var(--on-surface)',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              fontWeight: 500, padding: '0.6rem 0.75rem', borderRadius: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {icon} {label}
            </Link>
          ))}
        </nav>

        {user && (
          <button onClick={handleLogout} style={{
            marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
            width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            background: 'rgba(239,68,68,0.1)', color: '#fca5a5',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          >
            <LogOut size={16} /> Sign Out
          </button>
        )}
      </aside>

      {/* ── Right column: Navbar + Page content ─────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Navbar */}
        <header className="top-navbar">
          <span className="top-navbar__title">Dashboard</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Theme toggle pill */}
            <button
              className={`navbar-theme-toggle${isDark ? ' dark-active' : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
            >
              <span className="ntt-icon">
                {isDark ? <Moon size={14} /> : <Sun size={14} />}
              </span>
              <span className="ntt-label">{isDark ? 'Dark' : 'Light'}</span>
              <span className="ntt-track">
                <span className="ntt-thumb" />
              </span>
            </button>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/admin" element={<ProtectedRoute><AdminOverview /></ProtectedRoute>} />
            <Route path="/teacher/:id" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/student/:id" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            {/* All other routes use AppShell which has the sidebar */}
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
