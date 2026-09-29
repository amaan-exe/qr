import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ReviewPulse — Restaurant Feedback & Authentic Reviews',
  description: 'QR-based customer feedback platform for Biryani Charminar with AI-assisted review drafting',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#090d16',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased overflow-x-hidden selection:bg-amber-500 selection:text-white`}>
        {children}
      </body>
    </html>
  )
}
