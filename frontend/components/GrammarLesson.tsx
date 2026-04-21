'use client'
import { useState } from 'react'
import { GrammarNode, GrammarExercise } from '../lib/grammarBank'
import { answersEquivalent } from '../lib/appHelpers'
import { useAccentInput, ACCENT_BAR } from '../lib/useAccentInput'

interface GrammarLessonProps {
  node: GrammarNode
  onComplete: () => void
  onBack: () => void
}

const CEFR_COLORS: Record<string, string> = {
  A1: '#34d399', A2: '#4f9cf9', B1: '#a78bfa',
  B2: '#f59e0b', C1: '#f87171', C2: '#e879f9',
}

function ExerciseCard({ ex, color }: { ex: GrammarExercise; color: string }) {
  const [selected,  setSelected]  = useState<string | null>(null)
  const [input,     setInput]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct,   setCorrect]   = useState<boolean | null>(null)
  const handleAccentKey = useAccentInput(input, setInput)

  function submit(answer: string) {
    if (submitted) return
    const ok = answersEquivalent(answer, ex.answer)
    setCorrect(ok)
    setSubmitted(true)
  }

  const isMcq = Array.isArray(ex.options) && ex.options.length > 0
  const borderColor = submitted ? (correct ? color : '#f87171') : 'rgba(255,255,255,.12)'

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: `1.5px solid ${borderColor}`,
      borderRadius: 14, padding: '16px 18px', marginBottom: 14,
      transition: 'border-color .2s',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14, lineHeight: 1.5 }}>
        {ex.prompt}
      </div>

      {isMcq ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ex.options!.map((opt, i) => {
            let bg = 'rgba(255,255,255,.05)'
            let bc = 'rgba(255,255,255,.1)'
            if (submitted) {
              if (opt === ex.answer) { bg = `${color}22`; bc = color }
              else if (opt === selected) { bg = 'rgba(248,113,113,.15)'; bc = '#f87171' }
            }
            return (
              <button key={i} disabled={submitted} onClick={() => { setSelected(opt); submit(opt) }}
                style={{
                  padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${bc}`,
                  background: bg, color: 'var(--text)', cursor: submitted ? 'default' : 'pointer',
                  textAlign: 'left', fontSize: 13, fontWeight: 500, transition: 'all .15s',
                }}>
                <span style={{ color: 'var(--t3)', marginRight: 8, fontWeight: 700 }}>{['A','B','C','D'][i]}.</span>
                {opt}
              </button>
            )
          })}
        </div>
      ) : (
        <>
          {/* Accent bar */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {ACCENT_BAR.map(ch => (
              <button key={ch} disabled={submitted}
                onClick={() => !submitted && setInput(v => v + ch)}
                style={{
                  width: 30, height: 28, borderRadius: 6, border: '1.5px solid rgba(255,255,255,.15)',
                  background: 'rgba(255,255,255,.06)', color: 'var(--text)',
                  fontSize: 13, fontWeight: 600, cursor: submitted ? 'not-allowed' : 'pointer',
                }}>
                {ch}
              </button>
            ))}
          </div>
          <input
            value={input} disabled={submitted}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="Type your answer…"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { handleAccentKey(e); if (e.key === 'Enter' && !submitted && input.trim()) submit(input) }}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              border: `1.5px solid ${borderColor}`, background: 'rgba(255,255,255,.05)',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {!submitted && (
            <button disabled={!input.trim()} onClick={() => submit(input)}
              style={{
                marginTop: 8, padding: '8px 20px', borderRadius: 10,
                background: input.trim() ? color : 'rgba(255,255,255,.06)',
                color: input.trim() ? '#000' : 'var(--t4)',
                border: 'none', fontWeight: 700, fontSize: 13, cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}>
              Check ✓
            </button>
          )}
        </>
      )}

      {submitted && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 10,
          background: correct ? `${color}18` : 'rgba(248,113,113,.12)',
          border: `1px solid ${correct ? color + '44' : 'rgba(248,113,113,.35)'}`,
          fontSize: 13,
        }}>
          <div style={{ fontWeight: 800, color: correct ? color : '#f87171', marginBottom: 4 }}>
            {correct ? '✓ Correct!' : `✗ Correct answer: ${ex.answer}`}
          </div>
          {!correct && (
            <div style={{ color: 'var(--t3)', fontSize: 12, marginBottom: 4 }}>💡 Hint: {ex.hint}</div>
          )}
          <div style={{ color: 'var(--t2)', fontSize: 12 }}>📚 {ex.note}</div>
        </div>
      )}
    </div>
  )
}

export default function GrammarLesson({ node, onComplete, onBack }: GrammarLessonProps) {
  const [phase, setPhase] = useState<'explain' | 'practice' | 'done'>('explain')
  const color = CEFR_COLORS[node.level] || 'var(--blue)'

  const allAnswered = true // simplified — just let them proceed after reading

  return (
    <div className="lesson-flow-wrap">
      <button className="lesson-flow-back" onClick={onBack}>← Back to tree</button>

      {/* Header badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        padding: '12px 16px',
        background: `${color}12`, border: `1.5px solid ${color}44`, borderRadius: 14,
      }}>
        <span style={{ fontSize: 26 }}>📚</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color, marginBottom: 2 }}>
            {node.title}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{node.concept}</div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>{node.subtitle}</div>
        </div>
      </div>

      {/* EXPLAIN PHASE */}
      {phase === 'explain' && (
        <div>
          {node.explanation.map((para, i) => (
            <p key={i} style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>{para}</p>
          ))}

          {/* Conjugation / reference table */}
          {node.table && (
            <div style={{ overflowX: 'auto', marginBottom: 18 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {node.table.header.map((h, i) => (
                      <th key={i} style={{
                        padding: '8px 12px', textAlign: 'left',
                        background: `${color}20`, color, fontWeight: 800,
                        borderBottom: `2px solid ${color}44`,
                        fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {node.table.rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,.03)' : 'transparent' }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{
                          padding: '8px 12px',
                          color: ci === 0 ? color : 'var(--text)',
                          fontWeight: ci === 0 ? 700 : 400,
                          borderBottom: '1px solid rgba(255,255,255,.06)',
                          fontFamily: ci > 0 ? 'monospace' : 'inherit',
                        }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Memory tip */}
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--amber)', marginBottom: 4 }}>Memory Tip</div>
            <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{node.tip}</div>
          </div>

          <button onClick={() => setPhase('practice')} style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: color, border: 'none', color: '#000',
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}>
            Practice exercises →
          </button>
        </div>
      )}

      {/* PRACTICE PHASE */}
      {phase === 'practice' && (
        <div>
          <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--t2)' }}>
            Answer these exercises to lock in the grammar rule.
          </div>
          {node.exercises.map(ex => (
            <ExerciseCard key={ex.id} ex={ex} color={color} />
          ))}
          <button onClick={() => { setPhase('done'); onComplete() }} style={{
            width: '100%', padding: '13px', borderRadius: 12, marginTop: 8,
            background: color, border: 'none', color: '#000',
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}>
            Complete checkpoint ✓
          </button>
        </div>
      )}

      {/* DONE PHASE */}
      {phase === 'done' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 8 }}>Checkpoint Complete!</div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 24 }}>
            You've mastered <strong style={{ color }}>{node.concept}</strong>. Keep going!
          </div>
          <button onClick={onBack} style={{
            padding: '12px 32px', borderRadius: 12,
            background: color, border: 'none', color: '#000',
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}>Back to tree →</button>
        </div>
      )}
    </div>
  )
}
