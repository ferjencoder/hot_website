import { useAuth } from '../hooks/useAuth.jsx'
import { useData, calcPoints } from '../hooks/useData.jsx'
import { useMemo } from 'react'

export default function Dashboard() {
  const { member } = useAuth()
  const { gifts, scoring, config, roster, loading } = useData()

  const points = useMemo(() => calcPoints(gifts, scoring), [gifts, scoring])
  const myStats = points[member] || { points: 0, chests: 0, breakdown: {} }
  const clanTotal = Object.values(points).reduce((s, m) => s + m.points, 0)
  const target = config?.weekly_target || 8000
  const myPct = Math.min(100, Math.round(myStats.points / target * 100))
  const clanPct = Math.min(100, Math.round(clanTotal / target * 100))

  const myRoster = roster.find(r => r.name === member) || {}

  const topContributors = Object.entries(points)
    .sort((a, b) => b[1].points - a[1].points)
    .slice(0, 5)

  if (loading) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading...</div>

  return (
    <div>
      <div style={{ padding: '24px 32px 0', borderBottom: '0.5px solid var(--border-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 4 }}>Welcome, {member}</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{config?.week_label || 'Current week'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {myStats.points >= target
              ? <span className="badge green">Target met</span>
              : <span className="badge red">{target - myStats.points} pts to target</span>
            }
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 28 }}>
          <div className="metric-card">
            <div className="metric-label">Your points</div>
            <div className="metric-val">{myStats.points.toLocaleString()}</div>
            <div className="metric-sub">of {target.toLocaleString()} target</div>
            <div className="progress-wrap" style={{ marginTop: 10 }}>
              <div className="progress-fill" style={{ width: `${myPct}%` }} />
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Clan total</div>
            <div className="metric-val" style={{ color: 'var(--text)' }}>{clanTotal.toLocaleString()}</div>
            <div className="metric-sub">{clanPct}% of weekly target</div>
            <div className="progress-wrap" style={{ marginTop: 10 }}>
              <div className={`progress-fill ${clanPct >= 100 ? 'green' : ''}`} style={{ width: `${clanPct}%` }} />
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Hero level</div>
            <div className="metric-val" style={{ color: 'var(--text)' }}>{myRoster.level || '—'}</div>
            <div className="metric-sub">{myRoster.rank || 'Soldier'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Might</div>
            <div className="metric-val" style={{ fontSize: 18, color: 'var(--text)' }}>
              {myRoster.might ? Number(myRoster.might.replace(/,/g, '')).toLocaleString() : '—'}
            </div>
            <div className="metric-sub">{myRoster.location || '—'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Your contributions this week</div>
            {Object.keys(myStats.breakdown).length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No chests recorded yet this week.</p>
              : Object.entries(myStats.breakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, cnt]) => (
                  <div key={src} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border-dim)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text)' }}>{src}</span>
                    <span>
                      <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{cnt}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> × {(scoring[src] || 0)}pts</span>
                    </span>
                  </div>
                ))}
            {Object.keys(myStats.breakdown).length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 13, fontWeight: 500 }}>
                <span style={{ color: 'var(--text-dim)' }}>Total</span>
                <span style={{ color: 'var(--gold)' }}>{myStats.points} pts</span>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Top contributors</div>
            {topContributors.map(([name, stats], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? 'rgba(200,168,75,0.2)' : 'var(--bg4)',
                  border: `0.5px solid ${i === 0 ? 'var(--gold-dim)' : 'var(--border-dim)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: i === 0 ? 'var(--gold)' : 'var(--text-muted)',
                  fontFamily: 'Cinzel, serif',
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: name === member ? 500 : 400, color: name === member ? 'var(--gold)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ height: 3, background: 'var(--bg4)', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--gold)', borderRadius: 2, width: `${Math.round(stats.points / (topContributors[0]?.[1].points || 1) * 100)}%` }} />
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)', flexShrink: 0 }}>{stats.points}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)' }}>Active members</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{roster.length} total</span>
          </div>
          <table>
            <thead><tr><th>Name</th><th>Rank</th><th>Hero Lv</th><th>Might</th><th>Location</th></tr></thead>
            <tbody>
              {roster.slice(0, 8).map(r => (
                <tr key={r.name}>
                  <td style={{ fontWeight: r.name === member ? 500 : 400, color: r.name === member ? 'var(--gold)' : 'var(--text)' }}>{r.name}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{r.rank || '—'}</td>
                  <td>{r.level || '—'}</td>
                  <td style={{ fontSize: 12 }}>{r.might || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{r.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {roster.length > 8 && (
            <div style={{ textAlign: 'center', paddingTop: 12, fontSize: 12 }}>
              <a href="/roster" style={{ color: 'var(--gold-dim)' }}>View all {roster.length} members →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
