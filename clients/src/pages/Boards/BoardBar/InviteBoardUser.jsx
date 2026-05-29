import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { EMAIL_RULE, FIELD_REQUIRED_MESSAGE, EMAIL_RULE_MESSAGE } from '~/untils/validators'
import { inviteUserToBoardAPI } from '~/apis'
import { socketInstance } from '~/socketClient'

function InviteBoardUser({ boardId }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const submitInvite = (data) => {
    inviteUserToBoardAPI({ inviteeEmail: data.inviteeEmail, boardId }).then((invitation) => {
      setValue('inviteeEmail', '')
      setOpen(false)
      socketInstance.emit('FE_USER_INVITED_TO_BOARD', invitation)
    })
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(v => !v)}>
        + Invite
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)', padding: 20, width: 300,
          boxShadow: 'var(--shadow-lg)', zIndex: 100
        }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Invite user to board</div>
          <form onSubmit={handleSubmit(submitInvite)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="form-group">
              <input
                autoFocus
                type="text"
                placeholder="Enter email to invite..."
                {...register('inviteeEmail', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
                })}
              />
              {errors.inviteeEmail && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.inviteeEmail.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-sm interceptor-loading">Invite</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default InviteBoardUser
