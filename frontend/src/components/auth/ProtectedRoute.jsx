import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children, role }) {
  const { user, role: userRole, loading } = useAuthStore()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && userRole !== role) return <Navigate to={userRole === 'instructor' ? '/instructor' : '/student'} replace />
  return children
}