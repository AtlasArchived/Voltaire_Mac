'use client'
/**
 * components/PronunciationFeedback.tsx
 * Voltaire — Pronunciation scoring UI component
 * Scoring comes from backend; this renders the feedback display.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PronunciationFeedbackProps {
  word: string
  phonetic: string
  userAudio?: Blob | null
  score?: number | null        // 0-100, null = not scored yet
  feedback?: string            // tip from backend
  onRecordAgain: () => void
  onClose: () => void
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)'
  const label = score >= 80 ? 'Excellent!' : score >= 60 ? 'Good effort' : 'Keep practicing'

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        border: `5px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        boxShadow: `0 0 28px ${color}55`,
        background: 'var(--surface2)',
      }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700 }}>/ 100</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color }}>{label}</div>
    </motion.div>
  )
}

function Waveform({ animating }: { animating: boolean }) {
  const bars = Array.from({ length: 18 }, (_, i) => i)

  return (
    <div className="pronunciation-waveform">
      {bars.map(i => (
        <div
          key={i}
          className={`waveform-bar${animating ? ' animating' : ''}`}
          style={{ animationDelay: `${(i * 0.06).toFixed(2)}s` }}
        />
      ))}
    </div>
  )
}

export default function PronunciationFeedback({
  word,
  phonetic,
  userAudio,
  score,
  feedback,
  onRecordAgain,
  onClose,
}: PronunciationFeedbackProps) {
  const [waveActive, setWaveActive] = useState(false)

  // Pulse the waveform briefly on mount to show it's active
  useEffect(() => {
    setWaveActive(true)
    const t = setTimeout(() => setWaveActive(false), 2200)
    return () => clearTimeout(t)
  }, [userAudio])

  const tipText = feedback ||
    (score != null && score < 60
      ? 'Try slowing down and focusing on vowel sounds. French vowels are purer than in English.'
      : score != null && score < 80
      ? 'Good attempt! Pay attention to nasal vowels and silent letters.'
      : 'Keep it up! Focus on linking sounds smoothly between words.')

  return (
    <motion.div
      className="pronunciation-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="pronunciation-modal"
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--blue-b)', lineHeight: 1.1 }}>{word}</div>
            <div style={{ fontSize: '1rem', color: 'var(--t3)', fontWeight: 600, marginTop: 4 }}>{phonetic}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}
          >
            ✕
          </button>
        </div>

        {/* Waveform */}
        <Waveform animating={waveActive} />

        {/* Score */}
        <AnimatePresence>
          {score != null && (
            <motion.div
              style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 16px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ScoreRing score={score} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip */}
        {score == null && (
          <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 14, fontWeight: 600, margin: '20px 0', lineHeight: 1.6 }}>
            Recording received. Waiting for score…
          </div>
        )}

        {score != null && (
          <motion.div
            className="pronunciation-tip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span style={{ fontSize: '1.1rem', marginRight: 8 }}>💡</span>
            <span>{tipText}</span>
          </motion.div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            className="pronunciation-btn secondary"
            onClick={onRecordAgain}
          >
            🎙️ Record Again
          </button>
          <button
            className="pronunciation-btn primary"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
