import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Voltaire — French Fluency',
  description: 'Voltaire is an AI-powered French language tutor that adapts to your level and learning style. From A1 to C2, build real fluency with personalized drills, conversation practice, and intelligent coaching.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Voltaire',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#07090f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Voltaire" />
        {/* Prevent iOS from zooming on input focus */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        {/* Open Graph / SEO */}
        <meta property="og:title" content="Voltaire — French Fluency" />
        <meta property="og:description" content="AI-powered French language tutor. Fluency for life." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#07090f" />
        {/* Fonts — display=swap prevents FOIT */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Cinzel:wght@600;700&display=swap"
          rel="stylesheet"
        />
        {/* Inline critical CSS to prevent flash */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { background: #07090f; color: #e8edf5; margin: 0; padding: 0; }
          * { box-sizing: border-box; }
        `}} />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#111520',
              color:      '#e8edf5',
              border:     '1px solid rgba(99,179,237,.14)',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize:   '14px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#111520' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#111520' } },
          }}
        />
      </body>
    </html>
  )
}
