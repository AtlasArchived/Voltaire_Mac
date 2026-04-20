'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from './AppContext'
import XpPop from '../components/XpPop'

const NAV = [
  { href: '/learn',   icon: '🎯', label: 'Learn'   },
  { href: '/chat',    icon: '✍️', label: 'Tutor'   },
  { href: '/mathieu', icon: '☕', label: 'Mathieu' },
  { href: '/voice',   icon: '🎙️', label: 'Voice'   },
  { href: '/stories', icon: '📚', label: 'Stories' },
  { href: '/review',  icon: '🔁', label: 'Review'  },
  { href: '/map',     icon: '🗺️', label: 'Course'  },
  { href: '/grammar', icon: '📐', label: 'Grammar' },
]

const CEFR = [
  { l:'A1', min:0    },
  { l:'A2', min:1000 },
  { l:'B1', min:1200 },
  { l:'B2', min:1400 },
  { l:'C1', min:1600 },
  { l:'C2', min:1800 },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { learner, streak, due, xpPop, setXpPop, mistakes } = useApp()
  const pathname = usePathname()
  const router   = useRouter()

  // Login page renders bare — no shell, no API gating.
  if (pathname === '/login') return <>{children}</>

  const elo      = learner?.elo || 800
  const xpToday  = streak?.xp_today || 0
  const xpGoal   = streak?.daily_goal_xp || 50
  const xpPct    = Math.min(100, Math.round(xpToday / Math.max(xpGoal, 1) * 100))
  const curStreak = streak?.current_streak || 0

  const cefrCls = (i: number) => {
    const next = CEFR[i+1]?.min ?? 9999
    return elo >= next ? 'done' : elo >= CEFR[i].min ? 'active' : 'locked'
  }

  return (
    <div className="app">
      {xpPop !== null && <XpPop xp={xpPop} onDone={() => setXpPop(null)} />}

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🇫🇷</div>
          <div>
            <div className="brand-text">VOLTAIRE</div>
            <div className="brand-sub">French Fluency</div>
          </div>
        </div>
        <div className="nav-section">Study</div>
        {NAV.map(n => (
          <Link key={n.href} href={n.href}
            className={`nav-item${pathname === n.href ? ' active' : ''}`}>
            <div className="nav-icon-wrap">{n.icon}</div>{n.label}
            {n.href === '/review' && due > 0 && <span className="nav-badge">{due}</span>}
          </Link>
        ))}
        <div className="nav-section">Account</div>
        <Link href="/settings" className={`nav-item${pathname==='/settings'?' active':''}`}>
          <div className="nav-icon-wrap">⚙️</div>Settings
        </Link>
        <button
          type="button"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
            window.location.href = '/login'
          }}
          className="nav-item"
          style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
        >
          <div className="nav-icon-wrap">🚪</div>Sign out
        </button>
        {mistakes.length > 0 && (
          <div style={{margin:'8px 12px',padding:'10px 12px',background:'rgba(255,75,75,.08)',border:'1px solid rgba(255,75,75,.2)',borderRadius:10,fontSize:12,fontWeight:700}}>
            ⚠️ {mistakes.length} weak spot{mistakes.length > 1 ? 's' : ''} detected
            <div style={{fontSize:11,color:'var(--t3)',marginTop:3,fontWeight:600}}>Go to Review → Weak Spots</div>
          </div>
        )}
        <div style={{padding:'12px 18px',fontSize:11,color:'var(--t3)',borderTop:'1px solid var(--border)',marginTop:'auto'}}>
          Voltaire v2.0
        </div>
      </nav>

      {/* Main */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-streak">
            <span className="fire">{curStreak > 0 ? '🔥' : '💤'}</span>
            <span className="count" style={{color: curStreak > 0 ? 'var(--amber)' : 'var(--t3)'}}>{curStreak}</span>
          </div>
          <div className="topbar-xp">
            <span className="xp-icon">⚡</span>
            <div className="xp-bar-wrap">
              <div className="xp-bar-label">{xpToday} / {xpGoal} XP</div>
              <div className="xp-bar-track"><div className="xp-bar-fill" style={{width:`${xpPct}%`}}/></div>
            </div>
          </div>
          <div className="topbar-elo">
            <span className="elo-num">{elo}</span>
            <span className="elo-lbl">ELO</span>
          </div>
        </div>

        {/* CEFR bar */}
        <div className="cefr-bar">
          {CEFR.map((c, i) => (
            <div key={c.l} className="cefr-step">
              <div className={`cefr-dot ${cefrCls(i)}`} title={`${c.l} — ELO ${c.min}+`}>
                {cefrCls(i) === 'done' ? '✓' : c.l}
                <span className="cefr-tip">{c.l} · ELO {c.min}+</span>
              </div>
              {i < CEFR.length - 1 && <div className={`cefr-line${cefrCls(i)==='done'?' done':''}`}/>}
            </div>
          ))}
        </div>

        {/* Mode tabs (mobile) */}
        <div className="mode-tabs">
          {NAV.slice(0, 6).map(n => (
            <Link key={n.href} href={n.href}
              className={`mode-tab${pathname===n.href?' active t-'+n.href.slice(1):''}`}>
              {n.icon} {n.label}
            </Link>
          ))}
          <Link href="/map"     className={`mode-tab${pathname==='/map'?    ' active':''}`}>🗺️</Link>
          <Link href="/grammar" className={`mode-tab${pathname==='/grammar'?' active':''}`}>📐</Link>
        </div>

        {/* Content */}
        <div className="content-area">
          {children}
        </div>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav">
        <div className="bnav-inner">
          {NAV.slice(0, 5).map(n => (
            <Link key={n.href} href={n.href}
              className={`nav-item${pathname===n.href?' active':''}`}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
