import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

const SECRET = process.env.JWT_SECRET || 'dev-secret-please-set-JWT_SECRET-in-netlify'

function b64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function makeJWT(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body   = b64url(JSON.stringify(payload))
  const sig    = createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return `${header}.${body}.${sig}`
}

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let name, pin
  try {
    ;({ name, pin } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid request' }) }
  }

  if (!name || !pin) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Name and PIN required' }) }
  }

  // Load auth data — bundled via netlify.toml included_files
  let authData
  try {
    const path = join(process.cwd(), 'private', 'data', 'auth_members.json')
    authData = JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    console.error('[login] Failed to load auth data:', err.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Auth service unavailable' }) }
  }

  const record = authData?.members?.[name]

  // Always hash even if member not found — prevents timing-based enumeration
  const hashInput = record
    ? `${record.salt}:${name}:${pin}`
    : `dummy-salt:${name}:${pin}`

  const computed = createHash('sha256').update(hashInput).digest('hex')

  if (!record?.hash) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Invalid credentials' }) }
  }

  let match = false
  try {
    const a = Buffer.from(computed,    'hex')
    const b = Buffer.from(record.hash, 'hex')
    match = a.length === b.length && timingSafeEqual(a, b)
  } catch {
    match = false
  }

  if (!match) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Invalid credentials' }) }
  }

  // Issue JWT — valid 7 days
  const now   = Math.floor(Date.now() / 1000)
  const token = makeJWT({ name, iat: now, exp: now + 7 * 24 * 60 * 60 })

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ token, name }),
  }
}