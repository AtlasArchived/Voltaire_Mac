'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StoryDetail } from '../lib/api'
import { api } from '../lib/api'
import WordHints from './WordHints'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

type Phase = 'read' | 'quiz' | 'done'

// Speaker name → color mapping (deterministic by name)
const SPEAKER_COLORS: Record<string, { bg: string; color: string; border: string }> = {}
const PALETTE = [
  { bg: 'rgba(79,156,249,.15)',  color: '#7ac3ff', border: 'rgba(79,156,249,.4)'  },
  { bg: 'rgba(88,204,2,.12)',    color: '#7ae800', border: 'rgba(88,204,2,.4)'    },
  { bg: 'rgba(206,130,255,.13)', color: '#d9a8ff', border: 'rgba(206,130,255,.4)' },
  { bg: 'rgba(255,217,0,.12)',   color: '#ffd900', border: 'rgba(255,217,0,.4)'   },
  { bg: 'rgba(255,75,75,.12)',   color: '#ff8080', border: 'rgba(255,75,75,.35)'  },
  { bg: 'rgba(28,176,246,.12)',  color: '#1cb0f6', border: 'rgba(28,176,246,.4)'  },
]
let paletteIdx = 0
function getSpeakerColor(name: string) {
  if (!SPEAKER_COLORS[name]) {
    SPEAKER_COLORS[name] = PALETTE[paletteIdx % PALETTE.length]
    paletteIdx++
  }
  return SPEAKER_COLORS[name]
}

