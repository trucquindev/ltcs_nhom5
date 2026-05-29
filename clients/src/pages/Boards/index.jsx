import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectActiveWorkspace, selectWorkspaceLoading, fetchActiveWorkspaceThunk } from '~/redux/workspace/workspaceSlice'
import SidebarCreateBoardModal from './create'
import PageLoadingSpinner from '~/Combonents/Loading/PageLoadingSpiner'
import WorkspaceSettingsModal from '~/Combonents/Modal/WorkspaceSettingsModal'

const COLORS = ['#6366f1','#a855f7','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']
const colorFor = (id) => COLORS[(id?.charCodeAt(0) || 0) % COLORS.length]

function Boards() {
  const dispatch = useDispatch()
  const activeWorkspace = useSelector(selectActiveWorkspace)
  const isLoading = useSelector(selectWorkspaceLoading)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const afterCreateNewBoard = () => {
    if (activeWorkspace) {
      dispatch(fetchActiveWorkspaceThunk(activeWorkspace.id))
    }
  }

  if (isLoading && !activeWorkspace) return <PageLoadingSpinner caption="Loading Workspace..." />

  if (!activeWorkspace) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="empty-state">
          <h3>No Workspace Selected</h3>
          <p>Please select a workspace from the sidebar or create a new one.</p>
        </div>
      </div>
    )
  }

  const boards = activeWorkspace.boards || []

  return (
    <div className="page-content">
      {/* Workspace Header */}
      <div style={{ 
        background: 'var(--card-bg)', padding: 24, borderRadius: 12, 
        border: '1px solid var(--border-color)', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 24, fontWeight: 'bold'
          }}>
            {activeWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>{activeWorkspace.name}</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{activeWorkspace.description || 'No description provided.'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', marginRight: 16 }}>
            {activeWorkspace.members?.slice(0, 5).map((m, i) => (
              <div key={m.userId} className="avatar" style={{ 
                width: 32, height: 32, marginLeft: i > 0 ? -12 : 0, 
                border: '2px solid var(--card-bg)', fontSize: 12
              }} title={m.displayName}>
                {m.displayName?.charAt(0).toUpperCase()}
              </div>
            ))}
            {activeWorkspace.members?.length > 5 && (
              <div className="avatar" style={{ 
                width: 32, height: 32, marginLeft: -12, 
                border: '2px solid var(--card-bg)', fontSize: 11,
                background: 'var(--surface-color)'
              }}>
                +{activeWorkspace.members.length - 5}
              </div>
            )}
          </div>
          <button className="btn btn-ghost" onClick={() => setIsSettingsOpen(true)}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Manage Workspace
          </button>
        </div>
      </div>

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Boards</h2>
        </div>
        <SidebarCreateBoardModal afterCreateNewBoard={afterCreateNewBoard} workspaceId={activeWorkspace.id} />
      </div>

      {boards.length === 0 && (
        <div className="empty-state">
          <h3>No boards yet</h3>
          <p>Create your first board in this workspace to get started</p>
        </div>
      )}

      {boards.length > 0 && (
        <div className="boards-grid">
          {boards.map(b => (
            <Link key={b.id} to={`/boards/${b.id}`} className="board-card">
              <div className="board-card-banner" style={{ background: colorFor(b.id) }} />
              <div className="board-card-body">
                <div className="board-card-title">{b.name}</div>
                <div className="board-card-desc">{b.description}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isSettingsOpen && (
        <WorkspaceSettingsModal 
          workspace={activeWorkspace} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  )
}

export default Boards
