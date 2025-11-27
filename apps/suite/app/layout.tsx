import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Darevel Suite',
  description: 'Unified Workspace for the Future',
  generator: 'Darevel',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <footer className="site-footer">
          <p>© 2025 <span style={{background: 'linear-gradient(90deg,#a855f7,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:700}}>Darevel</span>. Unified Workspace for the Future.</p>
        </footer>
      </body>
    </html>
  )
}
