import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../api'
import { useAuth } from '../auth'
import { formatDate } from '../format'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorBanner, Loading, PageHeader } from '../components/Ui'

const emptyForm = { id: null, title: '', body: '' }

export default function NotesPage() {
  const { token } = useAuth()
  const [notes, setNotes] = useState([])
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
      const data = await api(`/notes?page=${page}`, { token })
      setNotes(data.data)
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

  function startEdit(note) {
    setForm({ id: note.id, title: note.title, body: note.body })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = { title: form.title, body: form.body }

      if (form.id) {
        await api(`/notes/${form.id}`, { method: 'PUT', body: payload, token })
      } else {
        await api('/notes', { method: 'POST', body: payload, token })
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

  async function remove(note) {
    if (!window.confirm(`Delete "${note.title}"?`)) {
      return
    }

    try {
      await api(`/notes/${note.id}`, { method: 'DELETE', token })
      refresh()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  return (
    <>
      <PageHeader
        title="My notes"
        description="Only you can read and modify these notes. Admins can view every note, but only the owner can edit it."
      />

      <ErrorBanner message={error} />

      <div className="split">
        <section className="panel">
          <h2>{form.id ? 'Edit note' : 'New note'}</h2>

          <form onSubmit={handleSubmit} className="stack">
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                maxLength={200}
                required
              />
            </label>

            <label>
              Body
              <textarea
                value={form.body}
                onChange={(event) => update('body', event.target.value)}
                rows={7}
                required
              />
            </label>

            <div className="actions">
              <button type="submit" className="button" disabled={saving}>
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create note'}
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
          <h2>Your notes</h2>

          {loading && <Loading />}

          {!loading && notes.length === 0 && (
            <EmptyState>No notes yet. Create your first note on the left.</EmptyState>
          )}

          <div className="card-list">
            {notes.map((note) => (
              <article key={note.id} className="card">
                <div className="card-head">
                  <h3>{note.title}</h3>
                  <span className="timestamp">{formatDate(note.created_at)}</span>
                </div>
                <p className="note-body">{note.body}</p>
                <div className="actions">
                  <button
                    type="button"
                    className="button ghost small"
                    onClick={() => startEdit(note)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button danger small"
                    onClick={() => remove(note)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <Pagination meta={meta} onPage={setPage} />
        </section>
      </div>
    </>
  )
}
