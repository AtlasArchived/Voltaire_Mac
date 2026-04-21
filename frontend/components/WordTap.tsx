'use client'
/**
 * components/WordTap.tsx
 * Voltaire — Hover-to-Translate French Text
 *
 * Wraps French text so hovering any word shows a Duolingo-style tooltip
 * with its English translation, part of speech, and a grammar note.
 * Tooltip uses position:fixed so it always appears right above the hovered word.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { api, WordLookup } from '../lib/api'

interface WordTapProps {
  text:       string
  isHtml?:    boolean
  className?: string
  style?:     React.CSSProperties
}

interface TooltipState {
  word:    string
  data:    WordLookup | null
  loading: boolean
  x:       number   // viewport px (centre of word)
  y:       number   // viewport px (top of word)
}

const POS_LABELS: Record<string, string> = {
  noun:        'noun',
  verb:        'verb',
  adjective:   'adj.',
  adverb:      'adv.',
  preposition: 'prep.',
  article:     'article',
  pronoun:     'pron.',
  conjunction: 'conj.',
  other:       '',
}

export default function WordTap({ text, isHtml, className, style }: WordTapProps) {
  const [tooltip,     setTooltip]     = useState<TooltipState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const cacheRef     = useRef<Record<string, WordLookup>>({})
  const hoverTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overTooltip  = useRef(false)

  const clearTimers = () => {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null }
    if (hideTimer.current)  { clearTimeout(hideTimer.current);  hideTimer.current  = null }
  }

  useEffect(() => () => clearTimers(), [])

  /** Get the centre-x and top-y of an element in VIEWPORT coordinates */
  const getViewportCoords = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top,
    }
  }

  const lookupWord = useCallback(async (word: string, x: number, y: number) => {
    const clean = word.toLowerCase().replace(/[.,!?;:'"«»—\-]/g, '').trim()
    if (!clean || clean.length < 2) return

    if (cacheRef.current[clean]) {
      setTooltip({ word: clean, data: cacheRef.current[clean], loading: false, x, y })
      return
    }

    setTooltip({ word: clean, data: null, loading: true, x, y })

    try {
      const data = await api.lookupWord(clean)
      cacheRef.current[clean] = data
      setTooltip(prev => prev?.word === clean ? { ...prev, data, loading: false } : prev)
    } catch {
      const fallback: WordLookup = { french: clean, english: '—', note: null, is_cognate: false, found: false }
      setTooltip(prev => prev?.word === clean ? { ...prev, loading: false, data: fallback } : prev)
    }
  }, [])

  const handleWordEnter = useCallback((word: string, x: number, y: number) => {
    clearTimers()
    hoverTimer.current = setTimeout(() => lookupWord(word, x, y), 350)
  }, [lookupWord])

  const handleWordLeave = useCallback(() => {
    clearTimers()
    hideTimer.current = setTimeout(() => {
      if (!overTooltip.current) setTooltip(null)
    }, 200)
  }, [])

  const handleTooltipEnter = () => {
    overTooltip.current = true
    clearTimers()
  }

  const handleTooltipLeave = () => {
    overTooltip.current = false
    hideTimer.current = setTimeout(() => setTooltip(null), 150)
  }

  const playAudio = useCallback(async (word: string) => {
    try {
      const url = await api.tts(word, true)
      if (!url) return
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(url)
      audioRef.current = audio
      await audio.play()
    } catch { /* ignore */ }
  }, [])

  if (isHtml) {
    return (
      <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
        <div
          dangerouslySetInnerHTML={{ __html: text }}
          onMouseOver={(e) => {
            const target = e.target as HTMLElement
            const word = target.textContent?.trim() || ''
            if (word && target !== e.currentTarget) {
              const { x, y } = getViewportCoords(target)
              handleWordEnter(word, x, y)
            }
          }}
          onMouseLeave={handleWordLeave}
          onClick={(e) => {
            const target = e.target as HTMLElement
            const word = target.textContent?.trim() || ''
            if (word) {
              const { x, y } = getViewportCoords(target)
              lookupWord(word, x, y)
            }
          }}
        />
        {tooltip && (
          <WordTooltip
            tooltip={tooltip}
            onClose={() => setTooltip(null)}
            onPlay={playAudio}
            onMouseEnter={handleTooltipEnter}
            onMouseLeave={handleTooltipLeave}
          />
        )}
      </div>
    )
  }

  const tokens = text.split(/(\s+)/)

  return (
    <span ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>
        return (
          <span
            key={i}
            className="word-hover-target"
            onMouseEnter={(e) => {
              const { x, y } = getViewportCoords(e.currentTarget)
              handleWordEnter(token, x, y)
            }}
            onMouseLeave={handleWordLeave}
            onClick={(e) => {
              const { x, y } = getViewportCoords(e.currentTarget)
              lookupWord(token, x, y)
            }}
          >
            {token}
          </span>
        )
      })}

      {tooltip && (
        <WordTooltip
          tooltip={tooltip}
          onClose={() => setTooltip(null)}
          onPlay={playAudio}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
        />
      )}
    </span>
  )
}

