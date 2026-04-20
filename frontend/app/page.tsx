'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useApp } from './AppContext'
import { UNIT_META, CEFR_ELO, type CefrLevel } from '../lib/questionBank'
import { getCompletedUnits, syncCompletedFromServer } from '../lib/lessonProgress'

export default function Home() {
  const router = useRouter()
  const { learner, streak, due, mistakes, missions, setCurrentUnitId, currentUnitId, memory } = useApp()
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(() => {
    setCompleted([...getCompletedUnits()])
    syncCompletedFromServer().then(({ units }) => setCompleted([...units]))
  }, [])

  const elo        = learner?.elo || 800
  const xpToday    = streak?.xp_today || 0
  const xpGoal     = streak?.daily_goal_xp || 50
  const xpPct      = Math.min(100, Math.round((xpToday / Math.max(xpGoal, 1)) * 100))
  const curStreak  = streak?.current_streak || 0
  const longestStreak = memory?.longest_streak || curStreak
  const heartCount = 5

  // Current CEFR level (highest unlocked)
  const levels: CefrLevel[] = ['A1','A2','B1','B2','C1','C2']
  const currentCefr: CefrLevel = (levels.slice().reverse().find(l => elo >= CEFR_ELO[l].min)) || 'A1'
  const nextCefr   = levels[Math.min(levels.indexOf(currentCefr) + 1, levels.length - 1)]
  const eloRange   = CEFR_ELO[currentCefr]
  const cefrPct    = Math.min(100, Math.round(((elo - eloRange.min) / Math.max(eloRange.max - eloRange.min, 1)) * 100))

  // Unit progress
  const unlockedUnits = UNIT_META.filter(u => elo >= CEFR_ELO[u.cefr].min)
  const completedSet  = new Set(completed)
  const masteredCount = unlockedUnits.filter(u => completedSet.has(u.id)).length
  const currentUnit   = UNIT_META.find(u => u.id === currentUnitId) || unlockedUnits[0]

  // Next 3 unit suggestions
  const nextUnits = unlockedUnits
    .filter(u => !completedSet.has(u.id))
    .slice(0, 3)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 5)  return 'Bonsoir'
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  })()
  const name = learner?.name || 'friend'

  const goalReached = xpToday >= xpGoal

  function continueLearning() {
    if (!currentUnit) return
    setCurrentUnitId(currentUnit.id)
    router.push('/learn')
  }

  // Ring math
  const RING_R = 56
  const RING_C = 2 * Math.PI * RING_R
  const xpDash = (xpPct / 100) * RING_C

  const topMission = missions?.find(m => m.unlocked && !m.completed) || missions?.[0]

  return (
    <div style={{padding:'32px 40px',maxWidth:1200,margin:'0 auto'}}>
      {/* ── Greeting ────────────────────────────────────────────────────── */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:28,fontWeight:800,letterSpacing:'-.02em'}}>
          {greeting}, {name} <span style={{fontSize:24}}>👋</span>
        </div>
        <div style={{color:'var(--t3)',fontSize:14,marginTop:4,fontWeight:600}}>
          {goalReached
            ? `Daily goal reached — keep the streak alive with a quick review.`
            : `${xpGoal - xpToday} XP to hit today's goal. Allons-y !`}
        </div>
      </div>

      {/* ── Top stats row ───────────────────────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr',gap:14,marginBottom:18}}>
        {/* Daily goal ring */}
        <div style={card()}>
          <div style={{display:'flex',alignItems:'center',gap:18}}>
            <div style={{position:'relative',width:140,height:140,flexShrink:0}}
              role="progressbar" aria-valuenow={xpToday} aria-valuemin={0} aria-valuemax={xpGoal}
              aria-label={`Daily XP progress: ${xpToday} of ${xpGoal} XP, ${xpPct}% of goal`}>
              <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
                <circle cx="70" cy="70" r={RING_R} fill="none" stroke="var(--border)" strokeWidth="10"/>
                <circle cx="70" cy="70" r={RING_R} fill="none"
                  stroke={goalReached ? '#58cc02' : '#4f9cf9'} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${xpDash} ${RING_C}`}
                  transform="rotate(-90 70 70)" style={{transition:'stroke-dasharray .6s ease'}}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:24,fontWeight:800,letterSpacing:'-.02em'}}>{xpPct}%</div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',letterSpacing:'.1em'}}>OF GOAL</div>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:4}}>TODAY'S PROGRESS</div>
              <div style={{fontSize:32,fontWeight:800,letterSpacing:'-.02em',lineHeight:1}}>
                {xpToday}<span style={{fontSize:18,color:'var(--t3)',fontWeight:700}}> / {xpGoal} XP</span>
              </div>
              <div style={{marginTop:14,fontSize:13,color:'var(--t2)',fontWeight:600,lineHeight:1.5}}>
                {goalReached ? '🎉 Goal smashed for today!' : 'Complete a lesson to make rapid progress.'}
              </div>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div style={card()}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:8}}>STREAK</div>
          <div style={{fontSize:36,fontWeight:800,letterSpacing:'-.02em',display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:32}}>{curStreak > 0 ? '🔥' : '💤'}</span>
            {curStreak}
            <span style={{fontSize:14,color:'var(--t3)',fontWeight:700}}>days</span>
          </div>
          <div style={{marginTop:12,fontSize:12,color:'var(--t2)',fontWeight:600,lineHeight:1.5}}>
            {curStreak >= 7 ? 'A week of consistency. Magnifique.'
              : curStreak > 0 ? 'Keep it going. Daily reps compound fast.'
              : 'Start your first day. The streak begins now.'}
            {longestStreak > curStreak && (
              <div style={{marginTop:4,fontSize:11,color:'var(--t3)'}}>Personal best: {longestStreak} days</div>
            )}
          </div>
        </div>

        {/* Hearts */}
        <div style={card()}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:8}}>HEARTS</div>
          <div style={{fontSize:36,fontWeight:800,letterSpacing:'-.02em',display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:30}}>❤️</span>{heartCount}
          </div>
          <div style={{marginTop:12,fontSize:12,color:'var(--t2)',fontWeight:600,lineHeight:1.5}}>
            Mistakes are how you learn. Hearts refresh each session.
          </div>
        </div>

        {/* Units mastered */}
        <div style={card()}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:8}}>UNITS MASTERED</div>
          <div style={{fontSize:36,fontWeight:800,letterSpacing:'-.02em'}}>
            {masteredCount}<span style={{fontSize:18,color:'var(--t3)',fontWeight:700}}> / {unlockedUnits.length}</span>
          </div>
          <div style={{marginTop:12,height:6,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
            <div style={{width:`${unlockedUnits.length ? (masteredCount/unlockedUnits.length)*100 : 0}%`,height:'100%',background:'linear-gradient(90deg,#58cc02,#4f9cf9)',borderRadius:99,transition:'width .4s'}}/>
          </div>
        </div>
      </div>

      {/* ── Continue + CEFR ─────────────────────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:14,marginBottom:18}}>
        {/* Continue learning hero */}
        <div style={{...card(),background:'linear-gradient(135deg,rgba(79,156,249,.08),rgba(167,139,250,.08))',border:'1px solid rgba(79,156,249,.3)'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:8}}>CONTINUE LEARNING</div>
          <div style={{fontSize:24,fontWeight:800,letterSpacing:'-.02em',marginBottom:6}}>
            {currentUnit?.title || 'Start your journey'}
          </div>
          <div style={{fontSize:13,color:'var(--t2)',fontWeight:600,marginBottom:18}}>
            {currentUnit?.cefr} · Unit {(parseInt(currentUnit?.id?.split('-u')[1] || '1', 10))}
          </div>
          <button onClick={continueLearning} disabled={!currentUnit}
            style={{...primaryBtn(), opacity: currentUnit ? 1 : 0.45, cursor: currentUnit ? 'pointer' : 'not-allowed'}}
            aria-label={currentUnit ? `Continue ${currentUnit.title}` : 'No unit available yet'}>
            ▶  {currentUnit ? 'Continue' : 'No unit yet'}
          </button>
        </div>

        {/* Current CEFR card */}
        <div style={card()}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:8}}>YOUR LEVEL</div>
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
            <div style={{fontSize:42,fontWeight:800,letterSpacing:'-.04em',color:'#4f9cf9'}}>{currentCefr}</div>
            <div style={{fontSize:13,color:'var(--t3)',fontWeight:700}}>· ELO {elo}</div>
          </div>
          <div style={{height:8,background:'var(--border)',borderRadius:99,overflow:'hidden',marginTop:4}}>
            <div style={{width:`${cefrPct}%`,height:'100%',background:'linear-gradient(90deg,#4f9cf9,#a78bfa)',borderRadius:99,transition:'width .4s'}}/>
          </div>
          <div style={{marginTop:8,fontSize:11,color:'var(--t3)',fontWeight:600}}>
            {currentCefr === 'C2'
              ? 'Mastery achieved. Keep practicing to maintain.'
              : `${eloRange.max - elo} ELO to ${nextCefr}`}
          </div>
        </div>
      </div>

      {/* ── Quick actions ───────────────────────────────────────────────── */}
      <div style={{marginBottom:14,fontSize:12,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em'}}>QUICK ACTIONS</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        <ActionCard href="/chat"    icon="✍️" title="AI Tutor"     subtitle="Chat in French with feedback"/>
        <ActionCard href="/mathieu" icon="☕" title="Mathieu's Café" subtitle="Roleplay everyday French"/>
        <ActionCard href="/voice"   icon="🎙️" title="Voice Lab"    subtitle="Speak and get pronunciation tips"/>
        <ActionCard href="/review"  icon="🔁" title="Review"       subtitle={due > 0 ? `${due} cards due now` : 'No reviews pending'} badge={due > 0 ? due : undefined}/>
      </div>

      {/* ── Today's mission + Weak spots ─────────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
        {/* Mission */}
        <div style={card()}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:8}}>TODAY'S MISSION</div>
          {topMission ? (
            <>
              <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>
                {topMission.completed ? `${topMission.level} mission complete ✓` : `Reach ${topMission.level} mastery`}
              </div>
              <div style={{fontSize:13,color:'var(--t2)',fontWeight:600,lineHeight:1.5}}>
                {topMission.completed
                  ? 'Strong work. Keep practicing to maintain your edge.'
                  : `Hit ${topMission.required_pct}% accuracy on ${topMission.level} questions to unlock the next checkpoint.`}
              </div>
            </>
          ) : (
            <>
              <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Earn {Math.max(xpGoal - xpToday, 10)} XP</div>
              <div style={{fontSize:13,color:'var(--t2)',fontWeight:600,lineHeight:1.5}}>
                {goalReached
                  ? "You're done for today — but every extra XP builds your ELO faster."
                  : 'A single lesson gets you 80% of the way. Tap Continue above.'}
              </div>
            </>
          )}
        </div>

        {/* Weak spots */}
        <div style={card()}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em',marginBottom:8}}>WEAK SPOTS</div>
          {mistakes.length > 0 ? (
            <>
              <div style={{fontSize:18,fontWeight:800,marginBottom:6,color:'#ff6b6b'}}>
                ⚠️ {mistakes.length} {mistakes.length === 1 ? 'item' : 'items'} flagged
              </div>
              <div style={{fontSize:13,color:'var(--t2)',fontWeight:600,lineHeight:1.5,marginBottom:12}}>
                Recurring mistakes are now in your spaced-repetition queue.
              </div>
              <Link href="/review" style={ghostBtn()}>Review now →</Link>
            </>
          ) : (
            <>
              <div style={{fontSize:18,fontWeight:800,marginBottom:6,color:'#58cc02'}}>✓ All clear</div>
              <div style={{fontSize:13,color:'var(--t2)',fontWeight:600,lineHeight:1.5}}>
                No mistakes flagged today. Keep the precision sharp.
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Up next ──────────────────────────────────────────────────────── */}
      {nextUnits.length > 0 && (
        <>
          <div style={{marginBottom:14,fontSize:12,fontWeight:700,color:'var(--t3)',letterSpacing:'.12em'}}>UP NEXT</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
            {nextUnits.map(u => (
              <button key={u.id}
                onClick={() => { setCurrentUnitId(u.id); router.push('/learn') }}
                style={{...card(),textAlign:'left',cursor:'pointer',transition:'transform .15s, border-color .15s'}}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(79,156,249,.5)' }}
                onMouseOut={e  => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:800,padding:'3px 8px',background:'rgba(79,156,249,.12)',color:'#4f9cf9',borderRadius:6,letterSpacing:'.05em'}}>{u.cefr}</span>
                  <span style={{fontSize:11,color:'var(--t3)',fontWeight:700}}>UNIT {parseInt(u.id.split('-u')[1] || '1', 10)}</span>
                </div>
                <div style={{fontSize:16,fontWeight:800,letterSpacing:'-.01em'}}>{u.title}</div>
                <div style={{fontSize:12,color:'var(--t3)',fontWeight:600,marginTop:8}}>Tap to start →</div>
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{height:40}}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function card(): React.CSSProperties {
  return {
    background:'var(--bg2)',
    border:'1px solid var(--border)',
    borderRadius:14,
    padding:20,
  }
}

function primaryBtn(): React.CSSProperties {
  return {
    background:'linear-gradient(135deg,#4f9cf9,#a78bfa)',
    color:'white',
    border:'none',
    padding:'12px 28px',
    borderRadius:10,
    fontSize:15,
    fontWeight:800,
    cursor:'pointer',
    letterSpacing:'.02em',
    boxShadow:'0 4px 14px rgba(79,156,249,.25)',
  }
}

function ghostBtn(): React.CSSProperties {
  return {
    display:'inline-block',
    padding:'8px 16px',
    background:'transparent',
    border:'1px solid var(--border)',
    borderRadius:8,
    fontSize:13,
    fontWeight:700,
    color:'var(--t1)',
    textDecoration:'none',
  }
}

function ActionCard({href, icon, title, subtitle, badge}: {href:string; icon:string; title:string; subtitle:string; badge?:number}) {
  return (
    <Link href={href} style={{textDecoration:'none',color:'inherit',display:'block'}}>
      <div style={{...card(),position:'relative',transition:'transform .15s, border-color .15s',cursor:'pointer'}}
        onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,156,249,.4)' }}
        onMouseOut={e  => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}>
        {badge !== undefined && (
          <span style={{position:'absolute',top:14,right:14,background:'#ff6b6b',color:'white',fontSize:11,fontWeight:800,padding:'2px 8px',borderRadius:99}}>
            {badge}
          </span>
        )}
        <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
        <div style={{fontSize:15,fontWeight:800,marginBottom:3}}>{title}</div>
        <div style={{fontSize:12,color:'var(--t3)',fontWeight:600}}>{subtitle}</div>
      </div>
    </Link>
  )
}
