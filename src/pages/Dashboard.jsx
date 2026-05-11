import { useAuth } from '../hooks/useAuth.jsx'
import { useChestData } from '../hooks/useChestData.jsx'
import { useEventsData } from '../hooks/useEventsData.jsx'
import { Link } from 'react-router-dom'

// ── Daily free gift links ─────────────────────────────────────────────────────
const GIFT_LINKS = [
  {
    label: 'Browser / PC',
    icon: '🖥',
    url: 'https://totalbattle.com/en/gifts/daily',
    color: 'var(--primary)',
  },
  {
    label: 'iOS (App Store)',
    icon: '🍎',
    url: 'https://apps.apple.com/app/total-battle-strategy-online/id1491393634',
    color: '#007aff',
  },
  {
    label: 'Android (Play)',
    icon: '🤖',
    url: 'https://play.google.com/store/apps/details?id=com.scorewarrior.totalbattle',
    color: '#34a853',
  },
]

function fmt(n) {
  if (!n && n !== 0) return '—'
  const num = typeof n === 'string' ? parseInt(n.replace(/,/g, '')) : n
  if (isNaN(num)) return '—'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K'
  return num.toLocaleString()
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { member } = useAuth()
  const {
    currentWeek, weeklyTarget,
    currentContribWeek, contribTarget,
    loading, generated,
  } = useChestData()

  const { upcoming, loading: eventsLoading, error: eventsError, formatTime, formatCountdown, resetTimeArgentina } = useEventsData()
  const upcomingEvents = upcoming.slice(0, 5)

  // My chest stats
  const myChests    = currentWeek?.members?.find(m => m.name === member)
  const myPts       = myChests?.points    ?? 0
  const myPct       = weeklyTarget > 0 ? Math.min(100, Math.round(myPts / weeklyTarget * 100)) : 0
  const ptsMissing  = Math.max(0, weeklyTarget - myPts)
  const chestDone   = myChests?.met_target ?? false

  // My contribution stats
  const myContrib   = currentContribWeek?.members?.find(m => m.name === member)
  const myContribAmt = myContrib?.total ?? 0
  const contribPct  = contribTarget > 0
    ? Math.min(100, Math.round(myContribAmt / contribTarget * 100))
    : 0
  const contribDone = myContrib?.met_target ?? false
  const contribMissing = Math.max(0, contribTarget - myContribAmt)

  const firstName = member?.split(' ')[0] ?? 'Warrior'

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  )

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1>Hey, {firstName} 👋</h1>
        <p style={{ marginTop: 2 }}>
          {currentWeek?.label ?? 'Current week'} · Kingdom 305
        </p>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Row 1: Chest + Contributions ──────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>

          {/* Chest counter */}
          <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="metric-label">🏆 Chests</div>
              {chestDone
                ? <span className="badge green" style={{ fontSize: 10 }}>✓ Done</span>
                : myPts > 0
                  ? <span className="badge red" style={{ fontSize: 10 }}>-{fmt(ptsMissing)}</span>
                  : null
              }
            </div>
            <div className="metric-val" style={{ fontSize: 22, lineHeight: 1 }}>
              {myPts.toLocaleString()}
            </div>
            <div className="metric-sub">
              of {weeklyTarget.toLocaleString()} target
            </div>
            <div className="progress-wrap" style={{ marginTop: 4 }}>
              <div
                className={`progress-fill${chestDone ? ' green' : ''}`}
                style={{ width: `${myPct}%` }}
              />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {myPct}% complete
            </div>
            <Link
              to="/leaderboard"
              style={{ fontSize: 11, color: 'var(--primary-dark)', fontWeight: 600, marginTop: 4 }}
            >
              View leaderboard →
            </Link>
          </div>

          {/* Contributions counter */}
          <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="metric-label">⚔️ Contributions</div>
              {contribTarget > 0 && (contribDone
                ? <span className="badge green" style={{ fontSize: 10 }}>✓ Done</span>
                : myContribAmt > 0
                  ? <span className="badge red" style={{ fontSize: 10 }}>-{fmt(contribMissing)}</span>
                  : null
              )}
            </div>
            <div className="metric-val" style={{ fontSize: 22, lineHeight: 1, color: 'var(--text)' }}>
              {myContribAmt > 0 ? fmt(myContribAmt) : '—'}
            </div>
            <div className="metric-sub">
              {contribTarget > 0 ? `of ${fmt(contribTarget)} target` : 'No target set'}
            </div>
            {contribTarget > 0 && (
              <>
                <div className="progress-wrap" style={{ marginTop: 4 }}>
                  <div
                    className={`progress-fill${contribDone ? ' green' : ''}`}
                    style={{ width: `${contribPct}%`, background: 'var(--text-dim)' }}
                  />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {contribPct}% complete
                </div>
              </>
            )}
            {!contribTarget && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Set contribution_target in hot.cfg
              </div>
            )}
          </div>
        </div>

        {/* ── Events today ──────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px 10px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg3)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>📅 Upcoming events</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Reset: {resetTimeArgentina} Argentina</div>
            </div>
            <Link
              to="/events"
              style={{ fontSize: 11, color: 'var(--primary-dark)', fontWeight: 600 }}
            >
              Full schedule →
            </Link>
          </div>

          {eventsLoading && (
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
              Loading events from totalcalculator.org...
            </div>
          )}

          {!eventsLoading && eventsError && (
            <div style={{ padding: '12px 16px', color: 'var(--red)', fontSize: 12 }}>
              Could not load event schedule. Open full schedule.
            </div>
          )}

          {!eventsLoading && !eventsError && upcomingEvents.length === 0 && (
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
              No upcoming events returned by source.
            </div>
          )}

          {!eventsLoading && !eventsError && upcomingEvents.map((e, i) => (
            <div
              key={`${e.groupKey}-${e.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 16px',
                borderBottom: i < upcomingEvents.length - 1 ? '1px solid var(--border-dim)' : 'none',
                background: e.current ? 'var(--primary-bg)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {e.current && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--primary)', display: 'inline-block', flexShrink: 0,
                  }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: e.current ? 700 : 500,
                    color: e.current ? 'var(--primary-dark)' : 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {e.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {e.groupKey}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
                  color: e.current ? 'var(--primary-dark)' : 'var(--text-dim)',
                }}>
                  {formatTime(e.starts_at)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {formatCountdown(e.minutes_until)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Free daily gifts ──────────────────────────────────────────── */}
        <div className="card">
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12,
          }}>
            🎁 Daily free gifts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GIFT_LINKS.map(g => (
              <a
                key={g.label}
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg3)',
                  textDecoration: 'none',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = g.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: 20 }}>{g.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                  {g.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Open ↗</span>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
            Claim on all 3 platforms for maximum daily resources.
          </div>
        </div>

        {/* ── This week clan overview ────────────────────────────────────── */}
        {currentWeek && (
          <div className="card">
            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.05em', color: 'var(--text-muted)', marginBottom: 12,
            }}>
              🏰 Clan this week
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total points</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'Outfit, sans-serif' }}>
                  {currentWeek.total_points.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hit target</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', fontFamily: 'Outfit, sans-serif' }}>
                  {currentWeek.members.filter(m => m.met_target).length}
                  <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>
                    /{currentWeek.members.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Top 3 */}
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border-dim)', paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Top contributors</div>
              {currentWeek.members.slice(0, 3).map((m, i) => {
                const medals = ['🥇','🥈','🥉']
                const isSelf = m.name === member
                const pct = weeklyTarget > 0
                  ? Math.min(100, Math.round(m.points / weeklyTarget * 100))
                  : 0
                return (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{medals[i]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: isSelf ? 700 : 500,
                        color: isSelf ? 'var(--primary-dark)' : 'var(--text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.name}{isSelf ? ' (you)' : ''}
                      </div>
                      <div className="progress-wrap" style={{ height: 3, marginTop: 3 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)', flexShrink: 0 }}>
                      {m.points.toLocaleString()}
                    </span>
                  </div>
                )
              })}
              <Link
                to="/leaderboard"
                style={{ fontSize: 11, color: 'var(--primary-dark)', fontWeight: 600 }}
              >
                Full leaderboard →
              </Link>
            </div>
          </div>
        )}

        {generated && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            Last synced: {generated}
          </p>
        )}

      </div>
    </div>
  )
}