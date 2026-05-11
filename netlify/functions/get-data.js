import { createHmac, timingSafeEqual } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

const SECRET = process.env.JWT_SECRET || 'dev-secret-please-set-JWT_SECRET-in-netlify'

// ── JWT verify ────────────────────────────────────────────────
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Buffer.from(str, 'base64').toString('utf8')
}

function verifyJWT(token) {
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
  } catch {
    return null
  }

  try {
    const data = JSON.parse(b64urlDecode(payload))
    if (data.exp < Math.floor(Date.now() / 1000)) return null
    return data
  } catch {
    return null
  }
}

// ── Allowed data types → filenames ────────────────────────────
const ALLOWED = {
  roster:  'HOT_Roster.json',
  config:  'config.json',
  scoring: 'chest_scoring.json',
  chest:   'chest_data.json',
}

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }

  // Verify JWT from Authorization: Bearer <token>
  const auth  = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  const claims = verifyJWT(token)

  if (!claims) {
    return {
      statusCode: 401,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Unauthorized — please log in again' }),
    }
  }

  const type     = event.queryStringParameters?.type
  const filename = ALLOWED[type]

  if (!filename) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: `Invalid type. Valid: ${Object.keys(ALLOWED).join(', ')}` }),
    }
  }

  try {
    const path = join(process.cwd(), 'private', 'data', filename)
    const body = readFileSync(path, 'utf8')
    return { statusCode: 200, headers: HEADERS, body }
  } catch (err) {
    console.error(`[get-data] ${type} → ${filename} failed:`, err.message)
    return {
      statusCode: 404,
      headers: HEADERS,
      body: JSON.stringify({ error: `${type} data not available yet` }),
    }
  }
}