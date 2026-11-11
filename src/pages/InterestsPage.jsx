import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../api'
import { useAuth } from '../auth'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorBanner, Loading, PageHeader } from '../components/Ui'

export default function InterestsPage() {
  const { token } = useAuth()
  const [groups, setGroups] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await api(`/users/grouped-by-interests?page=${page}&per_page=6`, {
        token,
      })
      setGroups(data.data)
      setMeta(data.meta)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [page, token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader
        title="Users by interest"
        description="Scenario 1: one collection.aggregate() call groups users by their interests array, with pagination inside the same pipeline."
      />

      <ErrorBanner message={error} />

      {loading && <Loading />}

      {!loading && groups.length === 0 && <EmptyState>No interests recorded yet.</EmptyState>}

      <div className="interest-grid">
        {groups.map((group) => (
          <article key={group.interest} className="card interest-card">
            <div className="card-head">
              <h3>{group.interest}</h3>
              <span className="badge neutral">{group.count} user{group.count === 1 ? '' : 's'}</span>
            </div>

            <ul className="user-list">
              {group.users.map((member) => (
                <li key={member.id}>
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <Pagination meta={meta} onPage={setPage} />
    </>
  )
}
