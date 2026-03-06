// frontend/src/pages/StudentDashboard.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'
import { useAuthStore } from '../store/authStore'
import AppShell from '../components/layout/AppShell'

const NAV = [
  { to: '/student',           icon: '🏠', label: 'Home'       },
  { to: '/student/courses',   icon: '📚', label: 'My Courses' },
  { to: '/student/todo',      icon: '✅', label: 'To-Do'      },
  { to: '/student/whiteboard',icon: '🎨', label: 'Whiteboard' },
  { to: '/student/theory',    icon: '📖', label: 'Theory'     },
]

// ── Home Tab ─────────────────────────────────────────────────────────────────
function StudentHome() {
  const { user } = useAuthStore()
  const [courses, setCourses]   = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining]   = useState(false)
  const [joinMsg, setJoinMsg]   = useState({ text: '', type: '' })
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  const fullName = user?.user_metadata?.full_name || 'Student'
  const firstName = fullName.split(' ')[0]

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    setLoading(true)
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, courses(id, title, description, created_at)')
      .eq('student_id', user.id)

    setCourses(enrollments?.map(e => e.courses).filter(Boolean) || [])
    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinMsg({ text: '', type: '' })

    // Find course by join code
    const { data: course, error } = await supabase
      .from('courses')
      .select('id, title')
      .eq('join_code', joinCode.trim().toUpperCase())
      .single()

    if (error || !course) {
      setJoinMsg({ text: 'Invalid join code. Check with your instructor.', type: 'error' })
      setJoining(false)
      return
    }

    // Check already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', course.id)
      .eq('student_id', user.id)
      .single()

    if (existing) {
      setJoinMsg({ text: `You're already enrolled in "${course.title}".`, type: 'error' })
      setJoining(false)
      return
    }

    // Enroll
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert({ course_id: course.id, student_id: user.id })

    setJoining(false)
    if (enrollError) {
      setJoinMsg({ text: 'Something went wrong. Try again.', type: 'error' })
    } else {
      setJoinMsg({ text: `✅ Joined "${course.title}" successfully!`, type: 'success' })
      setJoinCode('')
      fetchCourses()
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Hey, {firstName} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {courses.length === 0
            ? "You haven't joined any courses yet. Enter a code below to get started."
            : `You're enrolled in ${courses.length} course${courses.length > 1 ? 's' : ''}.`
          }
        </p>
      </div>

      {/* Join Course */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-semibold text-lg mb-1">Join a Course</h2>
        <p className="text-gray-500 text-sm mb-4">Enter the 8-character code from your instructor</p>
        <form onSubmit={handleJoin} className="flex gap-3">
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. AB12CD34"
            maxLength={8}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                       text-white placeholder-gray-500 font-mono tracking-widest uppercase
                       focus:outline-none focus:border-blue-500 transition-colors" />
          <button type="submit" disabled={joining || joinCode.length < 6}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed
                       text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            {joining ? 'Joining...' : 'Join'}
          </button>
        </form>
        {joinMsg.text && (
          <p className={`mt-3 text-sm ${joinMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {joinMsg.text}
          </p>
        )}
      </div>

      {/* Course Cards */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4">My Courses</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-800 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-400">No courses yet</p>
            <p className="text-gray-600 text-sm mt-1">Join one using a code above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <button key={course.id}
                onClick={() => navigate(`/student/courses/${course.id}`)}
                className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-2xl p-6
                           text-left transition-all hover:shadow-lg hover:shadow-blue-950 group">
                <div className="w-10 h-10 bg-blue-950 rounded-xl flex items-center justify-center mb-4
                                group-hover:bg-blue-600 transition-colors">
                  <span className="text-xl">📘</span>
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {course.description || 'No description provided'}
                </p>
                <div className="mt-4 text-blue-500 text-xs font-medium">
                  View course →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Todo Tab ──────────────────────────────────────────────────────────────────
function TodoTab() {
  const { user } = useAuthStore()
  const [todos, setTodos]     = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTodos() }, [])

  async function fetchTodos() {
    const { data } = await supabase
      .from('todos').select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
    setTodos(data || [])
    setLoading(false)
  }

  async function addTodo(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    const { data } = await supabase
      .from('todos')
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
  const completed = todos.filter(t => t.is_done)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">To-Do List</h1>
      <p className="text-gray-400 text-sm mb-8">Track your tasks and assignments</p>

      {/* Add task */}
      <form onSubmit={addTodo} className="flex gap-3 mb-8">
        <input value={newTask} onChange={e => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5
                     text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
        <button type="submit" disabled={!newTask.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed
                     text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
          Add
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i=><div key={i} className="h-14 bg-gray-900 rounded-xl animate-pulse"/>)}
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
                Pending · {pending.length}
              </p>
              <div className="space-y-2">
                {pending.map(todo => (
                  <div key={todo.id}
                    className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 group">
                    <button onClick={() => toggleTodo(todo.id, todo.is_done)}
                      className="w-5 h-5 rounded-full border-2 border-gray-600 hover:border-blue-500
                                 flex items-center justify-center shrink-0 transition-colors" />
                    <span className="flex-1 text-white text-sm">{todo.title}</span>
                    <button onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400
                                 transition-all text-lg leading-none">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
                Completed · {completed.length}
              </p>
              <div className="space-y-2">
                {completed.map(todo => (
                  <div key={todo.id}
                    className="flex items-center gap-3 bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3 group">
                    <button onClick={() => toggleTodo(todo.id, todo.is_done)}
                      className="w-5 h-5 rounded-full bg-green-600 border-2 border-green-600
                                 flex items-center justify-center shrink-0 text-white text-xs">✓</button>
                    <span className="flex-1 text-gray-600 text-sm line-through">{todo.title}</span>
                    <button onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400
                                 transition-all text-lg leading-none">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-500">No tasks yet. Add one above!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Whiteboard Tab ────────────────────────────────────────────────────────────
function WhiteboardTab() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="text-5xl mb-4">🎨</div>
      <h1 className="text-2xl font-bold text-white mb-2">Whiteboard</h1>
      <p className="text-gray-400 mb-6">Excalidraw will be embedded here in Phase 4.</p>
      <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl h-96
                      flex items-center justify-center">
        <p className="text-gray-600 text-sm">Whiteboard coming soon</p>
      </div>
    </div>
  )
}

// ── Theory Tab ────────────────────────────────────────────────────────────────
function TheoryTab() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="text-5xl mb-4">📖</div>
      <h1 className="text-2xl font-bold text-white mb-2">Theory & References</h1>
      <p className="text-gray-400">Select a course to view its reference materials.</p>
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  return (
    <AppShell navItems={NAV}>
      <Routes>
        <Route index        element={<StudentHome />}    />
        <Route path="courses"    element={<StudentHome />} />
        <Route path="todo"       element={<TodoTab />}     />
        <Route path="whiteboard" element={<WhiteboardTab />} />
        <Route path="theory"     element={<TheoryTab />}   />
      </Routes>
    </AppShell>
  )
}