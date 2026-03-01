import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CommentPull — Free YouTube Comment Downloader',
  description: 'Download YouTube comments instantly as CSV. Perfect for research, sentiment analysis, and content strategy. Free plan includes 5 downloads/day.',
  keywords: ['youtube comments', 'download youtube comments', 'comment analyzer', 'CSV export', 'youtube data'],
  authors: [{ name: 'Crestlabs' }],
  creator: 'Crestlabs',
  metadataBase: new URL('https://commentpull.com'),
  openGraph: {
    title: 'CommentPull — Free YouTube Comment Downloader',
    description: 'Download YouTube comments instantly as CSV. Free plan, no credit card.',
    url: 'https://commentpull.com',
    siteName: 'CommentPull',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CommentPull' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CommentPull — Free YouTube Comment Downloader',
    description: 'Download YouTube comments instantly as CSV.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
