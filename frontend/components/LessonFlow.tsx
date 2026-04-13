'use client'
import { useState, useRef } from 'react'
import { DrillQ, McqQ, ArrQ, ListQ, TransQ, FillQ, ErrQ, UnitMeta, getUnitPhrases, getUnitLessonQuestions } from '../lib/questionBank'
import { LESSON_PLANS } from '../lib/lessonPlans'
import { answersEquivalent } from '../lib/appHelpers'
import { useAccentInput, ACCENT_BAR } from '../lib/useAccentInput'

interface LessonFlowProps {
  unit: UnitMeta
  onComplete: (passed: boolean) => void
  onBack: () => void
}

type Phase = 'intro' | 'practice' | 'test' | 'result' | 'review'
type Verdict = 'correct' | 'almost' | 'wrong'

interface QuestionResult {
  question: DrillQ
  verdict: Verdict
  userAnswer: string
}

// Almost = answersEquivalent passed but raw normalized doesn't match exactly
// (accent was missing, fuzzy typo fixed it, etc.)
function norm(s: string): string {
  let x = s.replace(/[\u2019\u2018\u0060\u00b4]/g, "'")
  x = x.toLowerCase().replace(/\s+/g, ' ').trim()
  x = x.replace(/^["'«»]+|["'«»]+$/g, '')
  x = x.replace(/[.!?…]+$/g, '').trim()
  return x
}

function getVerdict(userAnswer: string, expected: string): Verdict {
  if (!answersEquivalent(userAnswer, expected)) return 'wrong'
  if (norm(userAnswer) === norm(expected)) return 'correct'
  return 'almost'
}

// Strict check for correction — must match exactly (normalized, no fuzzy)
function correctionAccepted(userInput: string, expected: string): boolean {
  return norm(userInput) === norm(expected)
}

// ── DrillQuestion ────────────────────────────────────────────────────────────
interface DrillQuestionProps {
  question: DrillQ
  hint: boolean
  isLast: boolean
  onResult: (verdict: Verdict, userAnswer: string) => void
  onAdvance: () => void
}

function DrillQuestion({ question: q, hint, isLast, onResult, onAdvance }: DrillQuestionProps) {
  const [selected,       setSelected]       = useState<string | null>(null)
  const [arranged,       setArranged]       = useState<string[]>([])
  const [available,      setAvailable]      = useState<string[]>(
    q.type === 'arrange' ? [...(q as ArrQ).words].sort(() => Math.random() - 0.5) : []
  )
  const [input,          setInput]          = useState('')
  const [submitted,      setSubmitted]      = useState(false)
  const [verdict,        setVerdict]        = useState<Verdict | null>(null)
  const [speaking,       setSpeaking]       = useState(false)
  const [corrInput,      setCorrInput]      = useState('')
  const [corrDone,       setCorrDone]       = useState(false)
  const handleAccentKey  = useAccentInput(input,      setInput)
  const handleCorrKey    = useAccentInput(corrInput,  setCorrInput)

  const needsCorrection = verdict === 'almost' || verdict === 'wrong'
  const canAdvance      = !submitted ? false : verdict === 'correct' || corrDone

  function submit(answer: string) {
    if (submitted) return
    const v = getVerdict(answer, q.answer)
    setVerdict(v)
    setSubmitted(true)
    onResult(v, answer)
  }

  function handleCorrChange(val: string) {
    setCorrInput(val)
    if (correctionAccepted(val, q.answer)) setCorrDone(true)
  }

  function playAudio(text: string) {
    if (speaking) return
    setSpeaking(true)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'fr-FR'; u.rate = 0.85
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  const verdictColor = verdict === 'correct' ? 'var(--green)'
    : verdict === 'almost' ? '#d4820e'
    : 'var(--red)'

  const feedbackBg = verdict === 'correct' ? 'rgba(88,204,2,.1)'
    : verdict === 'almost' ? 'rgba(212,130,14,.1)'
    : 'rgba(255,75,75,.1)'

  const corrLabel = verdict === 'almost'
    ? '⚡ Almost! Fix your spelling — type it exactly right'
    : '✍️ Type the correct answer to continue'

  const advBtnLabel = isLast ? 'Finish →' : 'Continue →'
  const advBtnClass = verdict === 'correct' ? 'check-btn continue'
    : verdict === 'almost' ? 'check-btn almost-continue'
    : 'check-btn wrong-continue'

  return (
    <div className="drill-q-wrap">

      {/* ── MCQ ── */}
      {q.type === 'mcq' && (
        <>
          <div className="drill-q-text">{q.prompt}</div>
          <div className="options single-col" style={{ marginTop: 16 }}>
            {(q as McqQ).options.map((opt, i) => {
              let cls = ''
              if (submitted) {
                if (opt === q.answer) cls = 'correct'
                else if (opt === selected) cls = 'wrong'
              }
              return (
                <button key={i} className={`opt ${cls}`}
                  disabled={submitted}
                  onClick={() => { setSelected(opt); submit(opt) }}>
                  <span className="opt-letter">{['A','B','C','D'][i]}</span>{opt}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ── ARRANGE ── */}
      {q.type === 'arrange' && (
        <>
          <div className="drill-q-text">{q.prompt}</div>
          <div className={`drop-zone${arranged.length > 0 ? ' has-words' : ''}${submitted ? (verdict !== 'wrong' ? ' correct' : ' wrong') : ''}`} style={{ marginTop: 16 }}>
            {arranged.length === 0
              ? <span className="drop-zone-placeholder">Tap words below…</span>
              : arranged.map((w, i) => (
                  <button key={i} className={`word-tile placed${submitted ? (verdict !== 'wrong' ? ' correct-tile' : ' wrong-tile') : ''}`}
                    disabled={submitted}
                    onClick={() => {
                      setArranged(a => { const n=[...a]; n.splice(i,1); return n })
                      setAvailable(a => [...a, w])
                    }}>{w}</button>
                ))
            }
          </div>
          <div className="word-bank" style={{ marginTop: 8 }}>
            {available.map((w, i) => (
              <button key={i} className="word-tile" disabled={submitted}
                onClick={() => {
                  setAvailable(a => { const n=[...a]; n.splice(i,1); return n })
                  setArranged(a => [...a, w])
                }}>{w}</button>
            ))}
          </div>
          {!submitted && (
            <button className={`check-btn ${arranged.length > 0 ? 'ready' : 'default'}`}
              style={{ marginTop: 12 }}
              disabled={arranged.length === 0}
              onClick={() => submit(arranged.join(' '))}>Check</button>
          )}
        </>
      )}

      {/* ── LISTEN ── */}
      {q.type === 'listen' && (
        <>
          <div className="drill-q-text">Listen and type what you hear</div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
            <button onClick={() => playAudio((q as ListQ).audioText)}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: speaking ? 'var(--green-dim)' : 'var(--blue-dim)',
                border: `3px solid ${speaking ? 'var(--green)' : 'var(--blue)'}`,
                fontSize: '1.8rem', cursor: 'pointer',
                boxShadow: `0 0 16px ${speaking ? 'var(--green-glow)' : 'var(--blue-glow)'}`,
              }}>
              {speaking ? '🔊' : '▶️'}
            </button>
          </div>
          <div className="accent-bar">
            {ACCENT_BAR.map(ch => (
              <button key={ch} type="button" disabled={submitted} className="accent-btn"
                onClick={() => !submitted && setInput(v => v + ch)}>{ch}</button>
            ))}
          </div>
          <input className={`answer-input${submitted ? (verdict !== 'wrong' ? ' correct' : ' wrong') : ''}`}
            value={input} disabled={submitted} autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="Type what you heard…"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { handleAccentKey(e); if (e.key === 'Enter' && !submitted && input.trim()) submit(input) }} />
          {!submitted && (
            <button className={`check-btn ${input.trim() ? 'ready' : 'default'}`}
              style={{ marginTop: 12 }} disabled={!input.trim()}
              onClick={() => submit(input)}>Check</button>
          )}
        </>
      )}

      {/* ── FILL BLANK ── */}
      {q.type === 'fill_blank' && (
        <>
          <div className="drill-q-text">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              📝 Fill in the blank
            </span>
            {q.prompt}
          </div>
          <div className="accent-bar" style={{ marginTop: 14, marginBottom: 4 }}>
            {ACCENT_BAR.map(ch => (
              <button key={ch} type="button" disabled={submitted} className="accent-btn"
                onClick={() => !submitted && setInput(v => v + ch)}>{ch}</button>
            ))}
          </div>
          <input className={`answer-input${submitted ? (verdict !== 'wrong' ? ' correct' : ' wrong') : ''}`}
            value={input} disabled={submitted} autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="Type the missing word…"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { handleAccentKey(e); if (e.key === 'Enter' && !submitted && input.trim()) submit(input) }} />
          {!submitted && (
            <button className={`check-btn ${input.trim() ? 'ready' : 'default'}`}
              style={{ marginTop: 12 }} disabled={!input.trim()}
              onClick={() => submit(input)}>Check</button>
          )}
        </>
      )}

      {/* ── ERROR CORRECT ── */}
      {q.type === 'error_correct' && (
        <>
          <div className="drill-q-text">
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e8970f', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              ⚠️ Correct the error
            </span>
            <span style={{ background: 'rgba(255,75,75,.1)', border: '1px solid rgba(255,75,75,.2)', borderRadius: 8, padding: '4px 10px', display: 'inline-block' }}>
              {q.prompt}
            </span>
          </div>
          <div className="accent-bar" style={{ marginTop: 14, marginBottom: 4 }}>
            {ACCENT_BAR.map(ch => (
              <button key={ch} type="button" disabled={submitted} className="accent-btn"
                onClick={() => !submitted && setInput(v => v + ch)}>{ch}</button>
            ))}
          </div>
          <input className={`answer-input${submitted ? (verdict !== 'wrong' ? ' correct' : ' wrong') : ''}`}
            value={input} disabled={submitted} autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="Type the corrected sentence…"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { handleAccentKey(e); if (e.key === 'Enter' && !submitted && input.trim()) submit(input) }} />
          {!submitted && (
            <button className={`check-btn ${input.trim() ? 'ready' : 'default'}`}
              style={{ marginTop: 12 }} disabled={!input.trim()}
              onClick={() => submit(input)}>Check</button>
          )}
        </>
      )}

      {/* ── TRANSLATE ── */}
      {q.type === 'translate' && (
        <>
          <div className="drill-q-text">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              {(q as TransQ).direction === 'en-fr' ? '🇬🇧 Translate to French' : '🇫🇷 Translate to English'}
            </span>
            {q.prompt.replace(/^Translate: /, '')}
          </div>
          {(q as TransQ).direction === 'en-fr' && (
            <div className="accent-bar" style={{ marginTop: 14, marginBottom: 4 }}>
              {ACCENT_BAR.map(ch => (
                <button key={ch} type="button" disabled={submitted} className="accent-btn"
                  onClick={() => !submitted && setInput(v => v + ch)}>{ch}</button>
              ))}
            </div>
          )}
          <input className={`answer-input${submitted ? (verdict !== 'wrong' ? ' correct' : ' wrong') : ''}`}
            value={input} disabled={submitted} autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder={(q as TransQ).direction === 'en-fr' ? 'Type in French…' : 'Type in English…'}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { handleAccentKey(e); if (e.key === 'Enter' && !submitted && input.trim()) submit(input) }}
            style={{ marginTop: (q as TransQ).direction === 'en-fr' ? 0 : 16 }} />
          {!submitted && (
            <button className={`check-btn ${input.trim() ? 'ready' : 'default'}`}
              style={{ marginTop: 12 }} disabled={!input.trim()}
              onClick={() => submit(input)}>Check</button>
          )}
        </>
      )}

      {/* ── Feedback bar ── */}
      {submitted && (
        <div style={{
          marginTop: 12, padding: '12px 14px',
          background: feedbackBg,
          border: `1.5px solid ${verdictColor}`,
          borderRadius: 12,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>
            {verdict === 'correct' ? '✅' : verdict === 'almost' ? '⚡' : '❌'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: verdictColor, fontSize: 14 }}>
              {verdict === 'correct' ? 'Correct!'
                : verdict === 'almost' ? 'Close — accent or spelling off'
                : 'Incorrect'}
            </div>
            {(verdict !== 'correct') && (
              <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                Correct answer: <strong style={{ color: verdictColor }}>{q.answer}</strong>
              </div>
            )}
            {q.note && (
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>{q.note}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Correction input ── */}
      {submitted && needsCorrection && !corrDone && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: verdictColor, marginBottom: 6, letterSpacing: '.04em' }}>
            {corrLabel}
          </div>
          <div className="accent-bar">
            {ACCENT_BAR.map(ch => (
              <button key={ch} type="button" className="accent-btn"
                onClick={() => { const v = corrInput + ch; setCorrInput(v); handleCorrChange(v) }}>{ch}</button>
            ))}
          </div>
          <input
            className={`answer-input${correctionAccepted(corrInput, q.answer) ? ' correct' : ''}`}
            value={corrInput}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder={`Type: ${q.answer}`}
            onChange={e => handleCorrChange(e.target.value)}
            onKeyDown={e => {
              handleCorrKey(e)
              if (e.key === 'Enter' && correctionAccepted(corrInput, q.answer)) {
                setCorrDone(true)
              }
            }}
            style={{ marginTop: 4 }}
          />
        </div>
      )}

      {submitted && needsCorrection && corrDone && (
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>
          ✓ Correction accepted — well done!
        </div>
      )}

      {/* ── Advance button ── */}
      {submitted && canAdvance && (
        <button className={advBtnClass} style={{ marginTop: 16 }} onClick={onAdvance}>
          {advBtnLabel}
        </button>
      )}
    </div>
  )
}

// ── DrillRound ───────────────────────────────────────────────────────────────
interface DrillRoundProps {
  questions: DrillQ[]
  hint: boolean
  title: string
  subtitle: string
  accentColor: string
  onDone: (results: QuestionResult[]) => void
}

function DrillRound({ questions, hint, title, subtitle, accentColor, onDone }: DrillRoundProps) {
  const [idx,     setIdx]     = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])
  const resultsRef = useRef<QuestionResult[]>([])

  function handleResult(verdict: Verdict, userAnswer: string) {
    const next = [...resultsRef.current, { question: questions[idx], verdict, userAnswer }]
    resultsRef.current = next
    setResults(next)
  }

  function advance() {
    const nextIdx = idx + 1
    if (nextIdx >= questions.length) {
      onDone(resultsRef.current)
      return
    }
    setIdx(nextIdx)
  }

  const q        = questions[idx]
  const progress = (idx / questions.length) * 100
  const correct  = results.filter(r => r.verdict !== 'wrong').length

  return (
    <div className="drill-round-wrap">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: accentColor, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 12 }}>{subtitle}</div>
        <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: accentColor, borderRadius: 99, transition: 'width .4s ease' }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
          {idx + 1} / {questions.length}
          {results.length > 0 && (
            <span style={{ marginLeft: 10, color: accentColor }}>
              {correct} correct so far
            </span>
          )}
        </div>
      </div>

      {q && (
        <DrillQuestion
          key={`${idx}-${q.type}-${q.prompt.slice(0,20)}`}
          question={q}
          hint={hint}
          isLast={idx + 1 >= questions.length}
          onResult={handleResult}
          onAdvance={advance}
        />
      )}
    </div>
  )
}