function WordTooltip({ tooltip, onClose, onPlay, onMouseEnter, onMouseLeave }: {
  tooltip:      TooltipState
  onClose:      () => void
  onPlay:       (word: string) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const { word, data, loading, x, y } = tooltip
  const pos = data?.part_of_speech
  const posLabel = pos ? (POS_LABELS[pos] ?? pos) : null

  return (
    <div
      className="word-tooltip"
      style={{
        position:  'fixed',
        left:      `clamp(130px, ${x}px, calc(100vw - 130px))`,
        top:       `${y}px`,
        transform: 'translate(-50%, calc(-100% - 10px))',
        zIndex:    9999,
        minWidth:  '190px',
        maxWidth:  '260px',
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={e => e.stopPropagation()}
    >
      {/* Arrow pointing down toward the word */}
      <div className="word-tooltip-arrow" />

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t2)', fontSize: '13px' }}>
          <div style={{
            width: 14, height: 14,
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--blue)',
            borderRadius: '50%',
            animation: 'spin .7s linear infinite',
            flexShrink: 0,
          }} />
          Looking up…
        </div>
      ) : data ? (
        <>
          {/* Direction badge */}
          <div style={{ marginBottom: 6 }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '.06em',
              color: data.direction === 'en-fr' ? 'var(--amber)' : 'var(--blue-bright)',
              background: data.direction === 'en-fr' ? 'rgba(251,191,36,.1)' : 'rgba(79,156,249,.1)',
              border: `1px solid ${data.direction === 'en-fr' ? 'rgba(251,191,36,.25)' : 'rgba(79,156,249,.25)'}`,
              padding: '1px 7px', borderRadius: '99px',
            }}>
              {data.direction === 'en-fr' ? 'EN → FR' : 'FR → EN'}
            </span>
          </div>

          {/* For EN→FR: show the English word hovered (dim), then French translation (prominent) */}
          {/* For FR→EN: show the French word (prominent), then English translation */}
          {data.direction === 'en-fr' ? (
            <>
              {/* Hovered English word (secondary) */}
              <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: 3, fontStyle: 'italic' }}>
                "{data.english}"
              </div>
              {/* French translation (primary) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--blue-bright)', fontWeight: 800, letterSpacing: '.01em' }}>
                  {data.french}
                </span>
                {posLabel && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--purple)', background: 'rgba(167,139,250,.12)', border: '1px solid rgba(167,139,250,.25)', padding: '1px 6px', borderRadius: '99px', flexShrink: 0 }}>
                    {posLabel}
                  </span>
                )}
                {data.is_cognate && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.25)', padding: '1px 6px', borderRadius: '99px', flexShrink: 0 }}>
                    cognate
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              {/* French word (primary) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--blue-bright)', fontWeight: 800, letterSpacing: '.01em' }}>
                  {data.french}
                </span>
                {posLabel && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--purple)', background: 'rgba(167,139,250,.12)', border: '1px solid rgba(167,139,250,.25)', padding: '1px 6px', borderRadius: '99px', flexShrink: 0 }}>
                    {posLabel}
                  </span>
                )}
                {data.is_cognate && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.25)', padding: '1px 6px', borderRadius: '99px', flexShrink: 0 }}>
                    cognate
                  </span>
                )}
              </div>
              {/* English translation */}
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, marginBottom: data.note ? '6px' : '10px' }}>
                {data.english}
              </div>
            </>
          )}

          {/* Grammar / usage note */}
          {data.note && (
            <div style={{
              fontSize: '11px', color: 'var(--t2)',
              marginBottom: '10px', lineHeight: 1.5,
              fontStyle: 'italic',
            }}>
              {data.note}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <button
              onClick={() => onPlay(data.french)}
              style={{
                flex: 1, background: 'rgba(79,156,249,.12)',
                border: '1px solid rgba(79,156,249,.25)',
                borderRadius: '6px', color: 'var(--blue-bright)',
                fontSize: '12px', fontWeight: 600,
                padding: '5px 8px', cursor: 'pointer',
              }}
            >
              🔊 Hear it
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--t3)',
                fontSize: '12px', padding: '5px 8px', cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--t3)' }}>Not found</div>
      )}
    </div>
  )
}
