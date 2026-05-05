import { useState, useEffect } from 'react'

// Mini events from totalcalculator.org — server runs on UTC
// These repeat on a 6-day (game week) cycle, times are UTC hours
const MINI_EVENTS = [
  { name: 'Gold Rush',             utcHour: 0,  day: 0 },
  { name: 'Castle Development',    utcHour: 5,  day: 0 },
  { name: 'The Quest for Chests',  utcHour: 8,  day: 0 },
  { name: 'The King\'s Mercy',     utcHour: 10, day: 0 },
  { name: 'Scientific Progress',   utcHour: 12, day: 0 },
  { name: 'Officer Academy',       utcHour: 14, day: 0 },
  { name: 'Battle Training',       utcHour: 19, day: 0 },
  { name: 'Power Points',          utcHour: 0,  day: 1 },
  { name: 'Tar Mastery',           utcHour: 3,  day: 1 },
  { name: 'Silver Rush',           utcHour: 8,  day: 1 },
  { name: 'Wargames',              utcHour: 11, day: 1 },
  { name: 'War Tools',             utcHour: 16, day: 1 },
  { name: 'Hammer and Anvil',      utcHour: 1,  day: 2 },
  { name: 'Crypt Raiders',         utcHour: 13, day: 2 },
  { name: 'Blessing of the Gods',  utcHour: 6,  day: 3 },
  { name: 'Capital Challenge',     utcHour: 11, day: 3 },
  { name: 'Beastslayer',           utcHour: 1,  day: 4 },
  { name: 'Regular Decrees',       utcHour: 10, day: 4 },
  { name: 'Call of Duty',          utcHour: 13, day: 4 },
]

// Country → IANA timezone (common Total Battle player countries)
const TIMEZONES = [
  { label: '🌍 UTC (Server time)',        tz: 'UTC' },
  { label: '🇬🇧 United Kingdom',          tz: 'Europe/London' },
  { label: '🇫🇷 France / Germany / Spain', tz: 'Europe/Paris' },
  { label: '🇷🇴 Romania / Bulgaria',      tz: 'Europe/Bucharest' },
  { label: '🇷🇺 Moscow',                  tz: 'Europe/Moscow' },
  { label: '🇹🇷 Turkey',                  tz: 'Europe/Istanbul' },
  { label: '🇦🇪 UAE / Dubai',             tz: 'Asia/Dubai' },
  { label: '🇮🇳 India',                   tz: 'Asia/Kolkata' },
  { label: '🇸🇬 Singapore / Malaysia',    tz: 'Asia/Singapore' },
  { label: '🇦🇺 Australia (Sydney)',       tz: 'Australia/Sydney' },
  { label: '🇧🇷 Brazil',                  tz: 'America/Sao_Paulo' },
  { label: '🇦🇷 Argentina',               tz: 'America/Argentina/Buenos_Aires' },  // ← duplicate removed
  { label: '🇺🇸 US Eastern',              tz: 'America/New_York' },
  { label: '🇺🇸 US Central',              tz: 'America/Chicago' },
  { label: '🇺🇸 US Pacific',              tz: 'America/Los_Angeles' },
  { label: '🇨🇦 Canada (Toronto)',         tz: 'America/Toronto' },
  { label: '🇿🇦 South Africa',            tz: 'Africa/Johannesburg' },
]

function formatInTz(utcHour, day, tz) {
  // Use today as base, set to next Monday as cycle start (approximate)
  const now = new Date()
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  base.setUTCDate(base.getUTCDate() + day)
  base.setUTCHours(utcHour, 0, 0, 0)

  try {
    return base.toLocaleTimeString('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return `${String(utcHour).padStart(2,'0')}:00 UTC`
  }
}

function getOffset(tz) {
  try {
    const now = new Date()
    const local = new Date(now.toLocaleString('en-US', { timeZone: tz }))
    const utc   = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const diff  = (local - utc) / 3600000
    const sign  = diff >= 0 ? '+' : '-'
    const abs   = Math.abs(diff)
    const h     = Math.floor(abs)
    const m     = Math.round((abs - h) * 60)
    return `UTC${sign}${h}${m ? ':' + String(m).padStart(2,'0') : ''}`
  } catch {
    return 'UTC'
  }
}

const DAY_NAMES = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5']

export function Events() {
  const [tz, setTz] = useState('UTC')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const utcTime = now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false })
  const localTime = now.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
  const offset = getOffset(tz)

  const byDay = DAY_NAMES.map((_, d) => MINI_EVENTS.filter(e => e.day === d))

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Events</h1>
          <p>Mini event schedule with local time conversion</p>
        </div>
        <a
          href="https://totalcalculator.org/events.php"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ fontWeight: 700, fontSize: 13 }}
        >
          ↗ Full schedule
        </a>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Timezone selector */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>
            Your timezone
          </div>
          <select value={tz} onChange={e => setTz(e.target.value)}>
            {TIMEZONES.map(t => (
              <option key={t.tz} value={t.tz}>{t.label}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Server (UTC): <strong style={{ color: 'var(--text)' }}>{utcTime}</strong>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Your time ({offset}): <strong style={{ color: 'var(--primary-dark)' }}>{localTime}</strong>
            </span>
          </div>
        </div>

        {/* Event tables per day */}
        {byDay.map((events, d) => events.length === 0 ? null : (
          <div key={d} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '12px 16px', background: 'var(--bg3)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                background: 'var(--primary)', color: '#000',
                padding: '2px 10px', borderRadius: 99,
                fontSize: 11, fontWeight: 700,
              }}>
                {DAY_NAMES[d]}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                of game week (6-day cycle)
              </span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th style={{ textAlign: 'right' }}>Server (UTC)</th>
                  <th style={{ textAlign: 'right' }}>Your time</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.name}>
                    <td style={{ fontWeight: 500 }}>{e.name}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-dim)' }}>
                      {String(e.utcHour).padStart(2,'0')}:00
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)' }}>
                      {formatInTz(e.utcHour, 0, tz)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      </div>
    </div>
  )
}