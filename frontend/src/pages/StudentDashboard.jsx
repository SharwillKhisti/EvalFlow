// ============================================================
//   StudentDashboard.jsx
//   Place at: frontend/src/pages/StudentDashboard.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, NavLink } from 'react-router-dom'
import { supabase } from '../api/client'
import { useAuthStore } from '../store/authStore'
import './StudentDashboard.css'

// ── Icons (Lucide-style inline SVGs) ─────────────────────────
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const IconExternalLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

// ── Course color themes ───────────────────────────────────────
const COURSE_COLORS = [
  { bg: '#1e3a5f', tag: 'Credit' },
  { bg: '#14532d', tag: 'Elective' },
  { bg: '#4c1d95', tag: 'Optional' },
  { bg: '#78350f', tag: 'Credit' },
  { bg: '#881337', tag: 'Elective' },
]

// ── Avatar color pool ─────────────────────────────────────────
const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626']

function avatarBg(i) { return AVATAR_COLORS[i % AVATAR_COLORS.length] }

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Shared fetch ──────────────────────────────────────────────
async function fetchEnrolledCourses(userId) {
  const { data: enrollments } = await supabase
    .from('enrollments').select('course_id').eq('student_id', userId)
  const courseIds = enrollments?.map(e => e.course_id) || []
  if (!courseIds.length) return []
  const { data: courses } = await supabase
    .from('courses').select('id, title, description, instructor_id').in('id', courseIds)
  return courses || []
}

// ── Donut chart ───────────────────────────────────────────────
function Donut({ pct = 80 }) {
  const r   = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="sd-donut-wrap">
      <svg viewBox="0 0 120 120">
        <circle className="sd-donut-bg"   cx="60" cy="60" r={r} />
        <circle className="sd-donut-fill" cx="60" cy="60" r={r}
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="sd-donut-center">
        <div className="sd-donut-pct">{pct}%</div>
        <div className="sd-donut-pct-label">overall progress</div>
      </div>
    </div>
  )
}

// ── Bar chart (static demo data, replace with real) ───────────
const CHART_DATA = [
  { label: 'Unit 1', assignment: 75, quiz: 60 },
  { label: 'Unit 2', assignment: 55, quiz: 80 },
  { label: 'Unit 3', assignment: 88, quiz: 70 },
  { label: 'Unit 4', assignment: 65, quiz: 55 },
  { label: 'Unit 5', assignment: 78, quiz: 85 },
]

