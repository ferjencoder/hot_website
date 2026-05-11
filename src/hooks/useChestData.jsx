import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth.jsx'

function normalizeWeekIndex(index, length) {
  if (!Number.isInteger(index) || index < 0) return 0
  if (length <= 0) return 0
  return Math.min(index, length - 1)
}

export function useChestData() {
  const { token } = useAuth()
  const [raw,            setRaw]            = useState(null)
  const [weekIndex,      setWeekIndexState] = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)

  useEffect(() => {
    if (!token) return
    let alive = true

    fetch('/.netlify/functions/get-data?type=chest', {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (!alive) return
        if (!Array.isArray(data?.weeks)) throw new Error('Invalid chest data: missing weeks array')
        setRaw(data)
        setError(null)
      })
      .catch(err => {
        console.error('[useChestData] load error:', err)
        if (alive) setError(err.message || 'Chest data load failed')
      })
      .finally(() => { if (alive) setLoading(false) })

    return () => { alive = false }
  }, [token])

  const weeks          = raw?.weeks || []
  const safeWeekIndex  = normalizeWeekIndex(weekIndex, weeks.length)

  useEffect(() => {
    if (safeWeekIndex !== weekIndex) setWeekIndexState(safeWeekIndex)
  }, [safeWeekIndex, weekIndex])

  const contributions = raw?.contributions || null

  const value = useMemo(() => ({
    weeks,
    chestColumns:       raw?.chest_columns || [],
    scoring:            raw?.scoring       || {},
    weeklyTarget:       raw?.weekly_target || 1000,
    weekIndex:          safeWeekIndex,
    setWeekIndex:       v => setWeekIndexState(normalizeWeekIndex(Number(v), weeks.length)),
    currentWeek:        weeks[safeWeekIndex] || null,
    contributions,
    contribTarget:      raw?.contribution_target || 0,
    currentContribWeek: contributions?.weeks?.[safeWeekIndex] || null,
    loading,
    error,
    generated:          raw?.generated || null,
  }), [raw, weeks, safeWeekIndex, contributions, loading, error])

  return value
}