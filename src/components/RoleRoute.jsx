import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

/**
 * Restricts nested routes to users whose role is in `allow`.
 * Unauthenticated users are sent to login (same behaviour as ProtectedRoute).
 */
export default function RoleRoute({ allow = ['admin'] }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allow.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
