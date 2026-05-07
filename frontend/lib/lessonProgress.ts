/**
 * lib/lessonProgress.ts — v2.8
 * localStorage-first (instant reads), server writes are optimistic.
 * New key voltaire_unit_v2 avoids stale data from old key.
 */

const UNIT_KEY    = 'voltaire_unit_v2'
const GRAMMAR_KEY = 'voltaire_grammar_v2'
const SESSION_KEY = 'voltaire_session_v2'

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) }
  catch { return new Set() }
}
function writeSet(key: string, s: Set<string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(Array.from(s)))
}

export function getCompletedUnits(): Set<string> { return readSet(UNIT_KEY) }
export function getCompletedGrammar(): Set<string> { return readSet(GRAMMAR_KEY) }

export function markUnitComplete(unitId: string): void {
  const s = readSet(UNIT_KEY)
  if (s.has(unitId)) return
  s.add(unitId); writeSet(UNIT_KEY, s)
  fetch(`/api/units/${encodeURIComponent(unitId)}/complete`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'unit' }),
  }).catch(() => {})
}

export function markGrammarComplete(id: string): void {
  const s = readSet(GRAMMAR_KEY)
  if (s.has(id)) return
  s.add(id); writeSet(GRAMMAR_KEY, s)
  fetch(`/api/units/${encodeURIComponent(id)}/complete`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'grammar' }),
  }).catch(() => {})
}

export function resetUnit(unitId: string): void {
  const s = readSet(UNIT_KEY); s.delete(unitId); writeSet(UNIT_KEY, s)
  fetch(`/api/units/${encodeURIComponent(unitId)}/complete`, { method: 'DELETE' }).catch(() => {})
}

export async function syncCompletedFromServer(): Promise<{ units: Set<string>; grammar: Set<string> }> {
  if (typeof window === 'undefined') return { units: new Set(), grammar: new Set() }
  const localU = readSet(UNIT_KEY)
  const localG = readSet(GRAMMAR_KEY)
  try {
    const r = await fetch('/api/units/completed', { credentials: 'same-origin' })
    if (!r.ok) throw new Error(String(r.status))
    const data: { units: string[]; grammar: string[] } = await r.json()
    const serverU = new Set<string>(data.units || [])
    const serverG = new Set<string>(data.grammar || [])
    const mergedU = new Set([...localU, ...serverU])
    const mergedG = new Set([...localG, ...serverG])
    writeSet(UNIT_KEY, mergedU)
    writeSet(GRAMMAR_KEY, mergedG)
    for (const id of localU) if (!serverU.has(id)) fetch(`/api/units/${encodeURIComponent(id)}/complete`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'unit' }) }).catch(() => {})
    for (const id of localG) if (!serverG.has(id)) fetch(`/api/units/${encodeURIComponent(id)}/complete`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'grammar' }) }).catch(() => {})
    return { units: mergedU, grammar: mergedG }
  } catch { return { units: localU, grammar: localG } }
}

// ── Session state ─────────────────────────────────────────────────────────────

interface SessionState { xpToday: number; lastActiveDate: string; sessionCount: number }

function todayISO(): string { return new Date().toISOString().split('T')[0] }

export function getSessionState(): SessionState {
  if (typeof window === 'undefined') return { xpToday: 0, lastActiveDate: '', sessionCount: 0 }
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return { xpToday: 0, lastActiveDate: '', sessionCount: 0 }
    const s: SessionState = JSON.parse(raw)
    if (s.lastActiveDate !== todayISO()) return { xpToday: 0, lastActiveDate: todayISO(), sessionCount: 0 }
    return s
  } catch { return { xpToday: 0, lastActiveDate: '', sessionCount: 0 } }
}

export function addSessionXp(xp: number): SessionState {
  const s = getSessionState()
  const updated = { xpToday: s.xpToday + xp, lastActiveDate: todayISO(), sessionCount: s.sessionCount }
  if (typeof window !== 'undefined') localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
  return updated
}

export function incrementSessionCount(): SessionState {
  const s = getSessionState()
  const updated = { ...s, lastActiveDate: todayISO(), sessionCount: s.sessionCount + 1 }
  if (typeof window !== 'undefined') localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
  return updated
}

export function getNextRecommendedUnit(
  unitMeta: { id: string; cefr: string }[],
  completedUnits: Set<string>,
  learnerElo: number,
  cefrElo: Record<string, { min: number }>,
): string | null {
  const eligible = unitMeta.filter(u => learnerElo >= (cefrElo[u.cefr]?.min ?? 0))
  const incomplete = eligible.filter(u => !completedUnits.has(u.id))
  return incomplete[0]?.id ?? null
}
