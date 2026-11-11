import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../api'
import { useAuth } from '../auth'
import { formatDate, parseInterests } from '../format'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorBanner, Loading, PageHeader } from '../components/Ui'

const emptyForm = {
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'user',
  interests: '',
}

export default function AdminUsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await api(`/users?page=${page}`, { token })
      setUsers(data.data)
      setMeta(data.meta)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [page, token])

  useEffect(() => {
    load()
  }, [load, version])

  function refresh() {
    setVersion((current) => current + 1)
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function startEdit(user) {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      interests: (user.interests || []).join(', '),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      interests: parseInterests(form.interests),
    }

    if (form.password.trim()) {
      payload.password = form.password
    }

    try {
      if (form.id) {
        await api(`/users/${form.id}`, { method: 'PUT', body: payload, token })
      } else {
        await api('/users', { method: 'POST', body: payload, token })
      }

      setForm(emptyForm)
      setPage(1)
      refresh()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function remove(user) {
    if (!window.confirm(`Delete ${user.name} and all of their content?`)) {
      return
    }

    try {
      await api(`/users/${user.id}`, { method: 'DELETE', token })
      refresh()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  return (
    <>
      <PageHeader
        title="User management"
        description="Admins can create, update, list, and delete users. Passwords are hashed with bcrypt."
      />

      <ErrorBanner message={error} />

      <section className="panel">
        <h2>{form.id ? 'Edit user' : 'Create user'}</h2>

        <form onSubmit={handleSubmit} className="form-grid">
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
              required
            />
          </label>

          <label>
            Password {form.id && <span className="hint">leave blank to keep</span>}
            <input
              type="password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              required={!form.id}
              autoComplete="new-password"
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => update('role', event.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="span-2">
            Interests <span className="hint">comma separated</span>
            <input
              value={form.interests}
              onChange={(event) => update('interests', event.target.value)}
              placeholder="chess, reading"
            />
          </label>

          <div className="actions span-2">
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create user'}
            </button>

            {form.id && (
              <button
                type="button"
                className="button ghost"
                onClick={() => setForm(emptyForm)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>All users</h2>

        {loading && <Loading />}

        {!loading && users.length === 0 && <EmptyState>No users found.</EmptyState>}

        {!loading && users.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Interests</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>{(user.interests || []).join(', ') || '—'}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td className="row-actions">
                      <button
                        type="button"
                        className="button ghost small"
                        onClick={() => startEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button danger small"
                        onClick={() => remove(user)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPage={setPage} />
      </section>
    </>
  )
}
