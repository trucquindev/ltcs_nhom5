import { useState, useEffect } from 'react'
import { fetchBoardAnalyticsAPI } from '~/apis'

const PRIORITY_COLORS = { 0: '#64748b', 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444' }
const PRIORITY_LABELS = { 0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' }

export default function BoardDashboard({ boardId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (boardId) {
      fetchBoardAnalyticsAPI(boardId)
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [boardId])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading analytics...</div>
  if (!data) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Failed to load analytics</div>

  const maxBarValue = Math.max(...(data.burndown || []).map(d => Math.max(d.completed, d.created)), 1)

  return (
    <div className="board-view-container" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 20px' }}>📈 Board Analytics</h3>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Tasks" value={data.totalTasks} color="#6366f1" icon="📋" />
        <StatCard label="Completed" value={data.completedCount} color="#10b981" icon="✅" />
        <StatCard label="Completion Rate" value={`${data.completionRate}%`} color="#3b82f6" icon="📊" />
        <StatCard label="Overdue" value={data.overdueTasks} color="#ef4444" icon="⚠️" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Column Distribution (Pie-like) */}
        <div className="dashboard-card">
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Tasks by Column</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.tasksByColumn || []).map(col => {
              const pct = data.totalTasks > 0 ? Math.round(col.count / data.totalTasks * 100) : 0
              return (
                <div key={col._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.color || '#6366f1', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, flex: 1, minWidth: 80 }}>{col.name}</span>
                  <div style={{ flex: 2, height: 8, background: 'var(--bg-card)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: col.color || '#6366f1', borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 40, textAlign: 'right' }}>{col.count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="dashboard-card">
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Tasks by Priority</h4>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(data.tasksByPriority || []).map(p => (
              <div key={p.priority} style={{ flex: '1 1 45%', padding: '12px 16px', background: PRIORITY_COLORS[p.priority] + '12', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${PRIORITY_COLORS[p.priority]}` }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: PRIORITY_COLORS[p.priority] }}>{p.count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{PRIORITY_LABELS[p.priority] || p.priorityName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Burndown chart */}
      <div className="dashboard-card" style={{ marginBottom: 24, height: '450px' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>14-Day Burndown</h4>
        <div style={{
          width: '100%', height: '100%', display: 'grid', paddingTop: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}>
            {(data.burndown || []).map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{d.completed}</span>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{
                    height: Math.max(4, (d.completed / maxBarValue) * 100),
                    background: '#10b981', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease'
                  }} title={`${d.completed} completed`} />
                  <div style={{
                    height: Math.max(4, (d.created / maxBarValue) * 100),
                    background: '#6366f1', borderRadius: '0 0 4px 4px', transition: 'height 0.5s ease'
                  }} title={`${d.created} created`} />
                </div>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.date}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Completed
            </span>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#6366f1' }} /> Created
            </span>
          </div>
        </div>
      </div>

      {/* Member Stats */}
      <div className="dashboard-card">
        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Team Performance</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {(data.memberStats || []).map(m => (
            <div key={m._id} style={{ padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ flexShrink: 0 }}>{m.displayName?.charAt(0)?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.displayName}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.totalAssigned} tasks</span>
                  <span style={{ fontSize: 11, color: '#10b981' }}>✅ {m.completed}</span>
                  {m.overdue > 0 && <span style={{ fontSize: 11, color: '#ef4444' }}>⚠ {m.overdue}</span>}
                  {m.totalTimeMinutes > 0 && <span style={{ fontSize: 11, color: 'var(--accent-primary)' }}>🕐 {m.totalTimeMinutes}m</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      padding: '20px 18px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
      borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 14
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}
