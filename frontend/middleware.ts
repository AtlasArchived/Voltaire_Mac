import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession, SESSION_COOKIE } from './lib/authToken'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const user = await verifySession(token)
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { 'content-type': 'application/json' }
      })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf)$).*)'],
}
