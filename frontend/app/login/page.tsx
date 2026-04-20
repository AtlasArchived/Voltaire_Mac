'use client'
import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j.error || 'Login failed')
        setLoading(false)
        return
      }
      window.location.href = next
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: 24,
    }}>
      <form onSubmit={onSubmit} style={{
        width: '100%', maxWidth: 380, background: '#111827', padding: 32, borderRadius: 16,
        border: '1px solid #1f2937', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🇫🇷</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Voltaire</div>
            <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: 1 }}>FRENCH FLUENCY</div>
          </div>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Sign in to continue your French journey.</p>

        <label style={{ display: 'block', fontSize: 12, color: '#cbd5e1', marginBottom: 6, letterSpacing: 0.5 }}>USERNAME</label>
        <input
          type="text" value={username} onChange={e => setUsername(e.target.value)} autoFocus required
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #1f2937',
            background: '#0f172a', color: '#fff', fontSize: 15, marginBottom: 14, outline: 'none',
          }}
        />
        <label style={{ display: 'block', fontSize: 12, color: '#cbd5e1', marginBottom: 6, letterSpacing: 0.5 }}>PASSWORD</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)} required
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #1f2937',
            background: '#0f172a', color: '#fff', fontSize: 15, marginBottom: 18, outline: 'none',
          }}
        />
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '10px 12px',
            borderRadius: 8, fontSize: 13, marginBottom: 14, border: '1px solid rgba(239,68,68,0.3)',
          }}>{error}</div>
        )}
        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none',
            background: loading ? '#475569' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
