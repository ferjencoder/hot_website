import { useAuth } from '../hooks/useAuth.jsx'
import { useData } from '../hooks/useData.jsx'
import { useChestData } from '../hooks/useChestData.jsx'
import { useMemo, useState } from 'react'

/* ─── Profile ───────────────────────────────────────────────── */
export function Profile() {
  const { member } = useAuth()
  const { roster, loading: rosterLoading } = useData()
  const {
    weeks, weekIndex, setWeekIndex,
    currentWeek, weeklyTarget, scoring,
    loading: chestLoading,
  } = useChestData()

  const myRoster = roster.find(r => r.name === member) || {}
  const loading  = rosterLoading || chestLoading

  // Find this member in the selected week
  const myStats = currentWeek?.members?.find(m => m.name === member)
    || { points: 0, chests: 0, met_target: false, breakdown: {} }

  const target   = weeklyTarget || 1000
  const pct      = Math.min(100, Math.round(myStats.points / target * 100))
  const initials = member ? member.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div><h1>My Profile</h1></div>
        {weeks.length > 1 && (
          <select value={weekIndex} onChange={e => setWeekIndex(Number(e.target.value))}
            style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}>
            {weeks.map((w, i) => (
              <option key={w.start} value={i}>{i === 0 ? `📅 ${w.label} (current)` : w.label}</option>
            ))}
          </select>
        )}
      </div>
      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, borderRadius: 16 }}>{initials}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{member}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{myRoster.rank || 'Soldier'} · HOT Clan</div>
            </div>
          </div>
          <table style={{ fontSize: 13 }}>
            <tbody>
              {[['Hero level', myRoster.level], ['Might', myRoster.might], ['Location', myRoster.location], ['Joined', myRoster.joined], ['Last seen', myRoster.last_seen]].map(([k,v]) => (
                <tr key={k}>
                  <td style={{ color: 'var(--text-muted)', padding: '7px 0', borderBottom: '1px solid var(--border-dim)', width: '50%' }}>{k}</td>
                  <td style={{ textAlign: 'right', padding: '7px 0', borderBottom: '1px solid var(--border-dim)', fontWeight: 500 }}>{v || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
            {currentWeek ? currentWeek.label : 'Weekly target'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'Outfit,sans-serif' }}>{myStats.points.toLocaleString()}</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {target.toLocaleString()}</span>
          </div>
          <div className="progress-wrap" style={{ height: 8, marginBottom: 10 }}>
            <div className={`progress-fill ${pct >= 100 ? 'green' : ''}`} style={{ width: `${pct}%` }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>{pct}% complete · {myStats.chests} chests</span>
            {pct < 100 && <span style={{ color: 'var(--red)', fontWeight: 600 }}>{(target - myStats.points).toLocaleString()} pts left</span>}
            {pct >= 100 && <span className="badge green">Done!</span>}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12 }}>My chest breakdown</div>
          {!myStats.breakdown || Object.values(myStats.breakdown).every(v => v === 0)
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No chests recorded for this week.</p>
            : <table>
                <thead><tr><th>Chest type</th><th style={{ textAlign: 'right' }}>Count</th><th style={{ textAlign: 'right' }}>Pts ea.</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                <tbody>
                  {Object.entries(myStats.breakdown)
                    .filter(([, cnt]) => cnt > 0)
                    .sort((a, b) => (b[1] * (scoring[b[0]] ?? 0)) - (a[1] * (scoring[a[0]] ?? 0)))
                    .map(([src, cnt]) => (
                      <tr key={src}>
                        <td>{src}</td>
                        <td style={{ textAlign: 'right' }}>{cnt}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{scoring[src] ?? 0}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-dark)' }}>
                          {(cnt * (scoring[src] ?? 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  )
}

/* ─── Roster ────────────────────────────────────────────────── */
export function Roster() {
  const { roster, loading } = useData()
  const [q, setQ] = useState('')

  const filtered = roster
    .filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const o = { Leader: 0, Superior: 1, Officer: 2, Veteran: 3, Soldier: 4 }
      return (o[a.rank]??5) - (o[b.rank]??5)
    })

  const rankColor = { Leader: 'var(--primary-dark)', Superior: '#7c3aed', Officer: '#1d4ed8', Veteran: '#065f46', Soldier: 'var(--text-dim)' }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div><h1>Roster</h1><p>{roster.length} active members</p></div>
      </div>
      <div className="page-body">
        <input type="search" placeholder="Search member..." value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 14 }}/>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead><tr><th>Name</th><th>Rank</th><th>Hero Lv</th><th>Might</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.name}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, color: rankColor[r.rank] || 'var(--text-dim)' }}>{r.rank || '—'}</span></td>
                  <td>{r.level || '—'}</td>
                  <td style={{ fontSize: 12 }}>{r.might || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Handbook ──────────────────────────────────────────────── */
const RULES = [
  'Contribute at least 1,000 chest points every week',
  'Open received chests within 24 hours',
  'Participate in clan wars and events',
  'Donate daily to the clan capital',
  'Notify leadership before going offline for 3+ days',
  'Respect all clan members — zero tolerance for toxicity',
  'Do not attack clan members\' cities',
]

const SCORING_TABLE = [
  ['L5 / L10 / L15 Crypt', '1 pt'], ['L20 Crypt', '20 pts'], ['L25 Crypt', '30 pts'],
  ['L15 epic Crypt', '50 pts'], ['L20 epic Crypt', '80 pts'], ['L25 epic Crypt', '100 pts'],
  ['L30 epic Crypt', '200 pts'], ['L35 epic Crypt', '300 pts'],
  ['L20 Citadel', '50 pts'], ['L25 Citadel', '160 pts'], ['L30 Citadel', '250 pts'],
  ['L40+ Heroic', '200 pts'], ['Ragnarok Chests', '40 pts'],
  ['Ancients vaults', '50 pts'], ['Ancients Chests', '120 pts'], ['Epic Monster Chests', '100 pts'],
]

export function Handbook() {
  return (
    <div>
      <div className="page-header"><h1>Clan Handbook</h1><p>HOT Clan · Kingdom 305</p></div>
      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ background: 'var(--primary-bg)', border: '1.5px solid var(--primary)', textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--primary-dark)', marginBottom: 8 }}>Weekly requirement</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>1,000</div>
          <div style={{ fontSize: 14, color: 'var(--primary-dark)', opacity: 0.8, marginTop: 4 }}>chest points</div>
        </div>

        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Clan rules</div>
          {RULES.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: i < RULES.length-1 ? '1px solid var(--border-dim)' : 'none', fontSize: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: 8, flexShrink: 0, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>{i+1}</div>
              <span style={{ color: 'var(--text)', lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Chest points table</div>
          {SCORING_TABLE.map(([name, pts]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-dim)', fontSize: 13 }}>
              <span>{name}</span>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 700 }}>{pts}</span>
            </div>
          ))}
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Gift chests (Wooden, Stone, Bone, etc.) and Bank sources score 0 points but still count toward chest count.
          </p>
        </div>
      </div>
    </div>
  )
}


