const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me'
const COOKIE_NAME = 'voltaire_session'
const MAX_AGE_SEC = 60 * 60 * 24 * 30

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return b64url(sig)
}

export async function signSession(username: string): Promise<string> {
  const payload = `${username}.${Date.now() + MAX_AGE_SEC * 1000}`
  const sig = await hmac(payload)
  return `${b64url(new TextEncoder().encode(payload).buffer as ArrayBuffer)}.${sig}`
}

export async function verifySession(token: string | undefined | null): Promise<string | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  try {
    const payloadStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))
    const expected = await hmac(payloadStr)
    if (expected !== parts[1]) return null
    const [user, expStr] = payloadStr.split('.')
    if (!user || !expStr) return null
    if (Date.now() > parseInt(expStr, 10)) return null
    return user
  } catch { return null }
}

export const SESSION_COOKIE = COOKIE_NAME
export const SESSION_MAX_AGE = MAX_AGE_SEC
