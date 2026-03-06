// frontend/src/components/layout/AppShell.jsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AppShell({ navItems, children }) {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Pull name from user metadata
  const fullName = user?.user_metadata?.full_name || user?.email || 'User'
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-gray-900 border-r border-gray-800
                         flex flex-col transition-all duration-200 shrink-0`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <span className="text-2xl shrink-0">🧪</span>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">EvalFlow</p>
              <p className="text-gray-500 text-xs capitalize">{role} portal</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                 ${isActive
                   ? 'bg-blue-600 text-white font-medium'
                   : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
              }>
              <span className="text-lg shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2 rounded-lg bg-gray-800">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-medium truncate">{fullName}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors`}>
            <span className="text-lg shrink-0">🚪</span>
            {!collapsed && <span>Log out</span>}
          </button>
          <button onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-center py-1 mt-1 text-gray-600 hover:text-gray-400 transition-colors">
            <span className="text-xs">{collapsed ? '→' : '←'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}