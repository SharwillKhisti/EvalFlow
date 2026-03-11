// frontend/src/pages/InstructorDashboard.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'
import { useAuthStore } from '../store/authStore'
import TopNav from '../components/layout/TopNav'

const NAV = [
  { to: '/instructor',           icon: '🏠', label: 'Home',      end: true },
  { to: '/instructor/courses',   icon: '📚', label: 'Courses'    },
  { to: '/instructor/analytics', icon: '📊', label: 'Analytics'  },
  { to: '/instructor/reports',   icon: '📋', label: 'Reports'    },
]

// ── Create Course Modal ───────────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const { user } = useAuthStore()
  const [title, setTitle]   = useState('')
  const [desc, setDesc]     = useState('')
  const [slug, setSlug]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const SLUGS = [
    { value: 'python', label: '🐍 Python' },
    { value: 'c',      label: '⚙️ C' },
    { value: 'cpp',    label: '➕ C++' },
    { value: 'ds',     label: '🌳 Data Structures' },
    { value: 'oop',    label: '🧱 OOP' },
  ]

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('courses')
      .insert({ title: title.trim(), description: desc.trim(), course_slug: slug || null, instructor_id: user.id })
      .select().single()
    setLoading(false)
    if (err) { setError(err.message); return }
    onCreated(data)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <h2 className="text-h2" style={{ marginBottom: 6 }}>Create New Course</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Set up a new course for your students</p>
        {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: '0.85rem' }}>{error}</div>}
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Course Title *</label>
            <input className="input" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Data Structures & Algorithms" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Course Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {SLUGS.map(s => (
                <button type="button" key={s.value} onClick={() => setSlug(s.value)}
                  style={{ padding: '8px 6px', borderRadius: 10, border: `2px solid ${slug === s.value ? 'var(--sky-500)' : 'var(--border)'}`, background: slug === s.value ? 'var(--sky-50)' : 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, color: slug === s.value ? 'var(--sky-700)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
            <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief overview..." rows={3} style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Creating...' : '+ Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Instructor Stat Card ──────────────────────────────────────
function IStatCard({ icon, label, value, sub, color = 'var(--sky-600)', delay = 1 }) {
  return (
    <div className={`stat-card animate-fade-up stagger-${delay}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ── Course card (instructor view) ─────────────────────────────
function InstructorCourseCard({ course, onClick, index }) {
  const slugColors = { python:'#3B82F6', c:'#8B5CF6', cpp:'#EC4899', ds:'#10B981', oop:'#F59E0B' }
  const color = slugColors[course.course_slug] || '#3B82F6'

  return (
    <button onClick={onClick}
      className={`animate-fade-up stagger-${(index % 4) + 2}`}
      style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '20px', cursor: 'pointer', textAlign: 'left', boxShadow: 'var(--shadow-sm)', transition: 'all 0.25s ease', width: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = color + '60' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📘</div>
        <div style={{ background: color + '18', color: color, borderRadius: 100, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {course.join_code}
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
        {course.title}
      </h3>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {course.description || 'No description'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>Manage →</span>
        {course.course_slug && <span className="badge" style={{ background: color + '15', color }}>{course.course_slug.toUpperCase()}</span>}
      </div>
    </button>
  )
}

// ── Instructor Home ───────────────────────────────────────────
function InstructorHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [courses, setCourses]     = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newCourse, setNewCourse] = useState(null)
  const [loading, setLoading]     = useState(true)

  const fullName  = user?.user_metadata?.full_name || 'Instructor'
  const firstName = fullName.split(' ')[0]
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    setLoading(true)
    const { data } = await supabase.from('courses').select('*').eq('instructor_id', user.id).order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  function handleCreated(course) {
    setCourses(prev => [course, ...prev])
    setShowModal(false)
    setNewCourse(course)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showModal && <CreateCourseModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{greeting} ☀️</p>
          <h1 className="text-h1">Welcome, Prof. {firstName}!</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + New Course
        </button>
      </div>

      {/* New course join code banner */}
      {newCourse && (
        <div className="animate-fade-up" style={{ background: 'linear-gradient(135deg, #065F46, #047857)', borderRadius: 'var(--radius-md)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>✅ Course created! Share this code with your students:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '0.15em' }}>{newCourse.join_code}</span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>— {newCourse.title}</span>
            </div>
          </div>
          <button onClick={() => setNewCourse(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div className="bento bento-4">
        <IStatCard icon="📚" label="COURSES" value={courses.length} sub="Active courses" delay={1} />
        <IStatCard icon="👥" label="STUDENTS" value="—" sub="Total enrolled" color="#8B5CF6" delay={2} />
        <IStatCard icon="📝" label="ASSIGNMENTS" value="—" sub="Generated & approved" color="#F59E0B" delay={3} />
        <IStatCard icon="📊" label="AVG SCORE" value="—" sub="Class average" color="#10B981" delay={4} />
      </div>

      {/* Courses grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="text-h2">My Courses</h2>
          <button onClick={() => navigate('/instructor/courses')} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>View all →</button>
        </div>

        {loading ? (
          <div className="bento bento-3">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-blue)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>No courses yet</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">Create your first course</button>
          </div>
        ) : (
          <div className="bento bento-3">
            {courses.map((course, i) => (
              <InstructorCourseCard key={course.id} course={course} index={i}
                onClick={() => navigate(`/instructor/courses/${course.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom promo cards */}
      <div className="bento bento-2">
        <div className="card-blue animate-fade-up stagger-5">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6 }}>AI Assignment Generator</h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>Auto-generate unit-wise coding assignments and theory quizzes from your syllabus. Review and approve in one click.</p>
          </div>
        </div>
        <div className="card animate-fade-up stagger-6" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
          <h3 className="text-h3" style={{ marginBottom: 6, color: '#92400E' }}>Analytics Dashboard</h3>
          <p style={{ fontSize: '0.82rem', color: '#B45309', lineHeight: 1.6 }}>Track class performance, filter by division and batch, and identify students who need extra support.</p>
          <button onClick={() => navigate('/instructor/analytics')} className="btn" style={{ marginTop: 12, background: '#F59E0B', color: 'white', padding: '8px 16px', fontSize: '0.8rem' }}>
            View Analytics →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Analytics stub ────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }} className="animate-float">📊</div>
      <h1 className="text-h1" style={{ marginBottom: 8 }}>Analytics</h1>
      <p style={{ color: 'var(--text-muted)' }}>Division/batch performance graphs — coming in Phase 4.</p>
    </div>
  )
}

// ── Reports stub ──────────────────────────────────────────────
function ReportsTab() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }} className="animate-float">📋</div>
      <h1 className="text-h1" style={{ marginBottom: 8 }}>Reports</h1>
      <p style={{ color: 'var(--text-muted)' }}>AI-generated assignment reports — available after student submissions.</p>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────
export default function InstructorDashboard() {
  return (
    <div className="page-bg">
      <div className="app-shell">
        <TopNav navItems={NAV} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route index               element={<InstructorHome />} />
            <Route path="courses"      element={<InstructorHome />} />
            <Route path="analytics"    element={<AnalyticsTab />}   />
            <Route path="reports"      element={<ReportsTab />}     />
          </Routes>
        </main>
      </div>
    </div>
  )
}
