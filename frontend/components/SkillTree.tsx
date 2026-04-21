'use client'
import { useMemo } from 'react'
import { UNIT_META, CEFR_ELO, UnitMeta, CefrLevel } from '../lib/questionBank'
import { LEVEL_GRAMMAR_IDS } from '../lib/grammarBank'

interface SkillTreeProps {
  learnerElo: number
  completedUnits: Set<string>
  completedGrammar: Set<string>
  currentUnitId: string
  onSelectUnit: (unitId: string) => void
  onSelectGrammar: (grammarId: string) => void
}

type NodeState = 'complete' | 'current' | 'available' | 'locked-prereq' | 'locked-level'

const CEFR_CONFIG: Record<CefrLevel, { label: string; color: string; dim: string; emoji: string }> = {
  A1: { label: 'Beginner',     color: '#34d399', dim: 'rgba(52,211,153,.13)',  emoji: '🌱' },
  A2: { label: 'Elementary',   color: '#4f9cf9', dim: 'rgba(79,156,249,.13)',  emoji: '🌿' },
  B1: { label: 'Intermediate', color: '#a78bfa', dim: 'rgba(167,139,250,.13)', emoji: '🌳' },
  B2: { label: 'Upper-Int.',   color: '#f59e0b', dim: 'rgba(245,158,11,.13)',  emoji: '🔥' },
  C1: { label: 'Advanced',     color: '#f87171', dim: 'rgba(248,113,113,.13)', emoji: '⚡' },
  C2: { label: 'Mastery',      color: '#e879f9', dim: 'rgba(232,121,249,.13)', emoji: '👑' },
}

const UNIT_ICONS = [
  '👋','🗣️','🏠','🍎','🌍','⏰','🚌','💬','🛒','☀️',
  '📖','🎒','✈️','🏃','🌟','📝','🎵','🏪','🗺️','🎭',
  '💼','🎓','🏆','💡','🌊','🎯','📰','🏛️','🔑','🌐',
  '🔥','⚡','🎪','🌙','🦅','💎','🏰','🎨','🧠','⚔️',
  '🦉','🎩','📜','🔮','⚗️','🌌','🏛️','👑','🌠','💫',
  '🔱','🏔️','🎭','💡','🎯','🔰','🌟','✨','🌀','🎊',
]

// ── Layout constants ──────────────────────────────────────────────────────────
const W       = 340
const NODE_D  = 72
const NODE_R  = NODE_D / 2
const STEP_Y  = 118
const PAD_T   = 18
const COL_X   = [75, 170, 265]

// ── Tree node definition ──────────────────────────────────────────────────────
interface LayoutNode {
  col: 0|1|2
  row: number
  parents: number[]    // layout indices of parent nodes
  choke: boolean
  type: 'unit' | 'grammar'
  unitIdx?: number     // index into units[] array (for type='unit')
  grammarIdx?: number  // 0 or 1 (which grammar checkpoint, for type='grammar')
}

//  Layout for 10 units + 2 grammar checkpoints (12 nodes total)
//
//               [U0]         row 0  root
//              /    \
//           [U1]    [U2]     row 1  branches
//           [U3]    [U4]     row 2  branches continue
//              \    /
//               [U5]         row 3  ★ CHOKE
//               [G1]         row 4  📚 GRAMMAR checkpoint 1
//              /    \
//           [U6]    [U7]     row 5  branches
//              \    /
//               [U8]         row 6  ★ CHOKE
//               [G2]         row 7  📚 GRAMMAR checkpoint 2
//               [U9]         row 8  final
//
const LAYOUT_12: LayoutNode[] = [
  { type: 'unit',    unitIdx: 0, col: 1, row: 0, parents: [],      choke: false },  // 0 root
  { type: 'unit',    unitIdx: 1, col: 0, row: 1, parents: [0],     choke: false },  // 1 left
  { type: 'unit',    unitIdx: 2, col: 2, row: 1, parents: [0],     choke: false },  // 2 right
  { type: 'unit',    unitIdx: 3, col: 0, row: 2, parents: [1],     choke: false },  // 3 left-2
  { type: 'unit',    unitIdx: 4, col: 2, row: 2, parents: [2],     choke: false },  // 4 right-2
  { type: 'unit',    unitIdx: 5, col: 1, row: 3, parents: [3, 4],  choke: true  },  // 5 ★ CHOKE 1
  { type: 'grammar', grammarIdx: 0, col: 1, row: 4, parents: [5],  choke: false },  // 6 📚 GRAMMAR 1
  { type: 'unit',    unitIdx: 6, col: 0, row: 5, parents: [6],     choke: false },  // 7 left-3
  { type: 'unit',    unitIdx: 7, col: 2, row: 5, parents: [6],     choke: false },  // 8 right-3
  { type: 'unit',    unitIdx: 8, col: 1, row: 6, parents: [7, 8],  choke: true  },  // 9 ★ CHOKE 2
  { type: 'grammar', grammarIdx: 1, col: 1, row: 7, parents: [9],  choke: false },  // 10 📚 GRAMMAR 2
  { type: 'unit',    unitIdx: 9, col: 1, row: 8, parents: [10],    choke: false },  // 11 final
]

