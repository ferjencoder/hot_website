import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [member, setMember] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('hot_member')) } catch { return null }
  })

  const login = (name) => {
    sessionStorage.setItem('hot_member', JSON.stringify(name))
    setMember(name)
  }

  const logout = () => {
    sessionStorage.removeItem('hot_member')
    setMember(null)
  }

  return <AuthContext.Provider value={{ member, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
