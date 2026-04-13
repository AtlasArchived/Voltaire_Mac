'use client'
/**
 * components/DailyStreakModal.tsx
 * Voltaire — Daily streak celebration modal
 * Shows once per day when the user has an active streak.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyStreakModalProps {
  streak: number
  onClose: () => void
}

function getMotivationalMessage(streak: number): string {
  if (streak >= 30) return "You're unstoppable! Legend status 🏆"
  if (streak >= 14) return 'Two weeks of dedication!'
  if (streak >= 7)  return 'One week strong! 🔥'
  return 'Keep the momentum going!'
}

export function shouldShowStreakModal(streak: number): boolean {
  if (streak <= 0) return false
  const today = new Date().toDateString()
  try {
    const last = localStorage.getItem('last_streak_shown')
    if (last === today) return false
  } catch { /* localStorage unavailable */ }
  return true
}

export function markStreakModalShown(): void {
  try {
    localStorage.setItem('last_streak_shown', new Date().toDateString())
  } catch { /* ignore */ }
}

export default function DailyStreakModal({ streak, onClose }: DailyStreakModalProps) {
  const [visible, setVisible] = useState(true)

  function handleClose() {
    setVisible(false)
    markStreakModalShown()
    setTimeout(onClose, 320)
  }

  // Also close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const message = getMotivationalMessage(streak)

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="streak-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="streak-modal"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {/* Animated flame */}
            <motion.div
              className="streak-flame"
              animate={{
                scale: [1, 1.12, 1, 1.08, 1],
                rotate: [-3, 3, -2, 2, 0],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              🔥
            </motion.div>

            {/* Streak number */}
            <motion.div
              className="streak-number"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
            >
              {streak}
            </motion.div>
            <div className="streak-label">Day Streak</div>

            {/* Motivational message */}
            <motion.div
              className="streak-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.4 }}
            >
              {message}
            </motion.div>

            {/* CTA */}
            <motion.button
              className="streak-btn"
              onClick={handleClose}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.35 }}
            >
              Let's Go!
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