// Fallback: linear layout for non-10-unit levels
function makeLinearLayout(n: number): LayoutNode[] {
  return Array.from({ length: n }, (_, i) => ({
    type: 'unit' as const,
    unitIdx: i,
    col: ([1, 0, 2] as const)[i % 3],
    row: i,
    parents: i === 0 ? [] : [i - 1],
    choke: false,
  }))
}

function getLayout(n: number): LayoutNode[] {
  return n === 10 ? LAYOUT_12 : makeLinearLayout(n)
}

function nx(l: LayoutNode) { return COL_X[l.col] }
function ny(l: LayoutNode) { return PAD_T + l.row * STEP_Y + NODE_R }

function edgePath(a: LayoutNode, b: LayoutNode): string {
  const x1 = nx(a), y1 = ny(a), x2 = nx(b), y2 = ny(b)
  const my = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${my} ${x2} ${my} ${x2} ${y2}`
}

// ── Availability logic ────────────────────────────────────────────────────────
function isAvailable(idx: number, layout: LayoutNode[], completedIdxs: Set<number>): boolean {
  const node = layout[idx]
  if (node.parents.length === 0) return true
  if (node.choke) return node.parents.every(p => completedIdxs.has(p))
  return node.parents.some(p => completedIdxs.has(p))
}

// ── Section component ─────────────────────────────────────────────────────────
interface SectionProps {
  level: CefrLevel
  units: UnitMeta[]
  cfg: typeof CEFR_CONFIG[CefrLevel]
  levelUnlocked: boolean
  completedUnits: Set<string>
  completedGrammar: Set<string>
  currentUnitId: string
  iconOffset: number
  grammarIds: [string, string]
  onSelectUnit: (id: string) => void
  onSelectGrammar: (id: string) => void
}

function Section({
  level, units, cfg, levelUnlocked,
  completedUnits, completedGrammar, currentUnitId,
  iconOffset, grammarIds, onSelectUnit, onSelectGrammar,
}: SectionProps) {
  const layout = getLayout(units.length)
  const maxRow = Math.max(...layout.map(l => l.row))
  const svgH = PAD_T + (maxRow + 1) * STEP_Y + 30

  // Which layout indices are "done" (unit completed or grammar completed)
  const completedIdxs = useMemo(() => {
    const s = new Set<number>()
    layout.forEach((node, i) => {
      if (node.type === 'unit' && node.unitIdx !== undefined) {
        if (completedUnits.has(units[node.unitIdx]?.id)) s.add(i)
      } else if (node.type === 'grammar' && node.grammarIdx !== undefined) {
        if (completedGrammar.has(grammarIds[node.grammarIdx])) s.add(i)
      }
    })
    return s
  }, [layout, completedUnits, completedGrammar, units, grammarIds])

  function getNodeState(idx: number): NodeState {
    if (!levelUnlocked) return 'locked-level'
    const node = layout[idx]
    const available = isAvailable(idx, layout, completedIdxs)
    if (!available) return 'locked-prereq'
    if (completedIdxs.has(idx)) return 'complete'
    if (node.type === 'unit' && node.unitIdx !== undefined) {
      if (units[node.unitIdx]?.id === currentUnitId) return 'current'
    }
    return 'available'
  }

  const doneCount = units.filter(u => completedUnits.has(u.id)).length

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 4,
        background: levelUnlocked ? cfg.dim : 'rgba(255,255,255,.03)',
        border: `1.5px solid ${levelUnlocked ? cfg.color + '44' : 'rgba(255,255,255,.06)'}`,
        borderRadius: 14,
      }}>
        <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: levelUnlocked ? cfg.color : 'var(--t4)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {level} — {cfg.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>
            {levelUnlocked
              ? `${doneCount} / ${units.length} units complete`
              : `Unlocks at ${CEFR_ELO[level].min} ELO`}
          </div>
        </div>
        {levelUnlocked && doneCount === units.length && <span style={{ fontSize: 16 }}>🏆</span>}
        {!levelUnlocked && <span style={{ fontSize: 16, color: 'var(--t4)' }}>🔒</span>}
      </div>

      {/* Tree canvas */}
      <div style={{ position: 'relative', width: W, maxWidth: '100%', margin: '0 auto', height: svgH }}>
        {/* SVG edges */}
        <svg width={W} height={svgH} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id={`glow-${level}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {layout.map((node, idx) =>
            node.parents.map(parentIdx => {
              const pDone = completedIdxs.has(parentIdx)
              const cDone = completedIdxs.has(idx)
              const pState = getNodeState(parentIdx)
              const cState = getNodeState(idx)
              const bright = pDone && (cDone || cState === 'available' || cState === 'current')
              return (
                <g key={`e-${parentIdx}-${idx}`}>
                  <path d={edgePath(layout[parentIdx], node)} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={7} strokeLinecap="round" />
                  {bright && (
                    <path d={edgePath(layout[parentIdx], node)} fill="none" stroke={cfg.color} strokeWidth={5} strokeLinecap="round" opacity={0.7} filter={`url(#glow-${level})`} />
                  )}
                  {pDone && !cDone && cState === 'locked-prereq' && (
                    <path d={edgePath(layout[parentIdx], node)} fill="none" stroke={cfg.color} strokeWidth={4} strokeLinecap="round" opacity={0.25} />
                  )}
                </g>
              )
            })
          )}
        </svg>

        {/* Nodes */}
        {layout.map((lnode, idx) => {
          const state = getNodeState(idx)
          const locked = state === 'locked-level' || state === 'locked-prereq'
          const x = nx(lnode), y = ny(lnode)
          const isGrammar = lnode.type === 'grammar'
          const isChoke = lnode.choke
          const chokeBlocked = isChoke && state === 'locked-prereq'

          // Grammar node gets a distinct look
          const grammarColor = '#a78bfa'
          const nodeColor = isGrammar ? grammarColor : cfg.color

          const ringColor = state === 'complete' ? nodeColor
            : state === 'current'   ? nodeColor
            : state === 'available' ? nodeColor + 'aa'
            : isChoke ? '#f59e0b55'
            : 'rgba(255,255,255,.08)'

          const bg = isGrammar && state === 'complete' ? grammarColor
            : isGrammar && state === 'available' ? 'rgba(167,139,250,.15)'
            : state === 'complete' ? nodeColor
            : (state === 'current' || state === 'available') ? cfg.dim
            : 'rgba(255,255,255,.04)'

          const glow = state === 'complete' ? `0 0 18px ${nodeColor}77, 0 4px 14px rgba(0,0,0,.5)`
            : state === 'current'  ? `0 0 24px ${nodeColor}99, 0 4px 14px rgba(0,0,0,.5)`
            : state === 'available' ? `0 4px 16px rgba(0,0,0,.4)`
            : 'none'

          const unitIdx  = lnode.unitIdx
          const grammarIdx = lnode.grammarIdx
          const icon = isGrammar ? '📚'
            : unitIdx !== undefined ? UNIT_ICONS[(iconOffset + unitIdx) % UNIT_ICONS.length]
            : '?'

          // Count remaining prerequisite paths
          const remainingPaths = isChoke
            ? lnode.parents.filter(p => !completedIdxs.has(p)).length
            : 0

          function handleClick() {
            if (locked) return
            if (isGrammar && grammarIdx !== undefined) {
              onSelectGrammar(grammarIds[grammarIdx])
            } else if (!isGrammar && unitIdx !== undefined) {
              onSelectUnit(units[unitIdx].id)
            }
          }

          return (
            <div key={`node-${idx}`} style={{ position: 'absolute', left: x - NODE_R, top: y - NODE_R }}>
              {/* Pulse ring for current unit */}
              {state === 'current' && (
                <div style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: `2px solid ${nodeColor}`,
                  animation: 'treePulseRing 2s ease-out infinite',
                  pointerEvents: 'none',
                }} />
              )}

              {/* START indicator for root node when nothing done yet */}
              {idx === 0 && state === 'available' && (
                <div style={{
                  position: 'absolute', top: NODE_D + 22, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, fontWeight: 800, color: cfg.color,
                  background: `${cfg.color}18`, border: `1px solid ${cfg.color}55`,
                  borderRadius: 8, padding: '3px 8px', whiteSpace: 'nowrap',
                  pointerEvents: 'none', zIndex: 5,
                }}>
                  ▶ TAP TO START
                </div>
              )}

              {/* Choke-lock badge */}
              {chokeBlocked && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, color: '#f59e0b', fontWeight: 800,
                  background: 'rgba(0,0,0,.75)', border: '1px solid #f59e0b55',
                  borderRadius: 6, padding: '2px 6px', whiteSpace: 'nowrap', zIndex: 10,
                }}>
                  {remainingPaths} path{remainingPaths !== 1 ? 's' : ''} to unlock
                </div>
              )}

              {/* Node button */}
              <button disabled={locked} onClick={handleClick} title={
                isGrammar ? `Grammar: ${grammarIds[grammarIdx ?? 0]}`
                  : unitIdx !== undefined ? units[unitIdx]?.title : ''
              } style={{
                width: NODE_D, height: NODE_D,
                borderRadius: isGrammar ? '22%' : '50%',  // grammar nodes = rounded square
                border: `${state === 'current' ? 4 : 3}px solid ${ringColor}`,
                background: bg,
                boxShadow: glow,
                cursor: locked ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: state === 'complete' && !isGrammar ? '1.35rem' : '1.55rem',
                color: state === 'locked-level' || state === 'locked-prereq' ? 'rgba(255,255,255,.25)' : 'var(--text)',
                opacity: locked ? 0.42 : 1,
                transition: 'transform .13s, box-shadow .15s',
                position: 'relative', padding: 0, outline: 'none',
              }}
                onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              >
                {/* Choke badge */}
                {isChoke && !locked && (
                  <div style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: state === 'complete' ? '#fff' : '#f59e0b',
                    color: '#000', fontSize: 9, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid rgba(0,0,0,.4)',
                  }}>⚡</div>
                )}
                {locked && !isGrammar ? '🔒'
                  : chokeBlocked ? '⛓'
                  : state === 'complete' && !isGrammar ? '✓'
                  : icon}
              </button>

              {/* Label */}
              <div style={{
                position: 'absolute', top: NODE_D + 5, left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, fontWeight: 700,
                color: state === 'complete' ? nodeColor
                     : state === 'current'  ? '#fff'
                     : isGrammar && state === 'available' ? grammarColor
                     : state === 'available' ? 'var(--t2)'
                     : 'rgba(255,255,255,.2)',
                whiteSpace: 'nowrap',
                textShadow: (state === 'complete' || state === 'current') ? `0 0 8px ${nodeColor}88` : 'none',
              }}>
                {isGrammar
                  ? (state === 'complete' ? '✓ Grammar' : '📚 Grammar')
                  : unitIdx !== undefined ? units[unitIdx]?.title : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function SkillTree({
  learnerElo, completedUnits, completedGrammar, currentUnitId, onSelectUnit, onSelectGrammar,
}: SkillTreeProps) {
  const byLevel = useMemo(() => {
    const levels: CefrLevel[] = ['A1','A2','B1','B2','C1','C2']
    let iconOffset = 0
    return levels.map(level => {
      const units = UNIT_META.filter(u => u.cefr === level)
      const ico   = iconOffset
      iconOffset += units.length
      return {
        level, units, cfg: CEFR_CONFIG[level],
        unlocked: learnerElo >= CEFR_ELO[level].min,
        ico,
        grammarIds: LEVEL_GRAMMAR_IDS[level],
      }
    })
  }, [learnerElo])

  return (
    <div className="skill-tree-wrap">
      {byLevel.map(({ level, units, cfg, unlocked, ico, grammarIds }) => (
        <Section
          key={level}
          level={level}
          units={units}
          cfg={cfg}
          levelUnlocked={unlocked}
          completedUnits={completedUnits}
          completedGrammar={completedGrammar}
          currentUnitId={currentUnitId}
          iconOffset={ico}
          grammarIds={grammarIds as [string, string]}
          onSelectUnit={onSelectUnit}
          onSelectGrammar={onSelectGrammar}
        />
      ))}
      <div style={{ height: 60 }} />
    </div>
  )
}
