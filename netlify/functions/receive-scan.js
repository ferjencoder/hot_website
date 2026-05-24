/**
 * netlify/functions/receive-scan.js
 *
 * Receives intercepted chest / member data from the HOT Clan Chrome extension.
 * JWT-gated — same token the member uses to log into the website.
 *
 * POST body (JSON):
 *   {
 *     type:        'chests' | 'members',
 *     url:         string,   // original game URL (for debugging)
 *     capturedAt:  ISO string,
 *     rows: [
 *       // chests:  { from, source, datetime }
 *       // members: { name, might, rank, level }
 *     ]
 *   }
 *
 * Storage: Netlify Blobs (built-in KV store).
 * The get-data function already reads chest_data.json from private/data/.
 * This function writes accumulated data into Blobs so the website stays
 * up to date even without running sync_website.py.
 *
 * Blob keys:
 *   chest-rows          → raw captured rows (array, newest-first, max 10 000)
 *   member-scan-latest  → latest member snapshot
 *   scan-stats          → counters / last-updated timestamps
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { getStore }                    from '@netlify/blobs'

const SECRET = process.env.JWT_SECRET || 'dev-secret-please-set-JWT_SECRET-in-netlify'

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
}

// ── JWT verification (same as get-data.js) ────────────────────────────────────
function b64urlDecode (str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Buffer.from(str, 'base64').toString('utf8')
}

function verifyJWT (token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, payload, sig] = parts
  const expected = createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  try {
    const pad = s => s + '='.repeat((4 - s.length % 4) % 4)
    const a = Buffer.from(pad(sig),      'base64')
    const b = Buffer.from(pad(expected), 'base64')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch { return null }
  try {
    const data = JSON.parse(b64urlDecode(payload))
    if (data.exp < Math.floor(Date.now() / 1000)) return null
    return data
  } catch { return null }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function handler (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'POST only' }) }
  }

  // Auth
  const auth   = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token  = auth.startsWith('Bearer ') ? auth.slice(7) : null
  const claims = verifyJWT(token)
  if (!claims) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  // Parse body
  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { type, rows, capturedAt, url } = body

  if (!type || !Array.isArray(rows) || rows.length === 0) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'type and rows required' }) }
  }

  try {
    if (type === 'chests') {
      await storeChestRows(rows, capturedAt, claims.name)
    } else if (type === 'members') {
      await storeMemberSnapshot(rows, capturedAt, claims.name)
    } else {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: `Unknown type: ${type}` }) }
    }

    console.log(`[receive-scan] ${claims.name} → ${type}: ${rows.length} rows from ${url || '?'}`)

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        ok:          true,
        type,
        rowsStored:  rows.length,
        capturedBy:  claims.name,
      }),
    }
  } catch (err) {
    console.error('[receive-scan] error:', err)
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message || 'Storage error' }),
    }
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────────

const MAX_ROWS = 10_000

async function storeChestRows (newRows, capturedAt, capturedBy) {
  const store = getStore('hot-clan-scans')

  // Load existing rows
  let existing = []
  try {
    const raw = await store.get('chest-rows', { type: 'json' })
    if (Array.isArray(raw)) existing = raw
  } catch { /* first run */ }

  // Stamp each new row with who captured it
  const stamped = newRows.map(r => ({ ...r, _capturedBy: capturedBy, _capturedAt: capturedAt }))

  // Prepend new rows, deduplicate by (from + source + datetime), cap at MAX_ROWS
  const combined = [...stamped, ...existing]
  const seen     = new Set()
  const deduped  = combined.filter(r => {
    const key = `${r.from}|${r.source}|${r.datetime}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, MAX_ROWS)

  await store.set('chest-rows', JSON.stringify(deduped))

  // Update stats
  await updateStats('chests', newRows.length, capturedAt)
}

async function storeMemberSnapshot (rows, capturedAt, capturedBy) {
  const store = getStore('hot-clan-scans')
  await store.set('member-scan-latest', JSON.stringify({ rows, capturedAt, capturedBy }))
  await updateStats('members', rows.length, capturedAt)
}

async function updateStats (type, count, capturedAt) {
  const store = getStore('hot-clan-scans')
  let stats   = {}
  try {
    stats = await store.get('scan-stats', { type: 'json' }) || {}
  } catch { /* first run */ }

  stats[type] = {
    lastUpdate: capturedAt || new Date().toISOString(),
    lastCount:  count,
    totalRuns:  (stats[type]?.totalRuns || 0) + 1,
  }
  await store.set('scan-stats', JSON.stringify(stats))
}