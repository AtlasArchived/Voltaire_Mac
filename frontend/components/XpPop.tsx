'use client'
import { useEffect } from 'react'
export default function XpPop({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 900); return () => clearTimeout(t) }, [onDone])
  return <div className="xp-popup">+{xp} XP ⚡</div>
}
