// ============================================================
//   LoginPage.jsx
//   Place this file at: frontend/src/pages/LoginPage.jsx
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'
import './LoginPage.css'

function detectRole(email) {
  const parts = email.split('@')
  if (parts.length < 2) return null
  const local  = parts[0]
  const domain = parts[1]
  if (domain !== 'vit.edu') return null
  return /\d/.test(local) ? 'student' : 'instructor'
}

// ── Lucide-style inline SVGs ──────────────────────────────────
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const IconLightbulb = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"/>
  </svg>
)
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const FEATURES = [
  { icon: <IconLightbulb />, title: 'AI Hints',            desc: 'Contextual guidance tailored to your logic.' },
  { icon: <IconBarChart />,  title: 'Real-time Analytics', desc: 'Instant feedback on your performance metrics.' },
  { icon: <IconUsers />,     title: 'Leaderboard',         desc: 'Collaborate and compete with your peer group.' },
  { icon: <IconClipboard />, title: 'Auto-Quizzes',        desc: 'Quizzes dynamically generated from your code.' },
]

export default function LoginPage() {
  const navigate = useNavigate()

  const [tab,      setTab]      = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error,    setError]    = useState('')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const detectedRole = detectRole(email)
  const emailValid   = detectedRole !== null || email === ''

  const switchTab = (t) => { setTab(t); setError(''); setMessage('') }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!detectedRole) { setError('Only @vit.edu email addresses are allowed.'); return }
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
    if (!detectedRole) { setError('Only @vit.edu email addresses are allowed.'); return }
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role: detectedRole } },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setMessage('Account created. You can now log in.')
    setTab('login')
  }

  return (
    <div className="lp-root">

      {/* Navbar */}
      <nav className="lp-nav">
        <a href="/" className="lp-logo">
          <div className="lp-logo-mark"><IconGrid /></div>
          <span className="lp-logo-name">EvalFlow</span>
        </a>
        <span className="lp-nav-help">
          Need help?<a href="#">Documentation</a>
        </span>
      </nav>

      {/* Body */}
      <div className="lp-body">

        {/* Left */}
        <div className="lp-left">
          <h1 className="lp-headline">
            Learn by doing,
            <span className="lp-headline-accent">not by copying.</span>
          </h1>
          <p className="lp-subtext">
            EvalFlow is a professional AI-assisted programming lab platform.
            Master core concepts with real-time guided hints that help you think,
            rather than just giving you the answer.
          </p>

          <div className="lp-features">
            {FEATURES.map(({ icon, title, desc }) => (
              <div className="lp-feature" key={title}>
                <div className="lp-feature-icon">{icon}</div>
                <div>
                  <div className="lp-feature-title">{title}</div>
                  <div className="lp-feature-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-partners">
            <span className="lp-partner-tag">Partner A</span>
            <span className="lp-partner-tag">Partner B</span>
            <span className="lp-partner-tag">Partner C</span>
          </div>
        </div>

        {/* Right */}
        <div className="lp-right">
          <div className="lp-card-wrapper">
          <div className="lp-card">

            <h2 className="lp-card-heading">Welcome back</h2>
            <p className="lp-card-sub">Please enter your credentials to access your lab.</p>

            {/* Tabs */}
            <div className="lp-tabs">
              <button className={`lp-tab${tab === 'login'    ? ' active' : ''}`} onClick={() => switchTab('login')}>Log In</button>
              <button className={`lp-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>Register</button>
            </div>

            {message && <div className="lp-alert success" style={{ marginBottom: 16 }}>{message}</div>}
            {error   && <div className="lp-alert error"   style={{ marginBottom: 16 }}>{error}</div>}

            <form className="lp-form" onSubmit={tab === 'login' ? handleLogin : handleRegister}>

              {tab === 'register' && (
                <div className="lp-field">
                  <label className="lp-label" htmlFor="fullname">Full Name</label>
                  <input
                    id="fullname" className="lp-input" type="text" required
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="John Doe" autoComplete="name"
                  />
                </div>
              )}

              <div className="lp-field">
                <label className="lp-label" htmlFor="email">VIT Email Address</label>
                <input
                  id="email"
                  className={`lp-input${email && !emailValid ? ' is-error' : ''}`}
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name.surname2024@vit.edu"
                  autoComplete="email"
                />
                {email && detectedRole && (
                  <span className={`lp-role-badge${detectedRole === 'student' ? ' is-student' : ''}`}>
                    <IconUser />
                    Role detected: {detectedRole === 'student' ? 'Student' : 'Instructor'}
                  </span>
                )}
              </div>

              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label" htmlFor="password">Password</label>
                  {tab === 'login' && <a href="#" className="lp-forgot">Forgot password?</a>}
                </div>
                <div className="lp-pass-wrap">
                  <input
                    id="password" className="lp-input"
                    type={showPass ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" minLength={6}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button type="button" className="lp-eye-btn" onClick={() => setShowPass(s => !s)}
                    tabIndex={-1} aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {tab === 'login' && (
                <div className="lp-checkbox-row">
                  <input type="checkbox" id="remember" />
                  <label className="lp-checkbox-label" htmlFor="remember">
                    Keep me logged in for 30 days
                  </label>
                </div>
              )}

              <button
                type="submit" className="lp-submit"
                disabled={loading || (!!email && !detectedRole)}
              >
                {loading
                  ? <><div className="lp-spinner" />Please wait...</>
                  : <>{tab === 'login' ? 'Sign In to EvalFlow' : 'Create Account'}<IconArrowRight /></>
                }
              </button>

            </form>

            <div className="lp-divider" />

            <a href="#" className="lp-academic">
              <IconInfo />
              Academic Institution Login
            </a>

            <p className="lp-legal">
              By continuing, you agree to EvalFlow's{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

          </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-footer">
        <span className="lp-footer-copy">© 2024 EvalFlow Platform. All rights reserved.</span>
        <div className="lp-footer-links">
          <a href="#">System Status</a>
          <a href="#">Security</a>
          <a href="#">Contact</a>
        </div>
      </footer>

    </div>
  )
}