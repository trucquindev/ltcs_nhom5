import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import AppLayout from '~/Combonents/AppLayout/AppLayout'
import Board from './pages/Boards/_id'
import Boards from './pages/Boards'
import Settings from '~/pages/Settings/Settings'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import GlobalDashboard from '~/pages/Dashboard/GlobalDashboard'

const ProtectedRoutes = ({ user }) => {
  if (!user) return <Navigate to='/login' replace />
  return <Outlet />
}

const PublicRoutes = ({ user }) => {
  if (user) return <Navigate to='/dashboard' replace />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/dashboard' replace />} />

      {/* Protected routes wrapped in AppLayout */}
      <Route element={<ProtectedRoutes user={currentUser} />}>
        <Route element={<AppLayout />}>
          <Route path='/dashboard' element={<GlobalDashboard />} />
          <Route path='/boards' element={<Boards />} />
          <Route path='/boards/:boardId' element={<Board />} />
          <Route path='/settings/account' element={<Settings />} />
          <Route path='/settings/security' element={<Settings />} />
        </Route>
      </Route>

      {/* Public routes */}
      <Route element={<PublicRoutes user={currentUser} />}>
        <Route path='/login' element={<Auth />} />
        <Route path='/register' element={<Auth />} />
      </Route>

      <Route path='/accounts/verification' element={<AccountVerification />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
