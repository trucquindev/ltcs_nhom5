import { useLocation } from 'react-router-dom'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

function Auth() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  return (
    <div className="auth-page">
      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  )
}

export default Auth
