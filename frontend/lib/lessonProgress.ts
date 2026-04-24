const KEY = 'voltaire_unit_completion'
const GRAMMAR_KEY = 'voltaire_grammar_completion'

function readLocal(key: string): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function writeLocal(key: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(ids))
}

export function getCompletedUnits(): Set<string> {
  return new Set(readLocal(KEY))
}

export function getCompletedGrammar(): Set<string> {
  return new Set(readLocal(GRAMMAR_KEY))
}

/** Pull the canonical completion set from the backend and merge with local cache. */
export async function syncCompletedFromServer(): Promise<{ units: Set<string>; grammar: Set<string> }> {
  if (typeof window === 'undefined') return { units: new Set(), grammar: new Set() }
  try {
    const r = await fetch('/api/units/completed', { credentials: 'same-origin' })
    if (!r.ok) throw new Error(String(r.status))
    const data: { units: string[]; grammar: string[] } = await r.json()
    const localU = readLocal(KEY)
    const localG = readLocal(GRAMMAR_KEY)
    const mergedU = Array.from(new Set([...localU, ...(data.units || [])]))
    const mergedG = Array.from(new Set([...localG, ...(data.grammar || [])]))
    writeLocal(KEY, mergedU)
    writeLocal(GRAMMAR_KEY, mergedG)
    // Push back any local-only entries that the server didn't have.
    for (const id of localU) if (!data.units?.includes(id)) {
      fetch(`/api/units/${encodeURIComponent(id)}/complete`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({kind:'unit'}) }).catch(()=>{})
    }
    for (const id of localG) if (!data.grammar?.includes(id)) {
      fetch(`/api/units/${encodeURIComponent(id)}/complete`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({kind:'grammar'}) }).catch(()=>{})
    }
    return { units: new Set(mergedU), grammar: new Set(mergedG) }
  } catch {
    return { units: new Set(readLocal(KEY)), grammar: new Set(readLocal(GRAMMAR_KEY)) }
  }
}

export function markUnitComplete(unitId: string): void {
  const s = new Set(readLocal(KEY)); s.add(unitId); writeLocal(KEY, Array.from(s))
  fetch(`/api/units/${encodeURIComponent(unitId)}/complete`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'unit' }),
  }).catch(() => {})
}

export function markGrammarComplete(id: string): void {
  const s = new Set(readLocal(GRAMMAR_KEY)); s.add(id); writeLocal(GRAMMAR_KEY, Array.from(s))
  fetch(`/api/units/${encodeURIComponent(id)}/complete`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'grammar' }),
  }).catch(() => {})
}

export function resetUnit(unitId: string): void {
  const s = new Set(readLocal(KEY)); s.delete(unitId); writeLocal(KEY, Array.from(s))
  fetch(`/api/units/${encodeURIComponent(unitId)}/complete`, { method: 'DELETE' }).catch(() => {})
}
