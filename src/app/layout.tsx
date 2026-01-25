import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'still-alive.dev | Is your npm package still maintained?',
  description: 'Check if an npm package is still being maintained before you add it to your project.',
  keywords: ['npm', 'package', 'maintained', 'abandoned', 'health check', 'dependencies'],
  openGraph: {
    title: 'still-alive.dev',
    description: 'Is your npm package still alive?',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a]">{children}</body>
    </html>
  )
}
