import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { loginUserAPI } from '~/redux/user/userSlice'
import {
  FIELD_REQUIRED_MESSAGE,
  EMAIL_RULE, EMAIL_RULE_MESSAGE,
  PASSWORD_RULE, PASSWORD_RULE_MESSAGE,
} from '~/untils/validators'

function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [searchParams] = useSearchParams()
  const { registeredEmail, verifiedEmail } = Object.fromEntries([...searchParams])

  const submitLogIn = (data) => {
    const { email, password } = data
    toast.promise(dispatch(loginUserAPI({ email, password })), {
      pending: 'Logging in...'
    }).then((res) => {
      if (!res.error) navigate('/')
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>✦ Trello</h1>
          <p>Sign in to your workspace</p>
        </div>

        {verifiedEmail && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16 }}>
            ✓ Email <strong>{verifiedEmail}</strong> verified. You can now log in!
          </div>
        )}
        {registeredEmail && (
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16 }}>
            ✉ Verification email sent to <strong>{registeredEmail}</strong>. Please check your inbox.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit(submitLogIn)}>
          <div className="form-group">
            <label>Email</label>
            <input
              autoFocus
              type="text"
              placeholder="you@example.com"
              {...register('email', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
              })}
            />
            {errors.email && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: { value: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
              })}
            />
            {errors.password && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary interceptor-loading" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner" />}
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          New to Trello? <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
