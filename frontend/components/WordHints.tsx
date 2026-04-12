'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'

const glossCache = new Map<string, string>()

function tokenizeWords(text: string) {
  const out: { type: 'word' | 'gap'; text: string }[] = []
  let last = 0
  const re = /[A-Za-zÀ-ÿ]+(?:'[A-Za-zÀ-ÿ]+)?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: 'gap', text: text.slice(last, m.index) })
    out.push({ type: 'word', text: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ type: 'gap', text: text.slice(last) })
  return out
}

export default function WordHints({
  text,
  pair = 'fr|en',
  className,
}: {
  text: string
  pair?: 'fr|en' | 'en|fr'
  className?: string
}) {
  const parts = useMemo(() => tokenizeWords(text), [text])
  const [tip, setTip] = useState<{ t: string; x: number; y: number } | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }

  const onEnter = useCallback(
    async (e: React.MouseEvent, word: string) => {
      clearHide()
      const key = `${pair}:${word.toLowerCase()}`
      let gloss = glossCache.get(key)
      if (!gloss) {
        try {
          const r = await api.hoverTranslation(word, pair)
          gloss = (r.text || '—').trim()
          glossCache.set(key, gloss)
        } catch {
          gloss = '—'
        }
      }
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setTip({ t: gloss, x: rect.left + rect.width / 2, y: rect.top })
    },
    [pair],
  )

  const scheduleHide = () => {
    clearHide()
    hideTimer.current = setTimeout(() => setTip(null), 140)
  }

  return (
    <>
      <span className={className}>
        {parts.map((p, i) =>
          p.type === 'gap' ? (
            <span key={i}>{p.text}</span>
          ) : (
            <span key={i} className="word-hint" onMouseEnter={e => void onEnter(e, p.text)} onMouseLeave={scheduleHide}>
              {p.text}
            </span>
          ),
        )}
      </span>
      {tip && (
        <span
          role="tooltip"
          className="word-hint-gloss"
          style={{
            position: 'fixed',
            left: tip.x,
            top: tip.y - 6,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          onMouseEnter={clearHide}
          onMouseLeave={scheduleHide}
        >
          {tip.t}
        </span>
      )}
    </>
  )
}
