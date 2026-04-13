'use client'
/**
 * components/VoiceMode.tsx
 * Voltaire — Voice Conversation Mode (polished)
 *
 * Uses Web Speech API for:
 *  - SpeechRecognition: mic input → text
 *  - Audio playback: Voltaire's response as TTS audio
 *
 * Works on: Chrome, Edge, Safari (iOS 14.5+)
 * Does NOT work on: Firefox (no SpeechRecognition support)
 */

import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((e: any) => void) | null
  onend: (() => void) | null
  onerror: ((e: any) => void) | null
  start: () => void
  stop: () => void
}

interface Exchange {
  role: 'user' | 'voltaire'
  text: string
  time: string
}

// ── Orb visual states ─────────────────────────────────────────────────────────
const ORB_STATES: Record<VoiceStatus, {
  label: string
  hint: string
  gradient: string
  glow: string
  icon: string
}> = {
  idle: {
    label: 'Ready to listen',
    hint: 'Press Space or tap the orb to speak',
    gradient: 'radial-gradient(circle at 35% 35%, #6ab4ff 0%, #4f9cf9 40%, #2563c7 100%)',
    glow: 'rgba(79,156,249,.45)',
    icon: '🎙️',
  },
  listening: {
    label: 'Listening…',
    hint: 'Speak French — tap orb to stop',
    gradient: 'radial-gradient(circle at 35% 35%, #7effc0 0%, #58cc02 40%, #2d8000 100%)',
    glow: 'rgba(88,204,2,.5)',
    icon: '👂',
  },
  processing: {
    label: 'Voltaire is thinking…',
    hint: 'Processing your message',
    gradient: 'radial-gradient(circle at 35% 35%, #e6b3ff 0%, #ce82ff 40%, #8b2fcc 100%)',
    glow: 'rgba(206,130,255,.45)',
    icon: '⟳',
  },
  speaking: {
    label: 'Voltaire speaks…',
    hint: 'Tap to interrupt',
    gradient: 'radial-gradient(circle at 35% 35%, #7ac3ff 0%, #4f9cf9 40%, #1a60c0 100%)',
    glow: 'rgba(79,156,249,.55)',
    icon: '🔊',
  },
  error: {
    label: 'Something went wrong',
    hint: 'Tap to retry',
    gradient: 'radial-gradient(circle at 35% 35%, #ff8080 0%, #ff4b4b 40%, #b31a1a 100%)',
    glow: 'rgba(255,75,75,.5)',
    icon: '⚠️',
  },
}

