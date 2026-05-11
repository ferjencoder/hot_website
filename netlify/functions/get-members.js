import { readFileSync } from 'fs'
import { join } from 'path'

// Returns only member names — no hashes, no salts.
// Used by Login dropdown. No auth required.

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }

  try {
    const path = join(process.cwd(), 'private', 'data', 'auth_members.json')
    const authData = JSON.parse(readFileSync(path, 'utf8'))
    const names = Object.keys(authData?.members || {}).sort((a, b) => a.localeCompare(b))
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ names }),
    }
  } catch (err) {
    console.error('[get-members] error:', err.message)
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Could not load member list' }),
    }
  }
}