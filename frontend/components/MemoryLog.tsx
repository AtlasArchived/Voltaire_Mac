'use client'

import { useEffect, useState } from 'react'
import { api, LessonMemoryItem } from '../lib/api'

export default function MemoryLog() {
  const [items, setItems] = useState<LessonMemoryItem[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    api
      .getLessonMemory(150)
      .then(r => setItems(r.items || []))
      .catch(e => setErr(String(e)))
  }, [])

  return (
    <div style={{ padding: '20px 24px 48px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>📓 Learning memory</div>
      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
        Completed units, exams, and stories — newest first.
      </div>
      {err && (
        <div style={{ padding: 12, borderRadius: 12, background: 'var(--red-dim)', color: 'var(--red)', fontSize: 13 }}>
          {err}
        </div>
      )}
      {!err && items.length === 0 && (
        <div style={{ fontSize: 14, color: 'var(--t3)' }}>No milestones logged yet. Finish a unit, pass an exam, or complete a story.</div>
      )}
      {!err && items.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(it => (
            <li
              key={it.id}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue-b)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {it.source}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{it.title}</div>
              {it.detail ? (
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>{it.detail}</div>
              ) : null}
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>
                {it.created_at?.replace('T', ' ').slice(0, 19)} · {it.lesson_id}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
