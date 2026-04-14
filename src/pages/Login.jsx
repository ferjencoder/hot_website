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
    if (!name) { setError('Select your name'); return }
    if (!config?.members[name]) { setError('Member not found'); return }
    if (config.members[name] !== pin) { setError('Incorrect PIN'); return }
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
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(200,168,75,0.05) 0%, transparent 70%)',
    }}>
      <div style={{ width: 360, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '1.5px solid var(--gold-dim)',
            background: 'var(--bg2)',
            margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, marginBottom: 6, color: 'var(--gold)' }}>HOT Clan</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Kingdom 305 · Member portal</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', fontFamily: 'Cinzel, serif', marginBottom: 6 }}>
                Your name
              </label>
              <select value={name} onChange={e => { setName(e.target.value); setError('') }}>
                <option value="">Select member...</option>
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', fontFamily: 'Cinzel, serif', marginBottom: 6 }}>
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
              <div style={{ fontSize: 12, color: '#ef5350', padding: '8px 12px', background: 'rgba(192,57,43,0.1)', border: '0.5px solid rgba(192,57,43,0.25)', borderRadius: 'var(--radius)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn primary" style={{ justifyContent: 'center', marginTop: 4 }}>
              Enter the clan
            </button>
          </form>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid var(--border-dim)', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Don't know your PIN? Ask <span style={{ color: 'var(--gold)' }}>Chili Peppers</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