/* ─── Daily free gift links ─────────────────────────────────── */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DAILY_GIFTS = [
  { day: 'Monday',    reward: '500 Gold',                   emoji: '🪙' },
  { day: 'Tuesday',   reward: '+100% XP Bonus for 1 hour',  emoji: '⚡' },
  { day: 'Wednesday', reward: '2500 Flare Oil',              emoji: '🔥' },
  { day: 'Thursday',  reward: '25% March Speed Up ×5',       emoji: '🚀' },
  { day: 'Friday',    reward: '500 Gold',                   emoji: '🪙' },
  { day: 'Saturday',  reward: '15 min Building Boost ×4',   emoji: '🏗️' },
  { day: 'Sunday',    reward: '3h Building Speed Up ×1',    emoji: '🏗️' },
]

const GIFT_LINKS = {
  android: {
    label: '📱 Android',
    links: {
      Monday:    'https://totalbattle.onelink.me/Xsl6/h3n9bz4l',
      Tuesday:   'https://totalbattle.onelink.me/Xsl6/atjav1j0',
      Wednesday: 'https://totalbattle.onelink.me/Xsl6/xp7gbljw',
      Thursday:  'https://totalbattle.onelink.me/Xsl6/gbwfnf2t',
      Friday:    'https://totalbattle.onelink.me/Xsl6/e08dg3he',
      Saturday:  'https://totalbattle.onelink.me/Xsl6/shl7uy9z',
      Sunday:    'https://totalbattle.onelink.me/Xsl6/hk7nqk5m',
    },
  },
  totalbattle: {
    label: '🌐 TotalBattle.com',
    links: {
      Monday:    'https://totalbattle.com/ru?present=gold',
      Tuesday:   'https://totalbattle.com/ru?present=xp',
      Wednesday: 'https://totalbattle.com/ru?present=tar',
      Thursday:  'https://totalbattle.com/ru?present=march25',
      Friday:    'https://totalbattle.com/ru?present=gold500',
      Saturday:  'https://totalbattle.com/ru?present=speedups15',
      Sunday:    'https://totalbattle.com/ru/?present=speedups3',
    },
  },
  triumph: {
    label: '🏛️ Triumph',
    links: {
      Monday:    'https://triumph.totalbattle.com/ru?present=gold',
      Tuesday:   'https://triumph.totalbattle.com/ru?present=xp',
      Wednesday: 'https://triumph.totalbattle.com/ru?present=tar',
      Thursday:  'https://triumph.totalbattle.com/ru?present=march25',
      Friday:    'https://triumph.totalbattle.com/ru?present=gold500',
      Saturday:  'https://triumph.totalbattle.com/ru?present=speedups15',
      Sunday:    'https://triumph.totalbattle.com/ru?present=speedups3',
    },
  },
}

