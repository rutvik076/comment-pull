import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'CommentPull — Free YouTube Comments Downloader',
  description: 'Download YouTube video comments as CSV instantly. Free tool for creators, researchers, and marketers. Export author, text, likes, date and more.',
  keywords: 'youtube comments downloader, export youtube comments, youtube comments csv, download youtube comments free',
  openGraph: {
    title: 'CommentPull — Free YouTube Comments Downloader',
    description: 'Download YouTube video comments as CSV instantly.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}