'use client'
/**
 * components/WordTap.tsx
 * Voltaire — Tappable French Text
 *
 * Wraps a block of French text so every word is tappable.
 * On tap/click: shows a tooltip with translation + IPA + TTS button.
 * Works on mobile (touch) and desktop (hover/click).
 *
 * Also preserves the existing .word-cog / .word-lat HTML from annotate_text().
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { api, WordLookup } from '../lib/api'

interface WordTapProps {
  text:      string   // raw French text (may contain HTML from annotate_text)
  isHtml?:   boolean  // if true, render as dangerouslySetInnerHTML
  className?: string
}

interface TooltipState {
  word:     string
  data:     WordLookup | null
  loading:  boolean
  x:        number
  y:        number
}

export default function WordTap({ text, isHtml, className }: WordTapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const cacheRef     = useRef<Record<string, WordLookup>>({})

  // Close tooltip on outside click
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTooltip(null)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const handleWordClick = useCallback(async (
    word: string,
    x: number,
    y: number,
  ) => {
    const clean = word.toLowerCase().replace(/[.,!?;:'"«»—\-]/g, '').trim()
    if (!clean || clean.length < 2) return

    // If same word already showing, close
    if (tooltip?.word === clean) { setTooltip(null); return }

    // Check cache
    if (cacheRef.current[clean]) {
      setTooltip({ word: clean, data: cacheRef.current[clean], loading: false, x, y })
      return
    }

    setTooltip({ word: clean, data: null, loading: true, x, y })

    try {
      const data = await api.lookupWord(clean)
      cacheRef.current[clean] = data
      setTooltip(prev => prev?.word === clean
        ? { ...prev, data, loading: false }
        : prev)
    } catch {
      setTooltip(prev => prev?.word === clean
        ? { ...prev, loading: false, data: { french: clean, english: '—',
            note: null, is_cognate: false, found: false } }
        : prev)
    }
  }, [tooltip])

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

  // If pre-annotated HTML, render it with click delegation
  if (isHtml) {
    return (
      <div ref={containerRef} className={className} style={{ position: 'relative' }}>
        <div
          dangerouslySetInnerHTML={{ __html: text }}
          onClick={(e) => {
            const target = e.target as HTMLElement
            const word = target.textContent?.trim() || ''
            if (word) {
              const rect = target.getBoundingClientRect()
              const containerRect = containerRef.current!.getBoundingClientRect()
              handleWordClick(word, rect.left - containerRect.left + rect.width / 2,
                              rect.top - containerRect.top - 8)
            }
          }}
        />
        {tooltip && (
          <WordTooltip
            tooltip={tooltip}
            onClose={() => setTooltip(null)}
            onPlay={playAudio}
          />
        )}
      </div>
    )
  }

  // Plain text — wrap each word in a tappable span
  const words = text.split(/(\s+)/)

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>
        return (
          <span
            key={i}
            className="word-tap"
            onClick={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect()
              const containerRect = containerRef.current!.getBoundingClientRect()
              handleWordClick(token, rect.left - containerRect.left + rect.width / 2,
                              rect.top - containerRect.top - 8)
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
        />
      )}
    </div>
  )
}

// ── Tooltip component ─────────────────────────────────────────────────────────

function WordTooltip({ tooltip, onClose, onPlay }: {
  tooltip: TooltipState
  onClose: () => void
  onPlay:  (word: string) => void
}) {
  const { word, data, loading, x, y } = tooltip

  return (
    <div
      style={{
        position:   'absolute',
        bottom:     `calc(100% - ${y}px + 12px)`,
        left:       `clamp(8px, ${x}px, calc(100% - 200px))`,
        transform:  'translateX(-50%)',
        background: 'var(--s3)',
        border:     '1px solid var(--b2)',
        borderRadius: '10px',
        padding:    '10px 14px',
        zIndex:     50,
        minWidth:   '160px',
        maxWidth:   '240px',
        boxShadow:  '0 4px 20px rgba(0,0,0,.5)',
        animation:  'fadeUp .2s ease',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Arrow */}
      <div style={{
        position: 'absolute', bottom: -5, left: '50%',
        width: 10, height: 10, background: 'var(--s3)',
        borderRight: '1px solid var(--b2)', borderBottom: '1px solid var(--b2)',
        transform: 'translateX(-50%) rotate(45deg)',
      }} />

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t2)', fontSize: '13px' }}>
          <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid var(--b2)',
                                                  borderTop: '2px solid var(--blue)', borderRadius: '50%' }} />
          Looking up…
        </div>
      ) : data ? (
        <>
          {/* Word + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--blue-bright)' }}>
              {data.french}
            </span>
            {data.is_cognate && (
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--green)',
                              background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)',
                              padding: '1px 6px', borderRadius: '99px' }}>
                cognate
              </span>
            )}
          </div>

          {/* Translation */}
          <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: data.note ? '6px' : '0' }}>
            {data.english}
          </div>

          {/* Note */}
          {data.note && (
            <div style={{ fontSize: '11px', color: 'var(--purple)', marginBottom: '8px' }}>
              ⟳ {data.note}
            </div>
          )}

          {/* Not found message */}
          {!data.found && (
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: '8px' }}>
              Not in vocabulary list yet
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingTop: '8px',
                        borderTop: '1px solid var(--b1)' }}>
            <button
              onClick={() => onPlay(data.french)}
              style={{ flex: 1, background: 'var(--blue2)', border: '1px solid rgba(79,156,249,.2)',
                        borderRadius: '6px', color: 'var(--blue-bright)', fontSize: '12px',
                        padding: '5px 8px', cursor: 'pointer', transition: 'all .15s' }}
            >
              🔊 Hear it
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid var(--b1)',
                        borderRadius: '6px', color: 'var(--t3)', fontSize: '12px',
                        padding: '5px 8px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--t3)' }}>No data found</div>
      )}
    </div>
  )
}
