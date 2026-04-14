import { useAuth } from '../hooks/useAuth.jsx'
import { useData, calcPoints } from '../hooks/useData.jsx'
import { useMemo } from 'react'

export function Profile() {
  const { member } = useAuth()
  const { gifts, scoring, config, roster, loading } = useData()
  const points = useMemo(() => calcPoints(gifts, scoring), [gifts, scoring])
  const myStats = points[member] || { points: 0, chests: 0, breakdown: {} }
  const myRoster = roster.find(r => r.name === member) || {}
  const target = config?.weekly_target || 8000
  const pct = Math.min(100, Math.round(myStats.points / target * 100))

  if (loading) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading...</div>

  return (
    <div>
      <div style={{ padding: '24px 32px 20px', borderBottom: '0.5px solid var(--border-dim)' }}>
        <h1 style={{ fontSize: 22, color: 'var(--gold)' }}>My profile</h1>
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(200,168,75,0.12)', border: '0.5px solid var(--gold-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 600, color: 'var(--gold)', fontFamily: 'Cinzel, serif',
              }}>
                {member.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{member}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{myRoster.rank || 'Soldier'} · HOT Clan</div>
              </div>
            </div>
            <table style={{ fontSize: 13 }}>
              <tbody>
                {[
                  ['Hero level', myRoster.level || '—'],
                  ['Might', myRoster.might || '—'],
                  ['Location', myRoster.location || '—'],
                  ['Joined', myRoster.joined || '—'],
                  ['Last seen', myRoster.last_seen || '—'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: 'var(--text-dim)', padding: '6px 0', borderBottom: '0.5px solid var(--border-dim)' }}>{k}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', borderBottom: '0.5px solid var(--border-dim)', fontFamily: k === 'Location' ? 'monospace' : undefined, fontSize: k === 'Location' ? 11 : undefined }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Weekly target</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>{myStats.points.toLocaleString()}</span>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>/ {target.toLocaleString()}</span>
            </div>
            <div className="progress-wrap" style={{ height: 8, marginBottom: 16 }}>
              <div className={`progress-fill ${pct >= 100 ? 'green' : ''}`} style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{pct}% complete · {myStats.chests} chests opened</div>
            {pct < 100 && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#ef5350' }}>
                {(target - myStats.points).toLocaleString()} points remaining
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Chest breakdown — this week</div>
          {Object.keys(myStats.breakdown).length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No chests recorded yet.</p>
            : <table>
                <thead><tr><th>Source</th><th style={{ textAlign: 'right' }}>Count</th><th style={{ textAlign: 'right' }}>Pts each</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                <tbody>
                  {Object.entries(myStats.breakdown).sort((a, b) => b[1] - a[1]).map(([src, cnt]) => (
                    <tr key={src}>
                      <td>{src}</td>
                      <td style={{ textAlign: 'right' }}>{cnt}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{scoring[src] ?? 0}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--gold)' }}>{cnt * (scoring[src] ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  )
}

export function Roster() {
  const { roster, loading } = useData()
  if (loading) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading...</div>

  return (
    <div>
      <div style={{ padding: '24px 32px 20px', borderBottom: '0.5px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, color: 'var(--gold)' }}>Roster</h1>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{roster.length} active members</span>
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead><tr><th>Name</th><th>Rank</th><th>Hero Lv</th><th>Might</th><th>Location</th><th>Last seen</th></tr></thead>
            <tbody>
              {roster.sort((a, b) => {
                const rOrder = { Leader: 0, Superior: 1, Officer: 2, Veteran: 3, Soldier: 4 }
                return (rOrder[a.rank] ?? 5) - (rOrder[b.rank] ?? 5)
              }).map(r => (
                <tr key={r.name}>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{r.rank || '—'}</td>
                  <td>{r.level || '—'}</td>
                  <td style={{ fontSize: 12 }}>{r.might || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>{r.location || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.last_seen || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const RULES = [
  'Contribute at least 8,000 chest points every week',
  'Open received gifts within 24 hours',
  'Participate in clan wars and events',
  'Donate daily to the clan capital',
  'Notify leadership before going offline for 3+ days',
  'Respect all clan members — zero tolerance for toxicity',
  'Do not attack clan members\' cities',
]

const SCORING = [
  ['L5 / L10 / L15 Crypt', '1 pt'], ['L15 rare Crypt', '1 pt'],
  ['L20 Crypt', '20 pts'], ['L25 Crypt', '30 pts'],
  ['L15 epic Crypt', '50 pts'], ['L20 epic Crypt', '80 pts'],
  ['L25 epic Crypt', '100 pts'], ['L30 epic Crypt', '200 pts'],
  ['L35 epic Crypt', '300 pts'], ['L20 Citadel', '50 pts'],
  ['L25 Citadel', '160 pts'], ['L30 Citadel', '250 pts'],
  ['L40+ Heroic', '200 pts'], ['Ragnarok Chests', '40 pts'],
  ['Ancients vaults', '50 pts'], ['Ancients Chests', '120 pts'],
  ['Epic Monster Chests', '100 pts'],
]

export function Handbook() {
  return (
    <div>
      <div style={{ padding: '24px 32px 20px', borderBottom: '0.5px solid var(--border-dim)' }}>
        <h1 style={{ fontSize: 22, color: 'var(--gold)' }}>Clan handbook</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>HOT Clan · Kingdom 305</p>
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Weekly requirement</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: 6 }}>8,000 pts</div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7 }}>
                Every member must contribute at least 8,000 chest points per week. Points are based on the source of each gift chest, not the chest type itself.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Clan rules</div>
              {RULES.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: i < RULES.length - 1 ? '0.5px solid var(--border-dim)' : 'none', fontSize: 13 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(200,168,75,0.1)', border: '0.5px solid var(--gold-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: 'var(--gold)', fontFamily: 'Cinzel, serif',
                  }}>{i + 1}</div>
                  <span style={{ color: 'var(--text)', lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Chest points table</div>
            {SCORING.map(([name, pts]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--border-dim)', fontSize: 13 }}>
                <span style={{ color: 'var(--text)' }}>{name}</span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 2,
                  background: 'rgba(200,168,75,0.1)', color: 'var(--gold)',
                  border: '0.5px solid rgba(200,168,75,0.2)', fontWeight: 500,
                }}>{pts}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Gift chests (Wooden, Stone, Bone, etc.) and Bank sources score 0 points. They still count toward chest count.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Gifts() {
  const { gifts, loading, config } = useData()
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

  const recent = [...gifts].reverse().slice(0, 50)
  const byPlayer = {}
  gifts.forEach(g => {
    const f = g.from || ''
    byPlayer[f] = (byPlayer[f] || 0) + 1
  })

  const lastTs = gifts.length ? gifts[gifts.length - 1].datetime : null

  if (loading) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading...</div>

  return (
    <div>
      <div style={{ padding: '24px 32px 20px', borderBottom: '0.5px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, color: 'var(--gold)' }}>Daily gifts</h1>
        {lastTs && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Last scanned: {lastTs}</span>}
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
          <div className="metric-card"><div className="metric-label">Total gifts logged</div><div className="metric-val" style={{ color: 'var(--text)' }}>{gifts.length}</div><div className="metric-sub">This month</div></div>
          <div className="metric-card"><div className="metric-label">Gift contributors</div><div className="metric-val" style={{ color: 'var(--text)' }}>{Object.keys(byPlayer).length}</div><div className="metric-sub">Unique players</div></div>
          <div className="metric-card">
            <div className="metric-label">Download data</div>
            <div style={{ marginTop: 8 }}>
              <a href={`/data/gifts_${month}.csv`} download className="btn" style={{ padding: '6px 12px', fontSize: 12 }}>
                gifts_{month}.csv
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Recent gifts</div>
            <table>
              <thead><tr><th>Time</th><th>Chest</th><th>From</th><th>Source</th><th>Tab</th></tr></thead>
              <tbody>
                {recent.slice(0, 20).map((g, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>{(g.datetime || '').slice(11, 16)}</td>
                    <td style={{ fontSize: 12 }}>{g.chest || g.chest_type || '—'}</td>
                    <td style={{ fontWeight: 500 }}>{g.from || g.from_player || '—'}</td>
                    <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{g.source || '—'}</td>
                    <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{g.tab || 'Gifts'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Top gift givers this month</div>
            {Object.entries(byPlayer).sort((a,b) => b[1]-a[1]).slice(0,12).map(([name, cnt], i) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid var(--border-dim)', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Cinzel, serif' }}>{i+1}</span>
                  <span>{name}</span>
                </div>
                <span style={{ color: 'var(--gold)', fontWeight: 500 }}>{cnt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
