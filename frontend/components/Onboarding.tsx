'use client'
/**
 * components/Onboarding.tsx
 * Voltaire — Cinematic First-Run Onboarding Flow
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

interface OnboardingProps {
  onComplete: () => void
}

const PLACEMENT_QS = [
  {
    q:    'What does "bonjour" mean?',
    opts: ['Goodbye', 'Hello', 'Please', 'Thank you'],
    ans:  1, level: 'A1',
  },
  {
    q:    'Complete: "Je ___ français." (I speak French)',
    opts: ['parle', 'mange', 'suis', 'vais'],
    ans:  0, level: 'A1',
  },
  {
    q:    'Passé composé of "aller" (to go) for "je":',
    opts: ["j'ai allé", 'je suis allé', "j'allais", "j'irai"],
    ans:  1, level: 'A2',
  },
  {
    q:    'Which is correct?',
    opts: ['Il faut que tu vas', 'Il faut que tu ailles', 'Il faut que tu vas aller', 'Il faut tu ailles'],
    ans:  1, level: 'B1',
  },
  {
    q:    '"Nonobstant" means:',
    opts: ['Nevertheless', 'Obviously', 'Immediately', 'Elsewhere'],
    ans:  0, level: 'B2',
  },
]

const GOALS = [
  { value: 'travel',   emoji: '🗼', title: 'Travel & Daily Life',         sub: 'Practical conversation, survival French, real situations' },
  { value: 'reading',  emoji: '📚', title: 'Literature & Culture',        sub: 'Deep vocabulary, classical register, authentic texts' },
  { value: 'career',   emoji: '💼', title: 'Career & Professional',       sub: 'Formal register, business vocabulary, interviews' },
  { value: 'personal', emoji: '🧠', title: 'Heritage & Personal Growth',  sub: 'Cultural connection, warm conversational tone' },
]

const XP_GOALS = [
  { xp: 25,  emoji: '🌱', title: 'Casual',    sub: '~5 min/day',    color: '#58cc02' },
  { xp: 50,  emoji: '📖', title: 'Regular',   sub: '~15 min/day',   color: '#4f9cf9' },
  { xp: 100, emoji: '🔥', title: 'Serious',   sub: '~30 min/day',   color: '#ff9600' },
  { xp: 200, emoji: '⚡', title: 'Intensive', sub: '~1 hour/day',   color: '#ce82ff' },
]

// Background gradients that shift between steps
const STEP_GRADIENTS = [
  'radial-gradient(ellipse at 30% 20%, rgba(79,156,249,.08) 0%, transparent 60%)',
  'radial-gradient(ellipse at 70% 30%, rgba(88,204,2,.07) 0%, transparent 60%)',
  'radial-gradient(ellipse at 50% 60%, rgba(206,130,255,.08) 0%, transparent 60%)',
  'radial-gradient(ellipse at 20% 70%, rgba(255,150,0,.07) 0%, transparent 60%)',
  'radial-gradient(ellipse at 80% 20%, rgba(28,176,246,.09) 0%, transparent 60%)',
]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step,      setStep]    = useState(0)
  const [name,      setName]    = useState('')
  const [goal,      setGoal]    = useState('')
  const [xp,        setXp]      = useState(50)
  const [answers,   setAnswers] = useState<number[]>([])
  const [loading,   setLoading] = useState(false)
  const [direction, setDir]     = useState(1)
  const [logoReady, setLogoReady] = useState(false)

  useEffect(() => { const t = setTimeout(() => setLogoReady(true), 100); return () => clearTimeout(t) }, [])

  const totalSteps = 5
  const correct    = answers.filter((a, i) => a === PLACEMENT_QS[i]?.ans).length
  const startElo   = 800 + correct * 80

  function goTo(s: number) {
    setDir(s > step ? 1 : -1)
    setStep(s)
  }

  async function finish() {
    setLoading(true)
    try {
      await api.completeOnboarding({ name, goal, daily_xp: xp, placement_score: correct })
      toast.success(`Bienvenue, ${name}! Voltaire is ready.`)
      onComplete()
    } catch {
      toast.error('Setup failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', zIndex: 100, overflowY: 'auto',
      transition: 'background-image .8s ease',
    }}>
      {/* Shifting background gradient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: STEP_GRADIENTS[step] ?? STEP_GRADIENTS[0],
        transition: 'background .9s ease',
      }}/>

      {/* Logo — cinematic entrance */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: logoReady ? 1 : 0, y: logoReady ? 0 : -20 }}
        transition={{ duration: .7, ease: [.4,0,.2,1] }}
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 8 }}
      >
        <div style={{
          fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 700,
          letterSpacing: '.35em', color: 'var(--blue)',
          textShadow: '0 0 28px rgba(79,156,249,.45)',
        }}>
          VOLTAIRE
        </div>
        <div style={{ fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--t3)', marginTop: 4 }}>
          French Fluency for Life
        </div>
      </motion.div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, position: 'relative', zIndex: 1 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 24 : 8,
              background: i < step ? 'var(--green)' : i === step ? 'var(--blue)' : 'var(--surface3)',
              boxShadow: i === step ? '0 0 10px rgba(79,156,249,.6)' : 'none',
            }}
            transition={{ duration: .3 }}
            style={{ height: 8, borderRadius: 99 }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, delay: .2 }}
        style={{
          width: '100%', maxWidth: '520px', position: 'relative', zIndex: 1,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 20, padding: '32px 28px', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(79,156,249,.08)',
        }}
      >
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '5%', right: '5%', height: '1px',
          background: 'linear-gradient(90deg,transparent,rgba(79,156,249,.4),transparent)',
        }}/>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: .28, ease: [.4,0,.2,1] }}
          >

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
                Bienvenue. Let's get acquainted.
              </div>
              <div style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.75, marginBottom: 24 }}>
                Voltaire is your personal AI French tutor. It remembers you — your mistakes,
                your progress, your level — and builds every lesson around you.
                Unlike Duolingo, there are no gamified tricks. Just real French.
              </div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--t3)',
                               marginBottom: 6, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Your first name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && goTo(1)}
                placeholder="Jackson"
                autoFocus
                style={{
                  width: '100%', background: 'var(--surface2)', border: '2px solid var(--border2)',
                  borderRadius: 14, color: 'var(--text)', fontFamily: 'var(--font)',
                  fontSize: '16px', fontWeight: 700, padding: '13px 16px', outline: 'none',
                  transition: 'border-color .2s, box-shadow .2s', marginBottom: 20,
                  boxShadow: '0 2px 0 rgba(0,0,0,.3)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,156,249,.15)' }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = '0 2px 0 rgba(0,0,0,.3)' }}
              />
              <button
                onClick={() => name.trim() && goTo(1)}
                disabled={!name.trim()}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: name.trim() ? 'var(--blue)' : 'var(--surface3)',
                  color: name.trim() ? '#fff' : 'var(--t3)', fontFamily: 'var(--font)',
                  fontSize: '15px', fontWeight: 800, cursor: name.trim() ? 'pointer' : 'default',
                  boxShadow: name.trim() ? '0 5px 0 #2d6cc7' : 'none', transition: 'all .15s',
                  letterSpacing: '.04em',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 1: Goal ── */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 6 }}>
                What's driving you, {name}?
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: 20, lineHeight: 1.65 }}>
                This shapes everything — vocabulary priority, Mathieu's topics, AI coaching focus.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => { setGoal(g.value); goTo(2) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: goal === g.value ? 'rgba(79,156,249,.15)' : 'var(--surface2)',
                      border: `2px solid ${goal === g.value ? 'var(--blue)' : 'var(--border2)'}`,
                      borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all .18s', fontFamily: 'var(--font)',
                      boxShadow: goal === g.value ? '0 0 16px rgba(79,156,249,.2)' : 'none',
                    }}
                    onMouseEnter={e => { if (goal !== g.value) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.22)' }}
                    onMouseLeave={e => { if (goal !== g.value) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
                  >
                    <span style={{
                      fontSize: '2rem', width: 52, height: 52, borderRadius: 14,
                      background: 'var(--surface3)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 3px 0 rgba(0,0,0,.3)',
                    }}>{g.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text)', marginBottom: 3 }}>{g.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.45 }}>{g.sub}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--t3)' }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Placement test ── */}
          {step === 2 && (() => {
            const qi = answers.length
            if (qi >= PLACEMENT_QS.length) {
              // Placement complete — encouragement screen
              return (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    style={{ fontSize: '3rem', marginBottom: 16 }}
                  >
                    {correct >= 4 ? '🎓' : correct >= 2 ? '📗' : '🌱'}
                  </motion.div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', color: 'var(--blue)', marginBottom: 8 }}>
                    {correct >= 4 ? 'Strong foundation!' : correct >= 2 ? 'False beginner!' : 'Fresh start!'}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: 4 }}>
                    {correct}/5 correct · Starting ELO: <strong style={{ color: 'var(--text)' }}>{startElo}</strong>
                  </div>
                  <div style={{
                    background: 'rgba(79,156,249,.1)', border: '1px solid rgba(79,156,249,.25)',
                    borderRadius: 14, padding: '14px 18px', margin: '16px 0 20px',
                    fontSize: '14px', color: 'var(--t2)', lineHeight: 1.65,
                  }}>
                    Great job! We've personalized your learning path based on these results.
                    Voltaire will calibrate every lesson to your exact level.
                  </div>
                  <button
                    onClick={() => goTo(3)}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                      background: 'var(--blue)', color: '#fff', fontFamily: 'var(--font)',
                      fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 5px 0 #2d6cc7', letterSpacing: '.04em',
                    }}
                  >
                    Continue →
                  </button>
                </div>
              )
            }

            const q = PLACEMENT_QS[qi]
            const progress = ((qi / PLACEMENT_QS.length) * 100)

            return (
              <div>
                {/* Game-like header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    Placement · Question {qi + 1} of {PLACEMENT_QS.length}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--blue)' }}>
                    {qi > 0 ? `${Math.round((answers.filter((a,i)=>a===PLACEMENT_QS[i]?.ans).length / qi)*100)}% correct` : ''}
                  </div>
                </div>
                {/* Animated progress bar */}
                <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: .4, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg,var(--blue),var(--purple))', borderRadius: 99 }}
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={qi}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: .22 }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: 20, lineHeight: 1.55 }}>
                      {q.q}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {q.opts.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswers(a => [...a, i])}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: 'var(--surface2)', border: '2px solid var(--border2)',
                            borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                            fontFamily: 'var(--font)', fontSize: '14px', fontWeight: 700,
                            color: 'var(--text)', textAlign: 'left', transition: 'all .15s',
                            boxShadow: '0 3px 0 rgba(0,0,0,.3)',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = '' }}
                        >
                          <span style={{
                            width: 28, height: 28, borderRadius: 8, background: 'var(--surface3)',
                            border: '1.5px solid var(--border2)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--t3)',
                            flexShrink: 0,
                          }}>{['A','B','C','D'][i]}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )
          })()}

          {/* ── Step 3: Daily goal ── */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 6 }}>
                How much can you commit?
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: 20, lineHeight: 1.7 }}>
                15–20 minutes daily beats 2-hour weekend sessions — research is clear on this.
                Pick something you'll actually stick to.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {XP_GOALS.map(g => (
                  <button
                    key={g.xp}
                    onClick={() => setXp(g.xp)}
                    style={{
                      background: xp === g.xp ? `${g.color}1a` : 'var(--surface2)',
                      border: `2px solid ${xp === g.xp ? g.color : 'var(--border2)'}`,
                      borderRadius: 16, padding: '18px 12px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all .18s', fontFamily: 'var(--font)',
                      boxShadow: xp === g.xp ? `0 0 16px ${g.color}33` : '0 3px 0 rgba(0,0,0,.3)',
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>{g.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text)' }}>{g.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: 2 }}>{g.sub}</div>
                    <div style={{ fontSize: '12px', color: g.color, marginTop: 6, fontWeight: 800 }}>{g.xp} XP/day</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => goTo(4)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: 'var(--blue)', color: '#fff', fontFamily: 'var(--font)',
                  fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 5px 0 #2d6cc7', letterSpacing: '.04em',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 4: Summary + launch ── */}
          {step === 4 && (
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 6 }}>
                Everything's ready, {name}.
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: 20, lineHeight: 1.65 }}>
                Here's your personalized profile:
              </div>

              <div style={{ background: 'var(--surface2)', borderRadius: 16, padding: '4px 0', marginBottom: 20, border: '1px solid var(--border)' }}>
                {[
                  ['Name',         name,                                                              '👤'],
                  ['Goal',         GOALS.find(g => g.value === goal)?.title || goal,                  GOALS.find(g => g.value === goal)?.emoji || '🎯'],
                  ['Daily target', `${xp} XP / day`,                                                  '⚡'],
                  ['Starting ELO', `${startElo} (${correct}/5 placement)`,                            '📊'],
                ].map(([k, v, icon], idx, arr) => (
                  <div key={String(k)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '12px 16px',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: '14px',
                  }}>
                    <span style={{ color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1rem' }}>{icon}</span>{k}
                    </span>
                    <span style={{ color: 'var(--text)', fontWeight: 700, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: 20, lineHeight: 1.7, textAlign: 'center' }}>
                Voltaire remembers everything. The more you use it, the better it knows you.
              </div>

              <button
                onClick={finish}
                disabled={loading}
                style={{
                  width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                  background: loading ? 'var(--surface3)' : 'linear-gradient(135deg,var(--blue),#7c5cfc)',
                  color: loading ? 'var(--t3)' : '#fff', fontFamily: 'var(--font)',
                  fontSize: '15px', fontWeight: 800, cursor: loading ? 'default' : 'pointer',
                  boxShadow: loading ? 'none' : '0 5px 0 #2d3dc7, 0 0 24px rgba(79,156,249,.3)',
                  letterSpacing: '.04em', transition: 'all .2s',
                }}
              >
                {loading ? 'Setting up…' : 'Commencer →'}
              </button>
            </div>
          )}

          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