function BarChart() {
  const max = 100
  return (
    <div className="sd-bar-chart">
      {CHART_DATA.map(d => (
        <div className="sd-bar-group" key={d.label}>
          <div className="sd-bars">
            <div className="sd-bar assignment" style={{ height: `${(d.assignment / max) * 116}px` }} title={`Assignment: ${d.assignment}`} />
            <div className="sd-bar quiz"       style={{ height: `${(d.quiz / max) * 116}px`       }} title={`Quiz: ${d.quiz}`} />
          </div>
          <div className="sd-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Student Home ──────────────────────────────────────────────
function StudentHome() {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()
  const [courses,  setCourses]  = useState([])
  const [todos,    setTodos]    = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [joining,  setJoining]  = useState(false)
  const [joinMsg,  setJoinMsg]  = useState({ text: '', type: '' })
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('monthly')

  const fullName  = user?.user_metadata?.full_name || 'Student'
  const firstName = fullName.split(' ')[0]

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [c, { data: t }] = await Promise.all([
      fetchEnrolledCourses(user.id),
      supabase.from('todos').select('*').eq('student_id', user.id).eq('is_done', false).limit(5),
    ])
    setCourses(c)
    setTodos(t || [])
    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinMsg({ text: '', type: '' })

    const { data: course } = await supabase
      .from('courses').select('id, title')
      .eq('join_code', joinCode.trim().toUpperCase()).single()

    if (!course) {
      setJoinMsg({ text: 'Invalid code. Check with your instructor.', type: 'error' })
      setJoining(false); return
    }

    const { data: existing } = await supabase
      .from('enrollments').select('id')
      .eq('course_id', course.id).eq('student_id', user.id).maybeSingle()

    if (existing) {
      setJoinMsg({ text: `Already enrolled in "${course.title}"`, type: 'error' })
      setJoining(false); return
    }

    const { error } = await supabase
      .from('enrollments').insert({ course_id: course.id, student_id: user.id })

    setJoining(false)
    if (error) {
      setJoinMsg({ text: 'Something went wrong. Please try again.', type: 'error' })
    } else {
      setJoinMsg({ text: `Joined "${course.title}" successfully.`, type: 'success' })
      setJoinCode('')
      fetchData()
    }
  }

  // Mock pending tasks (replace with real data from submissions + todos)
  const pendingTasks = [
    { id: 1, title: 'Linked List Traversal',    course: 'Data Structures',    due: 'Tomorrow, 11:59 PM', status: 'critical' },
    { id: 2, title: 'File I/O Operations',       course: 'Python Programming', due: 'Oct 24, 2024',       status: 'active'   },
    { id: 3, title: 'Inheritance & Polymorphism',course: 'OOP Principles',     due: 'Oct 26, 2024',       status: 'upcoming' },
    { id: 4, title: 'Binary Search Trees',       course: 'Data Structures',    due: 'Oct 30, 2024',       status: 'upcoming' },
  ]

  // Mock leaderboard (replace with real leaderboard_scores query)
  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', pts: 1420 },
    { rank: 2, name: 'Sarah Chen',   pts: 1385 },
    { rank: 3, name: firstName + ' (You)', pts: 1240, isMe: true },
    { rank: 4, name: 'Marcus King',  pts: 1210 },
  ]

  return (
    <div className="sd-main">

      {/* Hero */}
      <div className="sd-hero">
        <div className="sd-hero-text">
          <h1 className="sd-hero-heading">
            Welcome back, <span>{firstName}.</span>
          </h1>
          <p className="sd-hero-sub">
            You have <strong>{pendingTasks.filter(t => t.status === 'critical' || t.status === 'active').length} assignments</strong> due this week across {courses.length} courses.
          </p>
        </div>
        <form className="sd-join-form" onSubmit={handleJoin}>
          <input
            className="sd-join-input"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter join code"
            maxLength={8}
          />
          <button type="submit" className="sd-hero-btn" disabled={joining || joinCode.length < 6}>
            <IconPlus />
            {joining ? 'Joining...' : 'Join a Course'}
          </button>
        </form>
      </div>

      {joinMsg.text && (
        <div className={`sd-alert ${joinMsg.type}`}>{joinMsg.text}</div>
      )}

      {/* Stat row */}
      <div className="sd-stats">
        <div className="sd-stat-card">
          <div className="sd-stat-top">
            <span className="sd-stat-label">Total Points</span>
            <div className="sd-stat-icon" style={{ background: '#eff6ff' }}>
              <IconTarget style={{ color: '#2563eb' }} />
            </div>
          </div>
          <div className="sd-stat-value">1,240 <span>/ 1,500</span></div>
          <div className="sd-stat-sub"><strong>+120 pts</strong> this week</div>
        </div>

        <div className="sd-stat-card">
          <div className="sd-stat-top">
            <span className="sd-stat-label">Assignments Submitted</span>
            <div className="sd-stat-icon" style={{ background: '#f0fdf4' }}>
              <IconCheckCircle style={{ color: '#22c55e' }} />
            </div>
          </div>
          <div className="sd-stat-value">8 <span>of 12 completed</span></div>
          <div className="sd-stat-sub">4 remaining this semester</div>
        </div>

        <div className="sd-stat-card">
          <div className="sd-stat-top">
            <span className="sd-stat-label">Quiz Average</span>
            <div className="sd-stat-icon" style={{ background: '#fff7ed' }}>
              <IconBarChart style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <div className="sd-stat-value">74%</div>
          <div className="sd-stat-sub"><strong>Class Avg. 68%</strong></div>
        </div>
      </div>

      {/* Middle: Chart + Donut */}
      <div className="sd-mid">

        {/* Assignment Performance chart */}
        <div className="sd-card">
          <div className="sd-chart-topbar">
            <div>
              <div className="sd-card-title">Assignment Performance</div>
              <div className="sd-card-sub">Unit scores progression for current semester</div>
            </div>
            <div className="sd-chart-filters">
              <select className="sd-chart-select">
                <option>All Courses</option>
                {courses.map(c => <option key={c.id}>{c.title}</option>)}
              </select>
              <button className={`sd-chart-filter-btn${filter === 'weekly'  ? ' active' : ''}`} onClick={() => setFilter('weekly')}>Weekly</button>
              <button className={`sd-chart-filter-btn${filter === 'monthly' ? ' active' : ''}`} onClick={() => setFilter('monthly')}>Monthly</button>
            </div>
          </div>
          <div className="sd-chart-legend">
            <div className="sd-legend-dot"><span style={{ background: '#2563eb' }} />Assignment</div>
            <div className="sd-legend-dot"><span style={{ background: '#93c5fd' }} />Quiz</div>
          </div>
          <BarChart />
        </div>

        {/* Completion average donut */}
        <div className="sd-card sd-donut-card">
          <div className="sd-donut-label">Completion Average</div>
          <Donut pct={80} />
          <div className="sd-donut-caption">Exceeding personal milestones</div>
          <div className="sd-donut-live">
            <div className="sd-donut-live-dot" />
            Live tracking active
          </div>
        </div>
      </div>

      {/* Bottom: Pending Tasks + Leaderboard */}
      <div className="sd-bottom">

        {/* Pending Tasks */}
        <div className="sd-card">
          <div className="sd-table-header">
            <div className="sd-card-title">Pending Tasks</div>
            <button className="sd-view-all" onClick={() => navigate('/student/todo')}>View All</button>
          </div>
          <table className="sd-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td style={{ color: '#6b7280' }}>{task.course}</td>
                  <td style={{ color: '#6b7280' }}>{task.due}</td>
                  <td>
                    <span className={`sd-status-tag ${task.status}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leaderboard */}
        <div className="sd-card">
          <div className="sd-table-header">
            <div className="sd-card-title">Leaderboard</div>
          </div>
          {leaderboard.map((row, i) => (
            <div key={row.rank} className={`sd-lb-row${row.isMe ? ' is-current' : ''}`}>
              <div className="sd-lb-rank">{row.rank}</div>
              <div className="sd-lb-avatar" style={{ background: avatarBg(i) }}>
                {initials(row.name)}
              </div>
              <div className="sd-lb-name">
                {row.name}
                {row.isMe && <><br /><span>Your rank</span></>}
              </div>
              <div className="sd-lb-pts">{row.pts.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="sd-courses-header">
          <div className="sd-section-title">My Courses</div>
          <button className="sd-view-all" onClick={() => navigate('/student/courses')}>
            Explore more →
          </button>
        </div>

        {loading ? (
          <div className="sd-courses-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="sd-skeleton" style={{ height: 220 }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="sd-empty">
            <p>No courses yet. Enter a join code above to get started.</p>
          </div>
        ) : (
          <div className="sd-courses-grid">
            {courses.slice(0, 3).map((course, i) => {
              const theme = COURSE_COLORS[i % COURSE_COLORS.length]
              return (
                <div
                  key={course.id}
                  className="sd-course-card"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  <div className="sd-course-header" style={{ background: theme.bg }}>
                    <div className="sd-course-tag">{theme.tag}</div>
                    <div className="sd-course-title">{course.title}</div>
                  </div>
                  <div className="sd-course-body">
                    <div className="sd-course-instructor-row">
                      <div className="sd-course-instructor-avatar" style={{ background: avatarBg(i), color: '#fff' }}>
                        {initials('Dr Instructor')}
                      </div>
                      <div className="sd-course-instructor-info">
                        <div className="sd-course-instructor-label">Instructor</div>
                        <div className="sd-course-instructor-name">Dr. Instructor</div>
                      </div>
                    </div>
                    <div className="sd-progress-row">
                      <span className="sd-progress-label">Progress</span>
                      <span className="sd-progress-pct">65%</span>
                    </div>
                    <div className="sd-progress-track">
                      <div className="sd-progress-fill" style={{ width: '65%' }} />
                    </div>
                    <button className="sd-course-open-btn">
                      Open Course <IconExternalLink />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

// ── Courses Tab ───────────────────────────────────────────────
function CoursesTab() {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrolledCourses(user.id).then(d => { setCourses(d); setLoading(false) })
  }, [])

  return (
    <div className="sd-main">
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 16 }}>My Courses</h1>
      {loading ? (
        <div className="sd-courses-grid">
          {[1,2,3].map(i => <div key={i} className="sd-skeleton" style={{ height: 220 }} />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="sd-empty"><p>You have not joined any courses yet.</p></div>
      ) : (
        <div className="sd-courses-grid">
          {courses.map((course, i) => {
            const theme = COURSE_COLORS[i % COURSE_COLORS.length]
            return (
              <div key={course.id} className="sd-course-card" onClick={() => navigate(`/student/courses/${course.id}`)}>
                <div className="sd-course-header" style={{ background: theme.bg }}>
                  <div className="sd-course-tag">{theme.tag}</div>
                  <div className="sd-course-title">{course.title}</div>
                </div>
                <div className="sd-course-body">
                  <div className="sd-progress-row">
                    <span className="sd-progress-label">Progress</span>
                    <span className="sd-progress-pct">—</span>
                  </div>
                  <div className="sd-progress-track">
                    <div className="sd-progress-fill" style={{ width: '0%' }} />
                  </div>
                  <button className="sd-course-open-btn">Open Course <IconExternalLink /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Todo Tab ──────────────────────────────────────────────────
function TodoTab() {
  const { user }  = useAuthStore()
  const [todos,    setTodos]    = useState([])
  const [newTask,  setNewTask]  = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.from('todos').select('*').eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setTodos(data || []); setLoading(false) })
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    const { data } = await supabase.from('todos')
      .insert({ student_id: user.id, title: newTask.trim() }).select().single()
    if (data) { setTodos(p => [data, ...p]); setNewTask('') }
  }

  async function toggleTodo(id, isDone) {
    await supabase.from('todos').update({ is_done: !isDone }).eq('id', id)
    setTodos(p => p.map(t => t.id === id ? { ...t, is_done: !isDone } : t))
  }

  async function deleteTodo(id) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(p => p.filter(t => t.id !== id))
  }

  const pending   = todos.filter(t => !t.is_done)
  const completed = todos.filter(t =>  t.is_done)

  return (
    <div className="sd-main">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>To-Do</h1>
        <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>Track your tasks and study goals.</p>
      </div>

      <div className="sd-todo-wrap">
        <form className="sd-todo-input-row" onSubmit={addTodo}>
          <input className="sd-input" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a new task..." />
          <button className="sd-btn-primary" type="submit" disabled={!newTask.trim()}>Add Task</button>
        </form>

        {loading ? (
          [1,2,3].map(i => <div key={i} className="sd-skeleton" style={{ height: 46, marginBottom: 8 }} />)
        ) : (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="sd-todo-group-label">Pending · {pending.length}</div>
                {pending.map(t => (
                  <div key={t.id} className="sd-todo-item">
                    <button className="sd-todo-check" onClick={() => toggleTodo(t.id, t.is_done)} />
                    <span className="sd-todo-title">{t.title}</span>
                    <button className="sd-todo-del" onClick={() => deleteTodo(t.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
            {completed.length > 0 && (
              <div>
                <div className="sd-todo-group-label">Completed · {completed.length}</div>
                {completed.map(t => (
                  <div key={t.id} className="sd-todo-item" style={{ opacity: 0.7 }}>
                    <button className="sd-todo-check done" onClick={() => toggleTodo(t.id, t.is_done)}>✓</button>
                    <span className="sd-todo-title done">{t.title}</span>
                    <button className="sd-todo-del" onClick={() => deleteTodo(t.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
            {todos.length === 0 && (
              <div className="sd-empty"><p>No tasks yet. Add one above.</p></div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Leaderboard stub ──────────────────────────────────────────
function LeaderboardTab() {
  return (
    <div className="sd-main">
      <div className="sd-stub">
        <h1>Leaderboard</h1>
        <p>Rankings will appear here once assignments are submitted.</p>
      </div>
    </div>
  )
}

// ── Whiteboard stub ───────────────────────────────────────────
function WhiteboardTab() {
  return (
    <div className="sd-main">
      <div className="sd-stub">
        <h1>Whiteboard</h1>
        <p>Excalidraw canvas — coming in Phase 4.</p>
        <div style={{ width: '100%', maxWidth: 600, height: 280, background: '#fff', border: '1px dashed #d1d5db', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
          <span style={{ fontSize: '0.83rem', color: '#9ca3af' }}>Canvas coming soon</span>
        </div>
      </div>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  const { user } = useAuthStore()
  const fullName = user?.user_metadata?.full_name || 'Student'

  const links = [
    { to: '/student',             label: 'Dashboard', end: true },
    { to: '/student/courses',     label: 'Courses'              },
    { to: '/student/todo',        label: 'To-Do'                },
    { to: '/student/whiteboard',  label: 'Whiteboard'           },
  ]

  return (
    <nav className="sd-nav">
      <a href="/student" className="sd-nav-logo">
        <div className="sd-nav-logo-mark"><IconGrid /></div>
        <span className="sd-nav-logo-name">EvalFlow</span>
      </a>

      <div className="sd-nav-search">
        <IconSearch />
        <input type="text" placeholder="Search resources..." />
      </div>

      <div className="sd-nav-links">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `sd-nav-link${isActive ? ' active' : ''}`}>
            {l.label}
          </NavLink>
        ))}
      </div>

      <div className="sd-nav-right">
        <div className="sd-nav-icon-btn">
          <IconBell />
          <div className="sd-nav-badge" />
        </div>
        <div className="sd-nav-avatar">{initials(fullName)}</div>
      </div>
    </nav>
  )
}

// ── Root ──────────────────────────────────────────────────────
export default function StudentDashboard() {
  return (
    <div className="sd-shell">
      <Navbar />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route index              element={<StudentHome />}    />
          <Route path="courses"     element={<CoursesTab />}     />
          <Route path="todo"        element={<TodoTab />}        />
          <Route path="leaderboard" element={<LeaderboardTab />} />
          <Route path="whiteboard"  element={<WhiteboardTab />}  />
        </Routes>
      </div>

      <footer className="sd-footer">
        <span className="sd-footer-copy">EvalFlow © 2024. Higher Learning Standard.</span>
        <div className="sd-footer-links">
          <a href="#">Support</a>
          <a href="#">API</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  )
}