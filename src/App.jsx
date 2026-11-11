import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import Layout from './components/Layout'
import AdminNotesPage from './pages/AdminNotesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import InterestsPage from './pages/InterestsPage'
import LoginPage from './pages/LoginPage'
import NotesPage from './pages/NotesPage'
import PostsPage from './pages/PostsPage'
import RegisterPage from './pages/RegisterPage'
import UserPostsPage from './pages/UserPostsPage'

function RequireAuth() {
  const { token } = useAuth()

  return token ? <Outlet /> : <Navigate to="/login" replace />
}

function RequireAdmin() {
  const { isAdmin } = useAuth()

  return isAdmin ? <Outlet /> : <Navigate to="/notes" replace />
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/notes" replace />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/users/:id/posts" element={<UserPostsPage />} />

              <Route element={<RequireAdmin />}>
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/notes" element={<AdminNotesPage />} />
                <Route path="/admin/interests" element={<InterestsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
