import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Voltaire — French Fluency',
  description: 'AI-powered French language tutor. Fluency for life.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Voltaire',
  },
  icons: {
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192' },
      { url: '/icons/icon-512.png', sizes: '512x512' },
    ],
    icon: '/icons/icon-192.png',
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
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#111520',
              color:      '#e8edf5',
              border:     '1px solid rgba(99,179,237,.14)',
              fontFamily: "'Nunito', system-ui, sans-serif",
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
