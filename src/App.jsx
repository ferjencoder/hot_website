import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { useData } from './hooks/useData.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import { Events } from './pages/Events.jsx'
import Breakdown from './pages/Breakdown.jsx'
import { Tips } from './pages/Tips.jsx'
import { Profile, Roster, Handbook, Gifts } from './pages/Pages.jsx'

const LEADERSHIP = ['Leader', 'Superior']

// Basic auth guard
function Guard({ children }) {
  const { member } = useAuth()
  if (!member) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

// Rank guard — only Leader / Superior can access
function RankGuard({ children }) {
  const { member } = useAuth()
  const { roster, loading } = useData()

  if (!member) return <Navigate to="/login" replace />

  if (loading) return (
    <Layout>
      <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>
        Checking permissions...
      </div>
    </Layout>
  )

  const me = roster.find(r => r.name === member)
  const hasAccess = me && LEADERSHIP.includes(me.rank)

  if (!hasAccess) return (
    <Layout>
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Leadership only</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          The full roster is only visible to Leaders and Superiors.
        </p>
      </div>
    </Layout>
  )

  return <Layout>{children}</Layout>
}

function AppRoutes() {
  const { member } = useAuth()
  return (
    <Routes>
      <Route path="/login"       element={member ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/"            element={<Guard><Dashboard /></Guard>} />
      <Route path="/leaderboard" element={<Guard><Leaderboard /></Guard>} />
      <Route path="/events"      element={<Guard><Events /></Guard>} />
      <Route path="/breakdown"   element={<Guard><Breakdown /></Guard>} />
      <Route path="/tips"        element={<Guard><Tips /></Guard>} />
      <Route path="/profile"     element={<Guard><Profile /></Guard>} />
      <Route path="/handbook"    element={<Guard><Handbook /></Guard>} />
      <Route path="/gifts"       element={<Guard><Gifts /></Guard>} />
      <Route path="/roster"      element={<RankGuard><Roster /></RankGuard>} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}