import { useChestData } from '../hooks/useChestData.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link } from 'react-router-dom'

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_CLS = ['gold', 'silver', 'bronze']

export default function Leaderboard() {
  const { member } = useAuth()
  const {
    weeks, weekIndex, setWeekIndex,
    currentWeek, weeklyTarget, loading, error, generated,
  } = useChestData()

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading chest data...
    </div>
  )

  if (error || !currentWeek) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        {error
          ? `Could not load chest data: ${error}`
          : 'No chest data yet — run Sync from the HOT Clan app.'
        }
      </p>
    </div>
  )

  const members = currentWeek.members || []

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Leaderboard</h1>
          <p>{currentWeek.label}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Week picker */}
          {weeks.length > 1 && (
            <select
              value={weekIndex}
              onChange={e => setWeekIndex(Number(e.target.value))}
              style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}
            >
              {weeks.map((w, i) => (
                <option key={w.start} value={i}>
                  {i === 0 ? `📅 ${w.label} (current)` : w.label}
                </option>
              ))}
            </select>
          )}
          {/* Full breakdown button */}
          <Link
            to={`/breakdown?week=${weekIndex}`}
            className="btn primary"
            style={{ fontSize: 13, padding: '7px 16px' }}
          >
            Full breakdown →
          </Link>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Week summary cards */}
        <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="metric-card">
            <div className="metric-label">Total points</div>
            <div className="metric-val">{currentWeek.total_points.toLocaleString()}</div>
            <div className="metric-sub">{currentWeek.label}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total chests</div>
            <div className="metric-val" style={{ color: 'var(--text)' }}>
              {currentWeek.total_chests.toLocaleString()}
            </div>
            <div className="metric-sub">
              {members.filter(m => m.met_target).length} / {members.length} hit target
            </div>
          </div>
        </div>

        {/* Member rows */}
        {members.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
            No members recorded for this week.
          </div>
        ) : members.map((m, i) => {
          const pct    = Math.min(100, Math.round(m.points / weeklyTarget * 100))
          const isSelf = m.name === member
          return (
            <div key={m.name} className={`lb-row${isSelf ? ' self' : ''}`}>
              {/* Rank */}
              <div className={`lb-rank ${RANK_CLS[i] || ''}`}>
                {MEDALS[i] || <span style={{ fontSize: 11 }}>{i + 1}</span>}
              </div>

              {/* Name + progress */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 14, fontWeight: isSelf ? 700 : 500,
                    color: isSelf ? 'var(--primary-dark)' : 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {m.name}
                  </span>
                  {isSelf && (
                    <span className="badge" style={{ fontSize: 10, padding: '1px 6px' }}>you</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                  {m.chests} chests · {pct}% of {weeklyTarget.toLocaleString()} target
                </div>
                <div className="progress-wrap">
                  <div
                    className={`progress-fill ${pct >= 100 ? 'green' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Points + status */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700,
                  color: m.points > 0 ? 'var(--primary-dark)' : 'var(--text-muted)',
                }}>
                  {m.points.toLocaleString()}
                </div>
                <div style={{ marginTop: 4 }}>
                  {m.met_target
                    ? <span className="badge green">✓ Done</span>
                    : m.points > 0
                      ? <span className="badge red">{(weeklyTarget - m.points).toLocaleString()} left</span>
                      : <span className="badge gray">—</span>
                  }
                </div>
              </div>
            </div>
          )
        })}

        {generated && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            Last synced: {generated}
          </p>
        )}
      </div>
    </div>
  )
}