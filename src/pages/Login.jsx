import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [members,    setMembers]    = useState([])
  const [name,       setName]       = useState('')
  const [pin,        setPin]        = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  // Load member names for the dropdown (names only — no hashes)
  useEffect(() => {
    let alive = true
    fetch('/.netlify/functions/get-members', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { if (alive) setMembers(data.names || []) })
      .catch(err => {
        console.error('[Login] get-members failed:', err)
        if (alive) setError('Could not load member list. Contact leadership.')
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name) { setError('Please select your name'); return }
    if (!pin)  { setError('Please enter your PIN');   return }

    setSubmitting(true)
    try {
      const res  = await fetch('/.netlify/functions/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed. Ask Chili Peppers if you forgot your PIN.')
        return
      }

      login(data.name, data.token)
      nav('/', { replace: true })
    } catch (err) {
      console.error('[Login] submit error:', err)
      setError('Login failed — please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="https://res.cloudinary.com/ferjen/image/upload/q_auto/f_auto/v1776433276/TB/logo/HOT_HookedOnTB.png"
            alt="HOT Clan"
            style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
          />
          <h1 style={{ fontSize: 26, fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            HOT Clan
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Kingdom 305 · Member portal</p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
                Your name
              </label>
              <select value={name} onChange={e => { setName(e.target.value); setError('') }}
                disabled={loading || submitting}>
                <option value="">{loading ? 'Loading members...' : 'Select member...'}</option>
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
                PIN
              </label>
              <input
                type="password" inputMode="numeric" autoComplete="current-password"
                value={pin} onChange={e => { setPin(e.target.value.trim()); setError('') }}
                placeholder="Enter your PIN" maxLength={12}
                disabled={loading || submitting}
              />
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: '#991b1b', padding: '10px 12px',
                background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius)',
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn primary"
              disabled={loading || submitting}
              style={{ justifyContent: 'center', padding: '12px 20px', marginTop: 4, fontSize: 15 }}>
              {submitting ? 'Checking...' : 'Enter the clan'}
            </button>
          </form>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Don't know your PIN? Ask{' '}
              <span style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Chili Peppers</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}