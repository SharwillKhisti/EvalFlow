// frontend/src/pages/StudentDashboard.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'
import { useAuthStore } from '../store/authStore'
import TopNav from '../components/layout/TopNav'

const NAV = [
  { to: '/student',             icon: '🏠', label: 'Home',        end: true },
  { to: '/student/courses',     icon: '📚', label: 'Courses'      },
  { to: '/student/todo',        icon: '✅', label: 'To-Do'        },
  { to: '/student/leaderboard', icon: '🏆', label: 'Leaderboard'  },
  { to: '/student/whiteboard',  icon: '🎨', label: 'Whiteboard'   },
]

// ── Shared fetch helper ───────────────────────────────────────
async function fetchEnrolledCourses(userId) {
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('student_id', userId)

  const courseIds = enrollments?.map(e => e.course_id) || []
  if (courseIds.length === 0) return []

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, description')
    .in('id', courseIds)

  return courses || []
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = 'var(--sky-600)', delay = 1 }) {
  return (
    <div className={`stat-card animate-fade-up stagger-${delay}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ── Course Card ───────────────────────────────────────────────
function CourseCard({ course, onClick, index }) {
  const colors = [
    { bg: 'linear-gradient(135deg, #1565C0, #1E40AF)' },
    { bg: 'linear-gradient(135deg, #065F46, #047857)' },
    { bg: 'linear-gradient(135deg, #6D28D9, #7C3AED)' },
    { bg: 'linear-gradient(135deg, #92400E, #B45309)' },
    { bg: 'linear-gradient(135deg, #9F1239, #BE123C)' },
  ]
  const c = colors[index % colors.length]

  return (
    <button onClick={onClick}
      className={`animate-fade-up stagger-${(index % 4) + 2}`}
      style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'all 0.25s ease', width: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}>
      <div style={{ background: c.bg, padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -15, right: 20, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ fontSize: 28, marginBottom: 8 }}>📘</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'white', lineHeight: 1.3 }}>
          {course.title}
        </div>
      </div>
      <div style={{ padding: '14px 20px 16px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description || 'No description provided'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--sky-600)', fontWeight: 600 }}>View course →</span>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--sky-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>→</div>
        </div>
      </div>
    </button>
  )
}

// ── Home Tab ──────────────────────────────────────────────────
function StudentHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [courses, setCourses]   = useState([])
  const [todos, setTodos]       = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining]   = useState(false)
  const [joinMsg, setJoinMsg]   = useState({ text: '', type: '' })
  const [loading, setLoading]   = useState(true)

  const fullName  = user?.user_metadata?.full_name || 'Student'
  const firstName = fullName.split(' ')[0]
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [courses, { data: todosData }] = await Promise.all([
      fetchEnrolledCourses(user.id),
      supabase.from('todos').select('*').eq('student_id', user.id).eq('is_done', false).limit(5)
    ])
    setCourses(courses)
    setTodos(todosData || [])
    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinMsg({ text: '', type: '' })

    const { data: course } = await supabase
      .from('courses')
      .select('id, title')
      .eq('join_code', joinCode.trim().toUpperCase())
      .single()

    if (!course) {
      setJoinMsg({ text: 'Invalid code. Check with your instructor.', type: 'error' })
      setJoining(false)
      return
    }

    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', course.id)
      .eq('student_id', user.id)
      .maybeSingle()

    if (existing) {
      setJoinMsg({ text: `Already enrolled in "${course.title}"`, type: 'error' })
      setJoining(false)
      return
    }

    const { error } = await supabase
      .from('enrollments')
      .insert({ course_id: course.id, student_id: user.id })

    setJoining(false)
    if (error) {
      setJoinMsg({ text: 'Something went wrong.', type: 'error' })
    } else {
      setJoinMsg({ text: `✅ Joined "${course.title}"!`, type: 'success' })
      setJoinCode('')
      fetchData()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{greeting} ☀️</p>
          <h1 className="text-h1">Welcome back, {firstName}!</h1>
        </div>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter join code" maxLength={8}
            style={{ padding: '10px 16px', borderRadius: 100, border: '1.5px solid var(--border-blue)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.85rem', outline: 'none', width: 160 }} />
          <button type="submit" disabled={joining || joinCode.length < 6} className="btn btn-primary" style={{ padding: '10px 20px' }}>
            {joining ? '...' : '+ Join Course'}
          </button>
        </form>
      </div>

      {joinMsg.text && (
        <div style={{ background: joinMsg.type === 'error' ? '#FEE2E2' : '#DCFCE7', border: `1px solid ${joinMsg.type === 'error' ? '#FCA5A5' : '#86EFAC'}`, borderRadius: 'var(--radius-sm)', padding: '10px 16px', fontSize: '0.85rem', color: joinMsg.type === 'error' ? '#DC2626' : '#15803D' }}>
          {joinMsg.text}
        </div>
      )}

      {/* Stats */}
      <div className="bento bento-4">
        <StatCard icon="📚" label="ENROLLED"     value={courses.length} sub="Active courses"  delay={1} />
        <StatCard icon="✅" label="PENDING TASKS" value={todos.length}   sub="To-do items"     color="#8B5CF6" delay={2} />
        <StatCard icon="🏆" label="BADGES"        value="0"              sub="Earned so far"   color="#F59E0B" delay={3} />
        <StatCard icon="🔥" label="STREAK"        value="1"              sub="Days active"     color="#EF4444" delay={4} />
      </div>

      {/* Main grid */}
      <div className="bento bento-3">

        {/* Courses — span 2 */}
        <div className="col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="text-h2">My Courses</h2>
            <button onClick={() => navigate('/student/courses')} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>View all →</button>
          </div>
          {loading ? (
            <div className="bento bento-2">
              {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} />)}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-blue)', padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📚</div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No courses yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>Enter a join code above to get started</p>
            </div>
          ) : (
            <div className="bento bento-2">
              {courses.slice(0, 4).map((course, i) => (
                <CourseCard key={course.id} course={course} index={i}
                  onClick={() => navigate(`/student/courses/${course.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick todo */}
          <div className="card animate-fade-up stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 className="text-h3">Pending Tasks</h3>
              <button onClick={() => navigate('/student/todo')} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>All →</button>
            </div>
            {todos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>All caught up! 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todos.map(todo => (
                  <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--sky-50)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sky-400)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{todo.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI promo card */}
          <div className="card-blue animate-fade-up stagger-4" style={{ flex: 1 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>AI Lab Assistant</h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>Stuck on an assignment? Get a contextual hint that guides you — not the answer.</p>
              <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                ✨ Available on every assignment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Courses Tab ───────────────────────────────────────────────
function CoursesTab() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrolledCourses(user.id).then(data => {
      setCourses(data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1 className="text-h1 animate-fade-up" style={{ marginBottom: 20 }}>My Courses</h1>
      {loading ? (
        <div className="bento bento-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't joined any courses yet.</p>
        </div>
      ) : (
        <div className="bento bento-3">
          {courses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i}
              onClick={() => navigate(`/student/courses/${course.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Todo Tab ──────────────────────────────────────────────────
function TodoTab() {
  const { user } = useAuthStore()
  const [todos, setTodos]     = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('todos').select('*').eq('student_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setTodos(data || []); setLoading(false) })
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    const { data } = await supabase.from('todos')
      .insert({ student_id: user.id, title: newTask.trim() })
      .select().single()
    if (data) { setTodos(prev => [data, ...prev]); setNewTask('') }
  }

  async function toggleTodo(id, isDone) {
    await supabase.from('todos').update({ is_done: !isDone }).eq('id', id)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_done: !isDone } : t))
  }

  async function deleteTodo(id) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const pending   = todos.filter(t => !t.is_done)
  const completed = todos.filter(t =>  t.is_done)
  const pct       = todos.length ? Math.round((completed.length / todos.length) * 100) : 0

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="animate-fade-up" style={{ marginBottom: 24 }}>
        <h1 className="text-h1" style={{ marginBottom: 4 }}>To-Do List</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track your tasks and study goals</p>
      </div>

      {todos.length > 0 && (
        <div className="card animate-fade-up stagger-1" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--sky-600)' }}>{pct}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>{completed.length} of {todos.length} tasks completed</p>
        </div>
      )}

      <form onSubmit={addTodo} className="animate-fade-up stagger-2" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)}
          placeholder="Add a new task..." className="input" style={{ flex: 1 }} />
        <button type="submit" disabled={!newTask.trim()} className="btn btn-primary">Add</button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {pending.length > 0 && (
            <div>
              <p className="text-label" style={{ marginBottom: 10 }}>Pending · {pending.length}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pending.map(todo => (
                  <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <button onClick={() => toggleTodo(todo.id, todo.is_done)}
                      style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--sky-300)', background: 'transparent', cursor: 'pointer', flexShrink: 0 }}
                      onMouseEnter={e => e.target.style.borderColor = 'var(--sky-500)'}
                      onMouseLeave={e => e.target.style.borderColor = 'var(--sky-300)'} />
                    <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{todo.title}</span>
                    <button onClick={() => deleteTodo(todo.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                      onMouseEnter={e => e.target.style.color = '#EF4444'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="text-label" style={{ marginBottom: 10 }}>Completed · {completed.length}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {completed.map(todo => (
                  <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F0FDF4', borderRadius: 10, padding: '12px 16px', border: '1px solid #86EFAC', opacity: 0.8 }}>
                    <button onClick={() => toggleTodo(todo.id, todo.is_done)}
                      style={{ width: 22, height: 22, borderRadius: '50%', background: '#22C55E', border: 'none', cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</button>
                    <span style={{ flex: 1, fontSize: '0.875rem', color: '#64748B', textDecoration: 'line-through' }}>{todo.title}</span>
                    <button onClick={() => deleteTodo(todo.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {todos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 24px', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <p style={{ color: 'var(--text-secondary)' }}>No tasks yet. Add one above!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Leaderboard stub ──────────────────────────────────────────
function LeaderboardTab() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }} className="animate-float">🏆</div>
      <h1 className="text-h1" style={{ marginBottom: 8 }}>Leaderboard</h1>
      <p style={{ color: 'var(--text-muted)' }}>Rankings will appear here once assignments are submitted.</p>
    </div>
  )
}

// ── Whiteboard stub ───────────────────────────────────────────
function WhiteboardTab() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }} className="animate-float">🎨</div>
      <h1 className="text-h1" style={{ marginBottom: 8 }}>Whiteboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Excalidraw whiteboard — coming in Phase 4.</p>
      <div style={{ height: 320, background: 'rgba(255,255,255,0.6)', border: '2px dashed var(--border-blue)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Whiteboard canvas coming soon</p>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────
export default function StudentDashboard() {
  return (
    <div className="page-bg">
      <div className="app-shell">
        <TopNav navItems={NAV} />
        <main style={{ flex: 1, minHeight: 0 }}>
          <Routes>
            <Route index               element={<StudentHome />}    />
            <Route path="courses"      element={<CoursesTab />}     />
            <Route path="todo"         element={<TodoTab />}        />
            <Route path="leaderboard"  element={<LeaderboardTab />} />
            <Route path="whiteboard"   element={<WhiteboardTab />}  />
          </Routes>
        </main>
      </div>
    </div>
  )
}