import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, errorMessage } from '../api'
import { useAuth } from '../auth'
import { formatDate } from '../format'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorBanner, Loading, PageHeader } from '../components/Ui'

export default function UserPostsPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [posts, setPosts] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const author = posts[0]?.author

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await api(`/users/${id}/posts?page=${page}`, { token })
      setPosts(data.data)
      setMeta(data.meta)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [id, page, token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader
        title={author ? `Posts by ${author.name}` : 'Posts by user'}
        description="Resolved with a single aggregation pipeline containing a $lookup stage."
        actions={
          <Link to="/posts" className="button ghost small">
            Back to all posts
          </Link>
        }
      />

      <ErrorBanner message={error} />

      {loading && <Loading />}

      {!loading && posts.length === 0 && (
        <EmptyState>This user has not written any posts.</EmptyState>
      )}

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
                by <strong>{post.author?.name ?? 'Unknown'}</strong>
              </span>
            </div>
          </article>
        ))}
      </div>

      <Pagination meta={meta} onPage={setPage} />
    </>
  )
}
