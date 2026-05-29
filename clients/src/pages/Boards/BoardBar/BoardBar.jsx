import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import { exportBoardCsvAPI, exportBoardJsonAPI } from '~/apis'
import { useState } from 'react'

const VIEWS = [
  { key: 'kanban', label: '📋 Kanban' },
  { key: 'table', label: '📊 Table' },
  { key: 'calendar', label: '📅 Calendar' },
  { key: 'planner', label: '📝 Planner' },
  { key: 'dashboard', label: '📈 Dashboard' },
]

const BoardBar = ({ board, showChat, onToggleChat, activeView, onChangeView }) => {
  const [showExport, setShowExport] = useState(false)

  const handleExport = (type) => {
    const url = type === 'csv' ? exportBoardCsvAPI(board?._id) : exportBoardJsonAPI(board?._id)
    // Get token for auth
    let token = ''
    try {
      const raw = localStorage.getItem('persist:root')
      if (raw) {
        const root = JSON.parse(raw)
        const user = JSON.parse(root.user || '{}')
        token = user?.currentUser?.accessToken || ''
      }
    } catch { /* ignore */ }
    // Download with auth header
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = type === 'csv' ? `${board?.title || 'board'}_export.csv` : `${board?.title || 'board'}_export.json`
        a.click()
      })
    setShowExport(false)
  }

  return (
    <div className="board-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
        <span className="board-bar-title">{board?.title}</span>
        {board?.description && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {board.description}
          </span>
        )}
        {/* View toggle tabs */}
        <div className="board-view-tabs">
          {VIEWS.map(v => (
            <button
              key={v.key}
              className={`board-view-tab ${activeView === v.key ? 'active' : ''}`}
              onClick={() => onChangeView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="board-bar-right">
        {/* Export */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowExport(!showExport)} title="Export Board">
            📥 Export
          </button>
          {showExport && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 20, boxShadow: 'var(--shadow-lg)', minWidth: 160
            }}>
              <div style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
                onClick={() => handleExport('csv')}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                📄 Export CSV
              </div>
              <div style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
                onClick={() => handleExport('json')}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                📋 Export JSON
              </div>
            </div>
          )}
        </div>

        <button
          className={`btn btn-chat-toggle ${showChat ? 'active' : ''}`}
          onClick={onToggleChat}
          title="Toggle Board Chat"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
          <span>Chat</span>
        </button>
        <InviteBoardUser boardId={board?._id} />
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </div>
    </div>
  )
}

export default BoardBar
