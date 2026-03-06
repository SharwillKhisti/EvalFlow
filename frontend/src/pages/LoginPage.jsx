// LoginPage.jsx	Auth: login + register tabs
// frontend/src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'

// Detect role from VIT email pattern
// Student:    firstname.lastname24@vit.edu  (digits present before @)
// Instructor: firstname.lastname@vit.edu    (no digits before @)
function detectRole(email) {
  const local = email.split('@')[0]           // e.g. "john.doe24"
  const domain = email.split('@')[1]          // e.g. "vit.edu"
  if (domain !== 'vit.edu') return null       // not a VIT email
  return /\d/.test(local) ? 'student' : 'instructor'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab]           = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(false)

  // Live-detect role as user types email
  const detectedRole = detectRole(email)
  const emailValid   = detectedRole !== null || email === ''

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!detectedRole) { setError('Please use your official VIT email address.'); return }
    setLoading(true)

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()

    setLoading(false)
    navigate(profile?.role === 'instructor' ? '/instructor' : '/student')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!detectedRole) { setError('Please use your official VIT email address.'); return }
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    setLoading(true)

    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role: detectedRole } }
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setMessage(`Account created as ${detectedRole}! Log in below.`)
    setTab('login')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧪</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EvalFlow</h1>
          <p className="text-gray-400 mt-1 text-sm">Virtual Lab Assistant · VIT</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">

          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-800 p-1 mb-6">
            {['login','register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setMessage('') }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all capitalize
                  ${tab===t ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          {message && <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-700 text-green-300 text-sm">{message}</div>}
          {error   && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">{error}</div>}

          <form onSubmit={tab==='login' ? handleLogin : handleRegister} className="space-y-4">

            {tab === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input type="text" required value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            )}

            {/* Email with live role badge */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">VIT Email</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name.lastname24@vit.edu"
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-colors
                  ${email && !emailValid ? 'border-red-500' : email && emailValid ? 'border-green-600' : 'border-gray-700 focus:border-blue-500'}`} />

              {/* Live role detection indicator */}
              {email && detectedRole && (
                <div className={`mt-2 flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md w-fit
                  ${detectedRole==='student' ? 'bg-blue-950 text-blue-300' : 'bg-purple-950 text-purple-300'}`}>
                  <span>{detectedRole === 'student' ? '🎓' : '👨‍🏫'}</span>
                  <span>Detected: {detectedRole}</span>
                </div>
              )}
              {email && !detectedRole && (
                <p className="mt-1 text-xs text-red-400">Only @vit.edu emails are allowed</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" minLength={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <button type="submit" disabled={loading || (email && !detectedRole)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mt-2">
              {loading ? 'Please wait...' : tab === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          VIT students & faculty only · @vit.edu required
        </p>
      </div>
    </div>
  )
}