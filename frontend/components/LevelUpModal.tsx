'use client'
/**
 * components/LevelUpModal.tsx
 * Voltaire — CEFR level-up celebration modal with confetti burst
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'

interface LevelUpModalProps {
  oldLevel: string
  newLevel: string
  onClose: () => void
}

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A2: 'You can now handle familiar everyday expressions and basic introductions. Conversations about personal details are unlocked.',
  B1: 'Intermediate milestone! You can navigate most situations while travelling and describe experiences and events.',
  B2: 'Upper-intermediate! Complex texts are readable, and spontaneous conversations with native speakers are now possible.',
  C1: 'Advanced! You can express yourself fluently and spontaneously. Academic and professional French unlocked.',
  C2: 'Mastery! You can understand virtually everything heard or read. Congratulations — near-native fluency achieved!',
}

export default function LevelUpModal({ oldLevel, newLevel, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Fire confetti burst on mount
    const fire = (opts: confetti.Options) => confetti({ ...opts, disableForReducedMotion: true })
    const t1 = setTimeout(() => {
      fire({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#ffd900','#ff9600','#4f9cf9','#58cc02','#ce82ff'] })
    }, 180)
    const t2 = setTimeout(() => {
      fire({ particleCount: 60, spread: 120, angle: 60, origin: { x: 0, y: 0.6 }, colors: ['#ffd900','#ff9600','#4f9cf9'] })
      fire({ particleCount: 60, spread: 120, angle: 120, origin: { x: 1, y: 0.6 }, colors: ['#58cc02','#ce82ff','#4f9cf9'] })
    }, 420)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 320)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleShare() {
    const text = `I just reached ${newLevel} in French on Voltaire! 🇫🇷🎉`
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Achievement copied to clipboard!')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  const description = LEVEL_DESCRIPTIONS[newLevel] || `You've reached ${newLevel}!`

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="level-up-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="level-up-modal"
            initial={{ opacity: 0, scale: 0.75, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          >
            {/* Gold glow aura */}
            <div className="level-up-aura" />

            {/* Stars */}
            <motion.div
              style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: 8 }}
              animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌟
            </motion.div>

            <div className="level-up-headline">You've Unlocked {newLevel}!</div>

            {/* Level transition */}
            <div className="level-up-transition">
              <div className="level-up-badge old">{oldLevel}</div>
              <motion.div
                className="level-up-arrow"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                →
              </motion.div>
              <motion.div
                className="level-up-badge new"
                animate={{ boxShadow: ['0 0 0px rgba(255,217,0,0)', '0 0 28px rgba(255,217,0,.7)', '0 0 0px rgba(255,217,0,0)'] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                {newLevel}
              </motion.div>
            </div>

            {/* Description */}
            <p className="level-up-desc">{description}</p>

            {/* Buttons */}
            <div className="level-up-btns">
              <motion.button
                className="level-up-share-btn"
                onClick={handleShare}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                📣 Share Achievement
              </motion.button>
              <motion.button
                className="level-up-continue-btn"
                onClick={handleClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue Learning
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
