'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AchievementToastProps {
  title: string
  description: string
  icon: string
  xp: number
  onDismiss?: () => void
}

export default function AchievementToast({ title, description, icon, xp, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Animate progress bar down over 4 seconds
    const start = Date.now()
    const duration = 4000
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (elapsed >= duration) {
        clearInterval(interval)
        setVisible(false)
        setTimeout(() => onDismiss?.(), 400)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 120, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 120, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          style={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 9999,
            width: 300,
            background: 'var(--surface2)',
            border: '1.5px solid var(--border2)',
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05)',
          }}
        >
          {/* Progress bar at top */}
          <div style={{ height: 3, background: 'var(--surface3)', position: 'relative' }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--amber), #ff9600)',
                borderRadius: 99,
                width: `${progress}%`,
              }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <div style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* Icon in glowing circle */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--amber-dim), rgba(255,150,0,.2))',
                border: '2px solid var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
                boxShadow: '0 0 20px rgba(255,217,0,.35)',
              }}
            >
              {icon}
            </motion.div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                  {title}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', lineHeight: 1.45, marginBottom: 8 }}>
                {description}
              </div>
              {/* XP badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'linear-gradient(135deg, #ffd900, #ff9600)',
                color: '#000',
                fontSize: 12,
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: 99,
                boxShadow: '0 2px 8px rgba(255,217,0,.4)',
              }}>
                +{xp} XP ⚡
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => { setVisible(false); setTimeout(() => onDismiss?.(), 400) }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--t3)',
                cursor: 'pointer',
                fontSize: 16,
                padding: 2,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Achievement manager hook ────────────────────────────────────────────────
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp: number
}

interface AchievementQueueProps {
  queue: Achievement[]
  onDismiss: (id: string) => void
}

export function AchievementQueue({ queue, onDismiss }: AchievementQueueProps) {
  return (
    <>
      {queue.map((a, idx) => (
        <div key={a.id} style={{ position: 'fixed', top: 80 + idx * 110, right: 20, zIndex: 9999 - idx }}>
          <AchievementToast
            title={a.title}
            description={a.description}
            icon={a.icon}
            xp={a.xp}
            onDismiss={() => onDismiss(a.id)}
          />
        </div>
      ))}
    </>
  )
}