function DailyGifts() {
  const [platform, setPlatform] = useState('android')
  const todayName = DAYS[new Date().getDay()]
  const links = GIFT_LINKS[platform].links

  return (
    <div className="card">
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
        Daily Free Gifts
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {Object.entries(GIFT_LINKS).map(([key, val]) => (
          <button key={key} onClick={() => setPlatform(key)}
            className={`btn${platform === key ? ' active' : ''}`}
            style={{ fontSize: 12, padding: '5px 12px' }}>
            {val.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DAILY_GIFTS.map(({ day, reward, emoji }) => {
          const isToday = day === todayName
          return (
            <a key={day} href={links[day]} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                border: `1.5px solid ${isToday ? 'var(--primary)' : 'var(--border)'}`,
                background: isToday ? 'var(--primary-bg)' : 'var(--bg3)',
                textDecoration: 'none', transition: 'all .15s',
              }}>
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? 'var(--primary-dark)' : 'var(--text)' }}>{day}</span>
                  {isToday && <span className="badge" style={{ fontSize: 10, padding: '1px 7px' }}>Today</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{reward}</div>
              </div>
              <span style={{ fontSize: 16, color: isToday ? 'var(--primary-dark)' : 'var(--text-muted)' }}>→</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Chests (renamed from Gifts) ──────────────────────────── */
export function Gifts() {
  const { gifts, scoring, config, loading } = useData()

  // Calculate total points across all recorded chests
  const totalPoints = useMemo(
    () => gifts.reduce((sum, row) => sum + (scoring[row.source] ?? 0), 0),
    [gifts, scoring]
  )

  // Total chest count (excluding Bank / 0-pt chests for meaningful count)
  const totalChests = gifts.length

  // Top crypters: ranked by points earned
  const topCrypters = useMemo(() => {
    const byPlayer = {}
    gifts.forEach(g => {
      const name = g.from || ''
      if (!name) return
      if (!byPlayer[name]) byPlayer[name] = { points: 0, chests: 0 }
      byPlayer[name].points += scoring[g.source] ?? 0
      byPlayer[name].chests += 1
    })
    return Object.entries(byPlayer)
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 15)
  }, [gifts, scoring])

  const recent = [...gifts].reverse().slice(0, 25)
  const lastTs = gifts.length ? gifts[gifts.length - 1]?.datetime : null
  const target = config?.weekly_target || 1000
  const totalPct = Math.min(100, Math.round(totalPoints / (target * (topCrypters.length || 1)) * 100))

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1>Chest Counter</h1>
          {lastTs && <p>Last recorded: {lastTs}</p>}
        </div>
        {/* View Excel file — put HOT_305_CHEST_COUNTER.xlsx in public/data/ */}
        <a
          href="/data/HOT_305_CHEST_COUNTER.xlsx"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          📊 View Excel
        </a>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Top metrics */}
        <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="metric-card">
            <div className="metric-label">Total points</div>
            <div className="metric-val">{totalPoints.toLocaleString()}</div>
            <div className="metric-sub">All recorded chests</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total chests</div>
            <div className="metric-val" style={{ color: 'var(--text)' }}>{totalChests.toLocaleString()}</div>
            <div className="metric-sub">{topCrypters.length} active players</div>
          </div>
        </div>

        {/* Daily free gifts */}
        <DailyGifts />

        {/* Top Crypters */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 14 }}>
            Top Crypters — by points
          </div>
          {topCrypters.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No chest data yet.</p>
            : topCrypters.map(([name, stats], i) => {
                const pct = Math.round(stats.points / (topCrypters[0]?.[1].points || 1) * 100)
                const medals = ['🥇','🥈','🥉']
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: i < 3 ? 'var(--primary)' : 'var(--bg4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: i < 3 ? 14 : 11, fontWeight: 700,
                      color: i < 3 ? '#000' : 'var(--text-muted)',
                    }}>{medals[i] || i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)', flexShrink: 0, marginLeft: 8 }}>
                          {stats.points.toLocaleString()} pts
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-wrap" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${pct}%` }}/>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{stats.chests} chests</span>
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>

        {/* Recent chest log */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>
            Recent chests
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>From</th>
                <th>Chest</th>
                <th>Source</th>
                <th style={{ textAlign: 'right' }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((g, i) => {
                const pts = scoring[g.source] ?? 0
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>
                      {(g.datetime || '').slice(11, 16)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{g.from || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-dim)' }}>{g.chest || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.source || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: pts > 0 ? 700 : 400, color: pts > 0 ? 'var(--primary-dark)' : 'var(--text-muted)', fontSize: 12 }}>
                      {pts > 0 ? pts : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}