import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

const MOCK_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { username: 'user',  password: 'user123',  role: 'user',  name: 'Farm Officer' },
]

const STORAGE_KEY = 'canaliq_user'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback((username, password) => {
    const found = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    )
    if (found) {
      const userData = { role: found.role, name: found.name, username: found.username }
      setUser(userData)
      return { success: true }
    }
    return { success: false, message: 'Invalid username or password' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)