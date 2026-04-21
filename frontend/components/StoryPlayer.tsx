'use client'

import { useState, useCallback, useEffect } from 'react'
import type { StoryDetail } from '../lib/api'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

type Phase = 'read' | 'quiz' | 'done'

export default function StoryPlayer({
  detail,
  onClose,
  onCompleted,
}: {
  detail: StoryDetail
  onClose: () => void
  onCompleted: () => void
}) {
  const [phase, setPhase] = useState<Phase>('read')
  const [lineIdx, setLineIdx] = useState(0)
  const [showEn, setShowEn] = useState(true)
  const [qIdx, setQIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const lines = detail.lines || []
  const questions = detail.questions || []
  const line = lines[lineIdx]
  const q = questions[qIdx]

  useEffect(() => {
    if (lines.length === 0 && questions.length > 0) setPhase('quiz')
  }, [lines.length, questions.length])

  const playFr = useCallback((text: string) => {
    if (!text?.trim()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'fr-FR'
    u.rate = 0.9
    const voices = window.speechSynthesis.getVoices()
    const fr = voices.find(v => v.lang.startsWith('fr'))
    if (fr) u.voice = fr
    window.speechSynthesis.speak(u)
  }, [])

  async function finishStory(score: number, total: number) {
    setSubmitting(true)
    try {
      await api.completeStory(detail.id, score, total)
      onCompleted()
    } catch {
      toast.error('Could not save story result')
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'read' && line) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', padding: '20px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button type="button" className="check-btn default" style={{ width: 'auto', padding: '8px 12px' }} onClick={onClose}>
            ← Stories
          </button>
          <label style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={showEn} onChange={e => setShowEn(e.target.checked)} />
            Show English
          </label>
        </div>
        <div style={{ fontSize: 12, color: 'var(--blue-b)', marginBottom: 8 }}>{detail.emoji} {detail.title_fr}</div>
        <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>{detail.setting} · {detail.cefr}</div>
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 6 }}>{line.speaker}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{line.french}</div>
          {showEn && <div style={{ fontSize: 14, color: 'var(--t2)' }}>{line.english}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="check-btn ready" style={{ width: 'auto', padding: '10px 14px' }} onClick={() => playFr(line.audio_hint || line.french)}>
            Play line
          </button>
          {lineIdx > 0 && (
            <button type="button" className="check-btn default" style={{ width: 'auto', padding: '10px 14px' }} onClick={() => setLineIdx(i => i - 1)}>
              Previous
            </button>
          )}
          {lineIdx < lines.length - 1 ? (
            <button type="button" className="check-btn continue" style={{ width: 'auto', padding: '10px 14px' }} onClick={() => setLineIdx(i => i + 1)}>
              Next
            </button>
          ) : (
            <button
              type="button"
              className="check-btn continue"
              style={{ width: 'auto', padding: '10px 14px' }}
              onClick={() => {
                if (questions.length) setPhase('quiz')
                else {
                  setFinalScore(1)
                  void finishStory(1, 1).then(() => setPhase('done'))
                }
              }}
            >
              {questions.length ? 'Comprehension quiz' : 'Finish'}
            </button>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 12 }}>
          Line {lineIdx + 1} / {lines.length}
        </div>
      </div>
    )
  }

  if (phase === 'quiz' && q) {
    const onNext = async () => {
      if (picked === null) {
        toast.error('Choose an answer')
        return
      }
      const ok = picked === q.correct
      const nextCorrect = correctCount + (ok ? 1 : 0)
      if (!ok) toast(q.explanation, { icon: '💡' })
      if (qIdx < questions.length - 1) {
        setCorrectCount(nextCorrect)
        setQIdx(i => i + 1)
        setPicked(null)
      } else {
        const total = questions.length
        setFinalScore(nextCorrect)
        await finishStory(nextCorrect, total)
        setPhase('done')
      }
    }

    return (
      <div style={{ height: '100%', overflowY: 'auto', padding: '20px', maxWidth: 560, margin: '0 auto' }}>
        <button type="button" className="check-btn default" style={{ width: 'auto', padding: '8px 12px', marginBottom: 16 }} onClick={onClose}>
          ← Exit
        </button>
        <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 8 }}>Question {qIdx + 1} / {questions.length}</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{q.question_fr}</div>
        <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 16 }}>{q.question_en}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`check-btn ${picked === i ? 'continue' : 'default'}`}
              style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', padding: '12px 14px' }}
              onClick={() => setPicked(i)}
            >
              {opt}
            </button>
          ))}
        </div>
        <button type="button" className="check-btn ready" style={{ marginTop: 16, padding: '12px 16px' }} onClick={onNext} disabled={submitting}>
          {qIdx < questions.length - 1 ? 'Next question' : 'See results'}
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    const total = questions.length || 1
    const score = questions.length ? finalScore : 1
    const pct = Math.round((score / total) * 100)
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{pct >= 70 ? '✓' : '◑'}</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Story complete</div>
        <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 24 }}>
          Score: {score}/{total} ({pct}%)
        </div>
        <button type="button" className="check-btn continue" onClick={onClose}>
          Back to stories
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
      No content for this story.
      <button type="button" className="check-btn default" style={{ marginTop: 16 }} onClick={onClose}>
        Close
      </button>
    </div>
  )
}
