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
  const topContributors = Object.entries(points).sort((a, b) => b[1].points - a[1].points).slice(0, 5)

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1>Hey, {member?.split(' ')[0]} 👋</h1>
          <p>{config?.week_label || 'Current week'}</p>
        </div>
        {myStats.points >= target
          ? <span className="badge green">✓ Target met</span>
          : <span className="badge red">{(target - myStats.points).toLocaleString()} pts to go</span>
        }
      </div>

      <div className="page-body">

        {/* Metric cards */}
        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-label">Your pts</div>
            <div className="metric-val">{myStats.points.toLocaleString()}</div>
            <div className="metric-sub">of {target.toLocaleString()} target</div>
            <div className="progress-wrap" style={{ marginTop: 10 }}>
              <div className={`progress-fill ${myPct >= 100 ? 'green' : ''}`} style={{ width: `${myPct}%` }}/>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Clan total</div>
            <div className="metric-val" style={{ color: 'var(--text)' }}>{clanTotal.toLocaleString()}</div>
            <div className="metric-sub">{clanPct}% of target</div>
            <div className="progress-wrap" style={{ marginTop: 10 }}>
              <div className={`progress-fill ${clanPct >= 100 ? 'green' : ''}`} style={{ width: `${clanPct}%` }}/>
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
              {myRoster.might ? Number(myRoster.might.replace(/,/g,'')).toLocaleString() : '—'}
            </div>
            <div className="metric-sub">{myRoster.location || '—'}</div>
          </div>
        </div>

        {/* Two columns on tablet+ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 12 }}>

          {/* My contributions */}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Your contributions this week
            </div>
            {Object.keys(myStats.breakdown).length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No chests recorded yet this week.</p>
              : Object.entries(myStats.breakdown).sort((a,b) => b[1]-a[1]).map(([src, cnt]) => (
                <div key={src} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-dim)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text)' }}>{src}</span>
                  <span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{cnt}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> × {scoring[src]||0} pts</span>
                  </span>
                </div>
              ))
            }
            {Object.keys(myStats.breakdown).length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: 'var(--text-dim)' }}>Total</span>
                <span style={{ color: 'var(--primary-dark)' }}>{myStats.points.toLocaleString()} pts</span>
              </div>
            )}
          </div>

          {/* Top contributors */}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Top contributors
            </div>
            {topContributors.map(([name, stats], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: i === 0 ? 'var(--primary)' : 'var(--bg4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: i === 0 ? '#000' : 'var(--text-muted)',
                }}>{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: name === member ? 700 : 500, color: name === member ? 'var(--primary-dark)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </div>
                  <div className="progress-wrap" style={{ height: 3, marginTop: 4 }}>
                    <div className="progress-fill" style={{ width: `${Math.round(stats.points / (topContributors[0]?.[1].points||1) * 100)}%` }}/>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)', flexShrink: 0 }}>{stats.points.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Members snapshot */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>Active members</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{roster.length} total</span>
          </div>
          <table>
            <thead><tr><th>Name</th><th>Rank</th><th>Hero Lv</th><th style={{ display: 'none' }}>Might</th></tr></thead>
            <tbody>
              {roster.slice(0,8).map(r => (
                <tr key={r.name}>
                  <td style={{ fontWeight: r.name === member ? 700 : 400, color: r.name === member ? 'var(--primary-dark)' : 'var(--text)' }}>{r.name}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{r.rank || '—'}</td>
                  <td>{r.level || '—'}</td>
                  <td style={{ display: 'none' }}>{r.might || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {roster.length > 8 && (
            <div style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, borderTop: '1px solid var(--border)' }}>
              <a href="/roster" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>View all {roster.length} members →</a>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
