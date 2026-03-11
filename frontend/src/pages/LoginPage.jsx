// frontend/src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'

function detectRole(email) {
  const local  = email.split('@')[0]
  const domain = email.split('@')[1]
  if (domain !== 'vit.edu') return null
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
  const [showPass, setShowPass] = useState(false)

  const detectedRole = detectRole(email)
  const emailValid   = detectedRole !== null || email === ''

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
      options: { data: { full_name: fullName, role: detectedRole } }
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setMessage('Account created! You can now log in.')
    setTab('login')
  }

  return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>

      {/* Floating orbs */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,197,253,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '8%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', width: '100%', maxWidth: 960, gap: 32, alignItems: 'center', position: 'relative', zIndex: 1 }}>

        {/* Left — Branding panel */}
        <div className="animate-fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32, padding: '40px 20px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
              🧪
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>EvalFlow</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: -2 }}>VIT · Virtual Lab Assistant</div>
            </div>
          </div>

          {/* Hero text */}
          <div>
            <h1 className="text-hero" style={{ marginBottom: 16, lineHeight: 1.15 }}>
              Learn by<br />
              <span style={{ color: 'var(--sky-600)' }}>doing,</span> not<br />
              by copying.
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 340, fontSize: '0.95rem' }}>
              Solve real coding problems with AI-guided hints. Your instructor sees how you think, not just what you submit.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🤖', text: 'AI hints that guide, never spoil' },
              { icon: '📊', text: 'Real-time performance analytics' },
              { icon: '🏆', text: 'Leaderboard & achievement badges' },
              { icon: '📝', text: 'Auto-generated quizzes per unit' },
            ].map(({ icon, text }, i) => (
              <div key={i} className={`animate-fade-up stagger-${i + 2}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.8)', width: 'fit-content' }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Auth card */}
        <div className="animate-fade-up stagger-2" style={{ width: 420, flexShrink: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 20px 60px rgba(15,23,42,0.15)', padding: '36px 32px' }}>

            {/* Tab switcher */}
            <div style={{ display: 'flex', background: 'var(--sky-50)', borderRadius: 100, padding: 4, marginBottom: 28, border: '1px solid var(--border-blue)' }}>
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); setMessage('') }}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s ease', background: tab === t ? 'white' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
                  {t === 'login' ? 'Log In' : 'Register'}
                </button>
              ))}
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.35rem', marginBottom: 6 }}>
              {tab === 'login' ? 'Welcome back 👋' : 'Create account ✨'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
              {tab === 'login' ? 'Sign in to your EvalFlow account' : 'Join EvalFlow with your VIT email'}
            </p>

            {/* Messages */}
            {message && (
              <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, color: '#15803D', fontSize: '0.85rem' }}>
                ✅ {message}
              </div>
            )}
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: '0.85rem' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {tab === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
                  <input className="input" type="text" required value={fullName}
                    onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>VIT Email</label>
                <input className={`input ${email && !emailValid ? 'error' : ''}`}
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name.lastname24@vit.edu" />
                {email && detectedRole && (
                  <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: detectedRole === 'student' ? 'var(--sky-100)' : '#EDE9FE', borderRadius: 100, padding: '3px 10px' }}>
                    <span style={{ fontSize: 12 }}>{detectedRole === 'student' ? '🎓' : '👨‍🏫'}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: detectedRole === 'student' ? 'var(--sky-700)' : '#7C3AED' }}>
                      {detectedRole === 'student' ? 'Student' : 'Instructor'} detected
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'}
                    required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" minLength={6}
                    style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || (!!email && !detectedRole)}
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '13px 20px', fontSize: '0.95rem', fontWeight: 600, marginTop: 4, borderRadius: 'var(--radius-sm)' }}>
                {loading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Please wait...</>
                  : tab === 'login' ? 'Sign In →' : 'Create Account →'
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 20 }}>
              VIT students & faculty only · @vit.edu required
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-split { flex-direction: column !important; }
          .login-brand { display: none !important; }
          .login-card { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
