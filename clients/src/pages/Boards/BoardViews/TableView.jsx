import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'

const PRIORITY_LABELS = { 0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' }
const PRIORITY_COLORS = { 0: 'transparent', 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444' }

export default function TableView({ board }) {
  const dispatch = useDispatch()
  const [sortField, setSortField] = useState('status')
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')

  const tasks = useMemo(() => {
    if (!board?.columns) return []
    return board.columns.flatMap(col =>
      (col.cards || []).filter(c => !c.FE_placeholderCard).map(card => ({
        ...card, columnTitle: col.title, columnColor: col.color || '#6366f1',
        columnPosition: col.position || 0
      }))
    )
  }, [board])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    let filtered = tasks
    if (search) {
      const q = search.toLowerCase()
      filtered = tasks.filter(t => t.title.toLowerCase().includes(q))
    }
    return [...filtered].sort((a, b) => {
      const d = sortDir === 'asc' ? 1 : -1
      switch (sortField) {
        case 'title': return a.title.localeCompare(b.title) * d
        case 'priority': return ((a.priority || 0) - (b.priority || 0)) * d
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return (new Date(a.dueDate) - new Date(b.dueDate)) * d
        }
        case 'status': return a.columnTitle.localeCompare(b.columnTitle) * d
        default: return 0
      }
    })
  }, [tasks, sortField, sortDir, search])

  const openCard = (card) => {
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, fontSize: 12 }}>⇅</span>
    return <span style={{ fontSize: 12 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const getTimeRemaining = (due) => {
    if (!due) return { text: '—', cls: '' }
    const days = Math.ceil((new Date(due) - Date.now()) / 864e5)
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, cls: 'text-danger' }
    if (days === 0) return { text: 'Due today', cls: 'text-warning' }
    if (days <= 3) return { text: `${days}d left`, cls: 'text-warning' }
    return { text: `${days}d left`, cls: '' }
  }

  return (
    <div className="board-view-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Table View</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tasks.length} tasks</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '6px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 200 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px', overflow: 'auto' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th onClick={() => toggleSort('title')} style={{ cursor: 'pointer', padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Task <SortIcon field="title" />
              </th>
              <th onClick={() => toggleSort('status')} style={{ cursor: 'pointer', padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Status <SortIcon field="status" />
              </th>
              <th onClick={() => toggleSort('priority')} style={{ cursor: 'pointer', padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Priority <SortIcon field="priority" />
              </th>
              <th onClick={() => toggleSort('dueDate')} style={{ cursor: 'pointer', padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Due Date <SortIcon field="dueDate" />
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Time Left
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(task => {
              const ti = getTimeRemaining(task.dueDate)
              const items = task.checklistItems || []
              const pct = items.length > 0 ? Math.round(items.filter(i => i.isCompleted).length / items.length * 100) : -1
              return (
                <tr key={task._id} onClick={() => openCard(task)} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, borderBottom: '1px solid var(--border-color)' }}>{task.title}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '2px 10px', borderRadius: 20, background: (task.columnColor || '#6366f1') + '22', color: task.columnColor || '#6366f1' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: task.columnColor || '#6366f1' }} />
                      {task.columnTitle}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    {(task.priority || 0) > 0 && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority], fontWeight: 600 }}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <span className={ti.cls} style={{ fontSize: 12 }}>{ti.text}</span>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    {pct >= 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: 'var(--bg-card)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : 'var(--accent-primary)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>}
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                {search ? 'No matching tasks' : 'No tasks yet'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