export default function VoiceMode() {
  const [status, setStatus]       = useState<VoiceStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [history, setHistory]     = useState<Exchange[]>([])
  const [supported, setSupported] = useState(true)
  const [volLevel, setVolLevel]   = useState(0) // 0-1 simulated volume

  const recogRef            = useRef<SpeechRecognitionLike | null>(null)
  const audioRef            = useRef<HTMLAudioElement | null>(null)
  const historyRef          = useRef<HTMLDivElement>(null)
  const volumeIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const finalTranscriptRef  = useRef('')

  // Check browser support
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    const SR = (w.SpeechRecognition || w.webkitSpeechRecognition) as unknown
    if (!SR) setSupported(false)
  }, [])

  // Space bar shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        handleOrbClick()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Animate volume bars while listening
  useEffect(() => {
    if (status === 'listening' || status === 'speaking') {
      volumeIntervalRef.current = setInterval(() => {
        setVolLevel(Math.random() * 0.7 + 0.1)
      }, 120)
    } else {
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current)
      setVolLevel(0)
    }
    return () => {
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current)
    }
  }, [status])

  // Auto-scroll history
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [history])

  const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const speakWithBrowserTTS = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      const t = text.trim()
      if (!t) { resolve(); return }
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(t)
      u.lang = 'fr-FR'
      u.rate = 0.88
      const voices = window.speechSynthesis.getVoices()
      const fr = voices.find(v => v.lang.startsWith('fr'))
      if (fr) u.voice = fr
      u.onend = () => resolve()
      u.onerror = () => resolve()
      window.speechSynthesis.speak(u)
    })
  }, [])

  const startListening = useCallback(() => {
    const w = window as unknown as Record<string, unknown>
    const SR = (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => SpeechRecognitionLike) | undefined
    if (!SR) return

    setStatus('listening')
    setTranscript('')
    finalTranscriptRef.current = ''

    const recog = new SR()
    recogRef.current = recog
    recog.lang = 'fr-FR'
    recog.interimResults = true
    recog.maxAlternatives = 1
    recog.continuous = false

    recog.onresult = (e: any) => {
      let full = ''
      const res = e.results
      for (let i = 0; i < res.length; i++) {
        full += res[i][0].transcript
      }
      finalTranscriptRef.current = full
      setTranscript(full)
    }

    recog.onend = async () => {
      const final = finalTranscriptRef.current.trim()
      if (!final) {
        setStatus('idle')
        return
      }

      setHistory(h => [...h, { role: 'user', text: final, time: now() }])
      setStatus('processing')
      setTranscript('')

      try {
        const res = await api.voiceRespond(final)
        setHistory(h => [...h, { role: 'voltaire', text: res.text, time: now() }])

        if (res.audio_b64) {
          setStatus('speaking')
          const audio = new Audio(`data:audio/mpeg;base64,${res.audio_b64}`)
          audioRef.current = audio
          audio.onended = () => setStatus('idle')
          audio.onerror = async () => {
            setStatus('speaking')
            await speakWithBrowserTTS(res.text)
            setStatus('idle')
          }
          try {
            await audio.play()
          } catch {
            setStatus('speaking')
            await speakWithBrowserTTS(res.text)
            setStatus('idle')
          }
        } else {
          setStatus('speaking')
          await speakWithBrowserTTS(res.text)
          setStatus('idle')
        }
      } catch {
        toast.error('Could not reach Voltaire')
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    }

    recog.onerror = (e: { error?: string }) => {
      if (e.error === 'no-speech') {
        setStatus('idle')
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    }

    recog.start()
  }, [speakWithBrowserTTS])

  const stopListening = useCallback(() => {
    recogRef.current?.stop()
  }, [])

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause()
    window.speechSynthesis.cancel()
    setStatus('idle')
  }, [])

  const handleOrbClick = useCallback(() => {
    if (status === 'idle' || status === 'error') startListening()
    else if (status === 'listening')             stopListening()
    else if (status === 'speaking')              stopSpeaking()
  }, [status, startListening, stopListening, stopSpeaking])

  const orbState = ORB_STATES[status]

  if (!supported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--surface2)', border: '2px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
        }}>
          🌐
        </div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Browser not supported</div>
        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, maxWidth: 300 }}>
          Voice mode requires Chrome, Edge, or Safari (iOS 14.5+).
          Firefox does not support the Web Speech API.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="check-btn ready"
          style={{ width: 'auto', padding: '12px 28px', marginTop: 8 }}
        >
          Try Refreshing
        </button>
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px' }}>

      {/* Header */}
      <div style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '.16em',
        textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: status === 'listening' ? 'var(--green)' : status === 'error' ? 'var(--red)' : 'var(--blue)',
          boxShadow: status === 'listening' ? '0 0 8px var(--green)' : '0 0 6px var(--blue)',
          animation: status === 'listening' ? 'pulse-glow 1s ease-in-out infinite' : 'none',
          display: 'inline-block',
        }} />
        Conversation Vocale — Speak French with Voltaire
      </div>

      {/* Conversation history */}
      <div
        ref={historyRef}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}
      >
        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🎙️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Parlez avec Voltaire
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
              Tap the orb below and speak French — or English.<br />
              Voltaire will respond in French at your level.
            </div>
            <div style={{ marginTop: 20, fontSize: 12, color: 'var(--blue-b)', fontWeight: 700 }}>
              Press <kbd style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 5, padding: '2px 7px', fontSize: 11 }}>Space</kbd> to speak
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {history.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {ex.role === 'user' ? (
                <div style={{ marginLeft: '38px' }}>
                  <div className="bub-u">
                    <div style={{
                      fontSize: '10px', fontWeight: 600, letterSpacing: '.12em',
                      textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '5px',
                    }}>
                      You · {ex.time}
                    </div>
                    {ex.text}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--blue-dim), rgba(79,156,249,.2))',
                    border: '2px solid rgba(79,156,249,.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', marginTop: '2px',
                    boxShadow: '0 0 12px rgba(79,156,249,.2)',
                  }}>
                    ✍️
                  </div>
                  <div className="bub-v">
                    <div style={{
                      fontSize: '10px', fontWeight: 600, letterSpacing: '.12em',
                      textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '5px',
                    }}>
                      Voltaire · {ex.time}
                    </div>
                    {ex.text}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ marginLeft: '38px' }}
            >
              <div style={{
                background: 'rgba(88,204,2,.06)', border: '1px dashed rgba(88,204,2,.4)',
                borderRadius: 'var(--r)', padding: '11px 15px', fontSize: '14px',
                color: 'var(--t2)', fontStyle: 'italic',
              }}>
                {transcript}
                <span style={{
                  borderRight: '2px solid var(--green)', marginLeft: '2px',
                  display: 'inline-block', height: '1em', verticalAlign: 'middle',
                  animation: 'caret 1s step-end infinite',
                }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing dots */}
        <AnimatePresence>
          {status === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-dim)',
                border: '2px solid rgba(79,156,249,.3)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
              }}>✍️</div>
              <div className="bub-v" style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '16px 15px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--purple)', opacity: .6,
                    animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Orb control area */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--b1)',
      }}>

        {/* Status label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: '13px', color: 'var(--t2)', textAlign: 'center', fontWeight: 600 }}
          >
            {orbState.label}
          </motion.div>
        </AnimatePresence>

        {/* Volume bars */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const active = status === 'listening' || status === 'speaking'
            const barH = active
              ? Math.max(3, Math.round(volLevel * 20 * (0.4 + Math.random() * 0.6)))
              : 3
            return (
              <motion.div
                key={i}
                animate={{ height: barH }}
                transition={{ duration: 0.1 }}
                style={{
                  width: 4,
                  borderRadius: 2,
                  background: status === 'listening'
                    ? 'var(--green)'
                    : status === 'speaking'
                    ? 'var(--blue)'
                    : 'var(--surface3)',
                  opacity: active ? 1 : 0.3,
                }}
              />
            )
          })}
        </div>

        {/* The orb with ripple rings */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Ripple rings (listening state) */}
          <AnimatePresence>
            {status === 'listening' && [0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="ripple-ring"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{
                  duration: 1.8,
                  delay: i * 0.55,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: 100, height: 100,
                  borderRadius: '50%',
                  border: '2px solid var(--green)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Speaking ripples (blue) */}
          <AnimatePresence>
            {status === 'speaking' && [0, 1].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 2.0, opacity: 0 }}
                transition={{
                  duration: 1.4,
                  delay: i * 0.6,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: 100, height: 100,
                  borderRadius: '50%',
                  border: '2px solid var(--blue)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </AnimatePresence>

          {/* The orb button */}
          <motion.button
            onClick={handleOrbClick}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            animate={{
              boxShadow: status === 'listening'
                ? [`0 0 0 0 ${ORB_STATES.listening.glow}`, `0 0 36px 12px ${ORB_STATES.listening.glow}`, `0 0 0 0 ${ORB_STATES.listening.glow}`]
                : status === 'speaking'
                ? [`0 0 0 0 ${ORB_STATES.speaking.glow}`, `0 0 32px 10px ${ORB_STATES.speaking.glow}`, `0 0 0 0 ${ORB_STATES.speaking.glow}`]
                : [`0 0 20px 4px ${orbState.glow}`],
            }}
            transition={{
              boxShadow: {
                duration: status === 'listening' || status === 'speaking' ? 1.2 : 0.3,
                repeat: status === 'listening' || status === 'speaking' ? Infinity : 0,
                ease: 'easeInOut',
              },
            }}
            aria-label={orbState.label}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              background: orbState.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            } as CSSProperties}
          >
            {/* Inner glow layer */}
            <div style={{
              position: 'absolute', inset: 6,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.25) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />

            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
                style={{ fontSize: '2.2rem', position: 'relative', zIndex: 1 }}
              >
                {orbState.icon}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Hint text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={orbState.hint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', fontWeight: 600 }}
          >
            {status === 'idle' ? (
              <>
                Press{' '}
                <kbd style={{
                  background: 'var(--surface3)', border: '1px solid var(--border2)',
                  borderRadius: 5, padding: '1px 6px', fontSize: 10, fontFamily: 'monospace',
                }}>
                  Space
                </kbd>
                {' '}or tap to speak
              </>
            ) : (
              orbState.hint
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error retry */}
        <AnimatePresence>
          {status === 'error' && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => { setStatus('idle'); setTimeout(startListening, 200) }}
              className="check-btn ready"
              style={{ width: 'auto', padding: '10px 24px', fontSize: 13 }}
            >
              🔄 Try Again
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
