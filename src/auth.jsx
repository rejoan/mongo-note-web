import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

const STORAGE_KEY = 'mongo-note-auth'

const AuthContext = createContext(null)

function storedSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function AuthProvider({ children }) {
  const initial = useMemo(storedSession, [])
  const [token, setToken] = useState(initial.token || null)
  const [user, setUser] = useState(initial.user || null)

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [token, user])

  async function signIn(email, password) {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    setToken(data.access_token)
    setUser(data.user)

    return data.user
  }

  async function signUp(payload) {
    const data = await api('/auth/register', {
      method: 'POST',
      body: payload,
    })

    setToken(data.access_token)
    setUser(data.user)

    return data.user
  }

  async function signOut() {
    if (token) {
      try {
        await api('/auth/logout', { method: 'POST', token })
      } catch {
        // The token is stateless; clearing it client-side is enough.
      }
    }

    setToken(null)
    setUser(null)
  }

  async function refreshUser() {
    if (!token) {
      return null
    }

    const data = await api('/auth/me', { token })
    setUser(data.data)

    return data.data
  }

  const value = {
    token,
    user,
    isAdmin: user?.role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}
