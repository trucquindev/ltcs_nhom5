import { useState, useRef, useEffect } from 'react'
import { useBoardStore } from '~/store/useBoardStore'
import { CARD_MEMBER_ACTION } from '~/untils/constrain'

function CardUserGroup({ cardMemberIds = [], onUpdateCardMember }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { currentActiveBoard: board } = useBoardStore()

  // Map user details for users who are currently assigned to this card
  const FE_CardMembers = cardMemberIds
    .map(id => board?.FE_allUsers?.find(u => u._id === id || u._id === id?.toString()))
    .filter(Boolean)

  // Filter board users who are NOT yet in the card
  const usersNotInCard = board?.FE_allUsers?.filter(
    user => !cardMemberIds.includes(user._id) && !cardMemberIds.includes(user._id?.toString())
  ) || []

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleUpdateMember = (user, forceAction = null) => {
    const isAlreadyMember = cardMemberIds.includes(user._id) || cardMemberIds.includes(user._id?.toString())
    const action = forceAction || (isAlreadyMember ? CARD_MEMBER_ACTION.REMOVE : CARD_MEMBER_ACTION.ADD)
    onUpdateCardMember({
      userId: user._id,
      action: action
    })
  }

  const initials = (name) => name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }} ref={ref}>
      {/* Existing Card Members */}
      {FE_CardMembers.map((user, i) => (
        <div 
          key={i} 
          className="card-member-avatar-wrapper" 
          style={{ position: 'relative' }}
          onClick={() => handleUpdateMember(user, CARD_MEMBER_ACTION.REMOVE)}
        >
          <div
            className="avatar avatar-sm"
            style={{
              backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
              backgroundSize: 'cover'
            }}
          >
            {!user?.avatar && initials(user?.displayName)}
          </div>
          <div className="avatar-tooltip">
            <strong>{user?.displayName || 'Unknown'}</strong>
            <span>{user?.email || ''}</span>
            <span style={{ color: '#ef4444', fontSize: 9, marginTop: 4, fontWeight: 600 }}>Click to remove</span>
          </div>
        </div>
      ))}

      {/* Add Member Button and Popover */}
      <div style={{ position: 'relative' }}>
        <button
          className="avatar avatar-sm"
          style={{
            background: 'var(--bg-hover)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            border: '1px dashed var(--border-color)',
            fontSize: 16
          }}
          onClick={() => setOpen(v => !v)}
          title="Add members to card"
        >
          +
        </button>

        {open && (
          <div className="card-member-popover">
            {/* Popover Header */}
            <div className="card-member-popover-header">
              <span>Add to Card</span>
              <button
                type="button"
                className="card-member-popover-close"
                onClick={() => setOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Popover List */}
            <div className="card-member-popover-list">
              {usersNotInCard.length > 0 ? (
                usersNotInCard.map((user, i) => {
                  return (
                    <div
                      key={i}
                      className="card-member-popover-item"
                      onClick={() => handleUpdateMember(user, CARD_MEMBER_ACTION.ADD)}
                    >
                      <div
                        className="avatar avatar-xs"
                        style={{
                          backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
                          backgroundSize: 'cover'
                        }}
                      >
                        {!user?.avatar && initials(user?.displayName)}
                      </div>
                      <div className="member-info">
                        <span className="member-name">{user?.displayName || 'Unknown'}</span>
                        <span className="member-email">{user?.email || ''}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                  All board members are already added to this card.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardUserGroup
