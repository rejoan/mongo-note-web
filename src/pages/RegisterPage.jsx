import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api'
import { useAuth } from '../auth'
import { parseInterests } from '../format'

export default function RegisterPage() {
  const { token, signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    interests: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (token) {
    return <Navigate to="/notes" replace />
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await signUp({
        ...form,
        interests: parseInterests(form.interests),
      })
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

        <h1>Create an account</h1>
        <p className="muted">New accounts are always created with the user role.</p>

        {error && <div className="banner error">{error}</div>}

        <form onSubmit={handleSubmit} className="stack">
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(event) => update('password_confirmation', event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Interests <span className="hint">comma separated, optional</span>
            <input
              value={form.interests}
              onChange={(event) => update('interests', event.target.value)}
              placeholder="chess, reading"
            />
          </label>

          <button type="submit" className="button" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
