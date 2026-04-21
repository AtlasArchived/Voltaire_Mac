import { useCallback } from 'react'

// Maps two-char sequences (vowel + modifier) → accented character
const ACCENT_MAP: Record<string, string> = {
  'e>': 'é', 'E>': 'É',
  'e<': 'è', 'E<': 'È',
  'e^': 'ê', 'E^': 'Ê',
  'e"': 'ë', 'E"': 'Ë',
  'a<': 'à', 'A<': 'À',
  'a^': 'â', 'A^': 'Â',
  'o^': 'ô', 'O^': 'Ô',
  'i^': 'î', 'I^': 'Î',
  'i"': 'ï', 'I"': 'Ï',
  'u^': 'û', 'U^': 'Û',
  'u<': 'ù', 'U<': 'Ù',
  'u"': 'ü', 'U"': 'Ü',
  'c,': 'ç', 'C,': 'Ç',
}

// All accented chars available for the accent bar, grouped
export const ACCENT_BAR = ['é','è','ê','ë','à','â','ô','î','ï','û','ù','ü','ç']

/**
 * Returns a keydown handler that detects two-char accent sequences and
 * replaces them with the accented equivalent.
 *
 * Usage:
 *   const handleAccentKey = useAccentInput(value, setValue)
 *   <input ... onKeyDown={handleAccentKey} />
 */
export function useAccentInput(
  value: string,
  setValue: (v: string) => void,
): (e: React.KeyboardEvent<HTMLInputElement>) => void {
  return useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    if (key.length !== 1) return   // skip control keys
    if (value.length === 0) return

    const lastChar = value[value.length - 1]
    const combo = lastChar + key

    if (ACCENT_MAP[combo]) {
      e.preventDefault()
      setValue(value.slice(0, -1) + ACCENT_MAP[combo])
    }
  }, [value, setValue])
}
