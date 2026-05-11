import { useEffect, useMemo, useState } from 'react'

const ARG_TZ = 'America/Argentina/Buenos_Aires'
const SERVER_RESET_ARGENTINA = '14:00'

function fetchJson(url) {
  return fetch(url, { cache: 'no-store' }).then(async r => {
    if (!r.ok) throw new Error(`${url}: ${r.status}`)
    return r.json()
  })
}

function fmtDateTime(iso, tz = ARG_TZ) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    timeZone: tz,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function fmtTime(iso, tz = ARG_TZ) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function fmtCountdown(minutes) {
  if (!Number.isFinite(minutes)) return '—'
  if (minutes <= 0) return 'now'

  const d = Math.floor(minutes / 1440)
  const h = Math.floor((minutes % 1440) / 60)
  const m = minutes % 60

  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function useEventsData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    const load = () => {
      fetchJson('/.netlify/functions/events')
        .then(json => {
          if (!alive) return
          setData(json)
          setError(null)
          setLoading(false)
        })
        .catch(err => {
          if (!alive) return
          setError(err.message || 'Could not load events')
          setLoading(false)
        })
    }

    load()
    const t = setInterval(load, 5 * 60 * 1000)

    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])

  const groups = data?.groups || {}

  const upcoming = useMemo(() => {
    return Object.entries(groups)
      .flatMap(([groupKey, events]) => (events || []).map(e => ({ ...e, groupKey })))
      .filter(e => Number.isFinite(e.minutes_until))
      .sort((a, b) => a.minutes_until - b.minutes_until)
  }, [groups])

  return {
    data,
    groups,
    upcoming,
    loading,
    error,
    sourceUrl: data?.source_url || 'https://totalcalculator.org/events.php',
    fetchedAt: data?.fetched_at || null,
    resetTimeArgentina: data?.reset_time_argentina || SERVER_RESET_ARGENTINA,
    formatDateTime: fmtDateTime,
    formatTime: fmtTime,
    formatCountdown: fmtCountdown,
  }
}
