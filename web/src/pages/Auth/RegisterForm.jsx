import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { registerUserAPI } from '~/apis'
import {
  FIELD_REQUIRED_MESSAGE,
  EMAIL_RULE, EMAIL_RULE_MESSAGE,
  PASSWORD_RULE, PASSWORD_RULE_MESSAGE,
  PASSWORD_CONFIRMATION_MESSAGE
} from '~/untils/validators'

function RegisterForm() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm()

  const submitRegister = (data) => {
    const { email, password } = data
    toast.promise(registerUserAPI({ email, password }), {
      pending: 'Creating account...'
    }).then((user) => {
      navigate(`/login?registeredEmail=${user.email}`)
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>✦ Trello</h1>
          <p>Create your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(submitRegister)}>
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
              placeholder="At least 8 characters"
              {...register('password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: { value: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
              })}
            />
            {errors.password && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              {...register('password_confirmation', {
                validate: (value) => value === watch('password') || PASSWORD_CONFIRMATION_MESSAGE
              })}
            />
            {errors.password_confirmation && <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.password_confirmation.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary interceptor-loading" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner" />}
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
