import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DD Innovations',
  description: 'Empowering governments, enterprises, and citizens with intelligent systems for safer, smarter, and faster operations.',
  generator: 'v0.dev',
  metadataBase: new URL('https://janrakshak.neo.healthcare'),
  openGraph: {
    title: 'Jan Rakshak – Pioneering AI, Automation & Smart Infrastructure',
    description: 'Empowering governments, enterprises, and citizens with intelligent systems for safer, smarter, and faster operations.',
    images: [
      {
        url: '/janrakshak-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Jan Rakshak - AI, Automation & Smart Infrastructure',
      },
    ],
    url: 'https://janrakshak.neo.healthcare',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jan Rakshak – Pioneering AI, Automation & Smart Infrastructure',
    description: 'Empowering governments, enterprises, and citizens with intelligent systems for safer, smarter, and faster operations.',
    images: ['/janrakshak-og.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
