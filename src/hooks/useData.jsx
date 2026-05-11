import { useEffect, useState } from 'react'
import { useAuth } from './useAuth.jsx'

function normalizeSource(raw) {
  if (!raw) return ''
  const s = String(raw).trim().replace(/}$/, '')
  if (s === 'Bank') return 'Bank'
  const levelMatch = s.match(/^Level (\d+)\s+(.+)$/)
  if (levelMatch) return `L${levelMatch[1]} ${levelMatch[2]}`
  if (/Vault of the Ancients/i.test(s) || /Rise of the Ancients/i.test(s)) return 'Ancients vaults'
  if (/Epic Ancient/i.test(s))  return 'Epic Monster Chests'
  if (/Ragnar/i.test(s))        return 'Ragnarok Chests'
  if (/Olympus/i.test(s))       return 'Olympus Chests'
  return s
}

async function apiFetch(path, token) {
  const res = await fetch(`/.netlify/functions/get-data?type=${path}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

function rosterToArray(rosterJson) {
  return Object.entries(rosterJson?.members || {})
    .filter(([, m]) => m?.status === 'active')
    .map(([name, m]) => ({ name, ...m }))
}

export function useData() {
  const { token } = useAuth()

  const [data, setData] = useState({
    roster: [], gifts: [], scoring: {}, categories: {}, config: null,
    loading: true, error: null, warnings: [],
  })

  useEffect(() => {
    if (!token) return
    let alive = true

    async function load() {
      try {
        const [config, scoringData, rosterJson] = await Promise.all([
          apiFetch('config',  token).catch(() => ({ weekly_target: 1000, clan_name: 'HOT', kingdom: 'K:305' })),
          apiFetch('scoring', token),
          apiFetch('roster',  token).catch(() => ({ members: {} })),
        ])

        if (!alive) return
        setData({
          roster:     rosterToArray(rosterJson),
          gifts:      [],
          scoring:    scoringData?.scoring    || {},
          categories: scoringData?.categories || {},
          config,
          loading: false,
          error:   null,
          warnings: [],
        })
      } catch (err) {
        console.error('[useData] load error:', err)
        if (!alive) return
        setData(prev => ({ ...prev, loading: false, error: err.message || 'Data load failed' }))
      }
    }

    load()
    return () => { alive = false }
  }, [token])

  return data
}

export function calcPoints(gifts, scoring) {
  const byMember = {}
  gifts.forEach(row => {
    const name = row.from || row.from_player || ''
    if (!name) return
    if (!byMember[name]) byMember[name] = { points: 0, chests: 0, breakdown: {} }
    const src = normalizeSource(row.source || '')
    const pts = scoring?.[src] ?? 0
    byMember[name].points += pts
    byMember[name].chests += 1
    byMember[name].breakdown[src] = (byMember[name].breakdown[src] || 0) + 1
  })
  return byMember
}