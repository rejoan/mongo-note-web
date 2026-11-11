import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../api'
import { useAuth } from '../auth'
import { formatDate } from '../format'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorBanner, Loading, PageHeader } from '../components/Ui'

export default function AdminNotesPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [notes, setNotes] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [authorId, setAuthorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await api('/users?per_page=100', { token })
        setUsers(data.data)
      } catch {
        // The author filter is a convenience; notes still load without it.
      }
    }

    loadUsers()
  }, [token])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const query = new URLSearchParams({ page: String(page) })

      if (authorId) {
        query.set('user_id', authorId)
      }

      const data = await api(`/notes?${query.toString()}`, { token })
      setNotes(data.data)
      setMeta(data.meta)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [authorId, page, token])

  useEffect(() => {
    load()
  }, [load])

  function changeAuthor(value) {
    setAuthorId(value)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="All notes"
        description="Admins can read every user's notes. Editing and deleting stay restricted to the note owner."
      />

      <ErrorBanner message={error} />

      <section className="panel">
        <div className="toolbar">
          <label>
            Filter by author
            <select value={authorId} onChange={(event) => changeAuthor(event.target.value)}>
              <option value="">Everyone</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <Loading />}

        {!loading && notes.length === 0 && <EmptyState>No notes match this filter.</EmptyState>}

        {!loading && notes.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id}>
                    <td>
                      <strong>{note.title}</strong>
                      <div className="muted clamp">{note.body}</div>
                    </td>
                    <td>
                      {note.author?.name ?? '—'}
                      <div className="muted">{note.author?.email}</div>
                    </td>
                    <td>{formatDate(note.updated_at)}</td>
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
