'use client'

import type { CSSProperties } from 'react'

// ── SkeletonLine ──────────────────────────────────────────────────────────────
export function SkeletonLine({
  width = '100%',
  height = 14,
  style,
}: {
  width?: string | number
  height?: string | number
  style?: CSSProperties
}) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: 99,
        ...style,
      }}
    />
  )
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────
export function SkeletonCard({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        ...style,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <SkeletonLine width="60%" height={13} />
          <SkeletonLine width="40%" height={10} />
        </div>
      </div>
      {/* Body lines */}
      <SkeletonLine width="100%" height={12} />
      <SkeletonLine width="85%" height={12} />
      <SkeletonLine width="70%" height={12} />
    </div>
  )
}

// ── SkeletonQuestion ──────────────────────────────────────────────────────────
export function SkeletonQuestion({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '20px 0',
        ...style,
      }}
    >
      {/* Label */}
      <SkeletonLine width="30%" height={11} />
      {/* Prompt */}
      <SkeletonLine width="90%" height={28} />
      <SkeletonLine width="65%" height={28} />
      {/* 4 option buttons */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="skeleton"
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
          }}
        />
      ))}
    </div>
  )
}

// ── SkeletonLeaderboard ───────────────────────────────────────────────────────
export function SkeletonLeaderboard({ rows = 5, style }: { rows?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          {/* Rank */}
          <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
          {/* Avatar */}
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          {/* Name + subtitle */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SkeletonLine width={`${50 + Math.random() * 25}%`} height={12} />
            <SkeletonLine width="35%" height={10} />
          </div>
          {/* Score */}
          <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 99, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}

// ── Full page loading skeleton ────────────────────────────────────────────────
export function SkeletonPage() {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SkeletonLine width="45%" height={22} />
      <SkeletonLine width="25%" height={14} />
      <SkeletonCard />
      <SkeletonQuestion />
    </div>
  )
}
