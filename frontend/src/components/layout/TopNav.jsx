// frontend/src/components/layout/TopNav.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function TopNav({ navItems }) {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()
  const fullName = user?.user_metadata?.full_name || 'User'
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="topnav animate-fade-up" style={{ justifyContent: 'space-between' }}>

      {/* Left — Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(37,99,235,0.3)', flexShrink: 0 }}>
          🧪
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
          EvalFlow
        </span>
      </div>

      {/* Centre — Nav pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Right — Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>

        {/* Notification bell */}
        <button className="btn btn-ghost" style={{ padding: '8px', borderRadius: '50%', width: 36, height: 36, justifyContent: 'center' }}>
          🔔
        </button>

        {/* Role badge */}
        <div className={`badge ${role === 'instructor' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
          {role === 'instructor' ? '👨‍🏫' : '🎓'} {role}
        </div>

        {/* Avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sky-400), var(--sky-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
            title={fullName}>
            {initials}
          </div>
          <button onClick={handleLogout} className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444' }}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
