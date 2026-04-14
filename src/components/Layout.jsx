import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const nav = [
  { to: '/', label: 'Dashboard', icon: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'M8 12H4v9h4zm6-6h-4v15h4zm6-6h-4v21h4z' },
  { to: '/profile', label: 'My profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/roster', label: 'Roster', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { to: '/handbook', label: 'Handbook', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13H6.5' },
  { to: '/gifts', label: 'Daily gifts', icon: 'M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z' },
]

export default function Layout({ children }) {
  const { member, logout } = useAuth()
  const navigate = useNavigate()

  const initials = member ? member.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--bg2)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '0.5px solid var(--border-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--gold-dim)',
              background: 'var(--bg3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--gold)', letterSpacing: '.04em' }}>HOT Clan</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Kingdom 305</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius)',
                margin: '1px 0',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                background: isActive ? 'rgba(200,168,75,0.08)' : 'transparent',
                textDecoration: 'none',
                transition: 'all .12s',
                borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
              })}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '0.5px solid var(--border-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(200,168,75,0.15)',
              border: '0.5px solid var(--gold-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: 'var(--gold)',
              fontFamily: 'Cinzel, serif', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Member</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '7px 12px' }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
