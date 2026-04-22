import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useData } from '../hooks/useData.jsx'

const LEADERSHIP = ['Leader', 'Superior']

// Bottom nav — visible to everyone on mobile
const mobileNav = [
  { to: '/',            label: 'Home',    end: true, icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  { to: '/leaderboard', label: 'Ranks',            icon: 'M8 12H4v9h4zm6-6h-4v15h4zm6-6h-4v21h4z' },
  { to: '/events',      label: 'Events',            icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  { to: '/gifts',       label: 'Chests',             icon: 'M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z' },
  { to: '/profile',     label: 'Profile',            icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
]

// Sidebar — full nav including leadership-only items
const sidebarNav = [
  { to: '/',            label: 'Home',      end: true, icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', leadership: false },
  { to: '/leaderboard', label: 'Leaderboard',         icon: 'M8 12H4v9h4zm6-6h-4v15h4zm6-6h-4v21h4z',                    leadership: false },
  { to: '/events',      label: 'Events',               icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',         leadership: false },
  { to: '/gifts',       label: 'Chests',                icon: 'M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z', leadership: false },
  { to: '/profile',     label: 'My Profile',           icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', leadership: false },
  { to: '/handbook',    label: 'Handbook',             icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13H6.5',      leadership: false },
  { to: '/roster',      label: 'Roster 🔒',            icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', leadership: true },
]

function NavIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  )
}

export default function Layout({ children }) {
  const { member, logout } = useAuth()
  const { roster } = useData()
  const navigate = useNavigate()

  const me = roster.find(r => r.name === member)
  const isLeadership = me && LEADERSHIP.includes(me.rank)

  const initials = member
    ? member.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : '?'

  return (
    <div className="app-shell">

      {/* Mobile top bar */}
      <header className="app-bar">
        <div className="app-bar-brand">
          <div className="app-bar-logo">
            <img width="64" height="64" viewBox="0 0 24 24" fill="none" src="https://res.cloudinary.com/ferjen/image/upload/q_auto/f_auto/v1776433276/TB/logo/HOT_HookedOnTB.png" alt="HOT_clan_logo"/>
          </div>
          <span className="app-bar-name">HOT Clan</span>
        </div>
        <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{initials}</div>
      </header>

      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img width="64" height="64" viewBox="0 0 24 24" fill="none" src="https://res.cloudinary.com/ferjen/image/upload/q_auto/f_auto/v1776433276/TB/logo/HOT_HookedOnTB.png" alt="HOT_clan_logo" />
          </div>
          <div>
            <div className="sidebar-name">HOT Clan</div>
            <div className="sidebar-sub">Kingdom 305</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarNav
            .filter(item => !item.leadership || isLeadership)
            .map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {item.label}
              </NavLink>
            ))
          }
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{me?.rank || 'Member'}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} className="btn" style={{ width: '100%', justifyContent: 'center' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="app-content">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {mobileNav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
            <NavIcon path={item.icon}/>
            {item.label}
          </NavLink>
        ))}
      </nav>

    </div>
  )
}

 