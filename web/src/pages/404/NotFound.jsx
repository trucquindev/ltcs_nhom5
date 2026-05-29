import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', color: 'var(--text-primary)', gap: 16
    }}>
      <div style={{ fontSize: 100, fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
      <div style={{ fontSize: 18, color: 'var(--text-secondary)' }}>Page not found</div>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>Go Home</Link>
    </div>
  )
}

export default NotFound
