import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../api'
import { useAuth } from '../auth'
import { formatDate } from '../format'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorBanner, Loading, PageHeader } from '../components/Ui'

export default function PostsPage() {
  const { token, user } = useAuth()
  const [posts, setPosts] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [form, setForm] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await api(`/posts?page=${page}`, { token })
      setPosts(data.data)
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

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await api('/posts', { method: 'POST', body: form, token })
      setForm({ title: '', body: '' })
      setPage(1)
      setVersion((current) => current + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function remove(post) {
    if (!window.confirm(`Delete "${post.title}"?`)) {
      return
    }

    try {
      await api(`/posts/${post.id}`, { method: 'DELETE', token })
      setVersion((current) => current + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  return (
    <>
      <PageHeader
        title="Public posts"
        description="Posts are visible to everyone. The per-author view is powered by a single MongoDB $lookup aggregation."
      />

      <ErrorBanner message={error} />

      <section className="panel">
        <h2>Write a post</h2>

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
              rows={4}
              required
            />
          </label>

          <button type="submit" className="button" disabled={saving}>
            {saving ? 'Publishing…' : 'Publish post'}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Latest posts</h2>

        {loading && <Loading />}

        {!loading && posts.length === 0 && <EmptyState>No posts yet.</EmptyState>}

        <div className="card-list">
          {posts.map((post) => (
            <article key={post.id} className="card">
              <div className="card-head">
                <h3>{post.title}</h3>
                <span className="timestamp">{formatDate(post.created_at)}</span>
              </div>

              <p className="note-body">{post.body}</p>

              <div className="card-foot">
                <span>
                  by <strong>{post.author?.name ?? 'Unknown'}</strong>{' '}
                  <Link to={`/users/${post.user_id}/posts`}>view their posts</Link>
                </span>

                {user?.id === post.user_id && (
                  <button
                    type="button"
                    className="button danger small"
                    onClick={() => remove(post)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <Pagination meta={meta} onPage={setPage} />
      </section>
    </>
  )
}
