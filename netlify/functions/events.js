const SOURCE_URL = 'https://totalcalculator.org/events.php'
const RESET_TIME_ARGENTINA = '14:00'

const GROUPS = [
  { key: 'monthly', label: 'Monthly events', marker: 'Monthly events' },
  { key: 'biweekly', label: 'Biweekly events', marker: 'Biweekly events' },
  { key: 'weekly', label: 'Weekly events', marker: 'Weekly events' },
  { key: 'mini', label: 'Mini events', marker: 'Mini events' },
]

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDuration(text) {
  const clean = String(text || '').trim()
  const dayMatch = clean.match(/(\d+)\s*days?/) 
  const hourMatch = clean.match(/(\d+)\s*h/)
  const minMatch = clean.match(/(\d+)\s*m/)

  const days = dayMatch ? Number(dayMatch[1]) : 0
  const hours = hourMatch ? Number(hourMatch[1]) : 0
  const minutes = minMatch ? Number(minMatch[1]) : 0

  return days * 1440 + hours * 60 + minutes
}

function parseEventsFromSection(section) {
  const events = []
  const currentMatches = [...section.matchAll(/CURRENT:\s*([^=]+?)(?=(?:\s{2,}|$))/g)]
    .map(m => m[1].trim())

  const withoutCurrent = section.replace(/CURRENT:\s*[^=]+?(?=(?:\s{2,}|$))/g, ' ')

  const re = /(.+?)\s+((?:\d+\s+days?\s*)?\d+h\d+m)/g
  let match
  while ((match = re.exec(withoutCurrent)) !== null) {
    const name = match[1]
      .replace(/=+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const remaining = match[2].replace(/\s+/g, ' ').trim()
    if (!name || name.length > 80) continue
    events.push({
      name,
      remaining,
      minutes_until: parseDuration(remaining),
      current: false,
    })
  }

  for (const currentName of currentMatches) {
    const existing = events.find(e => e.name.toLowerCase() === currentName.toLowerCase())
    if (existing) existing.current = true
    else events.unshift({ name: currentName, remaining: 'now', minutes_until: 0, current: true })
  }

  return events
}

function getSection(text, marker, nextMarkers) {
  const start = text.indexOf(marker)
  if (start < 0) return ''
  const afterStart = start + marker.length
  const next = nextMarkers
    .map(m => text.indexOf(m, afterStart))
    .filter(i => i >= 0)
    .sort((a, b) => a - b)[0]

  return text.slice(afterStart, next || text.length)
}

function parseSchedule(html) {
  const text = stripHtml(html)
  const now = new Date()

  const groups = {}
  const meta = {}

  GROUPS.forEach((group, idx) => {
    const nextMarkers = GROUPS.slice(idx + 1).map(g => g.marker).concat(['Note that'])
    const section = getSection(text, group.marker, nextMarkers)
    groups[group.key] = parseEventsFromSection(section)
      .map(event => ({
        ...event,
        starts_at: new Date(now.getTime() + event.minutes_until * 60000).toISOString(),
      }))
      .sort((a, b) => a.minutes_until - b.minutes_until)
    meta[group.key] = group.label
  })

  return { groups, labels: meta }
}

export async function handler() {
  try {
    const response = await fetch(SOURCE_URL, {
      headers: {
        'user-agent': 'HOT-Clan-Website/1.0 (+Netlify Function)',
        'accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: `Source returned ${response.status}` }),
      }
    }

    const html = await response.text()
    const parsed = parseSchedule(html)

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300, s-maxage=300',
      },
      body: JSON.stringify({
        source_url: SOURCE_URL,
        fetched_at: new Date().toISOString(),
        reset_time_argentina: RESET_TIME_ARGENTINA,
        note: 'Total Battle schedule predictions. A game week is 6 days and a game month is 24 days.',
        ...parsed,
      }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Could not fetch event schedule' }),
    }
  }
}
