import { useState, useEffect } from 'react'
import Papa from 'papaparse'

export function useData() {
  const [data, setData] = useState({ roster: [], gifts: [], scoring: {}, config: null, loading: true })

  useEffect(() => {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

    Promise.all([
      fetch('/data/config.json').then(r => r.json()),
      fetch('/data/chest_scoring.json').then(r => r.json()),
      fetch('/data/HOT_Roster.json').then(r => r.json()).catch(() => ({ members: {} })),
      fetch(`/data/gifts_${month}.csv`).then(r => r.text()).catch(() => ''),
    ]).then(([config, scoringData, rosterJson, giftsCSV]) => {
      const roster = Object.entries(rosterJson.members || {})
        .filter(([, m]) => m.status === 'active')
        .map(([name, m]) => ({ name, ...m }))

      let gifts = []
      if (giftsCSV) {
        const parsed = Papa.parse(giftsCSV, { header: true, skipEmptyLines: true })
        gifts = parsed.data
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
