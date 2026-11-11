import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api'
import { useAuth } from '../auth'

export default function LoginPage() {
  const { token, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (token) {
    return <Navigate to="/notes" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await signIn(email, password)
      navigate('/notes', { replace: true })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand large">
          <span className="brand-mark">MN</span>
          <span>
            Mongo Note
            <small>Secure note-taking with JWT</small>
          </span>
        </div>

        <h1>Sign in</h1>
        <p className="muted">Use one of the seeded accounts or register a new one.</p>

        {error && <div className="banner error">{error}</div>}

        <form onSubmit={handleSubmit} className="stack">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="button" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          No account yet? <Link to="/register">Create one</Link>
        </p>

        <div className="demo-box">
          <strong>Demo accounts</strong>
          <span>admin@example.com / Password123!</span>
          <span>user@example.com / Password123!</span>
        </div>
      </div>
    </div>
  )
}
