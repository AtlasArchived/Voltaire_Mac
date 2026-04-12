'use client'
import React, { useMemo } from 'react'
import { CourseUnit } from '../lib/course'

// ── Layout constants ──────────────────────────────────────────────────────────
const W      = 360          // container width px
const N_D    = 72           // node diameter px
const ROW_H  = 132          // px per row  (node + label + gap for bezier curves)

// Five column center-x positions within W
const COL_X = [38, 112, 182, 252, 322] as const
type  Col   = 0 | 1 | 2 | 3 | 4

// Repeating row patterns — which columns are occupied
const PATTERNS: Col[][] = [
  [2],          // 1 node — centred
  [1, 3],       // 2 nodes
  [0, 2, 4],    // 3 nodes
  [1, 3],
  [0, 2, 4],
]

interface TreeNode { unit: CourseUnit; row: number; col: Col; idx: number }
interface Edge     { fr: number; fc: Col; tr: number; tc: Col }

// ── Tree layout builder ───────────────────────────────────────────────────────
function buildTree(units: CourseUnit[]) {
  const nodes: TreeNode[] = []
  const rowCols: Col[][] = []
  let ui = 0, row = 0

  while (ui < units.length) {
    const pat  = PATTERNS[row % PATTERNS.length]
    const take = Math.min(pat.length, units.length - ui)
    // Normalise partial rows: always centre the small group
    const cols: Col[] =
      take === 1 ? [2] :
      take === 2 ? [1, 3] :
      pat.slice(0, take) as Col[]
    cols.forEach(col => nodes.push({ unit: units[ui++], row, col, idx: nodes.length }))
    rowCols.push(cols)
    row++
  }

  // Edges: connect any (fromCol, toCol) pair whose columns are within 2 steps of each other
  const edges: Edge[] = []
  for (let r = 0; r < rowCols.length - 1; r++) {
    for (const fc of rowCols[r]) {
      for (const tc of rowCols[r + 1]) {
        if (Math.abs(fc - tc) <= 2) edges.push({ fr: r, fc, tr: r + 1, tc })
      }
    }
  }

  return { nodes, edges, totalRows: row }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function crownLevel(unit: CourseUnit): number {
  const done  = unit.lessons.filter(l => l.complete).length
  const total = unit.lessons.length
  if (total === 0) return 0
  return Math.floor((done / total) * 5)
}

function nodeCenter(row: number, col: Col): [number, number] {
  return [COL_X[col], row * ROW_H + N_D / 2]
}

function bezierPath(
  [fx, fy]: [number, number],
  [tx, ty]: [number, number],
): string {
  const y1 = fy + N_D / 2 + 4
  const y2 = ty - N_D / 2 - 4
  // Cubic bezier: drop straight down from source, rise straight up into target
  return `M${fx},${y1} C${fx},${(y1 + y2) / 2} ${tx},${(y1 + y2) / 2} ${tx},${y2}`
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  units:       CourseUnit[]
  color:       string   // CEFR hex color, e.g. '#58cc02'
  activeIndex: number   // index within units[] that is the current unit; -1 = none
  onSelect:    (idx: number) => void
}

export default function SkillTree({ units, color, activeIndex, onSelect }: Props) {
  const { nodes, edges, totalRows } = useMemo(() => buildTree(units), [units])

  const svgH = totalRows * ROW_H + 32   // extra space for bottom label

  return (
    <div style={{
      position: 'relative',
      width:    W,
      maxWidth: '100%',
      margin:   '0 auto',
      userSelect: 'none',
    }}>

      {/* ── SVG connector lines (sits behind nodes) ── */}
      <svg
        width={W}
        height={svgH}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0, overflow: 'visible' }}
        aria-hidden="true"
      >
        {edges.map((e, i) => {
          const fn = nodes.find(n => n.row === e.fr && n.col === e.fc)
          const tn = nodes.find(n => n.row === e.tr && n.col === e.tc)
          if (!fn || !tn) return null

          const unlocked = !fn.unit.locked && !tn.unit.locked
          const fromDone = fn.unit.lessons.every(l => l.complete)

          return (
            <path
              key={i}
              d={bezierPath(nodeCenter(e.fr, e.fc), nodeCenter(e.tr, e.tc))}
              fill="none"
              stroke={
                !unlocked   ? 'rgba(255,255,255,.05)' :
                fromDone    ? color                   :
                              'rgba(255,255,255,.13)'
              }
              strokeWidth={unlocked ? 3 : 2}
              strokeDasharray={unlocked && !fromDone ? '8 5' : undefined}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {/* ── Nodes ── */}
      <div style={{ position: 'relative', zIndex: 1, height: svgH }}>
        {nodes.map(node => {
          const [cx, cy] = nodeCenter(node.row, node.col)
          const isActive = node.idx === activeIndex
          const allDone  = node.unit.lessons.every(l => l.complete)
          const crown    = crownLevel(node.unit)

          /* inline bg colour */
          const bg =
            allDone          ? color :
            isActive         ? color + '28' :
            node.unit.locked ? 'rgba(255,255,255,.03)' :
                               'var(--surface2, #1c2330)'

          const border = node.unit.locked
            ? 'rgba(255,255,255,.08)'
            : color

          const shadow = isActive
            ? `0 6px 0 rgba(0,0,0,.45), 0 0 30px ${color}80`
            : allDone
            ? `0 4px 0 rgba(0,0,0,.35), 0 0 16px ${color}44`
            : '0 5px 0 rgba(0,0,0,.45)'

          return (
            <div
              key={node.unit.id}
              style={{
                position:  'absolute',
                left:      cx - N_D / 2,
                top:       cy - N_D / 2,
                width:     N_D,
                display:   'flex',
                flexDirection:  'column',
                alignItems:     'center',
                overflow:  'visible',
              }}
            >
              {/* START bubble — floats above active node */}
              {isActive && !node.unit.locked && (
                <div
                  aria-hidden="true"
                  style={{
                    position:  'absolute',
                    bottom:    N_D + 12,
                    left:      '50%',
                    transform: 'translateX(-50%)',
                    background: color,
                    color:      '#fff',
                    fontSize:   12,
                    fontWeight: 900,
                    letterSpacing: '.12em',
                    padding:    '8px 20px',
                    borderRadius: 24,
                    boxShadow:  `0 4px 16px rgba(0,0,0,.5)`,
                    whiteSpace: 'nowrap',
                    zIndex:     20,
                    pointerEvents: 'none',
                  }}
                >
                  START
                  {/* Down arrow caret */}
                  <span style={{
                    position:    'absolute',
                    top:         '100%',
                    left:        '50%',
                    transform:   'translateX(-50%)',
                    display:     'block',
                    width:       0, height: 0,
                    borderLeft:  '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop:   `8px solid ${color}`,
                  }}/>
                </div>
              )}

              {/* ── Circle button ── */}
              <button
                className="skill-circle"
                disabled={node.unit.locked}
                onClick={() => onSelect(node.idx)}
                style={{
                  width:        N_D,
                  height:       N_D,
                  borderRadius: '50%',
                  border:       `4px solid ${border}`,
                  background:   bg,
                  fontSize:     node.unit.locked ? '1.5rem' : '1.9rem',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  cursor:       node.unit.locked ? 'not-allowed' : 'pointer',
                  opacity:      node.unit.locked ? .28 : 1,
                  boxShadow:    shadow,
                  outline:      'none',
                  position:     'relative',
                  flexShrink:   0,
                  fontFamily:   'inherit',
                  padding:      0,
                  // pulse animation via globals.css @keyframes skill-pulse
                  animation:    isActive ? 'skill-pulse 2.4s ease-in-out infinite' : 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {node.unit.locked ? '🔒' : node.unit.emoji}

                {/* Crown badge */}
                {crown >= 5 && (
                  <span style={{
                    position: 'absolute', top: -11, right: -4,
                    fontSize: 17, lineHeight: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.7))',
                    pointerEvents: 'none',
                  }}>👑</span>
                )}
                {crown >= 3 && crown < 5 && (
                  <span style={{
                    position: 'absolute', top: -11, right: -4,
                    fontSize: 15, lineHeight: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.7))',
                    pointerEvents: 'none',
                  }}>⭐</span>
                )}
              </button>

              {/* ── Crown dots (5 progress pips) ── */}
              {!node.unit.locked && (
                <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
                  {[1, 2, 3, 4, 5].map(d => (
                    <div key={d} style={{
                      width:        7,
                      height:       7,
                      borderRadius: '50%',
                      background:   d <= crown ? color : 'rgba(255,255,255,.1)',
                      boxShadow:    d <= crown ? `0 0 5px ${color}88` : 'none',
                      transition:   'all .3s',
                    }} />
                  ))}
                </div>
              )}

              {/* ── Label ── */}
              <div style={{
                marginTop:  5,
                fontSize:   10,
                fontWeight: 700,
                textAlign:  'center',
                lineHeight: 1.25,
                maxWidth:   84,
                overflow:   'hidden',
                display:    '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                color: node.unit.locked
                  ? 'rgba(255,255,255,.16)'
                  : isActive
                  ? '#fff'
                  : 'rgba(255,255,255,.55)',
              }}>
                {node.unit.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