export default function StoryPlayer({
  detail,
  onClose,
  onCompleted,
}: {
  detail: StoryDetail
  onClose: () => void
  onCompleted: () => void
}) {
  const [phase, setPhase]               = useState<Phase>('read')
  const [lineIdx, setLineIdx]           = useState(0)
  const [prevLineIdx, setPrevLineIdx]   = useState(-1)
  const [showEn, setShowEn]             = useState(true)
  const [qIdx, setQIdx]                 = useState(0)
  const [picked, setPicked]             = useState<number | null>(null)
  const [revealed, setRevealed]         = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finalScore, setFinalScore]     = useState(0)
  const [submitting, setSubmitting]     = useState(false)
  const [lineKey, setLineKey]           = useState(0)

  const lines     = detail.lines || []
  const questions = detail.questions || []
  const line      = lines[lineIdx]
  const q         = questions[qIdx]

  const progressPct     = lines.length > 1 ? Math.round((lineIdx / (lines.length - 1)) * 100) : 100
  const quizProgressPct = questions.length > 1 ? Math.round((qIdx / questions.length) * 100) : 0

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
      void api.logLessonMemory({
        lesson_id: `story:${detail.id}`,
        title: detail.title_fr,
        source: 'story',
        detail: `Score ${score}/${total}`,
      }).catch(() => {})
      // Fire confetti on good scores
      const pct = total > 0 ? score / total : 1
      if (pct >= 0.7) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#58cc02', '#ffd900', '#4f9cf9', '#ce82ff'] })
      }
      onCompleted()
    } catch {
      toast.error('Could not save story result')
    } finally {
      setSubmitting(false)
    }
  }

  function goToLine(idx: number) {
    setPrevLineIdx(lineIdx)
    setLineIdx(idx)
    setLineKey(k => k + 1)
  }

  // ── READ phase ───────────────────────────────────────────────────────────────
  if (phase === 'read' && line) {
    const speakerColors = getSpeakerColor(line.speaker || 'Narrator')
    const direction = lineIdx > prevLineIdx ? 1 : -1

    return (
      <div style={{ height: '100%', overflowY: 'auto', padding: '20px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
          <button type="button" className="check-btn default" style={{ width: 'auto', padding: '8px 12px' }} onClick={onClose}>
            ← Stories
          </button>
          <label style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={showEn} onChange={e => setShowEn(e.target.checked)} />
            Show English
          </label>
        </div>

        {/* Reading progress bar */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>
              {detail.emoji} {detail.title_fr}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-b)' }}>
              {lineIdx + 1} / {lines.length}
            </div>
          </div>
          <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--blue), var(--blue-b))',
                borderRadius: 99,
                boxShadow: '0 0 8px rgba(79,156,249,.4)',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>{detail.setting} · {detail.cefr}</div>
        </div>

        {/* Story line card — animated */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={lineKey}
              className="story-line"
              initial={{ opacity: 0, y: direction > 0 ? 30 : -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -20 : 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                background: 'var(--surface2)',
                border: '1.5px solid var(--border2)',
                borderRadius: 18,
                padding: '20px 22px',
                marginBottom: 16,
              }}
            >
              {/* Speaker badge */}
              {line.speaker && (
                <div style={{ marginBottom: 12 }}>
                  <span className="speaker-badge" style={{
                    background: speakerColors.bg,
                    color: speakerColors.color,
                    border: `1.5px solid ${speakerColors.border}`,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 99,
                    letterSpacing: '.06em',
                  }}>
                    {line.speaker}
                  </span>
                </div>
              )}

              {/* French text */}
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.5 }}>
                <WordHints text={line.french} pair="fr|en" />
              </div>

              {/* English translation */}
              <AnimatePresence>
                {showEn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, overflow: 'hidden' }}
                  >
                    {line.english}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              type="button"
              className="check-btn ready"
              style={{ width: 'auto', padding: '10px 16px', fontSize: 14 }}
              onClick={() => playFr(line.audio_hint || line.french)}
            >
              🔊 Play
            </button>
            {lineIdx > 0 && (
              <button type="button" className="check-btn default" style={{ width: 'auto', padding: '10px 14px' }} onClick={() => goToLine(lineIdx - 1)}>
                ← Prev
              </button>
            )}
            {lineIdx < lines.length - 1 ? (
              <button
                type="button"
                className="check-btn continue"
                style={{ width: 'auto', padding: '10px 18px' }}
                onClick={() => goToLine(lineIdx + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="check-btn continue"
                style={{ width: 'auto', padding: '10px 18px' }}
                onClick={() => {
                  if (questions.length) setPhase('quiz')
                  else {
                    setFinalScore(1)
                    void finishStory(1, 1).then(() => setPhase('done'))
                  }
                }}
              >
                {questions.length ? 'Quiz Time! →' : 'Finish'}
              </button>
            )}
          </div>

          {/* Line counter dots */}
          {lines.length <= 12 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              {lines.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToLine(i)}
                  style={{
                    width: i === lineIdx ? 20 : 8,
                    height: 8,
                    borderRadius: 99,
                    border: 'none',
                    cursor: 'pointer',
                    background: i === lineIdx ? 'var(--blue)' : i < lineIdx ? 'var(--surface3)' : 'var(--surface3)',
                    opacity: i < lineIdx ? 0.9 : i === lineIdx ? 1 : 0.4,
                    transition: 'all .2s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── QUIZ phase ───────────────────────────────────────────────────────────────
  if (phase === 'quiz' && q) {
    const onNext = async () => {
      if (picked === null) {
        toast.error('Choose an answer first')
        return
      }
      const ok = picked === q.correct
      const nextCorrect = correctCount + (ok ? 1 : 0)
      if (!ok) toast(q.explanation, { icon: '💡', duration: 4000 })
      if (qIdx < questions.length - 1) {
        setCorrectCount(nextCorrect)
        setQIdx(i => i + 1)
        setPicked(null)
        setRevealed(false)
      } else {
        const total = questions.length
        setFinalScore(nextCorrect)
        await finishStory(nextCorrect, total)
        setPhase('done')
      }
    }

    return (
      <div style={{ height: '100%', overflowY: 'auto', padding: '20px', maxWidth: 560, margin: '0 auto' }}>

        {/* Quiz progress bar */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <button type="button" className="check-btn default" style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }} onClick={onClose}>
              ← Exit
            </button>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue-b)' }}>
              Question {qIdx + 1} / {questions.length}
            </div>
          </div>
          <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${quizProgressPct}%` }}
              transition={{ duration: 0.4 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--blue), var(--purple))',
                borderRadius: 99,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{
              background: 'var(--surface2)', border: '1.5px solid var(--border2)',
              borderRadius: 16, padding: '18px 20px', marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Comprehension Check
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, lineHeight: 1.45 }}>
                <WordHints text={q.question_fr} pair="fr|en" />
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>{q.question_en}</div>
            </div>

            {/* Options — game-like animated buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {q.options.map((opt, i) => {
                const isSelected = picked === i
                const isCorrect  = revealed && i === q.correct
                const isWrong    = revealed && isSelected && i !== q.correct

                return (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => { if (!revealed) setPicked(i) }}
                    whileHover={!revealed ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!revealed ? { scale: 0.98 } : {}}
                    animate={
                      isCorrect ? { scale: [1, 1.04, 1], transition: { duration: 0.3 } }
                      : isWrong ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } }
                      : {}
                    }
                    style={{
                      width: '100%',
                      background: isCorrect
                        ? 'var(--green-dim)'
                        : isWrong
                        ? 'var(--red-dim)'
                        : isSelected
                        ? 'var(--blue-dim)'
                        : 'var(--surface2)',
                      border: `2px solid ${
                        isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : isSelected ? 'var(--blue)' : 'var(--border2)'
                      }`,
                      borderRadius: 14,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      cursor: revealed ? 'default' : 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--font)',
                      color: isCorrect ? 'var(--green-b)' : isWrong ? 'var(--red)' : 'var(--text)',
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: isSelected && !revealed ? '0 4px 16px rgba(79,156,249,.25)' : 'none',
                      transition: 'background .15s, border-color .15s, color .15s',
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : isSelected ? 'var(--blue)' : 'var(--surface3)',
                      border: '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: isSelected || isCorrect || isWrong ? '#fff' : 'var(--t3)',
                      transition: 'all .15s',
                    }}>
                      {isCorrect ? '✓' : isWrong ? '✗' : ['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                  </motion.button>
                )
              })}
            </div>

            {/* Submit / Next */}
            {!revealed && picked !== null && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                type="button"
                className="check-btn ready"
                style={{ marginBottom: 8 }}
                onClick={() => setRevealed(true)}
                disabled={submitting}
              >
                Check Answer
              </motion.button>
            )}

            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Explanation */}
                {picked !== q.correct && q.explanation && (
                  <div style={{
                    background: 'rgba(79,156,249,.08)', border: '1.5px solid rgba(79,156,249,.25)',
                    borderRadius: 12, padding: '12px 14px', marginBottom: 10, fontSize: 13, color: 'var(--t2)',
                  }}>
                    <div style={{ fontWeight: 800, color: 'var(--blue-b)', marginBottom: 4 }}>💡 Explanation</div>
                    {q.explanation}
                  </div>
                )}
                <button
                  type="button"
                  className="check-btn continue"
                  onClick={onNext}
                  disabled={submitting}
                >
                  {qIdx < questions.length - 1 ? 'Next Question →' : 'See Results 🏁'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ── DONE / celebration screen ─────────────────────────────────────────────────
  if (phase === 'done') {
    const total  = questions.length || 1
    const score  = questions.length ? finalScore : 1
    const pct    = Math.round((score / total) * 100)
    const passed = pct >= 70
    const xpEarned = 20 + Math.round(pct * 0.5)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
        style={{ textAlign: 'center', padding: '48px 28px', maxWidth: 480, margin: '0 auto' }}
      >
        {/* Big celebration emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
          style={{ fontSize: '4rem', marginBottom: 16 }}
        >
          {passed ? '🎉' : '📖'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
            {passed ? 'Story Complete! 🎉' : 'Keep Practicing!'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 24 }}>
            {detail.title_fr}
          </div>

          {/* Score display */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap',
          }}>
            {/* Score ring */}
            <div style={{
              background: passed ? 'var(--green-dim)' : 'var(--red-dim)',
              border: `2px solid ${passed ? 'var(--green)' : 'var(--red)'}`,
              borderRadius: 18, padding: '16px 22px',
              minWidth: 110,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: passed ? 'var(--green-b)' : 'var(--red)' }}>
                {pct}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                {score}/{total} correct
              </div>
            </div>

            {/* XP badge */}
            <div style={{
              background: 'rgba(255,217,0,.12)',
              border: '2px solid rgba(255,217,0,.4)',
              borderRadius: 18, padding: '16px 22px',
              minWidth: 110,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--amber)' }}>
                +{xpEarned}
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>XP earned ⚡</div>
            </div>
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
            {[1, 2, 3].map(star => (
              <motion.span
                key={star}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: pct >= star * 33 ? 1 : 0.2 }}
                transition={{ delay: 0.3 + star * 0.1, type: 'spring' }}
                style={{ fontSize: '2rem' }}
              >
                ⭐
              </motion.span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="check-btn continue"
              style={{ width: 'auto', padding: '13px 28px' }}
              onClick={onClose}
            >
              Back to Stories
            </button>
            {!passed && (
              <button
                type="button"
                className="check-btn ready"
                style={{ width: 'auto', padding: '13px 22px' }}
                onClick={() => {
                  setPhase('read')
                  setLineIdx(0)
                  setQIdx(0)
                  setPicked(null)
                  setRevealed(false)
                  setCorrectCount(0)
                  setFinalScore(0)
                }}
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
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
