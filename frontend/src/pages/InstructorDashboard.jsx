// ============================================================
//   InstructorDashboard.jsx
//   Place at: frontend/src/pages/InstructorDashboard.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, NavLink } from 'react-router-dom'
import { supabase } from '../api/client'
import { useAuthStore } from '../store/authStore'
import './InstructorDashboard.css'

// ── Icons ─────────────────────────────────────────────────────
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)
const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
)
const IconReport = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
}

// ── Bar chart data (mock — replace with real enrollment/score queries) ──
const CHART_DATA = [
  { label: 'Data Structures\nBatch B2',         assignment: 82, quiz: 58 },
  { label: 'Python Programming\nBatch A1',       assignment: 90, quiz: 75 },
  { label: 'Object Oriented\nBatch C3',          assignment: 70, quiz: 52 },
]

function BarChart() {
  const max = 100
  return (
    <div className="id-bar-chart">
      {CHART_DATA.map(d => (
        <div className="id-bar-group" key={d.label}>
          <div className="id-bars">
            <div className="id-bar assignment" style={{ height: `${(d.assignment / max) * 160}px` }} title={`Assignment avg: ${d.assignment}`} />
            <div className="id-bar quiz"       style={{ height: `${(d.quiz / max) * 160}px`       }} title={`Quiz avg: ${d.quiz}`} />
          </div>
          <div className="id-bar-label">
            {d.label.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Create Course Modal ───────────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const { user } = useAuthStore()
  const [title,   setTitle]   = useState('')
  const [desc,    setDesc]    = useState('')
  const [slug,    setSlug]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const SLUGS = [
    { value: 'python', label: 'Python'           },
    { value: 'c',      label: 'C'                },
    { value: 'cpp',    label: 'C++'              },
    { value: 'ds',     label: 'Data Structures'  },
    { value: 'oop',    label: 'OOP'              },
  ]

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('courses')
      .insert({ title: title.trim(), description: desc.trim(), course_slug: slug || null, instructor_id: user.id })
      .select().single()
    setLoading(false)
    if (err) { setError(err.message); return }
    onCreated(data)
  }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="id-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="id-modal">
        <div className="id-modal-title">Create New Course</div>
        <div className="id-modal-sub">Set up a new course for your students.</div>

        {error && <div className="id-alert-error">{error}</div>}

        <form className="id-form" onSubmit={handleCreate}>
          <div className="id-field">
            <label className="id-label">Course Title</label>
            <input className="id-input" required value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Data Structures and Algorithms" />
          </div>

          <div className="id-field">
            <label className="id-label">Course Type</label>
            <div className="id-slug-grid">
              {SLUGS.map(s => (
                <button type="button" key={s.value}
                  className={`id-slug-btn${slug === s.value ? ' active' : ''}`}
                  onClick={() => setSlug(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="id-field">
            <label className="id-label">Description</label>
            <textarea className="id-input" value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Brief overview of this course..."
              rows={3} style={{ resize: 'none' }} />
          </div>

          <div className="id-modal-actions">
            <button type="button" className="id-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="id-btn-primary" disabled={loading || !title.trim()}>
              {loading ? 'Creating...' : <><IconPlus /> Create Course</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Instructor Home ───────────────────────────────────────────
function InstructorHome() {
  const { user }  = useAuthStore()
  const navigate  = useNavigate()

  const [courses,    setCourses]    = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const [newCourse,  setNewCourse]  = useState(null)
  const [loading,    setLoading]    = useState(true)

  const fullName = user?.user_metadata?.full_name || 'Instructor'

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    setLoading(true)
    const { data } = await supabase
      .from('courses').select('*')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  function handleCreated(course) {
    setCourses(prev => [course, ...prev])
    setShowModal(false)
    setNewCourse(course)
  }

  // Total students across all courses (mock — replace with real enrollment count)
  const totalStudents = courses.length * 42

  return (
    <div className="id-main">

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Page header */}
      <div>
        <h1 className="id-page-heading">Welcome back, {fullName}</h1>
        <p className="id-page-sub">
          You are teaching {courses.length} active course{courses.length !== 1 ? 's' : ''} this semester.
        </p>
      </div>

      {/* New course join code banner */}
      {newCourse && (
        <div className="id-join-banner">
          <div>
            <div className="id-join-banner-label">Course created. Share this code with your students:</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="id-join-banner-code">{newCourse.join_code}</span>
              <span className="id-join-banner-course">— {newCourse.title}</span>
            </div>
          </div>
          <button className="id-dismiss-btn" onClick={() => setNewCourse(null)}>
            <IconX />
          </button>
        </div>
      )}

      {/* Middle row: chart + active courses */}
      <div className="id-mid">

        {/* Course Performance Overview — dark card */}
        <div className="id-card-dark">
          <div className="id-chart-header">
            <div>
              <div className="id-chart-title">Course Performance Overview</div>
              <div className="id-chart-sub">Comparative analysis of assignment vs quiz scores</div>
            </div>
            <div className="id-chart-legend">
              <div className="id-legend-item">
                <span className="id-legend-dot" style={{ background: '#2563eb' }} />
                Avg Assignment Score
              </div>
              <div className="id-legend-item">
                <span className="id-legend-dot" style={{ background: '#cbd5e1' }} />
                Avg Quiz Score
              </div>
            </div>
          </div>
          <BarChart />
        </div>

        {/* Active Courses list */}
        <div className="id-card">
          <div className="id-active-courses-title">
            Active Courses
            <button className="id-three-dots">···</button>
          </div>

          <div className="id-course-col-label">Course Name</div>

          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="id-skeleton" style={{ height: 44, marginBottom: 8 }} />
            ))
          ) : courses.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '0.82rem', color: '#9ca3af' }}>
              No courses yet.
            </div>
          ) : (
            courses.slice(0, 4).map(course => (
              <div
                key={course.id}
                className="id-course-row"
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
              >
                <div className="id-course-row-name">{course.title}</div>
                <div className="id-course-row-meta">
                  Enrolled: — students<br />
                  Since {formatDate(course.created_at)}
                </div>
              </div>
            ))
          )}

          <button className="id-view-all-btn" onClick={() => navigate('/instructor/courses')}>
            View All Courses
          </button>
        </div>
      </div>

      {/* Bottom row: 2 stat cards + analytics promo */}
      <div className="id-bottom">

        {/* Total Students */}
        <div className="id-stat-card">
          <div className="id-stat-label">Total Students</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div className="id-stat-value">{courses.length > 0 ? totalStudents : '—'}</div>
            {courses.length > 0 && (
              <div className="id-stat-delta">
                <IconTrendUp /> +8%
              </div>
            )}
          </div>
        </div>

        {/* Global Avg Score */}
        <div className="id-stat-card">
          <div className="id-stat-label">Global Avg Score</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div className="id-stat-value">84.1</div>
            <div className="id-stat-delta">
              <IconTrendUp /> +3%
            </div>
          </div>
        </div>

        {/* Analytics promo */}
        <div className="id-promo-card">
          <div>
            <div className="id-promo-label">Deep Insights and Tools</div>
            <div className="id-promo-title">Analytics Dashboard</div>
            <div className="id-promo-sub">
              Intelligently generated by AI Assistant to provide real-time insights.
            </div>
          </div>
          <div className="id-promo-btns">
            <button className="id-promo-btn primary" onClick={() => navigate('/instructor/analytics')}>
              <IconSparkle /> AI Assignment Generator
            </button>
            <button className="id-promo-btn secondary" onClick={() => navigate('/instructor/reports')}>
              <IconReport /> View Detailed Report
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Courses Tab (full list) ───────────────────────────────────
function CoursesTab() {
  const { user }  = useAuthStore()
  const navigate  = useNavigate()
  const [courses,   setCourses]   = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    supabase.from('courses').select('*')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCourses(data || []); setLoading(false) })
  }, [])

  const SLUG_COLORS = { python:'#2563eb', c:'#7c3aed', cpp:'#db2777', ds:'#059669', oop:'#d97706' }

  return (
    <div className="id-main">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className="id-page-heading">My Courses</h1>
        <button className="id-create-btn" onClick={() => setShowModal(true)}>
          <IconPlus /> New Course
        </button>
      </div>

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreated={c => { setCourses(p => [c, ...p]); setShowModal(false) }}
        />
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[1,2,3].map(i => <div key={i} className="id-skeleton" style={{ height: 180 }} />)}
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', border: '1px dashed #d1d5db', borderRadius: 10 }}>
          <p style={{ color: '#6b7280', marginBottom: 14 }}>No courses yet.</p>
          <button className="id-btn-primary" style={{ display: 'inline-flex' }} onClick={() => setShowModal(true)}>
            <IconPlus /> Create your first course
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {courses.map(course => {
            const color = SLUG_COLORS[course.course_slug] || '#2563eb'
            return (
              <div key={course.id} className="id-card"
                style={{ cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <span style={{ background: color + '18', color, borderRadius: 4, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {course.join_code}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.01em' }}>
                  {course.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5, marginBottom: 14,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description || 'No description provided.'}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color }}>Manage →</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Analytics stub ────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div className="id-main">
      <div className="id-stub">
        <h1>Analytics</h1>
        <p>Division and batch performance graphs — coming in Phase 4.</p>
      </div>
    </div>
  )
}

// ── Reports stub ──────────────────────────────────────────────
function ReportsTab() {
  return (
    <div className="id-main">
      <div className="id-stub">
        <h1>Reports</h1>
        <p>AI-generated assignment reports — available after student submissions.</p>
      </div>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar({ onCreateCourse }) {
  const { user } = useAuthStore()
  const fullName = user?.user_metadata?.full_name || 'Instructor'

  const links = [
    { to: '/instructor',             label: 'Dashboard', end: true },
    { to: '/instructor/courses',     label: 'Courses'              },
    { to: '/instructor/analytics',   label: 'Analytics'            },
  ]

  return (
    <nav className="id-nav">
      <a href="/instructor" className="id-nav-logo">
        <div className="id-nav-logo-mark"><IconGrid /></div>
        <span className="id-nav-logo-name">EvalFlow</span>
      </a>

      <div className="id-nav-links">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `id-nav-link${isActive ? ' active' : ''}`}>
            {l.label}
          </NavLink>
        ))}
      </div>

      <div className="id-nav-right">
        <button className="id-create-btn" onClick={onCreateCourse}>
          <IconPlus /> Create Course
        </button>
        <div className="id-nav-icon-btn">
          <IconBell />
          <div className="id-nav-badge" />
        </div>
        <div className="id-nav-avatar">{initials(fullName)}</div>
      </div>
    </nav>
  )
}

// ── Root ──────────────────────────────────────────────────────
export default function InstructorDashboard() {
  const [showCreate, setShowCreate] = useState(false)
  const [newCourse,  setNewCourse]  = useState(null)

  return (
    <div className="id-shell">
      <Navbar onCreateCourse={() => setShowCreate(true)} />

      {showCreate && (
        <CreateCourseModal
          onClose={() => setShowCreate(false)}
          onCreated={c => { setNewCourse(c); setShowCreate(false) }}
        />
      )}

      <div style={{ flex: 1 }}>
        <Routes>
          <Route index              element={<InstructorHome  />} />
          <Route path="courses"     element={<CoursesTab      />} />
          <Route path="analytics"   element={<AnalyticsTab    />} />
          <Route path="reports"     element={<ReportsTab      />} />
        </Routes>
      </div>

      <footer className="id-footer">
        <span className="id-footer-copy">EvalFlow © 2024. Higher Learning Standard.</span>
        <div className="id-footer-links">
          <a href="#">Support</a>
          <a href="#">API</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  )
}