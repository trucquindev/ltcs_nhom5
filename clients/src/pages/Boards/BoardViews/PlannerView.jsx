import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'

const PRIORITY_LABELS = { 0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' }
const PRIORITY_COLORS = { 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444' }
const TABS = ['All', 'Pending', 'Active', 'Completed', 'Overdue']
const TAB_ICONS = { All: '📋', Pending: '⏳', Active: '🔄', Completed: '✅', Overdue: '⚠️' }

export default function PlannerView({ board }) {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('All')
  const [sortBy, setSortBy] = useState('date')

  const { tasks, firstCol, lastCol } = useMemo(() => {
    if (!board?.columns) return { tasks: [], firstCol: '', lastCol: '' }
    const cols = board.columns
    const firstCol = cols[0]?.title || 'To Do'
    const lastCol = cols[cols.length - 1]?.title || 'Done'
    const tasks = cols.flatMap(col =>
      (col.cards || []).filter(c => !c.FE_placeholderCard).map(card => ({
        ...card, columnTitle: col.title, columnColor: col.color || '#6366f1'
      }))
    )
    return { tasks, firstCol, lastCol }
  }, [board])

  const filtered = useMemo(() => {
    let f = tasks
    switch (activeTab) {
      case 'Pending': f = tasks.filter(t => t.columnTitle === firstCol); break
      case 'Active': f = tasks.filter(t => t.columnTitle !== firstCol && t.columnTitle !== lastCol); break
      case 'Completed': f = tasks.filter(t => t.columnTitle === lastCol); break
      case 'Overdue': f = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()); break
    }
    return [...f].sort((a, b) => {
      switch (sortBy) {
        case 'priority': return (b.priority || 0) - (a.priority || 0)
        case 'name': return a.title.localeCompare(b.title)
        case 'date': default: {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
      }
    })
  }, [tasks, activeTab, sortBy, firstCol, lastCol])

  const tabCount = (tab) => {
    switch (tab) {
      case 'All': return tasks.length
      case 'Pending': return tasks.filter(t => t.columnTitle === firstCol).length
      case 'Active': return tasks.filter(t => t.columnTitle !== firstCol && t.columnTitle !== lastCol).length
      case 'Completed': return tasks.filter(t => t.columnTitle === lastCol).length
      case 'Overdue': return tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length
    }
  }

  const openCard = (card) => {
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  return (
    <div className="board-view-container" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Planner</h3>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '6px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }}>
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab)}
            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
          >
            {TAB_ICONS[tab]} {tab}
            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)' }}>
              {tabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(task => {
          const items = task.checklistItems || []
          const pct = items.length > 0 ? Math.round(items.filter(i => i.isCompleted).length / items.length * 100) : -1
          return (
            <div key={task._id}
              onClick={() => openCard(task)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', transition: 'all 0.15s', border: '1px solid transparent'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none' }}
            >
              {/* Status dot */}
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: task.columnColor || '#6366f1', flexShrink: 0 }} />
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.columnTitle}</span>
                  {task.dueDate && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              {/* Right badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {pct >= 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 40, height: 4, background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : 'var(--accent-primary)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{pct}%</span>
                  </div>
                )}
                {(task.priority || 0) > 0 && (
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority], fontWeight: 600 }}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>No tasks in this filter</h3>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try a different filter or add more tasks.</p>
          </div>
        )}
      </div>
    </div>
  )
}
