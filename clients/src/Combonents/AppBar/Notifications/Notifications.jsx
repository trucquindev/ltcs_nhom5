import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNotificationsAPI, updateBoardInvitationAPI } from '~/apis'
import { socketInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice'

const STATUS = { PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED' }

function Notifications() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const queryClient = useQueryClient()
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotificationsAPI
  })

  const updateInvitationMutation = useMutation({
    mutationFn: ({ status, invitationId }) => updateBoardInvitationAPI(invitationId, status),
    onSuccess: (data) => {
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old
        return old.map(n => n._id === data._id ? data : n)
      })
      if (data?.boardInvitation?.status === STATUS.ACCEPTED) {
        navigate(`/boards/${data.boardInvitation.boardId}`)
      }
    }
  })

  const [open, setOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onReceive = (invitation) => {
      if (invitation.inviteeId === user._id) {
        queryClient.setQueryData(['notifications'], (old = []) => [invitation, ...old])
        setHasNew(true)
      }
    }
    socketInstance.on('BE_USER_INVITED_TO_BOARD', onReceive)
    return () => socketInstance.off('BE_USER_INVITED_TO_BOARD', onReceive)
  }, [queryClient, user._id])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const updateInvitation = (status, invitationId) => {
    updateInvitationMutation.mutate({ status, invitationId })
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="notifications-btn"
        onClick={() => { setOpen(v => !v); setHasNew(false) }}
        title="Notifications"
      >
        🔔
        {hasNew && <span className="notifications-badge">•</span>}
      </button>

      {open && (
        <div className="notifications-dropdown">
          <div className="notifications-header">Notifications</div>
          <div className="notifications-list">
            {(!notifications || notifications.length === 0) && (
              <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                No notifications yet.
              </div>
            )}
            {notifications?.map((n, i) => (
              <div key={i} className="notification-item">
                <div className="notification-text">
                  <strong>{n?.inviter?.displayName}</strong> invited you to join <strong>{n?.board?.title}</strong>
                </div>
                {n?.boardInvitation?.status === STATUS.PENDING && (
                  <div className="notification-actions">
                    <button className="btn btn-sm btn-primary interceptor-loading" onClick={() => updateInvitation(STATUS.ACCEPTED, n._id)}>Accept</button>
                    <button className="btn btn-sm btn-ghost interceptor-loading" onClick={() => updateInvitation(STATUS.REJECTED, n._id)}>Reject</button>
                  </div>
                )}
                {n?.boardInvitation?.status === STATUS.ACCEPTED && (
                  <span style={{ fontSize: 12, color: '#10b981' }}>✓ Accepted</span>
                )}
                {n?.boardInvitation?.status === STATUS.REJECTED && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>✕ Rejected</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications
