import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait for auth state to resolve before redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  // Fallback — should never reach here in normal usage
  return <Navigate to="/login" replace />;
};

export default Dashboard;
