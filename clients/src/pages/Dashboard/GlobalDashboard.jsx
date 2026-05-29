import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchDashboardAPI } from '~/apis'

const PRIORITY_COLORS = { 0: '#64748b', 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444' }
const PRIORITY_LABELS = { 0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' }
const BOARD_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

export default function GlobalDashboard() {
  const currentUser = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardAPI()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '☀️ Good morning'
    if (h < 18) return '🌤 Good afternoon'
    return '🌙 Good evening'
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <span className="spinner" style={{ marginRight: 12 }} /> Loading dashboard...
    </div>
  )

  const maxChart = Math.max(...(data?.weeklyChart || []).map(d => d.completed), 1)

  return (
    <div className="page-content" style={{ padding: '24px 32px' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          {getGreeting()}, {currentUser?.displayName || 'User'}!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
          Here's what's happening across your boards
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <DashStatCard icon="📋" label="Total Boards" value={data?.totalBoards || 0} color="#6366f1" />
        <DashStatCard icon="📌" label="Assigned Tasks" value={data?.assignedTasksCount || 0} color="#3b82f6" />
        <DashStatCard icon="⚠️" label="Overdue Tasks" value={data?.overdueTasksCount || 0} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Weekly Chart */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-secondary)' }}>Weekly Completion</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {(data?.weeklyChart || []).map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 600 }}>{d.completed}</span>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: Math.max(8, (d.completed / maxChart) * 100),
                  background: 'linear-gradient(180deg, #6366f1, #a855f7)',
                  transition: 'height 0.6s ease'
                }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.date.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Boards */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-secondary)' }}>Recent Boards</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {(data?.recentBoards || []).map((b, i) => (
              <div key={b._id}
                onClick={() => navigate(`/boards/${b._id}`)}
                style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${BOARD_COLORS[i % BOARD_COLORS.length]}22, transparent)`,
                  border: '1px solid var(--border-color)', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BOARD_COLORS[i % BOARD_COLORS.length]; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.taskCount} tasks</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Tasks */}
      <div className="dashboard-card">
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-secondary)' }}>My Tasks</h3>
        {(!data?.myTasks || data.myTasks.length === 0) ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <p>No tasks assigned to you. Enjoy your free time!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.myTasks.map(task => {
              const getDue = () => {
                if (!task.dueDate) return null
                const days = Math.ceil((new Date(task.dueDate) - Date.now()) / 864e5)
                if (days < 0) return { text: `${Math.abs(days)}d overdue`, cls: 'text-danger' }
                if (days === 0) return { text: 'Today', cls: 'text-warning' }
                if (days <= 3) return { text: `${days}d`, cls: 'text-warning' }
                return { text: `${days}d`, cls: '' }
              }
              const due = getDue()
              return (
                <div key={task._id}
                  onClick={() => navigate(`/boards/${task.boardId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: task.columnColor || '#6366f1', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.boardName} → {task.columnName}</div>
                  </div>
                  {task.priority > 0 && (
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority], fontWeight: 600 }}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  )}
                  {due && <span className={due.cls} style={{ fontSize: 11 }}>{due.text}</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function DashStatCard({ icon, label, value, color }) {
  return (
    <div style={{
      padding: '20px 18px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
      borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 14
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}
