'use client'
/**
 * components/VoiceMode.tsx
 * Voltaire — Voice Conversation Mode
 *
 * Uses Web Speech API for:
 *  - SpeechRecognition: mic input → text
 *  - Audio playback: Voltaire's response as TTS audio
 *
 * Works on: Chrome, Edge, Safari (iOS 14.5+)
 * Does NOT work on: Firefox (no SpeechRecognition support)
 */

import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react'
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
  role:    'user' | 'voltaire'
  text:    string
  time:    string
}

// ── Orb visual states ─────────────────────────────────────────────────────────

const ORB_STATES: Record<VoiceStatus, { label: string; color: string; icon: string }> = {
  idle:       { label: 'Tap to speak',      color: 'var(--blue)',   icon: '🎙️' },
  listening:  { label: 'Listening…',        color: 'var(--blue)',   icon: '👂' },
  processing: { label: 'Voltaire thinks…',  color: 'var(--purple)', icon: '⟳'  },
  speaking:   { label: 'Voltaire speaks…',  color: 'var(--green)',  icon: '🔊' },
  error:      { label: 'Tap to retry',       color: 'var(--red)',    icon: '⚠️' },
}

export default function VoiceMode() {
  const [status,    setStatus]    = useState<VoiceStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [history,   setHistory]   = useState<Exchange[]>([])
  const [supported, setSupported] = useState(true)

  const recogRef   = useRef<SpeechRecognitionLike | null>(null)
  const audioRef   = useRef<HTMLAudioElement | null>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  /** Final text from SpeechRecognition (React state is stale inside onend). */
  const finalTranscriptRef = useRef('')

  // Check browser support
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    const SR = (w.SpeechRecognition || w.webkitSpeechRecognition) as unknown
    if (!SR) setSupported(false)
  }, [])

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
      if (!t) {
        resolve()
        return
      }
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
    recog.lang           = 'fr-FR'
    recog.interimResults = true
    recog.maxAlternatives = 1
    recog.continuous     = false

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
        setTimeout(() => setStatus('idle'), 2000)
      }
    }

    recog.onerror = (e: { error?: string }) => {
      if (e.error === 'no-speech') {
        setStatus('idle')
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 2000)
      }
    }

    recog.start()
  }, [speakWithBrowserTTS])

  const stopListening = useCallback(() => {
    recogRef.current?.stop()
  }, [])

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause()
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
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🌐</div>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>Browser not supported</div>
        <div style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.7 }}>
          Voice mode requires Chrome, Edge, or Safari (iOS 14.5+).
          Firefox does not support the Web Speech API.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px' }}>

      {/* Header */}
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.16em',
                    textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '16px' }}>
        🎙️ Conversation Vocale — Speak French with Voltaire
      </div>

      {/* Conversation history */}
      <div ref={historyRef} style={{ flex: 1, overflowY: 'auto', display: 'flex',
                                      flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
        {history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎙️</div>
            <div style={{ fontSize: '14px', lineHeight: 1.7 }}>
              Tap the orb and speak French — or English.<br />
              Voltaire will respond in French at your level.
            </div>
          </div>
        )}

        {history.map((ex, i) => (
          <div key={i} className={ex.role === 'voltaire' ? '' : ''}>
            {ex.role === 'user' ? (
              <div style={{ marginLeft: '38px' }}>
                <div className="bub-u">
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em',
                                textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '5px' }}>
                    You · {ex.time}
                  </div>
                  {ex.text}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                              background: 'var(--blue2)', border: '1px solid rgba(79,156,249,.3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', marginTop: '2px' }}>
                  ✍️
                </div>
                <div className="bub-v animate-fade-up">
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em',
                                textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '5px' }}>
                    Voltaire · {ex.time}
                  </div>
                  {ex.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live transcript */}
        {transcript && (
          <div style={{ marginLeft: '38px' }}>
            <div style={{ background: 'var(--s2)', border: '1px dashed var(--b2)',
                          borderRadius: 'var(--r)', padding: '11px 15px', fontSize: '14px',
                          color: 'var(--t2)', fontStyle: 'italic' }}>
              {transcript}
              <span style={{ animation: 'caret 1s infinite', borderRight: '2px solid var(--blue)',
                              marginLeft: '2px', display: 'inline-block', height: '1em',
                              verticalAlign: 'middle' }} />
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue2)',
                          border: '1px solid rgba(79,156,249,.3)', flexShrink: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✍️</div>
            <div className="bub-v" style={{ display: 'flex', gap: '6px', alignItems: 'center',
                                             padding: '16px 15px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%',
                                      background: 'var(--blue)', opacity: .6,
                                      animation: `pulse-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Orb control */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--b1)' }}>

        {/* Status label */}
        <div style={{ fontSize: '13px', color: 'var(--t2)', height: '20px', textAlign: 'center' }}>
          {orbState.label}
        </div>

        {/* The orb */}
        <button
          onClick={handleOrbClick}
          className={`voice-orb ${status}`}
          style={{ ['--orb-color' as string]: orbState.color } as CSSProperties}
          aria-label={orbState.label}
        >
          <span style={{ fontSize: '2rem' }}>{orbState.icon}</span>
          {status === 'listening' && (
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%',
                          border: '2px solid var(--blue)', opacity: .4,
                          animation: 'pulse-blue 1s ease-in-out infinite' }} />
          )}
        </button>

        {/* Language toggle */}
        <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center' }}>
          Speak in French or English — Voltaire responds in French
        </div>
      </div>
    </div>
  )
}
