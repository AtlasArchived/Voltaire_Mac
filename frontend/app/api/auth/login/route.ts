import { NextRequest, NextResponse } from 'next/server'
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from '../../../../lib/authToken'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}))
  const expectedUser = process.env.AUTH_USERNAME || 'Jackson'
  const expectedPass = process.env.AUTH_PASSWORD || 'Frenchman'
  if (username !== expectedUser || password !== expectedPass) {
    await new Promise(r => setTimeout(r, 400))
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }
  const token = await signSession(username)
  const res = NextResponse.json({ ok: true, username })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
