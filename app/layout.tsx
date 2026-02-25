import type { Metadata } from 'next'
import './globals.css'

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
        {/* Google AdSense — add your publisher ID below */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
      </head>
      <body style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{children}</body>
    </html>
  )
}
