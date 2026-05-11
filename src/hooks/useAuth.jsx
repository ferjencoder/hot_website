import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext  = createContext(null)
const STORAGE_KEY  = 'hot_auth_v2'
const SESSION_DAYS = 7

function safeParse(value) {
  try { return JSON.parse(value) } catch { return null }
}

function readStoredSession() {
  const saved = safeParse(sessionStorage.getItem(STORAGE_KEY))
  if (!saved?.member || !saved?.token || !saved?.expiresAt) return null
  if (Date.now() > saved.expiresAt) {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
  return saved
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)

  const login = (name, token) => {
    const next = {
      member: name,
      token,
      loginAt:   Date.now(),
      expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem('hot_auth') // clean up old key if present
    setSession(null)
  }

  const value = useMemo(() => ({
    member: session?.member || null,
    token:  session?.token  || null,
    session,
    login,
    logout,
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}