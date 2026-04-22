import { useData, calcPoints } from '../hooks/useData.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useMemo, useState } from 'react'

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_CLS = ['gold', 'silver', 'bronze']

export default function Leaderboard() {
  const { gifts, scoring, config, roster, loading } = useData()
  const { member } = useAuth()
  const [sort, setSort] = useState('points')

  const points = useMemo(() => calcPoints(gifts, scoring), [gifts, scoring])
  const target = config?.weekly_target || 8000

  const rows = useMemo(() => {
    const combined = roster.map(r => ({ ...r, ...(points[r.name] || { points: 0, chests: 0 }) }))
    return combined.sort((a, b) => sort === 'points' ? b.points - a.points : b.chests - a.chests)
  }, [roster, points, sort])

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Leaderboard</h1>
          <p>{config?.week_label}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['points', 'chests'].map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`btn${sort === s ? ' active' : ''}`}
              style={{ padding: '6px 14px', fontSize: 12 }}>
              {s === 'points' ? 'By points' : 'By chests'}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">

        {/* Mobile card list */}
        <div style={{ display: 'block' }}>
          {rows.map((r, i) => {
            const pct = Math.min(100, Math.round(r.points / target * 100))
            const isSelf = r.name === member
            return (
              <div key={r.name} className={`lb-row${isSelf ? ' self' : ''}`}>
                <div className={`lb-rank ${RANK_CLS[i] || ''}`}>
                  {MEDALS[i] || <span style={{ fontSize: 11 }}>{i+1}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: isSelf ? 700 : 500, color: isSelf ? 'var(--primary-dark)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.name}
                    </span>
                    {isSelf && <span className="badge" style={{ fontSize: 10, padding: '1px 6px' }}>you</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {r.rank || 'Soldier'} · Lv {r.level || '?'}
                  </div>
                  <div className="progress-wrap">
                    <div className={`progress-fill ${pct >= 100 ? 'green' : ''}`} style={{ width: `${pct}%` }}/>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: r.points > 0 ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                    {r.points.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.chests} chests</div>
                  <div style={{ fontSize: 11, color: pct >= 100 ? 'var(--green)' : 'var(--text-muted)', marginTop: 2 }}>
                    {pct}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
