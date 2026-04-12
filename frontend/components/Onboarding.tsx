'use client'
/**
 * components/Onboarding.tsx
 * Voltaire — First-Run Onboarding Flow
 */

import { useState } from 'react'
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
  { value: 'travel',   label: '🗼', title: 'Live or travel in France',      sub: 'Practical, conversational, survival-first' },
  { value: 'reading',  label: '📚', title: 'Read French literature',         sub: 'Vocabulary-deep, classical register' },
  { value: 'career',   label: '💼', title: 'Career / professional use',      sub: 'Formal register, business vocabulary' },
  { value: 'personal', label: '🧠', title: 'Personal — heritage or family',  sub: 'Cultural, warm, conversational' },
]

const XP_GOALS = [
  { xp: 25,  label: '🌱', title: 'Casual', sub: '~5 min/day' },
  { xp: 50,  label: '📖', title: 'Regular', sub: '~15 min/day' },
  { xp: 100, label: '🔥', title: 'Serious', sub: '~30 min/day' },
  { xp: 200, label: '⚡', title: 'Intensive', sub: '~1 hour/day' },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step,    setStep]    = useState(0)
  const [name,    setName]    = useState('')
  const [goal,    setGoal]    = useState('')
  const [xp,      setXp]      = useState(50)
  const [answers, setAnswers] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const totalSteps = 5
  const correct    = answers.filter((a, i) => a === PLACEMENT_QS[i]?.ans).length
  const startElo   = 800 + correct * 80

  async function finish() {
    setLoading(true)
    try {
      await api.completeOnboarding({
        name, goal, daily_xp: xp, placement_score: correct,
      })
      toast.success(`Bienvenue, ${name}! Voltaire is ready.`)
      onComplete()
    } catch (err) {
      toast.error('Setup failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  // ── Background ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      position:   'fixed', inset: 0,
      background: 'var(--bg)',
      display:    'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding:    '24px', zIndex: 100,
      overflowY:  'auto',
    }}>

      {/* Logo */}
      <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700,
                    letterSpacing: '.3em', color: 'var(--blue-bright)',
                    textShadow: '0 0 24px rgba(79,156,249,.3)', marginBottom: '8px' }}>
        VOLTAIRE
      </div>
      <div style={{ fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase',
                    color: 'var(--t3)', marginBottom: '32px' }}>
        French Fluency for Life
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < step ? 'var(--blue)' : i === step
              ? 'var(--blue-bright)' : 'var(--b1)',
            transition: 'all .3s',
            boxShadow:  i === step ? '0 0 8px rgba(79,156,249,.6)' : 'none',
          }} />
        ))}
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '500px',
        background: 'var(--s2)', border: '1px solid var(--b1)',
        borderRadius: '16px', padding: '28px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: 'linear-gradient(90deg,transparent,rgba(79,156,249,.3),transparent)',
        }} />

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="animate-fade-up">
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
              Bienvenue. Let's get acquainted.
            </div>
            <div style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.7, marginBottom: '24px' }}>
              Voltaire is your personal AI French tutor. It remembers you — your mistakes,
              your progress, your level — and builds every lesson around you.
              Unlike Duolingo, there are no levels to grind. Just French.
            </div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--t3)',
                             marginBottom: '6px', letterSpacing: '.05em' }}>
              Your first name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(1)}
              placeholder="Jackson"
              autoFocus
              style={{
                width: '100%', background: 'var(--s1)', border: '1.5px solid var(--b2)',
                borderRadius: 'var(--r2)', color: 'var(--text)', fontFamily: 'var(--font)',
                fontSize: '15px', padding: '12px 15px', outline: 'none',
                transition: 'border-color .2s', marginBottom: '20px',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--b2)')}
            />
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => name.trim() && setStep(1)}
              disabled={!name.trim()}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 1: Goal ── */}
        {step === 1 && (
          <div className="animate-fade-up">
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>
              What's driving you, {name}?
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px' }}>
              This shapes everything — vocabulary priority, Mathieu's conversation topics,
              the kind of content Voltaire pulls.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => { setGoal(g.value); setStep(2) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: goal === g.value ? 'var(--blue2)' : 'var(--s1)',
                    border:     `1.5px solid ${goal === g.value ? 'var(--blue)' : 'var(--b1)'}`,
                    borderRadius: 'var(--r2)', padding: '13px 16px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all .15s', fontFamily: 'var(--font)',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{g.label}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{g.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)', marginTop: '2px' }}>{g.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Placement test ── */}
        {step === 2 && (() => {
          const qi = answers.length
          if (qi >= PLACEMENT_QS.length) {
            return (
              <div className="animate-fade-up" style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                  {correct >= 4 ? '🎓' : correct >= 2 ? '📗' : '🌱'}
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem',
                               color: 'var(--blue-bright)', marginBottom: '8px' }}>
                  {correct >= 4 ? 'Strong foundation' : correct >= 2 ? 'False beginner' : 'Fresh start'}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '6px' }}>
                  {correct}/5 correct · Starting ELO: {startElo}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '24px' }}>
                  Voltaire will calibrate every lesson to this level.
                </div>
                <button className="btn-primary" style={{ width: '100%', padding: '12px' }}
                        onClick={() => setStep(3)}>
                  Continue →
                </button>
              </div>
            )
          }

          const q = PLACEMENT_QS[qi]
          return (
            <div className="animate-fade-up">
              <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: '12px' }}>
                Placement test · {qi + 1} of {PLACEMENT_QS.length}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '20px', lineHeight: 1.5 }}>
                {q.q}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.opts.map((opt, i) => (
                  <button
                    key={i}
                    className="opt-btn"
                    onClick={() => setAnswers(a => [...a, i])}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Step 3: Daily goal ── */}
        {step === 3 && (
          <div className="animate-fade-up">
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>
              How much can you commit?
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px', lineHeight: 1.7 }}>
              15–20 minutes daily beats 2-hour weekend sessions — research is clear on this.
              Pick something you'll actually hit.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {XP_GOALS.map(g => (
                <button
                  key={g.xp}
                  onClick={() => setXp(g.xp)}
                  style={{
                    background:   xp === g.xp ? 'var(--blue2)' : 'var(--s1)',
                    border:       `1.5px solid ${xp === g.xp ? 'var(--blue)' : 'var(--b1)'}`,
                    borderRadius: 'var(--r2)', padding: '14px 12px',
                    textAlign:    'center', cursor: 'pointer',
                    transition:   'all .15s', fontFamily: 'var(--font)',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{g.label}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{g.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>{g.sub}</div>
                  <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '4px' }}>{g.xp} XP/day</div>
                </button>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '12px' }}
                    onClick={() => setStep(4)}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 4: Summary + launch ── */}
        {step === 4 && (
          <div className="animate-fade-up">
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>
              Everything's ready, {name}.
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px' }}>
              Here's your profile:
            </div>

            <div style={{ background: 'var(--s1)', borderRadius: 'var(--r)',
                           padding: '16px', marginBottom: '20px' }}>
              {[
                ['Name',         name],
                ['Goal',         GOALS.find(g => g.value === goal)?.title || goal],
                ['Daily target', `${xp} XP / day`],
                ['Starting ELO', `${startElo} (${correct}/5 placement)`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                                       padding: '7px 0', borderBottom: '1px solid var(--b1)',
                                       fontSize: '14px' }}>
                  <span style={{ color: 'var(--t2)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '24px', lineHeight: 1.7 }}>
              Voltaire remembers everything. The more you use it, the better it knows you.
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '15px',
                        opacity: loading ? .7 : 1 }}
              onClick={finish}
              disabled={loading}
            >
              {loading ? 'Setting up…' : 'Commencer →'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
