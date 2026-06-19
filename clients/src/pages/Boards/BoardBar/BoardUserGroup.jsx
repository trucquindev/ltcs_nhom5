import { useState, useRef, useEffect } from 'react'

function BoardUserGroup({ boardUsers = [], limit = 4 }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (name) => name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="user-group" ref={ref} style={{ position: 'relative' }}>
      {boardUsers.slice(0, limit).map((u, i) => (
        <div key={i} className="card-member-avatar-wrapper" style={{ position: 'relative' }}>
          <div 
            className="avatar avatar-sm"
            style={{ 
              backgroundImage: u?.avatar ? `url(${u.avatar})` : undefined, 
              backgroundSize: 'cover' 
            }}
          >
            {!u?.avatar && initials(u?.displayName)}
          </div>
          <div className="avatar-tooltip">
            <strong>{u?.displayName || 'Unknown'}</strong>
            <span>{u?.email || ''}</span>
          </div>
        </div>
      ))}
      
      {boardUsers.length > limit && (
        <div
          className="avatar avatar-sm"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 11 }}
          onClick={() => setOpen(v => !v)}
        >
          +{boardUsers.length - limit}
        </div>
      )}
      
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)', padding: 12,
          display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 240,
          boxShadow: 'var(--shadow-lg)', zIndex: 100
        }}>
          {boardUsers.map((u, i) => (
            <div key={i} className="card-member-avatar-wrapper" style={{ position: 'relative' }}>
              <div 
                className="avatar avatar-sm"
                style={{ 
                  backgroundImage: u?.avatar ? `url(${u.avatar})` : undefined, 
                  backgroundSize: 'cover' 
                }}
              >
                {!u?.avatar && initials(u?.displayName)}
              </div>
              <div className="avatar-tooltip">
                <strong>{u?.displayName || 'Unknown'}</strong>
                <span>{u?.email || ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BoardUserGroup
