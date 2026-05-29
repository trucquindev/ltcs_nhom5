import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchCardActivityAPI } from '~/apis'

function CardActivitySection({ cardId, cardComments = [], onAddCardComment }) {
  const currentUser = useSelector(selectCurrentUser)
  const [activities, setActivities] = useState([])
  const initials = (name) => name?.charAt(0)?.toUpperCase() || '?'

  useEffect(() => {
    if (cardId) {
      fetchCardActivityAPI(cardId).then(setActivities).catch(() => {})
    }
  }, [cardId])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!e.target.value.trim()) return
      onAddCardComment({
        userAvatar: currentUser?.avatar,
        userDisplayName: currentUser?.displayName,
        content: e.target.value.trim()
      }).then(() => { e.target.value = '' })
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className="avatar avatar-sm"
          style={{ backgroundImage: currentUser?.avatar ? `url(${currentUser.avatar})` : undefined, backgroundSize: 'cover' }}>
          {!currentUser?.avatar && initials(currentUser?.displayName)}
        </div>
        <input
          style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
          placeholder="Write a comment... (Enter to send)"
          onKeyDown={handleKeyDown}
        />
      </div>

      {cardComments.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, paddingLeft: 46 }}>No activity yet.</div>
      )}

      {cardComments.map((comment, i) => (
        <div key={`comment-${i}`} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div className="avatar avatar-sm"
            style={{ backgroundImage: comment?.userAvatar ? `url(${comment.userAvatar})` : undefined, backgroundSize: 'cover', flexShrink: 0 }}>
            {!comment?.userAvatar && initials(comment?.userDisplayName)}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 13, marginRight: 8 }}>{comment?.userDisplayName}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {new Date(comment?.commentedAt).toLocaleString()}
            </span>
            <div style={{ marginTop: 4, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: 13, wordBreak: 'break-word' }}>
              {comment?.content}
            </div>
          </div>
        </div>
      ))}

      {activities.length > 0 && <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />}

      {activities.map(act => (
        <div key={act.id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
          <div className="avatar avatar-sm"
            style={{ width: 24, height: 24, fontSize: 10, backgroundImage: act.user?.avatarUrl ? `url(${act.user.avatarUrl})` : undefined, backgroundSize: 'cover', flexShrink: 0 }}>
            {!act.user?.avatarUrl && initials(act.user?.displayName)}
          </div>
          <div style={{ flex: 1, fontSize: 13 }}>
            <span style={{ fontWeight: 600, marginRight: 4 }}>{act.user?.displayName}</span>
            <span>{act.action}</span>
            {act.newValue && <strong style={{ marginLeft: 4 }}>{act.newValue}</strong>}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
              {new Date(act.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardActivitySection
