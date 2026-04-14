import { useData, calcPoints } from '../hooks/useData.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useMemo, useState } from 'react'

export default function Leaderboard() {
  const { gifts, scoring, config, roster, loading } = useData()
  const { member } = useAuth()
  const [sort, setSort] = useState('points')

  const points = useMemo(() => calcPoints(gifts, scoring), [gifts, scoring])
  const target = config?.weekly_target || 8000

  const rows = useMemo(() => {
    const combined = roster.map(r => ({
      ...r,
      ...(points[r.name] || { points: 0, chests: 0 }),
    }))
    return combined.sort((a, b) => sort === 'points' ? b.points - a.points : b.chests - a.chests)
  }, [roster, points, sort])

  const medals = ['🥇', '🥈', '🥉']

  if (loading) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading...</div>

  return (
    <div>
      <div style={{ padding: '24px 32px 20px', borderBottom: '0.5px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, color: 'var(--gold)' }}>Leaderboard</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{config?.week_label}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['points', 'chests'].map(s => (
            <button key={s} onClick={() => setSort(s)} className="btn" style={{
              padding: '6px 14px', fontSize: 12,
              background: sort === s ? 'rgba(200,168,75,0.12)' : 'transparent',
              color: sort === s ? 'var(--gold)' : 'var(--text-dim)',
              borderColor: sort === s ? 'var(--gold-dim)' : 'var(--border-dim)',
            }}>
              {s === 'points' ? 'By points' : 'By chests'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 52, textAlign: 'center' }}>Rank</th>
                <th>Member</th>
                <th>In-game rank</th>
                <th>Hero Lv</th>
                <th style={{ textAlign: 'right' }}>Points</th>
                <th style={{ textAlign: 'right' }}>Chests</th>
                <th style={{ width: 140 }}>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pct = Math.min(100, Math.round(r.points / target * 100))
                const isSelf = r.name === member
                return (
                  <tr key={r.name} style={{ background: isSelf ? 'rgba(200,168,75,0.04)' : undefined }}>
                    <td style={{ textAlign: 'center' }}>
                      {medals[i]
                        ? <span style={{ fontSize: 16 }}>{medals[i]}</span>
                        : <span style={{ color: 'var(--text-muted)', fontFamily: 'Cinzel, serif', fontSize: 12 }}>{i + 1}</span>
                      }
                    </td>
                    <td style={{ fontWeight: isSelf ? 500 : 400, color: isSelf ? 'var(--gold)' : 'var(--text)' }}>
                      {r.name}{isSelf && <span style={{ fontSize: 10, color: 'var(--gold-dim)', marginLeft: 6 }}>you</span>}
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{r.rank || '—'}</td>
                    <td>{r.level || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500, color: r.points > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {r.points.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{r.chests}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-wrap" style={{ flex: 1 }}>
                          <div className={`progress-fill ${pct >= 100 ? 'green' : ''}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      {r.points >= target
                        ? <span className="badge green">Done</span>
                        : r.points > 0
                          ? <span className="badge">Active</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                      }
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
