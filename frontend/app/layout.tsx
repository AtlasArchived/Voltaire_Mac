import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './AppContext'
import AppShell from './AppShell'

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
    <html lang="fr" suppressHydrationWarning>
      <body>
        {/* Runs before hydration — reads localStorage and sets .light class to avoid flash */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function(){try{var t=localStorage.getItem('voltaire_theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();
        `}</Script>
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
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  )
}
