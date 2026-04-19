import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AuthProvider from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import FieldDetail from './pages/FieldDetail';
import NotFound from './pages/NotFound';

// ── Role-based redirect (logic unchanged) ────────────────────
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

// ── Page transition wrapper ───────────────────────────────────
// Scrolls to top on every route change and applies the
// entry animation defined in App.css (.page-enter)
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
};

// ── Root App ──────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* app-shell provides the background texture / gradient */}
        <div className="app-shell">
          <Routes>
            {/* ── Public routes ─────────────────────────── */}
            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <Register />
                </PageTransition>
              }
            />

            {/* ── Role-based redirect ────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Admin routes ───────────────────────────── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fields"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />

            {/* ── Agent routes ───────────────────────────── */}
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute requiredRole="agent">
                  <PageTransition>
                    <AgentDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/fields"
              element={
                <ProtectedRoute requiredRole="agent">
                  <PageTransition>
                    <AgentDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/updates"
              element={
                <ProtectedRoute requiredRole="agent">
                  <PageTransition>
                    <AgentDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/settings"
              element={
                <ProtectedRoute requiredRole="agent">
                  <PageTransition>
                    <AgentDashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />

            {/* ── Shared routes ──────────────────────────── */}
            <Route
              path="/fields/:id"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <FieldDetail />
                  </PageTransition>
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all ──────────────────────────────── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;