'use client'
import { useApp } from '../AppContext'
import { useEffect, useState } from 'react'

function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('voltaire_theme')
    setDark(saved !== 'light')
  }, [])

  function toggle() {
    const next = dark ? 'light' : 'dark'
    setDark(!dark)
    localStorage.setItem('voltaire_theme', next)
    if (next === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  return (
    <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div>
        <div style={{fontWeight:700,fontSize:14}}>Appearance</div>
        <div style={{fontSize:12,color:'var(--t3)',marginTop:2}}>
          {dark ? '🌙 Dark mode' : '☀️ Light mode'}
        </div>
      </div>
      <button
        onClick={toggle}
        style={{
          position:'relative',
          width:52,
          height:28,
          borderRadius:99,
          border:'none',
          cursor:'pointer',
          background: dark ? 'var(--blue)' : 'var(--surface3)',
          transition:'background .2s',
          flexShrink:0,
        }}
        aria-label="Toggle theme"
      >
        <span style={{
          position:'absolute',
          top:3,
          left: dark ? 27 : 3,
          width:22,
          height:22,
          borderRadius:'50%',
          background:'#fff',
          transition:'left .2s',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:12,
          boxShadow:'0 1px 4px rgba(0,0,0,.3)',
        }}>
          {dark ? '🌙' : '☀️'}
        </span>
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { learner, streak, c1Status, c2Status, settingsMap, setSettingsMap, savingSettings, saveSetting } = useApp()

  return (
    <div style={{height:'100%',overflowY:'auto',padding:'20px'}}>
      <div style={{fontSize:'1.2rem',fontWeight:800,marginBottom:4}}>⚙️ Settings</div>
      <div style={{fontSize:13,color:'var(--t3)',marginBottom:14}}>
        Persisted locally and used by your adaptive tutor.
      </div>
      <div style={{display:'grid',gap:14,maxWidth:560}}>

        <ThemeToggle />

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>Display name</div>
          <input className="chat-input"
            value={settingsMap.user_name || learner?.name || ''}
            onChange={e => setSettingsMap(p => ({ ...p, user_name: e.target.value }))} />
          <button className="check-btn ready" style={{marginTop:8,padding:'10px 12px'}} disabled={savingSettings}
            onClick={() => saveSetting('user_name', settingsMap.user_name || learner?.name || 'Learner')}>
            Save Name
          </button>
        </div>

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>Daily XP goal</div>
          <input className="chat-input"
            value={settingsMap.daily_goal_xp || String(streak?.daily_goal_xp || 50)}
            onChange={e => setSettingsMap(p => ({ ...p, daily_goal_xp: e.target.value.replace(/[^0-9]/g,'') }))} />
          <button className="check-btn ready" style={{marginTop:8,padding:'10px 12px'}} disabled={savingSettings}
            onClick={() => saveSetting('daily_goal_xp', settingsMap.daily_goal_xp || '50')}>
            Save Goal
          </button>
        </div>

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>C1 target status</div>
          <div style={{fontSize:13,fontWeight:700}}>
            {c1Status ? `${c1Status.elo}/${c1Status.target_elo} ELO (${c1Status.pct_to_c1}%)` : 'Loading...'}
          </div>
          <div style={{fontSize:12,color:'var(--t2)',marginTop:4}}>
            {c1Status?.recommendation || 'Keep practicing daily.'}
          </div>
        </div>

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>C2 target status</div>
          <div style={{fontSize:13,fontWeight:700}}>
            {c2Status ? `${c2Status.elo}/${c2Status.target_elo} ELO (${c2Status.pct_to_c2}%)` : 'Loading...'}
          </div>
          <div style={{fontSize:12,color:'var(--t2)',marginTop:4}}>
            {c2Status?.recommendation || 'Build consistency and long streaks.'}
          </div>
        </div>

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>Difficulty bias (0-100)</div>
          <input className="chat-input"
            value={settingsMap.difficulty_bias || '50'}
            onChange={e => setSettingsMap(p => ({ ...p, difficulty_bias: e.target.value.replace(/[^0-9]/g,'') }))} />
          <button className="check-btn ready" style={{marginTop:8,padding:'10px 12px'}} disabled={savingSettings}
            onClick={() => saveSetting('difficulty_bias', settingsMap.difficulty_bias || '50')}>
            Save Difficulty
          </button>
        </div>

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>Correction strictness (low/medium/high)</div>
          <input className="chat-input"
            value={settingsMap.correction_strictness || 'medium'}
            onChange={e => setSettingsMap(p => ({ ...p, correction_strictness: e.target.value }))} />
          <button className="check-btn ready" style={{marginTop:8,padding:'10px 12px'}} disabled={savingSettings}
            onClick={() => saveSetting('correction_strictness', settingsMap.correction_strictness || 'medium')}>
            Save Strictness
          </button>
        </div>

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>Audio speed (0.6-1.2)</div>
          <input className="chat-input"
            value={settingsMap.audio_speed || '0.85'}
            onChange={e => setSettingsMap(p => ({ ...p, audio_speed: e.target.value.replace(/[^0-9.]/g,'') }))} />
          <button className="check-btn ready" style={{marginTop:8,padding:'10px 12px'}} disabled={savingSettings}
            onClick={() => saveSetting('audio_speed', settingsMap.audio_speed || '0.85')}>
            Save Audio Speed
          </button>
        </div>

      </div>
    </div>
  )
}
