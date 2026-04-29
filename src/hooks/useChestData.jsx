import { useState, useEffect } from 'react'

export function useChestData() {
  const [raw, setRaw]             = useState(null)
  const [weekIndex, setWeekIndex] = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    fetch('/data/chest_data.json')
      .then(r => {
        if (!r.ok) throw new Error('not_found')
        const ct = r.headers.get('content-type') || ''
        if (!ct.includes('json')) throw new Error('not_found')
        return r.json()
      })
      .then(data => { setRaw(data); setLoading(false) })
      .catch(e => {
        const msg = e.message === 'not_found'
          ? 'not_found'
          : e.message
        setError(msg)
        setLoading(false)
      })
  }, [])

  const weeks        = raw?.weeks         || []
  const chestColumns = raw?.chest_columns || []
  const scoring      = raw?.scoring       || {}
  const weeklyTarget = raw?.weekly_target || 1000
  const currentWeek  = weeks[weekIndex]   || null

  return {
    weeks, chestColumns, scoring, weeklyTarget,
    weekIndex, setWeekIndex,
    currentWeek,
    loading, error,
    generated: raw?.generated || null,
  }
}