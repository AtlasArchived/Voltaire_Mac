/** Shared helpers used across Voltaire route pages */

export function md(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/GRADE:\s*CORRECT/gi,'<span class="grade-correct">✓ Correct!</span>')
    .replace(/GRADE:\s*PARTIAL/gi,'<span class="grade-partial">◑ Partial</span>')
    .replace(/GRADE:\s*WRONG/gi,  '<span class="grade-wrong">✗ Incorrect</span>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .split(/\n\n+/).map(p=>p.trim()).filter(Boolean)
    .map(p=>p.startsWith('<')?p:`<p>${p.replace(/\n/g,'<br/>')}</p>`).join('')
}

function extractAfterLastAnswerLabel(raw: string): string {
  const lower = raw.toLowerCase()
  const needles = ['answer:', 'réponse:', 'reponse:', 'response:', 'translation:', 'traduction:']
  let bestIdx = -1, bestLen = 0
  for (const n of needles) {
    const idx = lower.lastIndexOf(n)
    if (idx > bestIdx) { bestIdx = idx; bestLen = n.length }
  }
  if (bestIdx >= 0) return raw.slice(bestIdx + bestLen).trim()
  return raw.trim()
}

function normalizeAnswerCore(raw: string, extractLabel: boolean): string {
  let s = extractLabel ? extractAfterLastAnswerLabel(raw) : raw.trim()
  s = s.replace(/[\u2019\u2018\u0060\u00b4]/g, "'")
  s = s.toLowerCase().replace(/\s+/g, ' ').trim()
  s = s.replace(/^["'«»]+|["'«»]+$/g, '')
  s = s.replace(/[.!?…]+$/g, '').trim()
  return s
}

function stripMarks(s: string): string {
  try { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') }
  catch { return s }
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

export function answersEquivalent(userRaw: string, expectedRaw: string): boolean {
  const exp = normalizeAnswerCore(expectedRaw, false)
  if (!exp) return false
  const userLabeled = normalizeAnswerCore(userRaw, true)
  const userFull    = normalizeAnswerCore(userRaw, false)

  // Exact match (with or without answer label)
  if (userLabeled === exp || userFull === exp) return true

  // Substring match for longer expected answers
  const minLen = 8
  if (exp.length >= minLen && (userFull.includes(exp) || userLabeled.includes(exp))) return true

  // Accent-stripped exact match
  const expStripped  = stripMarks(exp)
  const uLStripped   = stripMarks(userLabeled)
  const uFStripped   = stripMarks(userFull)
  if (uLStripped === expStripped || uFStripped === expStripped) return true

  // Fuzzy match: tolerate 1-2 character typos for longer answers
  // (catches missing accents combined with minor typos, e.g. "sommes" vs "somme")
  const maxDist = exp.length >= 25 ? 2 : exp.length >= 12 ? 1 : 0
  if (maxDist > 0) {
    const d = Math.min(
      levenshtein(uFStripped, expStripped),
      levenshtein(uLStripped, expStripped)
    )
    if (d <= maxDist) return true
  }

  return false
}
