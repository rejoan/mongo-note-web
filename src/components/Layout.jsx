import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Layout() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">MN</span>
          <span>
            Mongo Note
            <small>Secure notes API</small>
          </span>
        </div>

        <nav className="nav">
          <NavLink to="/notes">My notes</NavLink>
          <NavLink to="/posts">Posts</NavLink>
          {isAdmin && <NavLink to="/admin/users">Users</NavLink>}
          {isAdmin && <NavLink to="/admin/notes">All notes</NavLink>}
          {isAdmin && <NavLink to="/admin/interests">Interests</NavLink>}
        </nav>

        <div className="account">
          <span className="account-name">
            {user?.name}
            <small>{user?.role}</small>
          </span>
          <button type="button" className="button ghost small" onClick={handleSignOut}>
            Log out
          </button>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
