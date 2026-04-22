import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [config, setConfig] = useState(null)
  const { login } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    fetch('/data/config.json').then(r => r.json()).then(c => {
      setConfig(c)
      setMembers(Object.keys(c.members).sort())
    })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!name) { setError('Please select your name'); return }
    if (!config?.members[name]) { setError('Member not found'); return }
    if (config.members[name] !== pin) { setError('Incorrect PIN — ask Chili Peppers if you forgot'); return }
    login(name)
    nav('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'var(--primary)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            HOT Clan
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Kingdom 305 · Member portal</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
                Your name
              </label>
              <select value={name} onChange={e => { setName(e.target.value); setError('') }}>
                <option value="">Select member...</option>
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                placeholder="Enter your PIN"
                maxLength={8}
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

            <button type="submit" className="btn primary" style={{ justifyContent: 'center', padding: '12px 20px', marginTop: 4, fontSize: 15 }}>
              Enter the clan
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
