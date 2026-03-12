// ============================================================
//   TodoTab.jsx
//   Place at: frontend/src/pages/TodoTab.jsx
//
//   Usage: replace the TodoTab function inside StudentDashboard.jsx
//   with an import of this component, or use directly as a Route element.
//
//   import TodoTab from './TodoTab'
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../api/client'
import { useAuthStore } from '../store/authStore'
import './TodoTab.css'

// ── Icons ─────────────────────────────────────────────────────
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────
function getStatus(subtasks) {
  if (!subtasks || subtasks.length === 0) return 'not-started'
  const done = subtasks.filter(s => s.done).length
  if (done === 0) return 'not-started'
  if (done === subtasks.length) return 'completed'
  const pct = (done / subtasks.length) * 100
  return pct >= 70 ? 'almost-done' : 'in-progress'
}

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress':  'In Progress',
  'almost-done':  'Almost Done',
  'completed':    'Completed',
}

function pct(subtasks) {
  if (!subtasks || !subtasks.length) return 0
  return Math.round((subtasks.filter(s => s.done).length / subtasks.length) * 100)
}

// ── Subtask Modal ─────────────────────────────────────────────
function SubtaskModal({ task, onClose, onUpdate }) {
  const [subtasks,   setSubtasks]   = useState(task.subtasks || [])
  const [newSub,     setNewSub]     = useState('')
  const inputRef = useRef(null)

  const completedCount = subtasks.filter(s => s.done).length
  const totalCount     = subtasks.length
  const progress       = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  function toggleSub(id) {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
  }

  function deleteSub(id) {
    setSubtasks(prev => prev.filter(s => s.id !== id))
  }

  function addSub(e) {
    e.preventDefault()
    if (!newSub.trim()) return
    setSubtasks(prev => [...prev, { id: Date.now(), text: newSub.trim(), done: false }])
    setNewSub('')
    inputRef.current?.focus()
  }

  function handleUpdate() {
    onUpdate({ ...task, subtasks })
    onClose()
  }

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="td-overlay" onClick={handleOverlayClick}>
      <div className="td-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="td-modal-head">
          <div className="td-modal-head-icon">
            <IconClipboard />
          </div>
          <div className="td-modal-head-text">
            <div className="td-modal-title">{task.title} Subtasks</div>
            <div className="td-modal-course">
              {task.course ? `${task.course} • ` : ''}{task.due || 'No due date'}
            </div>
          </div>
          <button className="td-modal-close" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        {/* Progress bar */}
        <div className="td-modal-progress">
          <div className="td-modal-progress-row">
            <div className="td-modal-progress-count">
              <strong>{completedCount}</strong> of {totalCount} subtasks completed
            </div>
            <div className="td-modal-progress-pct">{progress}% Complete</div>
          </div>
          <div className="td-modal-track">
            <div className="td-modal-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Subtask list */}
        <div className="td-modal-body">
          {subtasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '0.83rem' }}>
              No subtasks yet. Add one below.
            </div>
          )}
          {subtasks.map(sub => (
            <div
              key={sub.id}
              className={`td-subtask-item${sub.done ? ' done' : ''}`}
              onClick={() => toggleSub(sub.id)}
            >
              <div className={`td-subtask-check${sub.done ? ' done' : ''}`}>
                {sub.done && '✓'}
              </div>
              <span className={`td-subtask-text${sub.done ? ' done' : ''}`}>{sub.text}</span>
              <button
                className="td-subtask-del"
                onClick={e => { e.stopPropagation(); deleteSub(sub.id) }}
                aria-label="Delete subtask"
              >×</button>
            </div>
          ))}
        </div>

        {/* Add subtask */}
        <form className="td-add-subtask" onSubmit={addSub}>
          <input
            ref={inputRef}
            className="td-input td-input-sm"
            value={newSub}
            onChange={e => setNewSub(e.target.value)}
            placeholder="Add a subtask..."
          />
          <button type="submit" className="td-btn-primary" disabled={!newSub.trim()}>
            <IconPlus /> Add
          </button>
        </form>

        {/* Footer */}
        <div className="td-modal-foot">
          <button className="td-btn-primary" onClick={handleUpdate}>
            Update Progress
          </button>
          <button className="td-btn-ghost" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────
