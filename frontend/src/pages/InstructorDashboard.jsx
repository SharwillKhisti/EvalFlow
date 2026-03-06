// frontend/src/pages/InstructorDashboard.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'
import { useAuthStore } from '../store/authStore'
import AppShell from '../components/layout/AppShell'

const NAV = [
  { to: '/instructor',          icon: '🏠', label: 'Home'        },
  { to: '/instructor/courses',  icon: '📚', label: 'My Courses'  },
  { to: '/instructor/reports',  icon: '📊', label: 'Reports'     },
]

// ── Create Course Modal ───────────────────────────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const { user } = useAuthStore()
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('courses')
      .insert({ title: title.trim(), description: desc.trim(), instructor_id: user.id })
      .select().single()

    setLoading(false)
    if (err) { setError(err.message); return }
    onCreated(data)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Create New Course</h2>
        {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Course Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              required placeholder="e.g. Data Structures & Algorithms"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Brief course overview..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                         transition-colors resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700
                         disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors">
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Instructor Home ───────────────────────────────────────────────────────────
function InstructorHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [courses, setCourses]     = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [newCourse, setNewCourse] = useState(null) // show join code after creation

  const fullName  = user?.user_metadata?.full_name || 'Instructor'
  const firstName = fullName.split(' ')[0]

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

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Greeting */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {firstName} 👨‍🏫</h1>
          <p className="text-gray-400 mt-1">
            {courses.length === 0
              ? "Create your first course to get started."
              : `Managing ${courses.length} course${courses.length > 1 ? 's' : ''}.`
            }
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5
                     rounded-xl font-medium transition-colors flex items-center gap-2">
          <span>+</span> New Course
        </button>
      </div>

      {/* New course join code banner */}
      {newCourse && (
        <div className="mb-6 bg-green-950 border border-green-700 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-green-300 font-semibold">"{newCourse.title}" created!</p>
            <p className="text-green-500 text-sm mt-1">Share this code with your students:</p>
            <p className="text-white font-mono text-2xl font-bold tracking-widest mt-1">
              {newCourse.join_code}
            </p>
          </div>
          <button onClick={() => setNewCourse(null)}
            className="text-green-600 hover:text-green-400 text-2xl transition-colors">×</button>
        </div>
      )}

      {/* Course grid */}
      <h2 className="text-white font-semibold text-lg mb-4">My Courses</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i=>(
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-800 rounded mb-3 w-3/4"/>
              <div className="h-3 bg-gray-800 rounded w-full mb-2"/>
              <div className="h-3 bg-gray-800 rounded w-1/2"/>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-400">No courses yet</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 text-blue-500 hover:text-blue-400 text-sm transition-colors">
            Create your first course →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <button key={course.id}
              onClick={() => navigate(`/instructor/courses/${course.id}`)}
              className="bg-gray-900 border border-gray-800 hover:border-purple-600 rounded-2xl p-6
                         text-left transition-all hover:shadow-lg hover:shadow-purple-950 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-purple-950 rounded-xl flex items-center justify-center
                                group-hover:bg-purple-700 transition-colors">
                  <span className="text-xl">📘</span>
                </div>
                <span className="font-mono text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-md">
                  {course.join_code}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">
                {course.description || 'No description provided'}
              </p>
              <div className="mt-4 text-purple-500 text-xs font-medium">
                Manage course →
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Reports stub ──────────────────────────────────────────────────────────────
function ReportsTab() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="text-5xl mb-4">📊</div>
      <h1 className="text-2xl font-bold text-white mb-2">Reports</h1>
      <p className="text-gray-400">AI-generated assignment reports will appear here in Phase 4.</p>
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function InstructorDashboard() {
  return (
    <AppShell navItems={NAV}>
      <Routes>
        <Route index             element={<InstructorHome />} />
        <Route path="courses"    element={<InstructorHome />} />
        <Route path="reports"    element={<ReportsTab />}     />
      </Routes>
    </AppShell>
  )
}