import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { logoutUserAPI, updateUserAPI } from '~/redux/user/userSlice'
import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/untils/validators'

function SecurityTab() {
  const dispatch = useDispatch()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const submitChangePassword = (data) => {
    if (!window.confirm('You will be logged out after changing your password. Continue?')) return
    const { current_password, new_password } = data
    toast.promise(dispatch(updateUserAPI({ current_password, new_password })), { pending: 'Updating...' })
      .then(res => {
        if (!res.error) {
          toast.success('Password changed! Please log in again.')
          dispatch(logoutUserAPI(false))
        }
      })
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Security</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Change your password</div>

      <form onSubmit={handleSubmit(submitChangePassword)} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" {...register('current_password', {
            required: FIELD_REQUIRED_MESSAGE,
            pattern: { value: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
          })} />
          {errors.current_password && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.current_password.message}</span>}
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" {...register('new_password', {
            required: FIELD_REQUIRED_MESSAGE,
            pattern: { value: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
          })} />
          {errors.new_password && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.new_password.message}</span>}
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" {...register('new_password_confirmation', {
            validate: v => v === watch('new_password') || 'Password confirmation does not match.'
          })} />
          {errors.new_password_confirmation && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.new_password_confirmation.message}</span>}
        </div>
        <button type="submit" className="btn btn-primary interceptor-loading" style={{ alignSelf: 'flex-start' }}>
          Change password
        </button>
      </form>
    </div>
  )
}

export default SecurityTab