function TaskCard({ task, onOpen, onDelete }) {
  const status   = getStatus(task.subtasks)
  const progress = pct(task.subtasks)
  const done     = task.subtasks?.filter(s => s.done).length || 0
  const total    = task.subtasks?.length || 0

  return (
    <div className="td-card" onClick={() => onOpen(task)}>

      <div className="td-card-top">
        <div className="td-card-title">{task.title}</div>
        <div className={`td-card-status ${status}`}>{STATUS_LABELS[status]}</div>
      </div>

      {task.course && (
        <div className="td-card-course">{task.course}</div>
      )}

      {/* Progress */}
      <div>
        <div className="td-card-progress-row">
          <span>Overall Progress</span>
          <strong>{progress}%</strong>
        </div>
        <div className="td-progress-track">
          <div
            className={`td-progress-fill${status === 'completed' ? ' done' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="td-card-footer" onClick={e => e.stopPropagation()}>
        <div className="td-card-subtask-count">
          <strong>{done}</strong> / {total} subtasks
        </div>
        <button className="td-view-btn" onClick={() => onOpen(task)}>
          View Subtasks <IconChevronRight />
        </button>
      </div>

    </div>
  )
}

// ── Main TodoTab ──────────────────────────────────────────────
export default function TodoTab() {
  const { user } = useAuthStore()

  // Tasks are stored locally (extend to Supabase todos table as needed)
  // Each task: { id, title, course, due, subtasks: [{ id, text, done }] }
  const [tasks,       setTasks]       = useState([])
  const [newTitle,    setNewTitle]    = useState('')
  const [newCourse,   setNewCourse]   = useState('')
  const [activeTask,  setActiveTask]  = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [courses,     setCourses]     = useState([])

  // Fetch enrolled courses for the course selector
  useEffect(() => {
    if (!user) return
    supabase.from('enrollments').select('course_id')
      .eq('student_id', user.id)
      .then(({ data: enrollments }) => {
        if (!enrollments?.length) return
        const ids = enrollments.map(e => e.course_id)
        supabase.from('courses').select('id, title').in('id', ids)
          .then(({ data }) => setCourses(data || []))
      })

    // Load tasks from localStorage as simple persistence
    // (replace with Supabase insert/select if you want server persistence)
    try {
      const saved = localStorage.getItem(`evalflow_tasks_${user.id}`)
      if (saved) setTasks(JSON.parse(saved))
    } catch {}
  }, [user])

  function saveTasks(updated) {
    setTasks(updated)
    try {
      localStorage.setItem(`evalflow_tasks_${user.id}`, JSON.stringify(updated))
    } catch {}
  }

  function createTask(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const course = courses.find(c => c.id === newCourse)
    const task = {
      id:       Date.now(),
      title:    newTitle.trim(),
      course:   course?.title || '',
      due:      '',
      subtasks: [],
    }
    saveTasks([task, ...tasks])
    setNewTitle('')
    setNewCourse('')
  }

  function deleteTask(id) {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  function updateTask(updated) {
    saveTasks(tasks.map(t => t.id === updated.id ? updated : t))
  }

  const FILTERS = [
    { key: 'all',         label: 'All' },
    { key: 'not-started', label: 'Not Started' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'almost-done', label: 'Almost Done' },
    { key: 'completed',   label: 'Completed' },
  ]

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => getStatus(t.subtasks) === filter)

  return (
    <div className="td-page">

      {/* Page header */}
      <div className="td-page-header">
        <h1 className="td-page-title">Project Milestones</h1>
        <p className="td-page-sub">Manage your course tasks and track subtask progress.</p>
      </div>

      {/* Create task row */}
      <form className="td-create-row" onSubmit={createTask}>
        <input
          className="td-input"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Task title..."
        />
        <select
          className="td-input"
          style={{ maxWidth: 200 }}
          value={newCourse}
          onChange={e => setNewCourse(e.target.value)}
        >
          <option value="">No course</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <button className="td-btn-primary" type="submit" disabled={!newTitle.trim()}>
          <IconPlus /> Create Task
        </button>
      </form>

      {/* Filter tabs */}
      <div className="td-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`td-filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key !== 'all' && (
              <span style={{ marginLeft: 5, opacity: 0.7 }}>
                ({tasks.filter(t => getStatus(t.subtasks) === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="td-grid">
        {filtered.length === 0 ? (
          <div className="td-empty">
            <div className="td-empty-title">
              {filter === 'all' ? 'No tasks yet' : `No ${STATUS_LABELS[filter]} tasks`}
            </div>
            <p>
              {filter === 'all'
                ? 'Create a task above to get started.'
                : 'Switch to All to see all tasks.'}
            </p>
          </div>
        ) : (
          filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={t => setActiveTask(t)}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {activeTask && (
        <SubtaskModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onUpdate={updated => {
            updateTask(updated)
            setActiveTask(null)
          }}
        />
      )}

    </div>
  )
}