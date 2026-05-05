import { useState, useEffect } from 'react'
import Papa from 'papaparse'

// Maps raw CSV `source` values → scoring JSON keys
function normalizeSource(raw) {
  if (!raw) return ''
  const s = raw.trim().replace(/}$/, '') // strip trailing typo "}"

  // Direct matches
  if (s === 'Bank') return 'Bank'

  // "Level 5 Crypt", "Level 10 rare Crypt", "Level 15 epic Crypt" etc. → "L5 Crypt" etc.
  const levelMatch = s.match(/^Level (\d+)\s+(.+)$/)
  if (levelMatch) return `L${levelMatch[1]} ${levelMatch[2]}`

  // "Level X-Y Vault of the Ancients" and "Rise of the Ancients event" → "Ancients vaults"
  if (/Vault of the Ancients/i.test(s) || /Rise of the Ancients/i.test(s)) return 'Ancients vaults'

  // "Epic Ancient squad" → "Epic Monster Chests"
  if (/Epic Ancient/i.test(s)) return 'Epic Monster Chests'

  // Ragnarok / Olympus
  if (/Ragnar/i.test(s)) return 'Ragnarok Chests'
  if (/Olympus/i.test(s)) return 'Olympus Chests'

  // Arena, Clan wealth, Story, tournaments, etc. → kept as-is (will score 0)
  return s
}

export function useData() {
  const [data, setData] = useState({ roster: [], gifts: [], scoring: {}, config: null, loading: true })

  useEffect(() => {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

    Promise.all([
      fetch('/data/config.json').then(r => r.json()),
      fetch('/data/chest_scoring.json').then(r => r.json()),
      fetch('/data/HOT_Roster.json').then(r => r.json()).catch(() => ({ members: {} })),
      fetch(`/data/chests_${month}.csv`).then(r => r.text()).catch(() => ''),  // ← FIXED: was gifts_
    ]).then(([config, scoringData, rosterJson, giftsCSV]) => {
      const roster = Object.entries(rosterJson.members || {})
        .filter(([, m]) => m.status === 'active')
        .map(([name, m]) => ({ name, ...m }))

      let gifts = []
      if (giftsCSV) {
        const parsed = Papa.parse(giftsCSV, { header: true, skipEmptyLines: true })
        gifts = parsed.data
          .filter(row => row.from && row.from !== 'from')
          .map(row => ({ ...row, source: normalizeSource(row.source) }))
      }

      setData({ roster, gifts, scoring: scoringData.scoring, categories: scoringData.categories, config, loading: false })
    }).catch(err => {
      console.error('Data load error:', err)
      setData(d => ({ ...d, loading: false }))
    })
  }, [])

  return data
}

export function calcPoints(gifts, scoring) {
  const byMember = {}
  gifts.forEach(row => {
    const name = row.from || row.from_player || ''
    if (!name) return
    if (!byMember[name]) byMember[name] = { points: 0, chests: 0, breakdown: {} }
    const src = row.source || ''
    const pts = scoring[src] ?? 0
    byMember[name].points += pts
    byMember[name].chests += 1
    byMember[name].breakdown[src] = (byMember[name].breakdown[src] || 0) + 1
  })
  return byMember
}