// ── Main LessonFlow ──────────────────────────────────────────────────────────
export default function LessonFlow({ unit, onComplete, onBack }: LessonFlowProps) {
  const [phase,           setPhase]           = useState<Phase>('intro')
  const [practiceResults, setPracticeResults] = useState<QuestionResult[]>([])
  const [testResults,     setTestResults]     = useState<QuestionResult[]>([])
  const [reviewResults,   setReviewResults]   = useState<QuestionResult[]>([])
  const [reviewDone,      setReviewDone]      = useState(false)

  const { practice, test } = getUnitLessonQuestions(unit.id)
  const phrases = getUnitPhrases(unit.id)
  const plan = LESSON_PLANS[unit.id]

  const CEFR_COLORS: Record<string,string> = {
    A1: '#34d399', A2: '#4f9cf9', B1: '#a78bfa',
    B2: '#f59e0b', C1: '#f87171', C2: '#e879f9',
  }
  const color = CEFR_COLORS[unit.cefr] || 'var(--blue)'

  function handlePracticeDone(results: QuestionResult[]) {
    setPracticeResults(results)
    setPhase('test')
  }

  function handleTestDone(results: QuestionResult[]) {
    setTestResults(results)
    setPhase('result')
    const passed = results.filter(r => r.verdict !== 'wrong').length >= Math.ceil(results.length * 0.7)
    if (passed) onComplete(true)
  }

  function handleReviewDone(results: QuestionResult[]) {
    setReviewResults(results)
    setReviewDone(true)
    setPhase('result')
  }

  const testCorrect   = testResults.filter(r => r.verdict !== 'wrong').length
  const testPassed    = testResults.length > 0 && testCorrect >= Math.ceil(testResults.length * 0.7)
  const mistakeQs     = testResults.filter(r => r.verdict !== 'correct').map(r => r.question)
  const hasMistakes   = mistakeQs.length > 0 && !reviewDone

  const reviewCorrect = reviewResults.filter(r => r.verdict !== 'wrong').length

  return (
    <div className="lesson-flow-wrap">
      <button className="lesson-flow-back" onClick={onBack}>← Back to tree</button>

      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <div className="lesson-intro-card">
          <div className="lesson-intro-header" style={{ borderColor: color }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color, marginBottom: 4 }}>
              {unit.cefr} · {unit.title}
            </div>
            {plan?.theme && (
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 6, fontStyle: 'italic' }}>
                {plan.theme}
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
              What you'll learn
            </div>
            <div style={{ fontSize: 13, color: 'var(--t2)' }}>
              {plan
                ? `${practice.length} practice exercises · ${test.length}-question test · All new question types unlocked`
                : 'This lesson covers 3 French phrases. Practice them first, then prove mastery in a short test.'}
            </div>
          </div>
          <div className="lesson-phrases-list">
            {phrases.map((p, i) => (
              <div key={i} className="lesson-phrase-row">
                <div className="lesson-phrase-fr">{p.fr}</div>
                <div className="lesson-phrase-en">{p.en}</div>
                {p.note && <div className="lesson-phrase-note">{p.note}</div>}
              </div>
            ))}
          </div>
          {phrases[0]?.note && (
            <div className="lesson-grammar-tip">
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                💡 Grammar tip
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>
                {phrases.map(p => p.note).filter(Boolean).join(' · ')}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="check-btn ready" style={{ flex: 1, background: color, borderColor: color }}
              onClick={() => setPhase('practice')}>
              Start Lesson →
            </button>
          </div>
        </div>
      )}

      {/* ── PRACTICE ── */}
      {phase === 'practice' && (
        <DrillRound
          questions={practice}
          hint={true}
          title="Practice Round"
          subtitle="Learn the phrases — hints are on, mistakes won't count against you."
          accentColor={color}
          onDone={handlePracticeDone}
        />
      )}

      {/* ── TEST ── */}
      {phase === 'test' && (
        <div>
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--amber)', marginBottom: 3 }}>🎯 Unit Test</div>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              No hints this time — answer from memory. You need {Math.ceil(test.length * 0.7)} / {test.length} to pass.
            </div>
          </div>
          <DrillRound
            questions={test}
            hint={false}
            title="Unit Test"
            subtitle={`Answer from memory — ${Math.ceil(test.length * 0.7)} of ${test.length} correct to pass.`}
            accentColor="var(--amber)"
            onDone={handleTestDone}
          />
        </div>
      )}

      {/* ── REVIEW ── */}
      {phase === 'review' && (
        <div>
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(206,130,255,.08)', border: '1px solid rgba(206,130,255,.3)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple)', marginBottom: 3 }}>🔄 Mistake Review</div>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              Redo the questions you got wrong or almost right — no moving on until you type each answer correctly.
            </div>
          </div>
          <DrillRound
            questions={mistakeQs}
            hint={true}
            title="Review Round"
            subtitle={`${mistakeQs.length} question${mistakeQs.length > 1 ? 's' : ''} to fix — corrections required.`}
            accentColor="var(--purple)"
            onDone={handleReviewDone}
          />
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === 'result' && (
        <div className="lesson-result-card">
          <div className="lesson-result-icon">{testPassed ? '🏆' : '😅'}</div>
          <div className="lesson-result-title" style={{ color: testPassed ? color : 'var(--red)' }}>
            {reviewDone ? 'Review Complete!' : testPassed ? 'Lesson Complete!' : 'Almost There!'}
          </div>
          <div className="lesson-result-score">
            {testCorrect} / {testResults.length} correct on the test
            {testResults.some(r => r.verdict === 'almost') && (
              <div style={{ fontSize: 12, color: '#d4820e', marginTop: 4 }}>
                ⚡ {testResults.filter(r => r.verdict === 'almost').length} almost-correct (counted as correct)
              </div>
            )}
          </div>

          {testPassed ? (
            <div style={{ fontSize: 13, color: 'var(--t2)', textAlign: 'center', marginBottom: 16 }}>
              {reviewDone
                ? `You reviewed all ${reviewResults.length} mistake${reviewResults.length > 1 ? 's' : ''} — great persistence!`
                : `You've mastered ${unit.title}. Keep going!`}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--t2)', textAlign: 'center', marginBottom: 16 }}>
              You need {Math.ceil(testResults.length * 0.7)} to pass. Review the phrases and try again.
            </div>
          )}

          {/* Score breakdown */}
          <div className="lesson-result-bars">
            <div className="lesson-result-bar-row">
              <span>Practice</span>
              <span>{practiceResults.filter(r => r.verdict !== 'wrong').length} / {practiceResults.length}</span>
            </div>
            <div className="lesson-result-bar-row">
              <span>Test</span>
              <span style={{ color: testPassed ? color : 'var(--red)' }}>
                {testCorrect} / {testResults.length}
              </span>
            </div>
            {reviewDone && (
              <div className="lesson-result-bar-row">
                <span>Review</span>
                <span style={{ color: 'var(--purple)' }}>
                  {reviewCorrect} / {reviewResults.length}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {testPassed ? (
              <>
                {hasMistakes && (
                  <button className="check-btn default" style={{ flex: 1 }}
                    onClick={() => setPhase('review')}>
                    🔄 Review {mistakeQs.length} mistake{mistakeQs.length > 1 ? 's' : ''}
                  </button>
                )}
                <button className="check-btn continue" style={{ flex: 1 }} onClick={onBack}>
                  Continue →
                </button>
              </>
            ) : (
              <>
                <button className="check-btn default" style={{ flex: 1 }} onClick={() => setPhase('intro')}>
                  Study again
                </button>
                {hasMistakes && (
                  <button className="check-btn default" style={{ flex: 1 }}
                    onClick={() => setPhase('review')}>
                    🔄 Review {mistakeQs.length} mistake{mistakeQs.length > 1 ? 's' : ''}
                  </button>
                )}
                <button className="check-btn ready" style={{ flex: 1 }}
                  onClick={() => { setTestResults([]); setReviewDone(false); setPhase('test') }}>
                  Retry test
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
