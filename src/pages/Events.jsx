import { useState } from 'react'
import { useEventsData } from '../hooks/useEventsData.jsx'

const GROUP_ORDER = [
  { key: 'monthly', title: 'Monthly events', note: 'Game month cycle - 24 days' },
  { key: 'biweekly', title: 'Biweekly events', note: 'Two-week event cycle' },
  { key: 'weekly', title: 'Weekly events', note: 'Game week cycle - 6 days' },
  { key: 'mini', title: 'Mini events', note: 'Short recurring events' },
]

const TIMEZONES = [
  { label: '🇦🇷 Argentina - reset 14:00', tz: 'America/Argentina/Buenos_Aires' },
  { label: '🌍 UTC / Server', tz: 'UTC' },
  { label: '🇬🇧 United Kingdom', tz: 'Europe/London' },
  { label: '🇫🇷 France / Germany / Spain', tz: 'Europe/Paris' },
  { label: '🇷🇴 Romania / Bulgaria', tz: 'Europe/Bucharest' },
  { label: '🇷🇺 Moscow', tz: 'Europe/Moscow' },
  { label: '🇹🇷 Turkey', tz: 'Europe/Istanbul' },
  { label: '🇦🇪 UAE / Dubai', tz: 'Asia/Dubai' },
  { label: '🇮🇳 India', tz: 'Asia/Kolkata' },
  { label: '🇸🇬 Singapore / Malaysia', tz: 'Asia/Singapore' },
  { label: '🇦🇺 Australia - Sydney', tz: 'Australia/Sydney' },
  { label: '🇧🇷 Brazil', tz: 'America/Sao_Paulo' },
  { label: '🇺🇸 US Eastern', tz: 'America/New_York' },
  { label: '🇺🇸 US Central', tz: 'America/Chicago' },
  { label: '🇺🇸 US Pacific', tz: 'America/Los_Angeles' },
  { label: '🇨🇦 Canada - Toronto', tz: 'America/Toronto' },
  { label: '🇿🇦 South Africa', tz: 'Africa/Johannesburg' },
]

function formatNow(tz) {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatFetched(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function Events() {
  const [tz, setTz] = useState('America/Argentina/Buenos_Aires')
  const {
    groups,
    loading,
    error,
    sourceUrl,
    fetchedAt,
    resetTimeArgentina,
    formatDateTime,
    formatCountdown,
  } = useEventsData()

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Events</h1>
          <p>Schedule pulled from totalcalculator.org</p>
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ fontWeight: 700, fontSize: 13 }}
        >
          Source ↗
        </a>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>
            Time settings
          </div>
          <select value={tz} onChange={e => setTz(e.target.value)}>
            {TIMEZONES.map(t => (
              <option key={t.tz} value={t.tz}>{t.label}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Selected time: <strong style={{ color: 'var(--primary-dark)' }}>{formatNow(tz)}</strong>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Game reset in Argentina: <strong style={{ color: 'var(--text)' }}>{resetTimeArgentina}</strong>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Last fetched: <strong style={{ color: 'var(--text)' }}>{formatFetched(fetchedAt)}</strong>
            </span>
          </div>
        </div>

        {loading && (
          <div className="card" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            Loading event schedule...
          </div>
        )}

        {!loading && error && (
          <div className="card" style={{ color: 'var(--red)', textAlign: 'center' }}>
            Could not load totalcalculator.org through the Netlify function.<br />
            Open the source link above or run the site with Netlify, not plain Vite preview.
          </div>
        )}

        {!loading && !error && GROUP_ORDER.map(group => {
          const events = groups[group.key] || []
          return (
            <div key={group.key} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '12px 16px', background: 'var(--bg3)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{group.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{group.note}</div>
                </div>
                <span style={{
                  background: 'var(--primary-bg)', color: 'var(--primary-dark)',
                  padding: '2px 10px', borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                }}>
                  {events.length}
                </span>
              </div>

              {events.length === 0 ? (
                <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>
                  No events returned for this group.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th style={{ textAlign: 'right' }}>Starts</th>
                      <th style={{ textAlign: 'right' }}>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(e => (
                      <tr key={`${group.key}-${e.name}`} style={{ background: e.current ? 'var(--primary-bg)' : undefined }}>
                        <td style={{ fontWeight: e.current ? 800 : 500 }}>
                          {e.current ? '● ' : ''}{e.name}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                          {formatDateTime(e.starts_at, tz)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: e.current ? 'var(--primary-dark)' : 'var(--text)' }}>
                          {formatCountdown(e.minutes_until)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
