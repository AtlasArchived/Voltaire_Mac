'use client'
export default function Dots({ color = 'var(--blue)' }: { color?: string }) {
  return (
    <div className="tdots">
      {[0,1,2].map(i => (
        <div key={i} className="tdot" style={{ background: color, animationDelay: `${i * .15}s` }} />
      ))}
    </div>
  )
}
