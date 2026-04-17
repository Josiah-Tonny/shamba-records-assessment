import { useMemo, useState } from 'react'
import { AuthContext } from './auth-context.jsx'

const AUTH_STORAGE_KEY = 'shamba-auth'

function loadStoredUser() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  const login = ({ email, name, role }) => {
    const nextUser = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      email,
      name,
      role,
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}